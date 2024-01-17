import ProgressChart from '../components/TremorProgressChart';
import TremorBarChart from '../components/TremorBarChart';
import TremorLineChart from '../components/TremorLineChart';
import MyResponsiveLine from '../components/NivoLineChart';
import NivoBarChart from '../components/NivoBarChart';
import ApexLineChart from '../components/ApexLineChart';


export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 w-full">
      <main className="flex flex-col items-center w-full py-16">
        <div className="flex flex-col gap-16 w-full max-w-xl">
            <div className='flex flex-col gap-4'>
                <a href='https://www.tremor.so/'>
                    <h2 className='text-center text-xl'>Tremor - https://www.tremor.so/</h2>
                </a>
                {/* <ProgressChart /> */}
                <TremorLineChart />
                <TremorBarChart />
            </div>
            <div className='flex flex-col gap-4'>
                <a href='https://nivo.rocks/'>
                    <h2 className='text-center text-xl'>Nivo - https://nivo.rocks/</h2>
                </a>
                <div className="h-72">
                    <MyResponsiveLine />
                </div>
                <div className="h-72">
                    <NivoBarChart />
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <a href='https://apexcharts.com/'>
                    <h2 className='text-center text-xl'>Apex Charts - https://apexcharts.com/</h2>
                </a>
                <ApexLineChart />
            </div>
        </div>
      </main>
    </div>
  )
}
