import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { Calendar, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-primary to-primary/80 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo in Hero */}
          <div className="flex justify-center mb-6">
            <Logo size="lg" showText={false} className="opacity-90" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing Events
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Find, book, and attend events that inspire you. Or create your own and bring people together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="#events">
                <Calendar className="w-5 h-5 mr-2" />
                Browse Events
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/register">
                <Users className="w-5 h-5 mr-2" />
                Start Organizing
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Features */}
      <div className="container mx-auto px-4 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Event Discovery</h3>
            <p className="opacity-90">Find events that match your interests with powerful search and filtering.</p>
          </div>
          <div className="text-center">
            <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Location-Based</h3>
            <p className="opacity-90">Discover events happening near you or in your favorite destinations.</p>
          </div>
          <div className="text-center">
            <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
            <p className="opacity-90">Connect with like-minded people and build lasting memories together.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
