"use client"

import { useEffect, useRef } from "react"
import { motion, useInView, useAnimation } from "framer-motion"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/card"

interface MonthlyBreakdownProps {
  data: { month: string; count: number }[]
}

export default function MonthlyBreakdown({ data }: MonthlyBreakdownProps) {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 },
      }}
      transition={{ duration: 0.5 }}
      className="px-4 py-12 max-w-4xl mx-auto"
    >
      <Card className="bg-white/10 backdrop-blur-lg border-2 border-[#21a696]">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-[#21a696]">Monthly Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="month" stroke="#141414" />
              <YAxis stroke="#141414" />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #21a696' }}
                labelStyle={{ color: '#21a696' }}
                formatter={(value) => [`${value} sports`, 'Count']}
              />
              <Bar
                dataKey="count"
                fill="#21a696"
                radius={[4, 4, 0, 0]}
                animationBegin={300}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}

