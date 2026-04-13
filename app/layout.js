import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import { AdminProvider } from "@/lib/AdminContext";
import { MenuProvider } from "@/lib/MenuContext";
import { OrderProvider } from "@/lib/OrderContext";
import CallWaiterFAB from "@/components/CallWaiterFAB";

export const metadata = {
  title: "LUXE DINE | AR Restaurant Menu",
  description:
    "Experience dining like never before. Browse our gourmet menu in stunning 3D and AR. Scan, explore, and order — all from your table.",
  keywords: "restaurant, AR menu, 3D food, fine dining, luxury restaurant",
  openGraph: {
    title: "LUXE DINE | AR Restaurant Menu",
    description: "Experience dining like never before with our immersive AR menu.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍽️</text></svg>" />
        
        {/* Performance Optimization: Preconnect to CDNs */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://ajax.googleapis.com" />
      </head>
      <body suppressHydrationWarning>
        <AdminProvider>
          <MenuProvider>
            <OrderProvider>
              <CartProvider>
                {children}
                <CallWaiterFAB />
              </CartProvider>
            </OrderProvider>
          </MenuProvider>
        </AdminProvider>
      </body>
    </html>
  );
}
