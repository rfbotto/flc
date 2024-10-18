export default async function NestedLoadingComponent() {
    await new Promise(resolve => setTimeout(resolve, 10000))
    return (
        <h2 className="text-black text-2xl">
            NESTED LOADING COMPONENT
        </h2>  
    )
}