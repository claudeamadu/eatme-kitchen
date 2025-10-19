
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div className="food-pattern min-h-screen pb-24">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-transparent z-10">
        <Button size="icon" variant="ghost" className="rounded-full bg-card" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-headline font-bold">Terms of Service</h1>
      </header>
      
      <main className="container mx-auto px-4">
        <Card className="shadow-lg">
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-lg font-bold">1. Agreement to Terms</h2>
            <p>By using our mobile application, EatMe, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the App.</p>

            <h2 className="text-lg font-bold">2. User Accounts</h2>
            <p>You may be required to create an account to access certain features of the App. You are responsible for safeguarding your account and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>

            <h2 className="text-lg font-bold">3. User Conduct</h2>
            <p>You agree not to use the App to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Violate any applicable laws or regulations.</li>
              <li>Post any content that is harmful, fraudulent, deceptive, threatening, harassing, defamatory, obscene, or otherwise objectionable.</li>
              <li>Infringe on the intellectual property rights of others.</li>
            </ul>
            
            <h2 className="text-lg font-bold">4. Intellectual Property</h2>
            <p>The App and its original content, features, and functionality are and will remain the exclusive property of EatMe and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of EatMe.</p>

            <h2 className="text-lg font-bold">5. Termination</h2>
            <p>We may terminate or suspend your account and bar access to the App immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>

            <h2 className="text-lg font-bold">6. Limitation of Liability</h2>
            <p>In no event shall EatMe, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the App.</p>

            <h2 className="text-lg font-bold">Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect.</p>

            <p className="pt-4 text-xs text-muted-foreground"><strong>Disclaimer:</strong> This is a template terms of service agreement. You should consult with a legal professional to ensure this agreement is suitable for your business and complies with all applicable laws.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
