export interface IconOptions {
  backgroundColor?: string
  fillColor?: string
  gridColor?: string
  rotate180?: boolean
}

export function generateIconSvg(
  charData: any,
  options: IconOptions = {}
): string {
  const {
    backgroundColor = '#4CAF50',
    fillColor = '#ffffff',
    gridColor = '#A5D6A7',
    rotate180 = false,
  } = options

  // Extract stroke paths from HanziWriter data
  const strokes = charData.strokes
    .map((path: string) => `<path d="${path}" fill="${fillColor}" />`)
    .join('')

  const charTransform = rotate180
    ? 'rotate(180, 512, 512) translate(0, 900) scale(1, -1)'
    : 'translate(0, 900) scale(1, -1)'

  // Return the complete SVG string
  // Matches the structure of src/icon.svg
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <!-- Background -->
  <rect width="1024" height="1024" fill="${backgroundColor}"/>

  <!-- Grid Lines (Rice Grid) - Radiating from Center, Opaque Light Gray -->
  <g stroke="${gridColor}" stroke-width="14" stroke-dasharray="100, 80" stroke-linecap="butt" fill="none">
    <!-- Horizontal: Draw from Center Outwards -->
    <line x1="512" y1="512" x2="32" y2="512" />
    <line x1="512" y1="512" x2="992" y2="512" />

    <!-- Vertical: Draw from Center Outwards -->
    <line x1="512" y1="512" x2="512" y2="32" />
    <line x1="512" y1="512" x2="512" y2="992" />

    <!-- Diagonals: Draw from Center Outwards -->
    <line x1="512" y1="512" x2="32" y2="32" />
    <line x1="512" y1="512" x2="992" y2="992" />
    <line x1="512" y1="512" x2="992" y2="32" />
    <line x1="512" y1="512" x2="32" y2="992" />
  </g>

  <!-- Outer Border (Moved after grid lines to cover them) -->
  <!--
  <rect x="32" y="32" width="960" height="960" fill="none" stroke="#000000" stroke-width="40" rx="60" ry="60" />
  -->

  <!-- Character Group: Flipped Y to match HanziWriter coordinate system -->
  <g transform="${charTransform}">
    ${strokes}
  </g>
</svg>`
}

export function svgToPngUrl(svg: string, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // SVG needs explicit width/height for Firefox/Safari sometimes if viewBox is used?
    // But Data URL should work.
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, size, size)
        resolve(canvas.toDataURL('image/png'))
      } else {
        reject(new Error('Failed to get canvas context'))
      }

      URL.revokeObjectURL(url)
    }

    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }

    img.src = url
  })
}
