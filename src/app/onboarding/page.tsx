'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/hooks/use-onboarding';
import { cn } from '@/lib/utils';
import { ChefHat, Heart, Search } from 'lucide-react';

const onboardingSteps = [
  {
    image: 'https://picsum.photos/800/1200',
    imageHint: 'delicious food',
    title: 'With Every Bite',
    description: 'Savor the Burst of Flavor and Freshness.',
    icon: ChefHat,
  },
  {
    image: 'https://picsum.photos/800/1200',
    imageHint: 'recipe book',
    title: 'Discover New Tastes',
    description: 'Explore thousands of recipes from around the world.',
    icon: Search,
  },
  {
    image: 'https://picsum.photos/800/1200',
    imageHint: 'favorite meal',
    title: 'Save Your Favorites',
    description: 'Never lose a recipe again. Keep them all in one place.',
    icon: Heart,
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const { completeOnboarding } = useOnboarding();
  const router = useRouter();

  const handleNext = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleSkip();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.push('/');
  };

  const currentStep = onboardingSteps[step];

  return (
    <div className="fixed inset-0 bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          <Image
            src={currentStep.image}
            alt={currentStep.title}
            fill
            className="object-cover"
            data-ai-hint={currentStep.imageHint}
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute top-4 right-4 z-20">
        <Button onClick={handleSkip} variant="ghost" className="bg-white/80 hover:bg-white text-foreground rounded-full">
          Skip
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 p-8 bg-card/90 backdrop-blur-sm rounded-t-3xl">
        <div className="text-center">
            <AnimatePresence mode="out-in">
                 <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                >
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <currentStep.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-headline font-bold text-foreground">{currentStep.title}</h2>
                    <p className="text-muted-foreground mt-2 text-lg">{currentStep.description}</p>
                 </motion.div>
            </AnimatePresence>

          <div className="flex justify-center gap-2 my-8">
            {onboardingSteps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-300',
                  i === step ? 'w-6 bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>
          <Button onClick={handleNext} size="lg" className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white">
            {step === onboardingSteps.length - 1 ? "Let's Go!" : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
