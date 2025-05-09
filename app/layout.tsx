import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "IndabaPro - School Readiness & Scholastic Assessments",
  description: "Helping schools efficiently track and analyze student assessment data",
  icons: {
    icon: '/images/indabapro logo.png',
    apple: '/images/indabapro logo.png',
  },
  openGraph: {
    title: "IndabaPro - School Readiness & Scholastic Assessments",
    description: "Helping schools efficiently track and analyze student assessment data",
    images: ['/opengraph-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "IndabaPro - School Readiness & Scholastic Assessments",
    description: "Helping schools efficiently track and analyze student assessment data",
    images: ['/twitter-image.png'],
  },
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
