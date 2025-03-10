import express from 'express';
import { userRouter } from './userRoutes';
import cors from 'cors'
const app = express();
app.use(express.json());
app.use(cors()); // Allow all origins (for development)


app.use("/user",userRouter);


app.listen(3001,()=>{
    console.log("http-server started at port 3001");
})
