'use client'

import { Card } from "@tremor/react"
import { useState } from "react"
import Chart from "react-apexcharts"

const ApexBarChart = () => {
    const state = {
        options: {
            colors: ['#7700ee', '#21a696'],
            chart: {
                id: 'revenue-bar-chart',
            },
            xaxis: {
                categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dez"]
            },
            yaxis: {
                title: {
                    text: 'Revenue'
                },
            },
            plotOptions: {
                bar: {
                  horizontal: false,
                  columnWidth: '55%',
                  endingShape: 'rounded'
                },
              },
              dataLabels: {
                enabled: false,
              },
              fill: {
                colors: ['#7700ee', '#21a696'],
              },
              stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
              },
              tooltip: {
                y: {
                  formatter: function (val: number) {
                    return `${val}k`
                  }
                }
              },
        },
        series: [
        {
            name: "2022",
            data: [30, 40, 45, 50, 49, 60, 70, 91, 84, 76, 90, 75]
        },
        {
            name: "2023",
            data: [40, 50, 55, 60, 59, 70, 80, 101, 94]
            }
        ]
    }

    return (
        <Card>
            <Chart
              options={state.options}
              series={state.series}
              type="bar"
              width="500"
            />
        </Card>
    )
}

export default ApexBarChart