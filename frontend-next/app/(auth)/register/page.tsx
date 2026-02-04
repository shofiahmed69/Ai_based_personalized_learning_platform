import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-100">Create account</h1>
        <p className="mb-6 text-center text-gray-400">AI Knowledge Base</p>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <a href="/login" className="text-violet-400 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
