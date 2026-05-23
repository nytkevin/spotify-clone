"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  //re-run this is router chnages
  useEffect(() => {
    router.push("/all");
  }, [router]);

  return <></>;
}
