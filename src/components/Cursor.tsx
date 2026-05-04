import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function Cursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [trail, setTrail] = useState({ x: -100, y: -100 })
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    const click = () => { setClicked(true); setTimeout(() => setClicked(false), 300) }
    window.addEventListener('mousemove', move)
    window.addEventListener('click', click)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('click', click)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTrail(prev => ({
        x: prev.x + (pos.x - prev.x) * 0.15,
        y: prev.y + (pos.y - prev.y) * 0.15
      }))
    }, 16)
    return () => clearInterval(interval)
  }, [pos])

  return (
    <>
      <motion.div
        className="cursor-dot"
        style={{ left: pos.x - 6, top: pos.y - 6 }}
        animate={{ scale: clicked ? 2 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <div
        className="cursor-trail"
        style={{ left: trail.x - 18, top: trail.y - 18 }}
      />
    </>
  )
}
