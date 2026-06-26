import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { TripCommunicationDrawer } from "@/features/communication/components/TripCommunicationDrawer";
import { useSocket } from "@/hooks/useSocket";

export function DashboardLayout() {
  useSocket();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="sticky top-0 h-screen shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        {/* Scroll only this area */}
        <main className="page-scroll flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <TripCommunicationDrawer />
    </div>
  );
}

export { AuthLayout } from "@/features/auth/components/AuthLayout";
