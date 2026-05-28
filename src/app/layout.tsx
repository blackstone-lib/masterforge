import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Master Forge",
  description: "A worldbuilding dashboard for RPG masters"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
