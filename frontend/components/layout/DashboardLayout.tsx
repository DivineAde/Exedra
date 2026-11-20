import { Suspense } from "react";
import { Sidebar } from "@/components/navigation/Sidebar";

/** App shell: fixed-height, so only the page content scrolls and the sidebar
 * and top bar stay put. */
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Sidebar reads the URL (?filter=) to highlight the active view. */}
      <Suspense fallback={<aside className="hidden w-[264px] shrink-0 border-r bg-sidebar md:block" />}>
        <Sidebar />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
