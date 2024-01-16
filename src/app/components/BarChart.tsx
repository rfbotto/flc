"use client"

import { BarChart, Card, Title } from "@tremor/react";
import CustomTooltip from "./CustomTooltip";
import chartData from "../data/chart-data-1";

export const BarChartCustomTooltip = () => {
  return (
    <>
      <Card>
        <Title>Revenue</Title>
        <BarChart
          className="h-72 mt-4"
          data={chartData}
          index="date"
          categories={["Revenue"]}
          colors={["#21a696"]}
          yAxisWidth={30}
          customTooltip={CustomTooltip}
        />
      </Card>
    </>
  );
}

export default BarChartCustomTooltip