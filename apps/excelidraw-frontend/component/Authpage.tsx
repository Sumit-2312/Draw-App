
import Input from '@repo/ui/Input'
export default function AuthPage({isSignin}:{isSignin: boolean}){
    return(
        <div className="h-screen w-screen flex justify-center items-center">
            <div className=" px-8 py-10  w-96 text-black bg-white flex gap-3 flex-col justify-center items-center rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold">{isSignin ? "Sign in" : "Sign up"}</h1>
                <div className='flex flex-col w-full gap-5'>
                    <Input label={"Username"} placeholder={"Enter username"} type={"text"} />
                    <Input label={"Email"} placeholder={"Enter email"} type={"text"} />
                    <Input label={"Password"} placeholder={"Enter password"} type={"password"} />
                    <button className="bg-green-800 hover:bg-green-600 cursor-pointer text-white px-5 py-2 rounded-xl">
                        {isSignin ? "Sign in" : "Sign up"}
                    </button>
                </div>
                <div>
                    {isSignin ? "Don't have an account?" : "Already have an account?"}
                    <span className="hover:font-bold cursor-pointer underline">
                        {isSignin ? "Sign up" : "Sign in"}
                    </span>
                </div>
            </div>
        </div>
    )
}