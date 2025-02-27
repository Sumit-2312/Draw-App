import express from 'express';
import auth from './auth';
import {PsClient} from '@repo/backend-common/db'
import bcrypt, { hash } from 'bcrypt'
import {UserSchema} from '@repo/common/zodSchema'
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
    const {username,password} = req.body;
    // add the zod validation here
    // add the db logic here
    // add the jwt verification logic here
    res.status(200).json({
        message:"You are logged in ",
    })
    return;
})

userRouter.post("/create-room",auth,async(req,res)=>{

})


export {userRouter};