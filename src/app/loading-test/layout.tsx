import Link from "next/link";

export const dynamic = 'force-dynamic'

export default async function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-screen h-screen border-4 border-pink-200">
            <div className="flex flex-1 p-2 flex-col h-full">
            <div className="flex gap-2 p-2 ">
                <Link href="/loading-test" className="underline hover:cursor-pointer">
                    Home
                </Link>
                <Link href="/loading-test/delay-loading" className="underline hover:cursor-pointer">
                    Delay loading
                </Link>
                <Link href="/loading-test/delay-loading-prefetch" className="underline hover:cursor-pointer" prefetch={true}>
                    Delay loading prefetch
                </Link>
                <Link href="/loading-test/normal-loading" className="underline hover:cursor-pointer">
                    Normal loading
                </Link>
            </div>
            {children}
            </div>
        </div>
    )
}