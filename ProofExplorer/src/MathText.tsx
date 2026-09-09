import katex from 'katex'
import { useMemo } from 'react'
import 'katex/dist/katex.min.css'
import './MathText.css'

export function InlineMath({ children }: { children: string }) {
  const markup = useMemo(
    () => katex.renderToString(children, {
      displayMode: false,
      throwOnError: false,
    }),
    [children],
  )

  return <span className="inline-math" dangerouslySetInnerHTML={{ __html: markup }} />
}

export function MathText({ children }: { children: string }) {
  return (
    <>
      {children.split(/(\$[^$]+\$)/g).filter(Boolean).map((part, index) => (
        part.startsWith('$') && part.endsWith('$')
          ? <InlineMath key={`${part}-${index}`}>{part.slice(1, -1)}</InlineMath>
          : part
      ))}
    </>
  )
}