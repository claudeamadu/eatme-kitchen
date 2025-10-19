
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
  const router = useRouter();
  
  return (
    <div className="food-pattern min-h-screen pb-24">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-transparent z-10">
        <Button size="icon" variant="ghost" className="rounded-full bg-card" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-headline font-bold">Privacy Policy</h1>
      </header>

      <main className="container mx-auto px-4">
        <Card className="shadow-lg">
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            
            <p>Welcome to EatMe. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.</p>

            <h2 className="text-lg font-bold">1. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect on the App includes:</p>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the App.</li>
                <li><strong>Contact List:</strong> We may request access to your device's contact list to enable features like inviting friends to reservations. We will ask for your explicit consent before accessing your contacts. This information is used solely for the purpose of the feature and is not shared with third parties for other purposes.</li>
                <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the App, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the App.</li>
            </ul>

            <h2 className="text-lg font-bold">2. Use of Your Information</h2>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the App to:</p>
            <ul className="list-disc list-inside space-y-2">
                <li>Create and manage your account.</li>
                <li>Email you regarding your account or order.</li>
                <li>Fulfill and manage purchases, orders, payments, and other transactions related to the App.</li>
                <li>Enable user-to-user communications.</li>
                <li>Generate a personal profile about you to make future visits to the App more personalized.</li>
            </ul>

             <h2 className="text-lg font-bold">3. Disclosure of Your Information</h2>
            <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
             <ul className="list-disc list-inside space-y-2">
                <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
            </ul>

            <h2 className="text-lg font-bold">4. Security of Your Information</h2>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

            <h2 className="text-lg font-bold">Contact Us</h2>
            <p>If you have questions or comments about this Privacy Policy, please contact us at: privacy@eatmekitchen.org</p>
          
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
