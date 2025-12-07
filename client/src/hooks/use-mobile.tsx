import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    
    // Set initial value
    setIsMobile(mql.matches)
    
    // Add event listener
    mql.addEventListener("change", onChange)
    
    // Cleanup function
    return () => {
      mql.removeEventListener("change", onChange)
    }
  }, [])

  return !!isMobile
}
