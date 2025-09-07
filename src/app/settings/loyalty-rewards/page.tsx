
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const rewards = [
    {
        title: 'Referral Feast',
        description: 'Refer 10 friends and gain a whooping 1000pts',
        image: 'https://picsum.photos/200/150?random=50',
        imageHint: 'group of friends',
        progress: 10,
        progressText: '1/10',
    },
    {
        title: 'First Bite Bonus',
        description: 'Enjoy extra points when you try a new menu item.',
        image: 'https://picsum.photos/200/150?random=51',
        imageHint: 'delicious meal',
        tag: '6 New trys',
    },
    {
        title: 'Loyalty Lunch',
        description: 'Unlock a free lunch after several visits.',
        image: 'https://picsum.photos/200/150?random=52',
        imageHint: 'thumbs up',
    },
    {
        title: 'Birthday Bash',
        description: 'Celebrate your birthday with bonus points and exclusive perks.',
        image: 'https://picsum.photos/200/150?random=53',
        imageHint: 'birthday gift',
    },
    {
        title: 'Feedback Star',
        description: 'Get rewarded for leaving 8 reviews.',
        image: 'https://picsum.photos/200/150?random=54',
        imageHint: 'five star review',
        progress: 12.5,
        progressText: '1/8',
    },
];

export default function LoyaltyRewardsPage() {
  const router = useRouter();

  return (
    <div className="food-pattern min-h-screen pb-24">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-transparent z-10">
        <Button size="icon" variant="ghost" className="rounded-full bg-card" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-headline font-bold">Loyalty Rewards</h1>
      </header>

      <main className="container mx-auto px-4">
        <Card className="shadow-xl rounded-2xl mb-8">
          <CardContent className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground">Points</p>
                <p className="text-4xl font-bold text-destructive">1,000 <span className="text-2xl">pts</span></p>
                <p className="text-sm font-semibold text-muted-foreground">5% off your next meal order</p>
                <Button className="mt-3 rounded-full bg-red-600 hover:bg-red-700 text-white px-8">Redeem</Button>
              </div>
              <Image src="https://picsum.photos/200/150?random=55" alt="Gift box" width={120} height={90} data-ai-hint="gift box" className="w-32 h-auto" />
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground mb-6">Earn more points and enjoy exclusive benefits</p>

        <div className="grid grid-cols-2 gap-4">
          {rewards.map((reward, index) => (
            <Card key={index} className="shadow-lg rounded-2xl">
              <CardContent className="p-4 text-center">
                <Image src={reward.image} alt={reward.title} width={100} height={75} data-ai-hint={reward.imageHint} className="mx-auto mb-3 h-20 object-contain" />
                <h3 className="font-bold font-headline">{reward.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-3 h-8">{reward.description}</p>
                {reward.progress !== undefined && (
                  <div className="flex items-center gap-2">
                    <Progress value={reward.progress} className="h-2" />
                    <span className="text-xs font-semibold text-muted-foreground">{reward.progressText}</span>
                  </div>
                )}
                {reward.tag && (
                    <Badge variant="secondary" className="bg-red-100 text-red-700 border-none font-semibold">{reward.tag}</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
