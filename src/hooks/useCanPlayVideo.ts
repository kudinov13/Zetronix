import { useEffect, useState } from "react";

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

export function useCanPlayVideo(): boolean {
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = (
      navigator as Navigator & { connection?: NetworkInformationLike }
    ).connection;
    const slowConnection =
      connection?.saveData === true ||
      connection?.effectiveType === "2g" ||
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "3g";
    setCanPlay(!reduced && !slowConnection);
  }, []);

  return canPlay;
}
