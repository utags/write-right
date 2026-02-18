export interface LayoutConfig {
  maxSize: number
  gap: number
  minControlsHeight: number
  minControlsWidth: number
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  maxSize: 400,
  gap: 4,
  minControlsHeight: 80,
  minControlsWidth: 70,
}

/**
 * Determines if the layout should be horizontal (controls on side) or vertical (controls on bottom).
 * Returns true for horizontal, false for vertical.
 */
export function calculateLayoutMode(
  containerWidth: number,
  containerHeight: number,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): boolean {
  const { maxSize, gap, minControlsHeight, minControlsWidth } = config

  // Option A: Controls Bottom
  const sizeBottom = Math.min(
    containerWidth,
    containerHeight - minControlsHeight - gap,
    maxSize
  )

  // Option B: Controls Side (Right)
  const sizeSide = Math.min(
    containerWidth - minControlsWidth - gap,
    containerHeight,
    maxSize
  )

  // 1. If we can reach MAX_SIZE with Bottom layout, prefer Bottom (default).
  if (sizeBottom >= maxSize) {
    return false
  }
  // 2. If Side layout gives significantly larger size, switch to Side.
  else if (sizeSide > sizeBottom + 10) {
    return true
  }

  // 3. Otherwise default to Bottom
  return false
}

/**
 * Calculates the effective size to reserve for the controls.
 * Ensures that even if the actual controls are smaller than expected (e.g. before full render),
 * we reserve at least the minimum safe size to prevent overlap.
 */
export function calculateEffectiveControlSize(
  isHorizontal: boolean,
  actualWidth: number,
  actualHeight: number,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): { width: number; height: number } {
  const { minControlsWidth, minControlsHeight } = config

  if (isHorizontal) {
    // For horizontal layout, we care about width
    return {
      width: Math.max(actualWidth, minControlsWidth),
      height: actualHeight, // Height usually doesn't constrain horizontal layout flow in the same way
    }
  } else {
    // For vertical layout, we care about height
    return {
      width: actualWidth,
      height: Math.max(actualHeight, minControlsHeight),
    }
  }
}

/**
 * Calculates the final size of the Tianzige based on current layout and dimensions.
 */
export function calculateTianzigeSize(
  containerWidth: number,
  containerHeight: number,
  isHorizontal: boolean,
  actualControlsWidth: number,
  actualControlsHeight: number,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): number {
  const { maxSize, gap } = config

  let availableWidth = containerWidth
  let availableHeight = containerHeight

  const effectiveControls = calculateEffectiveControlSize(
    isHorizontal,
    actualControlsWidth,
    actualControlsHeight,
    config
  )

  if (isHorizontal) {
    // Controls on side
    availableWidth -= effectiveControls.width + gap
  } else {
    // Controls on bottom
    availableHeight -= effectiveControls.height + gap
  }

  let size = Math.min(availableWidth, availableHeight)
  size = Math.min(size, maxSize)
  return Math.max(0, size)
}
