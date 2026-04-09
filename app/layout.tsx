import "./globals.css";


export const metadata = {
  title: "Smart Travel Planner",
  description: "AI travel planning app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}