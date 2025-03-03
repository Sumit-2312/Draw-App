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
    try{
        const {roomName,userId} = req.body;
        const room = await PsClient.room.findFirst({
            where:{
                name: roomName
            }
        })
        if(room){
            res.status(403).json({
                message: "Room with this name already exist please try another name"
            })
            return;
        }
    
        const newRoom = await PsClient.room.create({
            data:{
                name: roomName,
                adminId: userId
            }
        })
    
        res.status(200).json({
            message: "Room is created",
            newRoom
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

userRouter.post("/join-Room",auth,async(req,res)=>{
    try{
        const {userId, roomName} = req.body;
        // userId will tell which user want's to join the room
        // roomName will tell which room does the user wants to join

        const room = await PsClient.room.findFirst({
            where:{
                name: roomName
            }
        })

        if(!room){
            res.status(403).json({
                message:"No such room exists"
            })
            return;
        }

        const presentAlready = await PsClient.roomMember.findFirst({
            where:{
                userId : userId,
                roomId : room.id
            }
        })

        if(presentAlready){
            res.status(200).json({
                message: "You are already in this room"
            })
            return;
        }

        const roomMember = await PsClient.roomMember.create({
            data:{
                userId: userId,
                roomId: room.id
            }
        })
        res.status(200).json({
            message: "You are added to the room",
            roomMember
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

userRouter.get("/chat",auth,async(req,res )=>{
    try{
        const roomId = Number( req.query.roomId);
        const {userId} = req.body;

        const room = await PsClient.room.findFirst({
            where:{
                id:roomId
            }
        })

        if(!room){
            res.status(403).json({
                message:"This room does not exist",
            })
            return;
        }

        const isMember = await PsClient.roomMember.findFirst({
            where:{
                roomId : roomId,
                userId : userId
            }
        })

        if(!isMember){
            res.status(403).json({
                message:" You are not a member of this room"
            })
            return;
        }

        const userChats = await PsClient.chat.findMany({
            where:{
                userId:userId,
                roomId: roomId,
            },

            take: 50,

            orderBy:{
                createdAt: "desc"
            }
        })

        res.status(200).json({
             userChats
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

userRouter.get("/chat/:slug",auth,async(req,res)=>{
   try{
        const slug = req.params.slug;
        const room = await PsClient.room.findFirst({
            where:{
                name: slug
            }
        });
        if(!room){
            res.status(404).json({
                message:"No such room exists"
            })
            return;
        }
        res.status(200).json({
            roomId: room.id
        })
        return;
   }
   catch(error:any){
    res.status(404).json({
        message: error.message
    })
    return;
   }
})


export {userRouter};