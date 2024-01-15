import RadixDropdown from '../components/RadixDropdown';
import HeadlessDropdown from '../components/HeadlessDropdown';
import ChakraDropdown from '../components/ChakraDropdown';
import ReactAriaDropdown from '../components/ReactAriaDropdown';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <main className="flex flex-col items-center p-10">
        <h1 className="text-2xl font-bold mb-8">Dropdown Comparison</h1>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 items-center">
            <p>Radix UI</p>
            <RadixDropdown />
          </div>
          <div className="flex gap-2 items-center">
            <p>Headless UI</p>
            <HeadlessDropdown />
          </div>
          <div className="flex gap-2 items-center">
            <p>Chakra UI</p>
            <ChakraDropdown />
          </div>
          <div className="flex gap-2 items-center">
            <p>React Aria</p>
            <ReactAriaDropdown />
          </div>
        </div>
      </main>
    </div>
  )
}
