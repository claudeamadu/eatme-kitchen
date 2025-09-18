import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { OnboardingProvider } from '@/hooks/use-onboarding';

export const metadata: Metadata = {
  title: 'EatMe - Your Culinary Companion',
  description: 'Discover and save your favorite recipes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://eatme-kitchen.vercel.app/assets/EatMeLogo.png"
          rel="icon shortcut"
        />
      </head>
      <body className="font-body antialiased">
        <OnboardingProvider>
          {children}
          <Toaster />
        </OnboardingProvider>
      </body>
    </html>
  );
}
