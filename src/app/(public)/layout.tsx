import { PublicNav } from '@/components/public/PublicNav';
import { Footer } from '@/components/public/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
    </>
  );
}
