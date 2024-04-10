export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex justify-center bg-white px-4 w-full">
        <main className="flex flex-col w-full">
            {children}
        </main>
        </div>
    )
}