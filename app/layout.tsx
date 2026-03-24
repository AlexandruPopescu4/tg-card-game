import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "TG Card Game",
  description: "Telegram Mini App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}

        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}