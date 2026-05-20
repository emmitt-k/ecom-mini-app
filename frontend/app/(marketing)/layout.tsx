import { Navbar } from "@/components/layout/navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} E-Commerce Mini App</p>
      </footer>
    </div>
  );
}
