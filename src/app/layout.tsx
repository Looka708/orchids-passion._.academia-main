import type { Metadata } from 'next'
import { Inter, Noto_Nastaliq_Urdu } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { AuthProvider } from '@/hooks/useAuth'
import SafetyShield from '@/components/safety-shield'
import { ScrollProgress, MovingGreenLine } from '@/components/scroll-progress'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  subsets: ['arabic', 'latin'],
  variable: '--font-urdu',
  weight: ['400', '700']
})

export const metadata: Metadata = {
  title: 'Passion Academia - Fuel Your Ambition',
  description: 'Explore a universe of knowledge with courses designed to help you achieve your goals. Your journey to excellence starts here.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased content-protection',
          inter.variable,
          notoNastaliqUrdu.variable
        )}
      >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <ScrollProgress />
              <MovingGreenLine />
              <SafetyShield />
              <div className="relative flex min-h-dvh flex-col bg-background">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
