'use client'

import { Card, LineChart, Title } from "@tremor/react";
import chartData from "../../data/tremor-chart-data-2";
import valueFormatter from "./value-formatter";

const TremorLineChart = () => {
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
            connectNulls={true}
            valueFormatter={valueFormatter}
          />
        </Card>
    );
  }

export default TremorLineChart