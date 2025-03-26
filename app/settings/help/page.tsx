"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Bug, HelpCircle, RefreshCw, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BottomNav } from "@/components/bottom-nav"

export default function HelpCenterPage() {
  const router = useRouter()

  const helpOptions = [
    {
      id: "bug",
      title: "Report a bug",
      description: "Let us know any specific issue you are experiencing.",
      icon: <Bug className="h-5 w-5" />,
      href: "/settings/help/report-bug",
    },
    {
      id: "reservation",
      title: "Reservation assistance",
      description: "Need help with booking or modifying a table reservation? Click here for support.",
      icon: <HelpCircle className="h-5 w-5" />,
      href: "/settings/help/reservation",
    },
    {
      id: "refunds",
      title: "Refunds & cancellations",
      description: "Need to cancel an order or request a refund? Here's how to do it.",
      icon: <RefreshCw className="h-5 w-5" />,
      href: "/settings/help/refunds",
    },
    {
      id: "feedback",
      title: "Other feedback",
      description: "Let us know how we can serve you better.",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/settings/help/feedback",
    },
  ]

  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/background.png" alt="Background pattern" fill className="object-cover" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 flex items-center bg-white bg-opacity-90">
        <Button variant="outline" size="icon" className="mr-2 rounded-full bg-white" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Help Center</h1>
      </header>

      {/* Help Options */}
      <section className="relative z-10 px-4 mt-4">
        <div className="space-y-4">
          {helpOptions.map((option, index) => (
            <div key={option.id}>
              <div
                className="flex items-start p-4 bg-white rounded-lg shadow-md"
                onClick={() => router.push(option.href)}
              >
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-navy-blue">{option.title}</h3>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
              </div>
              {index < helpOptions.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </div>
      </section>

      <BottomNav active="settings" />
    </main>
  )
}

