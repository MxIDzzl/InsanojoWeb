"use client";

import { useEffect, useState } from "react";

export default function MaintenanceCountdown({ targetDate }: { targetDate: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    function tick() {
      const target = new Date(targetDate).getTime();
      const diff = Math.max(0, target - Date.now());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setRemaining(`${hours}h ${minutes}m ${seconds}s`);
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return <p className="mt-5 text-sm text-purple-300">Tiempo estimado restante: {remaining}</p>;
}
