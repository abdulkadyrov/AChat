import type { PropsWithChildren } from "react";
import { BottomNavigation } from "@/widgets/navigation/ui/bottom-navigation";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6">
      <div className="relative flex flex-1 overflow-hidden rounded-shell border border-white/60 bg-white/55 shadow-shell backdrop-blur-2xl dark:border-white/10 dark:bg-[#0f1724]/85">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(11,122,67,0.08),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(23,201,100,0.08),transparent_35%)]" />
        <div className="relative flex min-h-[calc(100vh-3rem)] w-full flex-col">
          <main className="flex-1 px-4 pb-24 pt-5 sm:px-6 sm:pb-28">{children}</main>
          <BottomNavigation />
        </div>
      </div>
    </div>
  );
}
