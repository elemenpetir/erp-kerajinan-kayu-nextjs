import './globals.css'

export const metadata = {
  title: 'ERP Kerajinan Kayu ERP',
  description: 'ERP dashboard dengan tema monochrome'
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
