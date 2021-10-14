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

/**
 *
 */
export function getWindowInnerWidth() {
  let widths = [window.innerWidth];
  if (window.screen?.width) {
    widths.push(window.screen?.width);
  }
  return Math.min(widths[0], widths[1]);
}
