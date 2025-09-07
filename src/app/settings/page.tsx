import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, CreditCard, Gift, LogOut, Pencil, ShieldQuestion, User } from 'lucide-react';

const menuItems = [
    { label: 'My Profile', icon: User },
    { label: 'Payment Methods', icon: CreditCard },
    { label: 'Loyalty Rewards', icon: Gift },
    { label: 'Help Center', icon: ShieldQuestion },
    { label: 'Logout', icon: LogOut, className: 'text-destructive' },
];

export default function SettingsPage() {
  return (
    <div className="food-pattern min-h-screen">
       <header className="container mx-auto px-4 py-6">
        <h1 className="text-4xl font-headline font-bold">Settings</h1>
      </header>

      <main className="container mx-auto px-4">
        <Card className="p-6 flex items-center gap-4 mb-8 shadow-lg bg-card">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src="https://i.pravatar.cc/150?u=sylvia" alt="Sylvia" />
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <h1 className="text-2xl font-bold">Sylvia</h1>
            <p className="text-muted-foreground">sylvia@example.com</p>
          </div>
          <Button variant="ghost" size="icon">
            <Pencil className="h-5 w-5 text-primary" />
          </Button>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-0">
            <ul className="divide-y">
                {menuItems.map((item, index) => (
                    <li key={index}>
                        <button className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors">
                           <item.icon className={`h-5 w-5 ${item.className || 'text-muted-foreground'}`} />
                           <span className={`flex-grow ${item.className || 'font-medium'}`}>{item.label}</span>
                           {item.label !== 'Logout' && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                        </button>
                    </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
