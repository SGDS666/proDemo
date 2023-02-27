//创建单次延迟
export const CreateDelayCss = (style: React.CSSProperties | undefined, count: number, delay?: number): React.CSSProperties => {

  const D = delay ?? 0

  return { ...style, animationDelay: `${count * 0.04 + D}s` }
}
//生成器维护延迟
interface DelayCssParams {
  max: number,
  delay?: number,
  reverse?: boolean,
  itemDelay?: number
}
export function* yieldDelayCss({ max, delay, reverse, itemDelay }: DelayCssParams) {
  const D = delay ?? 0
  if (reverse) {
    for (let i = max; i > 0; i--) {
      yield `${i * (itemDelay ?? 0.04) + D}s`
    }
  } else {
    for (let i = 0; i < max; i++) {
      yield `${i * (itemDelay ?? 0.04) + D}s`
    }
  }


}