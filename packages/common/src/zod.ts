import {z} from 'zod';

const UserSchema = z.object({
    username: z.string().min(5).max(20),
    password: z.string().min(6).max(12),
    email : z.string().email()
})

const RoomSchema = z.object({
    roomId : z.string()
})