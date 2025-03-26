import Link from "next/link"
import { Home, Menu, ShoppingBag, Calendar, Settings } from "lucide-react"

type BottomNavProps = {
  active: "home" | "menu" | "orders" | "reservations" | "settings"
}

export function BottomNav({ active }: BottomNavProps) {
  const navItems = [
    {
      name: "Home",
      icon: <Home className={active === "home" ? "text-red-600" : "text-gray-500"} />,
      href: "/home",
      isActive: active === "home",
    },
    {
      name: "Menu",
      icon: <Menu className={active === "menu" ? "text-red-600" : "text-gray-500"} />,
      href: "/menu",
      isActive: active === "menu",
    },
    {
      name: "Orders",
      icon: <ShoppingBag className={active === "orders" ? "text-red-600" : "text-gray-500"} />,
      href: "/orders",
      isActive: active === "orders",
    },
    {
      name: "Reservations",
      icon: <Calendar className={active === "reservations" ? "text-red-600" : "text-gray-500"} />,
      href: "/reservations",
      isActive: active === "reservations",
    },
    {
      name: "Settings",
      icon: <Settings className={active === "settings" ? "text-red-600" : "text-gray-500"} />,
      href: "/settings",
      isActive: active === "settings",
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 py-2">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center ${item.isActive ? "text-red-600" : "text-gray-500"}`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

