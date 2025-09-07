import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, CreditCard, Gift, LogOut, Pencil, ShieldQuestion } from 'lucide-react';

const menuItems = [
    { label: 'Payment Methods', icon: CreditCard },
    { label: 'Loyalty Rewards', icon: Gift },
    { label: 'Help Center', icon: ShieldQuestion },
    { label: 'Logout', icon: LogOut, className: 'text-destructive' },
];

export default function SettingsPage() {
  return (
    <div className="bg-muted min-h-full">
      <div 
        className="absolute inset-x-0 top-0 h-64 bg-card"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>
      <div className="relative container mx-auto px-4 py-8">
        <Card className="p-6 flex items-center gap-4 mb-8 shadow-lg">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src="https://i.pravatar.cc/150?u=sylvia" alt="Sylvia" />
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <h1 className="text-2xl font-bold">Sylvia</h1>
            <p className="text-muted-foreground">055 414 2456</p>
          </div>
          <Button variant="ghost" size="icon">
            <Pencil className="h-5 w-5 text-primary" />
          </Button>
        </Card>

        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
                {menuItems.map((item, index) => (
                    <li key={index}>
                        <button className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors">
                           <item.icon className={`h-5 w-5 ${item.className || 'text-muted-foreground'}`} />
                           <span className={`flex-grow ${item.className}`}>{item.label}</span>
                           {item.label !== 'Logout' && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                        </button>
                    </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
