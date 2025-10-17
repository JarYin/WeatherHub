import SignIn from "@/modules/auth/components/SignIn";

export default function Home() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="flex-col">
        <h1 className="text-4xl font-bold">Welcome to WeatherHub</h1>
        <p className="mb-4 text-center font-medium">Track weather data across multiple cities</p>
        <SignIn />
      </div>
    </div>
  );
}
