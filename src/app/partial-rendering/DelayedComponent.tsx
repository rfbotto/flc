export default async function DelayedComponent({timeout}: {timeout: number}) {
    await new Promise(resolve => setTimeout(resolve, timeout))
    return (
        <div className="flex flex-col justify-center items-center text-center p-2 gap-1 border-2 border-orange-700">
            <h2 className="text-black text-2xl">
                DELAYED COMPONENT
            </h2>
            <p className="text-black text-md">
                {timeout} ms
            </p>  
        </div>
    )
}