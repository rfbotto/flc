"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface RecapHeaderProps {
  name: string
  profilePicture: string
}

export default function RecapHeader({ name, profilePicture }: RecapHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center py-20 text-[#141414]"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white"
      >
        <Image src={profilePicture} alt={name} width={128} height={128} className="object-cover" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-4xl font-bold mb-2 text-[#21a696]"
      >
        {name}&apos;s 2023 Recap
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="text-xl text-[#7700ee]"
      >
        Let&apos;s celebrate your active year!
      </motion.p>
    </motion.div>
  )
}

