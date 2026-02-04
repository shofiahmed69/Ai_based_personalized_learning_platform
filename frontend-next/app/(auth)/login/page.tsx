import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-100">Sign in</h1>
        <p className="mb-6 text-center text-gray-400">AI Knowledge Base</p>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-gray-400">
          No account?{' '}
          <a href="/register" className="text-violet-400 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
