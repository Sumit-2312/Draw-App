import express from 'express';
import { userRouter } from './userRoutes';
import {starter} from '@repo/backend-common/db'
const app = express();
app.use(express.json());


app.use("/user",userRouter);


app.listen(3001,()=>{
    console.log("http-server started at port 3001");
})
