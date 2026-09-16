import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

/*
  next/font downloads these at BUILD time and self-hosts them.
  No request to Google's servers at runtime — faster, and better
  for privacy/GDPR. The `variable` option exposes each font as a
  CSS variable, which globals.css then maps to --font-display / --font-sans.
*/
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

/*
  Metadata is how Next.js handles <title> and <meta> tags.
  This affects SEO and how links look when shared.
*/
export const metadata: Metadata = {
  title: {
    default: "Clocktower — Student housing in Ormskirk",
    // Child pages set their own title; it slots into this pattern.
    template: "%s | Clocktower",
  },
  description:
    "Find student accommodation near Edge Hill University, ranked by how far it actually is from campus.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /*
      suppressHydrationWarning is required by next-themes. It stops React
      complaining that the server-rendered HTML doesn't match the client,
      which is expected here because the theme class is applied in the browser.
    */
    <html lang="en-GB" suppressHydrationWarning>
      <body className={`${geist.variable} ${bricolage.variable}`}>
        <ThemeProvider
          attribute="class"       // toggles a .dark class on <html>
          defaultTheme="system"   // respects the user's OS setting
          enableSystem
          disableTransitionOnChange // stops colours animating awkwardly on switch
        >
          {children}
          {/* Mounted once here so any component anywhere can fire a toast */}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}