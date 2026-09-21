import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '../components/ui/sonner'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata = {
  title: 'ERP Kerajinan Kayu ERP',
  description: 'ERP dashboard dengan tema monochrome'
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
