import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white flex flex-col justify-between">
      <Navbar />
      <Hero />
      <Footer />
    </main>
  );
}
