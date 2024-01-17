import { Card, Text, Metric, Flex, ProgressBar } from "@tremor/react";

const ProgressChart = () => (
  <Card className="max-w-xs mx-auto">
    <Text>Eversports Revenue 2023</Text>
    <Metric>71,465€</Metric>
    <Flex className="mt-4">
      <Text>10% of annual target</Text>
      <Text>710,465€</Text>
    </Flex>
    <ProgressBar value={10} className="mt-2" />
  </Card>
)

export default ProgressChart