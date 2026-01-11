import { AppSidebar } from '@/components/layout/app-sidebar'
import { NavBottom } from '@/components/layout/bottom-nav'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex">
      <AppSidebar />

      <main className="w-full h-screen">{children}</main>
      <NavBottom />
      <Toaster />
    </div>
  )
}
