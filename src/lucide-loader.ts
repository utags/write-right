/**
 * Custom lightweight Lucide icon loader to avoid bundling the entire library.
 * This replaces the default `createIcons` from lucide.
 */

const defaultAttributes = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
}

type IconNode = [string, Record<string, string>][]
type Icons = Record<string, IconNode>

export function createIcons(options: {
  icons: Icons
  nameAttr?: string
  attrs?: Record<string, string | number>
}) {
  const { icons, nameAttr = 'data-lucide', attrs = {} } = options

  if (!icons || Object.keys(icons).length === 0) {
    console.warn('No icons provided to createIcons')
    return
  }

  const elements = document.querySelectorAll(`[${nameAttr}]`)

  elements.forEach((element) => {
    const iconName = element.getAttribute(nameAttr)
    if (!iconName) return

    // Convert kebab-case to PascalCase for lookup (e.g. "rotate-ccw" -> "RotateCcw")
    // But wait, the imported names in main.ts will be the PascalCase variables.
    // The user might use "rotate-ccw" in HTML.
    // We need to map "rotate-ccw" to "RotateCcw" OR ensure the keys in `icons` object match the attribute.

    // In main.ts, we will pass { RotateCcw, Search, ... }.
    // The keys will be "RotateCcw", "Search".
    // So we need to convert attribute "rotate-ccw" to "RotateCcw".

    const componentName = toPascalCase(iconName)
    const iconData = icons[componentName]

    if (!iconData) {
      console.warn(
        `Icon "${iconName}" (mapped to "${componentName}") not found in provided icons.`
      )
      return
    }

    const svg = createSVG(iconData, {
      ...defaultAttributes,
      ...attrs,
      class: element.getAttribute('class') || '',
    })

    // Copy all other attributes from the original element (like id, event handlers? no, just attributes)
    // Actually, Lucide's replaceElement copies all attributes.
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name !== nameAttr && attr.name !== 'class') {
        svg.setAttribute(attr.name, attr.value)
      }
    })

    // Merge classes
    const existingClass = element.getAttribute('class') || ''
    const newClass = `lucide lucide-${iconName} ${existingClass}`
    svg.setAttribute('class', newClass.trim())

    if (element.parentNode) {
      element.parentNode.replaceChild(svg, element)
    }
  })
}

function createSVG(iconData: IconNode, attrs: Record<string, string | number>) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

  Object.entries(attrs).forEach(([key, value]) => {
    svg.setAttribute(key, String(value))
  })

  iconData.forEach(([tag, tagAttrs]) => {
    const child = document.createElementNS('http://www.w3.org/2000/svg', tag)
    Object.entries(tagAttrs).forEach(([key, value]) => {
      child.setAttribute(key, String(value))
    })
    svg.appendChild(child)
  })

  return svg
}

function toPascalCase(str: string) {
  return str.replace(/(^\w|-\w)/g, (clear) =>
    clear.replace(/-/, '').toUpperCase()
  )
}
