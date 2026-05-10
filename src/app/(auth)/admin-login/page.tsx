import { Suspense } from 'react';
import { AdminLoginForm } from './AdminLoginForm';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="card card-pad sm:p-8 animate-pulse h-96" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
