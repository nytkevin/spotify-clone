"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PlayerProvider } from "@/app/context/playerContext";

const queryClient = new QueryClient();
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PlayerProvider>{children}</PlayerProvider>
    </QueryClientProvider>
  );
}
