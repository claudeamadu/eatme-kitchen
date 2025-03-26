"use client"

import Link from "next/link"
import { Home, MenuIcon, FileText, Settings, ShoppingCart } from "lucide-react"

interface BottomNavProps {
  active: "home" | "menu" | "orders" | "settings" | "cart" | "reservation"
}

export default function BottomNav({ active }: BottomNavProps) {
  const navItems = [
    {
      name: "Home",
      href: "/home",
      icon: <Home className="h-5 w-5" />,
      id: "home",
    },
    {
      name: "Menu",
      href: "/menu",
      icon: <MenuIcon className="h-5 w-5" />,
      id: "menu",
    },
    {
      name: "Cart",
      href: "/cart",
      icon: <ShoppingCart className="h-5 w-5" />,
      id: "cart",
    },
    {
      name: "Orders",
      href: "/orders",
      icon: <FileText className="h-5 w-5" />,
      id: "orders",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      id: "settings",
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center py-2 px-4 ${active === item.id ? "text-red-600" : "text-gray-500"}`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

