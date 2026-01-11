import { AuthHeader } from '@/components/layout/auth-header'

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AuthHeader />
      {children}
    </div>
  )
}
