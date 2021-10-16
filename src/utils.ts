import { useEffect, useRef } from "react";

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

/**
 * For detecting compoenent prop changes
 * Usefull for optimisation
 */
export function useTraceUpdate(props: any) {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, Object.create(null));

    if (Object.keys(changedProps).length > 0) {
      console.log("Changed Props:", changedProps);
    }
    prev.current = props;
  });
}
