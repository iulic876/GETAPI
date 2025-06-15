import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar />
        <main style={{ flex: 1 }}>{children}</main>
      </div>
    </SidebarProvider>
  );
} 