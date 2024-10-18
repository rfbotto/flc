import Link from "next/link";

export const dynamic = 'force-dynamic'

export default async function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-screen h-screen border-4 border-pink-200">
            <div className="flex flex-1 p-2 flex-col h-full">
            <div className="flex gap-2 p-2 ">
                <Link href="/partial-rendering" className="underline hover:cursor-pointer">
                    Home
                </Link>
                <Link href="/charts" className="underline hover:cursor-pointer">
                    Charts
                </Link>
            </div>
            {children}
            </div>
        </div>
    )
}