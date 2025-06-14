import MainNavbar from "@/components/MainNavbar";
import AppSidebar from "@/components/SimpleSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNavbar />
      <SidebarProvider>
        <div className="flex flex-1">
          <AppSidebar />
          <main className="flex-1 p-8 bg-white">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  );
}
