"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/card"
import { Button } from "../../../components/button"
import { Share2 } from 'lucide-react'
import html2canvas from "html2canvas"
import Image from "next/image"

interface ShareableOverviewProps {
  userData: {
    name: string
    activeDays: number
    totalMinutes: number
    totalSports: number
    totalBookings: number
    topSport: { name: string; count: number }
    topVenue: { name: string; logo: string; count: number }
  }
}

export default function ShareableOverview({ userData }: ShareableOverviewProps) {
  const [sharing, setSharing] = useState(false)
  const overviewRef = useRef<HTMLDivElement>(null)

  const handleShare = async () => {
    setSharing(true)
    if (overviewRef.current) {
      try {
        const canvas = await html2canvas(overviewRef.current)
        const dataUrl = canvas.toDataURL("image/png")
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], "recap.png", { type: "image/png" })

        if (navigator.share) {
          await navigator.share({
            files: [file],
            title: "My Sports Year Recap",
            text: "Check out my amazing year in sports!",
          })
        } else {
          // Fallback for browsers that don't support Web Share API
          const link = document.createElement("a")
          link.href = dataUrl
          link.download = "my-sports-recap.png"
          link.click()
        }
      } catch (error) {
        console.error("Error sharing:", error)
      }
    }
    setSharing(false)
  }

  return (
    <div className="px-4 py-12 max-w-4xl mx-auto">
      <Card className="border-2 border-[#21a696]">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-[#21a696]">Your 2023 Sports Recap</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            ref={overviewRef}
            className="bg-gradient-to-br from-[#21a696] to-[#7700ee] p-6 rounded-lg text-white"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-semibold mb-4">{userData.name}&apos;s Year in Sports</h2>
            <ul className="space-y-2 text-lg">
              <li>🏋️ Active for {userData.activeDays} days</li>
              <li>⏱️ Spent {Math.round(userData.totalMinutes / 60)} hours working out</li>
              <li>🏅 Tried {userData.totalSports} different sports</li>
              <li>🥇 Top sport: {userData.topSport.name} ({userData.topSport.count} times)</li>
              <li className="flex items-center">
                🏟️ Favorite venue: {userData.topVenue.name} ({userData.topVenue.count} visits)
                <Image
                  src={userData.topVenue.logo}
                  alt={userData.topVenue.name}
                  width={24}
                  height={24}
                  className="ml-2 rounded-full"
                />
              </li>
            </ul>
            <p className="mt-4 text-xl font-semibold">What an incredible year!</p>
          </motion.div>
          <div className="mt-6 text-center">
            <Button onClick={handleShare} disabled={sharing} className="bg-[#21a696] text-white hover:bg-[#1c8f7f]">
              <Share2 className="mr-2 h-4 w-4" />
              {sharing ? "Generating..." : "Share Your Recap"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

