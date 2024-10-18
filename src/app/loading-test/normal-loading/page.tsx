export default async function page({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full flex justify-center items-center bg-teal-200">
            <h1 className="text-black text-3xl">
                Loaded normal page
            </h1>
        </div>
    )
}