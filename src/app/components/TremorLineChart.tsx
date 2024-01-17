'use client'

import { useState } from "react";
import { Card, EventProps, LineChart, Title } from "@tremor/react";
import chartData from "../data/tremor-chart-data-2";

const LineChartInteractiveExample = () => {
    const [value, setValue] = useState<EventProps | null>(null)

    return (
        <Card>
          <Title>Revenue</Title>
          <LineChart
            className="h-72 mt-4"
            data={chartData}
            index="date"
            categories={["2022", "2023"]}
            colors={["#7700ee", "#21a696"]}
            yAxisWidth={30}
            onValueChange={(v) => setValue(v)}
            connectNulls={true}
          />
        </Card>
    );
  }

export default LineChartInteractiveExample