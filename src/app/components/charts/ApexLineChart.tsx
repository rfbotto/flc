'use client'

import { Card } from "@tremor/react"
import { useState } from "react"
import Chart from "react-apexcharts"

const ApexLineChart = () => {
    const state = {
        options: {
            colors: ['#7700ee', '#21a696'],
            chart: {
                id: 'revenue-line-chart',
            },
            xaxis: {
                categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dez"]
            },
            yaxis: {
                title: {
                    text: 'Revenue'
                },
            },
            dataLabels: {
                enabled: false,
            },
            fill: {
                colors: ['#7700ee', '#21a696'],
            },
            stroke: {
                width: 2
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
              type="line"
              width="100%"
            />
        </Card>
    )
}

export default ApexLineChart