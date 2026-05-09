import './globals.css'
import Header from '../components/Header'

export const metadata = {
  title: 'ERP Portfolio - Next.js + Supabase',
  description: 'Demo ERP rebuild'
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Header />
        <main className="site-main">{children}</main>
      </body>
    </html>
  )
}
