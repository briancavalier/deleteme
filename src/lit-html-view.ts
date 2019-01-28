import { Cancel } from './fx'
import { Render } from './render'
import { directive, EventPart, NodePart, Part, render as lrender, TemplateResult } from 'lit-html'

export const renderLitHtml = <A> (root: Element): Render<TemplateResult, A> => {
  let animationFrame: number | undefined
  return {
    render: (v: TemplateResult, k: (a: A) => void): Cancel => {
      const wrapped = wrapHandlers(k, v)
      cancelAF(animationFrame)
      animationFrame = requestAnimationFrame(() => lrender(wrapped, root))
      return () => cancelAF(animationFrame)
    }
  }
}

const cancelAF = (af?: number): void => {
  if (af) cancelAnimationFrame(af)
}

const wrapHandlers = <A>(k: (a: A) => void, t: TemplateResult): TemplateResult =>
  new TemplateResult(t.strings, t.values.map(x => intent(k, x)), t.type, t.processor)

const intent = directive((k: (a: any) => void, x: any) => (part: Part) =>
  part.setValue(
    part instanceof EventPart ? (e: Event) => k(x(e))
    : part instanceof NodePart
      ? Array.isArray(x) ? x.map(x => x instanceof TemplateResult ? wrapHandlers(k, x) : x)
        : x instanceof TemplateResult ? wrapHandlers(k, x)
      : x
    : x))
