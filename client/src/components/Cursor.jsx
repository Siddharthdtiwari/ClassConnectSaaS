import { useEffect, useRef } from 'react'

// Custom cursor dot. The shared stylesheet hides the native cursor on hover-capable
// devices, so this element must exist on every page or the pointer is invisible.
export default function Cursor() {
  const ref = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const el = ref.current
    const move = e => {
      el.style.left = e.clientX + 'px'
      el.style.top = e.clientY + 'px'
    }
    // Grow the dot over any interactive element; event delegation instead of the old
    // per-element listeners so dynamically rendered React content is covered too.
    const over = e => {
      if (e.target.closest('a,button,.theme-toggle,select,input,textarea')) el.classList.add('big')
    }
    const out = e => {
      if (e.target.closest('a,button,.theme-toggle,select,input,textarea')) el.classList.remove('big')
    }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseover', over)
    document.addEventListener('mouseout', out)
    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', over)
      document.removeEventListener('mouseout', out)
    }
  }, [])

  return <div id="cur" ref={ref} />
}
