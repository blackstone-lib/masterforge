import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Master Forge",
  description: "A worldbuilding dashboard for RPG masters"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ margin: 0, background: "#050505" }}>{children}</body>
    </html>
  );
}
