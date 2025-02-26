import express from 'express';
import auth from './auth';
const userRouter = express.Router();

userRouter.post("/signup",async( req,res)=>{
    const {username,password} = req.body;
    // add the zod validation
    // add the db logic

    const user={
        username: "Sumit",
        password: " 12344",
    };

    // add the user to the database

    res.status(200).json({
        message:"You are signed up",
        user
    })
    return;
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