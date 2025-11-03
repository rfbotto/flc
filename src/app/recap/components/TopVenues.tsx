"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/card"

interface TopVenuesProps {
  venues: { name: string; logo: string; count: number }[]
}

export default function TopVenues({ venues }: TopVenuesProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
      className="px-4 py-12 max-w-4xl mx-auto"
    >
      <Card className="bg-white/10 backdrop-blur-lg border-2 border-[#21a696]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#21a696]">Your Top 5 Venues</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-6">
            {venues.map((venue, index) => (
              <motion.li key={venue.name} variants={itemVariants} className="flex items-center">
                <Image
                  src={venue.logo}
                  alt={venue.name}
                  width={64}
                  height={64}
                  className="rounded-full mr-4"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">{venue.name}</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <motion.div
                      className="bg-[#21a696] h-2.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(venue.count / venues[0].count) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    ></motion.div>
                  </div>
                </div>
                <span className="ml-4 font-semibold">{venue.count} visits</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  )
}

