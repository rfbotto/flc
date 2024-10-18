import { Suspense } from "react";
import NestedLoadingComponent from "./NestedLoadingComponent";

export default async function page({ children }: { children: React.ReactNode }) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return (
        <div className="h-full flex justify-center items-center bg-purple-200">
            <div className="flex flex-col gap-2 justify-center items-center">
                <h1 className="text-black text-3xl">
                    Loaded delay page prefetch
                </h1>
                <Suspense fallback={<div className="h-40 w-40 bg-teal-400" />}>
                    <NestedLoadingComponent />
                </Suspense>
            </div>
        </div>
    )
}