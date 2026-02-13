import { describe, it, expect } from 'vitest'
import {
  calculateLayoutMode,
  calculateTianzigeSize,
  calculateEffectiveControlSize,
  DEFAULT_LAYOUT_CONFIG,
} from '../src/layout'

describe('Layout Calculation Logic', () => {
  const config = DEFAULT_LAYOUT_CONFIG // maxSize: 400, gap: 4, minControlsHeight: 80, minControlsWidth: 70

  describe('calculateLayoutMode', () => {
    it('should prefer vertical layout (false) on mobile portrait', () => {
      // iPhone 14 Pro: ~393w x 852h
      // W: 393. H: 852.
      // Bottom: min(393, 852 - 80 - 4) = 393. (Max 400) -> 393
      // Side: min(393 - 70 - 4, 852) = 319.
      // 393 > 319. Should stay vertical.
      expect(calculateLayoutMode(393, 852)).toBe(false)
    })

    it('should prefer vertical layout (false) on desktop when max size is reachable', () => {
      // Desktop: 1200w x 800h
      // Bottom: min(1200, 800 - 84) = 716 -> capped at 400.
      // Side: min(1200 - 74, 800) = 800 -> capped at 400.
      // Both reach max size. Default to vertical.
      expect(calculateLayoutMode(1200, 800)).toBe(false)
    })

    it('should switch to horizontal layout (true) on landscape phone', () => {
      // iPhone SE Landscape: ~667w x 375h
      // Bottom: min(667, 375 - 84) = 291.
      // Side: min(667 - 74, 375) = 375.
      // Side (375) > Bottom (291) + 10. Should switch.
      expect(calculateLayoutMode(667, 375)).toBe(true)
    })

    it('should switch to horizontal layout (true) on short wide window', () => {
      // 600w x 400h
      // Bottom: min(600, 400 - 84) = 316.
      // Side: min(600 - 74, 400) = 400.
      // Side (400) > Bottom (316). Should switch.
      expect(calculateLayoutMode(600, 400)).toBe(true)
    })

    it('should stay vertical if side layout is not significantly better', () => {
      // Hypothetical case where side is only slightly better
      // W=300, H=300
      // Bottom: min(300, 300 - 84) = 216
      // Side: min(300 - 74, 300) = 226
      // Diff is exactly 10. Should stay vertical (default).
      expect(calculateLayoutMode(300, 300)).toBe(false)
    })
  })

  describe('calculateEffectiveControlSize', () => {
    it('should return min height for vertical layout if actual is smaller', () => {
      const size = calculateEffectiveControlSize(false, 100, 50) // Vertical, actual H=50 (less than 80)
      expect(size.height).toBe(80)
      expect(size.width).toBe(100)
    })

    it('should return actual height for vertical layout if actual is larger', () => {
      const size = calculateEffectiveControlSize(false, 100, 100) // Vertical, actual H=100 (more than 80)
      expect(size.height).toBe(100)
    })

    it('should return min width for horizontal layout if actual is smaller', () => {
      const size = calculateEffectiveControlSize(true, 50, 100) // Horizontal, actual W=50 (less than 70)
      expect(size.width).toBe(70)
      expect(size.height).toBe(100)
    })

    it('should return actual width for horizontal layout if actual is larger', () => {
      const size = calculateEffectiveControlSize(true, 100, 100) // Horizontal, actual W=100 (more than 70)
      expect(size.width).toBe(100)
    })
  })

  describe('calculateTianzigeSize', () => {
    it('should calculate correct size for vertical layout', () => {
      // W=400, H=600, Vertical
      // Available W: 400
      // Available H: 600 - 84 = 516
      // Size = min(400, 516) = 400.
      const size = calculateTianzigeSize(400, 600, false, 0, 0) // 0,0 means use defaults
      expect(size).toBe(400)
    })

    it('should respect actual control height if larger than min', () => {
      // W=400, H=600, Vertical, Controls H=100
      // Available W: 400
      // Available H: 600 - 100 - 4 = 496
      // Size = 400.
      // Let's try a smaller container to see the effect
      // W=300, H=300, Vertical, Controls H=100
      // Available W: 300
      // Available H: 300 - 100 - 4 = 196
      // Size = 196
      const size = calculateTianzigeSize(300, 300, false, 0, 100)
      expect(size).toBe(196)
    })

    it('should use min control height if actual is smaller', () => {
      // W=300, H=300, Vertical, Controls H=50 (less than 80)
      // Available W: 300
      // Available H: 300 - 80 - 4 = 216
      // Size = 216
      const size = calculateTianzigeSize(300, 300, false, 0, 50)
      expect(size).toBe(216)
    })

    it('should calculate correct size for horizontal layout', () => {
      // W=600, H=400, Horizontal
      // Available W: 600 - 70 - 4 = 526
      // Available H: 400
      // Size = min(526, 400) = 400
      const size = calculateTianzigeSize(600, 400, true, 0, 0)
      expect(size).toBe(400)
    })

    it('should respect actual control width if larger than min', () => {
      // W=300, H=300, Horizontal, Controls W=100
      // Available W: 300 - 100 - 4 = 196
      // Available H: 300
      // Size = 196
      const size = calculateTianzigeSize(300, 300, true, 100, 0)
      expect(size).toBe(196)
    })

    it('should use min control width if actual is smaller', () => {
      // W=300, H=300, Horizontal, Controls W=50 (less than 70)
      // Available W: 300 - 70 - 4 = 226
      // Available H: 300
      // Size = 226
      const size = calculateTianzigeSize(300, 300, true, 50, 0)
      expect(size).toBe(226)
    })
  })
})
