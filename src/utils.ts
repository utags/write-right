export function $$<T extends Element = Element>(
  selector: string,
  root: ParentNode = document
): T[] {
  const nodeList = root.querySelectorAll(selector) as NodeListOf<T>
  const result: T[] = []
  // eslint-disable-next-line @typescript-eslint/prefer-for-of, unicorn/no-for-loop
  for (let i = 0; i < nodeList.length; i++) {
    result.push(nodeList[i])
  }

  return result
}
