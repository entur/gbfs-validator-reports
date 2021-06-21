import { useCallback, useEffect, useState } from "react";



export const usePathParam = (position: number): [string | undefined, (newValue: string | null) => void] => {
  const [currentValue, setCurrentValue] = useState<string | undefined>(window.location.pathname.split('/')[position+1]);

  const handler = useCallback(() => {
    setCurrentValue(window.location.pathname.split('/')[position+1])
  }, [position])

  const setter = useCallback((newValue: string | null) => {
    if (newValue == null) {
      window.history.pushState({}, document.title, '/');
      setCurrentValue(undefined);
    } else {
      window.history.pushState({}, document.title, `/${newValue}`);
      setCurrentValue(newValue);
    }

  }, []);

  useEffect(() => {
    window.addEventListener('popstate', handler);

    return () => {
      window.removeEventListener('popstate', handler);
    }
  }, [handler]);

  return [currentValue, setter];
}