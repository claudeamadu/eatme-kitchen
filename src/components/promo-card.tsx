
import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { promo } from '@/lib/types';

export function PromoCard({ title, description, buttonText, imageUrl, imageHint, imagePosition, href }: promo) {
  return (
    <Card className="shadow-lg rounded-2xl overflow-hidden">
      <CardContent className={cn("p-6 flex items-center justify-between gap-4", imagePosition === 'left' ? 'flex-row-reverse' : '')}>
        <div className="flex-1">
          <h3 className="text-xl font-headline font-bold text-foreground">{title}</h3>
          <p className="text-muted-foreground mt-1 mb-4">{description}</p>
          <Link href={href}>
            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6">{buttonText}</Button>
          </Link>
        </div>
        <div className="hidden md:block">
           {imageUrl && imageUrl.trim() !== '' && (
            <Image
              src={imageUrl}
              alt={title}
              width={150}
              height={150}
              className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-md"
              data-ai-hint={imageHint}
            />
           )}
        </div>
      </CardContent>
    </Card>
  );
}
