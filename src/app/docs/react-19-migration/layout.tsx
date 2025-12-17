import { Outfit, Crimson_Pro, JetBrains_Mono } from 'next/font/google'
import './styles.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata = {
  title: 'React 19 Migration Guide',
  description: 'Instructions for AI coding agents to evaluate codebases for React 19 improvements',
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${outfit.variable} ${crimsonPro.variable} ${jetbrainsMono.variable}`}>
      {children}
    </div>
  )
}
