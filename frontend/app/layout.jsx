import './globals.css'
import { Toaster } from '../components/ui/sonner'

export const metadata = {
  title: 'ERP Kerajinan Kayu ERP',
  description: 'ERP dashboard dengan tema monochrome'
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
        <Toaster position="top-right" richColors={false} />
      </body>
    </html>
  )
}
