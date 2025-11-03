"use client"

import { motion, animate } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Card, CardContent } from "../../../components/card"
import { useState, useEffect } from "react"

interface ActivityStatsProps {
  activeDays: number
  totalMinutes: number
  totalSports: number
  totalBookings: number
}

function useAnimatedCounter(end: number, duration: number = 2) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const controls = animate(0, end, {
      duration,
      onUpdate: (value) => setCount(Math.round(value)),
    })

    return () => controls.stop()
  }, [end])

  return count
}

export default function ActivityStats({ activeDays, totalMinutes, totalSports, totalBookings }: ActivityStatsProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const animatedActiveDays = useAnimatedCounter(activeDays)
  const animatedTotalHours = useAnimatedCounter(Math.round(totalMinutes / 60))
  const animatedTotalSports = useAnimatedCounter(totalSports)
  const animatedTotalBookings = useAnimatedCounter(totalBookings)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 py-12 max-w-4xl mx-auto"
    >
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-[#21a696]">
          <CardContent className="p-6 text-center">
            <h3 className="text-4xl font-semibold mb-2 text-[#21a696]">{animatedActiveDays}</h3>
            <p className="text-sm text-[#141414]">Active Days</p>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-[#21a696]">
          <CardContent className="p-6 text-center">
            <h3 className="text-4xl font-semibold mb-2 text-[#21a696]">{animatedTotalHours}</h3>
            <p className="text-sm text-[#141414]">Total Hours</p>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-[#21a696]">
          <CardContent className="p-6 text-center">
            <h3 className="text-4xl font-semibold mb-2 text-[#21a696]">{animatedTotalSports}</h3>
            <p className="text-sm text-[#141414]">Sports Tried</p>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-[#21a696]">
          <CardContent className="p-6 text-center">
            <h3 className="text-4xl font-semibold mb-2 text-[#21a696]">{animatedTotalBookings}</h3>
            <p className="text-sm text-[#141414]">Total Bookings</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

