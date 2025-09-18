
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/hooks/use-onboarding';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { LoyaltyData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


const rewards = [
    {
        id: 'referrals',
        title: 'Referral Feast',
        description: 'Refer 10 friends and gain a whooping 1000pts',
        image: '/assets/rewards/ccc2546fd6f43a6f92d59440a884f685.png',
        imageHint: 'group of friends',
        target: 10,
    },
    {
        id: 'orderedFoodIds',
        title: 'First Bite Bonus',
        description: 'Enjoy extra points when you try a new menu item.',
        image: '/assets/rewards/7e0d309cc3a115c115f99deae34c3fee.png',
        imageHint: 'delicious meal',
        tag: '10 pts per try',
    },
    {
        id: 'loyalty-lunch',
        title: 'Loyalty Lunch',
        description: 'Unlock a free lunch after several visits.',
        image: '/assets/rewards/d6e4b0dc2e8998bba353d284473391d0.png',
        imageHint: 'thumbs up',
    },
    {
        id: 'birthday-bash',
        title: 'Birthday Bash',
        description: 'Celebrate your birthday with bonus points and exclusive perks.',
        image: '/assets/rewards/9cc08b0ff7a667d769d134a037bbc641.png',
        imageHint: 'birthday gift',
    },
    {
        id: 'reviews',
        title: 'Feedback Star',
        description: 'Get rewarded for leaving 8 reviews.',
        image: '/assets/rewards/93ca13d285236f95c503b594686917a4.png',
        imageHint: 'five star review',
        target: 8,
    },
];

export default function LoyaltyRewardsPage() {
  const router = useRouter();
  const { user } = useOnboarding();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      const loyaltyRef = doc(db, 'users', user.uid, 'loyalty', 'data');
      const unsubscribe = onSnapshot(loyaltyRef, (docSnap) => {
        if (docSnap.exists()) {
          setLoyaltyData(docSnap.data() as LoyaltyData);
        } else {
          setLoyaltyData({ points: 0, referrals: 0, reviews: 0, orders: 0, orderedFoodIds: [] });
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleRedeem = () => {
    toast({
        title: "How to use your points",
        description: "You can apply your points for a discount directly at checkout!",
    });
  };

  if (isLoading) {
    return (
      <div className="food-pattern min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="food-pattern min-h-screen pb-24">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-transparent z-10">
        <Button size="icon" variant="ghost" className="rounded-full bg-card" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-headline font-bold">Loyalty Rewards</h1>
      </header>

      <main className="container mx-auto px-4">
        <Card className="shadow-xl rounded-2xl mb-4">
          <CardContent className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground">Points</p>
                <p className="text-4xl font-bold text-destructive">{loyaltyData?.points || 0} <span className="text-2xl">pts</span></p>
                <p className="text-sm font-semibold text-muted-foreground">5% off your next meal order</p>
                <Button className="mt-3 rounded-full bg-red-600 hover:bg-red-700 text-white px-8" onClick={handleRedeem}>Redeem</Button>
              </div>
              <Image src="/assets/rewards/9cc08b0ff7a667d769d134a037bbc641.png" alt="Gift box" width={120} height={90} data-ai-hint="gift box" className="w-32 h-auto" />
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-muted-foreground mb-6">Earn more points and enjoy exclusive benefits</p>


        <div className="grid grid-cols-2 gap-4">
          {rewards.map((reward) => {
            const currentProgress = loyaltyData ? loyaltyData[reward.id] as number || 0 : 0;
            const progressValue = reward.target ? (currentProgress / reward.target) * 100 : undefined;
            const progressText = reward.target ? `${currentProgress}/${reward.target}` : undefined;

            if (reward.id === 'orderedFoodIds') {
                const firstBites = loyaltyData?.orderedFoodIds?.length || 0;
                return (
                    <Card key={reward.id} className="shadow-lg rounded-2xl">
                    <CardContent className="p-4 text-center flex flex-col justify-between h-full">
                        <div>
                            <Image src={reward.image} alt={reward.title} width={100} height={75} data-ai-hint={reward.imageHint} className="mx-auto mb-3 h-20 object-contain" />
                            <h3 className="font-bold font-headline">{reward.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1 mb-3 h-8">{reward.description}</p>
                        </div>
                        <div className="flex flex-col items-center">
                           <Badge variant="secondary" className="mt-2 bg-red-100 text-red-700 border-none font-semibold">
                                {firstBites} New trys
                           </Badge>
                        </div>
                    </CardContent>
                    </Card>
                )
            }

            return (
                <Card key={reward.id} className="shadow-lg rounded-2xl">
                <CardContent className="p-4 text-center flex flex-col justify-between h-full">
                    <div>
                        <Image src={reward.image} alt={reward.title} width={100} height={75} data-ai-hint={reward.imageHint} className="mx-auto mb-3 h-20 object-contain" />
                        <h3 className="font-bold font-headline">{reward.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 mb-3 h-8">{reward.description}</p>
                    </div>
                    {progressValue !== undefined && progressText !== undefined ? (
                    <div className="flex items-center gap-2">
                        <Progress value={progressValue} className="h-2 flex-1" />
                        <span className="text-xs font-semibold text-muted-foreground">{progressText}</span>
                    </div>
                    ) : (
                        reward.tag && <Badge variant="secondary" className="bg-red-100 text-red-700 border-none font-semibold mx-auto">{reward.tag}</Badge>
                    )}
                </CardContent>
                </Card>
            )
          })}
        </div>
      </main>
    </div>
  );
}

    