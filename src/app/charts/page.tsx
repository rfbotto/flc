'use client';

import dynamic from 'next/dynamic';
import TremorBarChart from '../../components/charts/TremorBarChart';
import TremorLineChart from '../../components/charts/TremorLineChart';
import MyResponsiveLine from '../../components/charts/NivoLineChart';
import NivoBarChart from '../../components/charts/NivoBarChart';
import LoadingChart from '../../components/charts/LoadingChart';

const ApexBarChart = dynamic(() => import('../../components/charts/ApexBarChart'), { loading: () => <LoadingChart />, ssr: false })
const ApexLineChart = dynamic(() => import('../../components/charts/ApexLineChart'), { loading: () => <LoadingChart />, ssr: false })


export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 w-full">
      <main className="flex flex-col items-center w-full py-16">
        <div className="flex flex-col gap-16 w-full max-w-xl">
            <div className='flex flex-col gap-4'>
                <a href='https://www.tremor.so/'>
                    <h2 className='text-center underline text-xl'>Tremor - https://www.tremor.so/</h2>
                </a>
                <TremorLineChart />
                <TremorBarChart />
            </div>
            <div className='flex flex-col gap-4'>
                <a href='https://nivo.rocks/'>
                    <h2 className='text-center underline text-xl'>Nivo - https://nivo.rocks/</h2>
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
                    <h2 className='text-center underline text-xl'>Apex Charts - https://apexcharts.com/</h2>
                </a>
                <ApexLineChart />
                <ApexBarChart />
            </div>
        </div>
      </main>
    </div>
  )
}
