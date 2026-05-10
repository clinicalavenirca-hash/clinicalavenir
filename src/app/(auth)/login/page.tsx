import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="card card-pad sm:p-8 animate-pulse h-96" />}>
      <LoginForm />
    </Suspense>
  );
}
