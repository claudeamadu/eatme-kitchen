import Link from 'next/link';
import { ChefHat, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline sm:inline-block">
              EatMe
            </span>
          </Link>
        </div>
        <nav className="flex-1 flex items-center space-x-4">
          <Link href="/" passHref>
             <Button variant="ghost">Home</Button>
          </Link>
          <Link href="/favorites" passHref>
             <Button variant="ghost">Favorites</Button>
          </Link>
        </nav>
        <div className="flex items-center justify-end space-x-4">
          <Link href="/favorites" passHref>
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Favorites</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
