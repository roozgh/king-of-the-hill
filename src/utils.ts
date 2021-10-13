import { useEffect } from "react";

/**
 *
 */
export const useWindowEvent = (event: any, callback: any) => {
  useEffect(() => {
    window.addEventListener(event, callback);
    return () => window.removeEventListener(event, callback);
  }, [event, callback]);
};

/**
 *
 */
export function delay(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}
