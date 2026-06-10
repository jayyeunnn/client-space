import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClientSpace — One link. Full clarity.",
  description:
    "Platform client portal untuk freelancer. Bagikan progress, milestone, file, dan invoice ke klien — dalam satu link.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${dmSans.variable} ${instrumentSerif.variable} antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-ui)",
              fontSize: 13,
              borderRadius: 8,
              border: "1px solid var(--cs-bd)",
              background: "var(--cs-surface)",
              color: "var(--cs-ink)",
            },
          }}
        />
      </body>
    </html>
  );
}
