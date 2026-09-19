import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm">
        <div className="hazard h-3 rounded-t" aria-hidden />
        <div className="panel rounded-t-none border-t-0 p-6">
          <h1 className="text-3xl">Site Attendance</h1>
          <p className="mb-6 mt-1 text-steel">Sign in to manage sites and workers.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
