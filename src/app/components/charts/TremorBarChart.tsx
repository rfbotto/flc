"use client"

import { BarChart, Card, Title } from "@tremor/react";
import chartData from "../../data/tremor-chart-data-2";
import valueFormatter from "./value-formatter";

export const TremorBarChart = () => {
  return (
    <>
      <Card>
        <Title>Revenue [€]</Title>
        <BarChart
          className="h-72 mt-4"
          data={chartData}
          index="date"
          categories={["2022", "2023"]}
          colors={["#7700ee", "#21a696"]}
          yAxisWidth={30}
          valueFormatter={valueFormatter}
        />
      </Card>
    </>
  );
}

export default TremorBarChart