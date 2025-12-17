'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
  showLineNumbers?: boolean
}

const customStyle = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    margin: 0,
    padding: '1rem',
    fontSize: '0.75rem',
    lineHeight: '1.5',
    borderRadius: '0.375rem',
    background: '#1e1e2e',
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    fontSize: '0.75rem',
    lineHeight: '1.5',
    background: 'transparent',
  },
}

export function CodeBlock({
  code,
  language = 'tsx',
  className = '',
  showLineNumbers = false,
}: CodeBlockProps) {
  return (
    <div className={`overflow-x-auto rounded-md ${className}`}>
      <SyntaxHighlighter
        language={language}
        style={customStyle}
        showLineNumbers={showLineNumbers}
        wrapLines
        customStyle={{
          margin: 0,
          borderRadius: '0.375rem',
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  )
}

export default CodeBlock
