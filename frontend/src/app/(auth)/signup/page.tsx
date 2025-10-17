import SignUp from "@/modules/auth/components/SignUp";

export default function SignUpPage() {
    return(
        <div className="min-h-screen flex justify-center items-center">
            <div className="flex-col">
                <h1 className="text-4xl text-center font-bold">Create an Account</h1>
                <p className="mb-4 text-center font-medium">Join WeatherHub to start tracking weather data</p>
                <SignUp />
            </div>
        </div>
    )
}