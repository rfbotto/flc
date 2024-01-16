import ProgressChart from '../components/ProgressChart';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';


export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 w-full">
      <main className="flex flex-col items-center p-10 w-full">
        <h1 className="text-2xl font-bold mb-8">Chart Examples</h1>
        <div className="flex flex-col gap-4 w-full">
          <ProgressChart />
          <BarChart />
          <LineChart />
        </div>
      </main>
    </div>
  )
}
