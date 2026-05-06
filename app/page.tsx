"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  //r e-run this is router chnages
  useEffect(() => {
    router.push("/all");
  }, [router]);

  return (
    <p className="text-center p-96 text-2xl font-bold leading-relaxed ml-32">
      Login to begin your Music Streaming experience
    </p>
  );
}
