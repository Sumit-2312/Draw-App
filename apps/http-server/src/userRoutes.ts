import express from 'express';
import auth from './auth';
import {PsClient} from '@repo/backend-common/db'
import bcrypt, { hash } from 'bcrypt'
import {UserSchema} from '@repo/common/zodSchema'
import jwt from 'jsonwebtoken'
import { JWT_SECRET_KEY } from '@repo/backend-common/config';
const userRouter = express.Router();

userRouter.post("/signup",async( req,res)=>{
    try{
        
        const dataValidation = UserSchema.safeParse(req.body);
        if(!dataValidation.success){
            res.status(403).json({
                message:" invalid credentials",
                error : dataValidation.error.message
            })
            return;
        }
        
        const {username,password,email} = req.body;

            const user = await PsClient.user.findFirst({
                where:{
                    username,
                    email
                }
            })

            if(user){
                res.status(200).json({
                    message: " You have already signed Up"
                })
                return;
            }

            const hashedPassword = await bcrypt.hash(password,10);

            const newUser = await PsClient.user.create({
                data:{
                    username,
                    password:hashedPassword,
                    email
                }
            })

            res.status(200).json({
                message:"You are signed up",
                newUser
            })
            return;
    }
    catch(error){
        console.log("error occured during signup process");
        res.status(403).json({
            //@ts-ignore
            error: error.message
        })
        return;
    }
})


userRouter.post("/signin",async(req,res)=>{

   try{
            const dataValidation = UserSchema.safeParse(req.body);
            if(!dataValidation.success){
                res.status(403).json({
                    message:" invalid credentials",
                    error : dataValidation.error.message
                })
                return;
            }

            const {username,password,email} = req.body;

            const user = await PsClient.user.findFirst({
                where:{
                    username,
                    email
                }
            });

            if(!user){
                res.status(403).json({
                    message: "You are not signed up, please sign up first"
                })
                return;
            }

            const token =  jwt.sign({id:user.id},JWT_SECRET_KEY);   // we will get the id in decoded.id
            
            res.status(200).json({
                message:"You are logged in ",
                token
            })
            return;
   }
   catch(error){
        res.status(403).json({
            //@ts-ignore
            error: error.message
        })
        return;
   }
})

userRouter.post("/create-room",auth,async(req,res)=>{

})


export {userRouter};