import { Suspense } from "react";
import DelayedComponent from "./DelayedComponent";

export default async function page() {
    return (
        <div className="h-full flex justify-center items-center bg-blue-200">
            <div className="flex flex-col flex-wrap gap-2">
                <input type="text" className="border-2 border-black" />
                <Suspense fallback={<div className="h-40 w-40 bg-amber-200" />}>
                    <DelayedComponent timeout={2000} />
                </Suspense>
                <Suspense fallback={<div className="h-40 w-40 bg-amber-200" />}>
                    <DelayedComponent timeout={5000} />
                </Suspense>
                    <DelayedComponent timeout={1000} />
                <Suspense fallback={<div className="h-40 w-40 bg-amber-200" />}>
                    <DelayedComponent timeout={7000} />
                </Suspense>
            </div>
        </div>
    )
}