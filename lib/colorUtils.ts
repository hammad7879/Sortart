export interface ColorResult {
  hex: string
  name: string
}

export async function pickColour(): Promise<ColorResult> {
  return {
    hex: '#8B4513',
    name: 'Burnt Sienna',
  }
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.trim().replace(/^#/, '')
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    }
  }
  if (h.length === 6 && /^[0-9a-fA-F]{6}$/.test(h)) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    }
  }
  return null
}

function dist2(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number }
): number {
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return dr * dr + dg * dg + db * db
}

/** Paint-friendly swatches for nearest-name matching (RGB Euclidean). */
const NAMED_SWATCHES: readonly { hex: string; name: string }[] = [
  { hex: '#000000', name: 'Black' },
  { hex: '#1a1a1a', name: 'Ivory black' },
  { hex: '#2C1A0E', name: 'Deep umber' },
  { hex: '#3D2314', name: 'Raw umber' },
  { hex: '#4A3728', name: 'Burnt umber' },
  { hex: '#5C3D1E', name: 'Sepia brown' },
  { hex: '#654321', name: 'Dark oak' },
  { hex: '#6B4423', name: 'Russet' },
  { hex: '#704214', name: 'Van Dyke brown' },
  { hex: '#783C1D', name: 'Burnt ochre' },
  { hex: '#7B4B3A', name: 'Mars brown' },
  { hex: '#8B4513', name: 'Burnt sienna' },
  { hex: '#8B5A2B', name: 'Saddle brown' },
  { hex: '#8B6914', name: 'Raw sienna' },
  { hex: '#8B7355', name: 'Taupe' },
  { hex: '#914F2D', name: 'Terracotta' },
  { hex: '#954535', name: 'Chestnut' },
  { hex: '#A0522D', name: 'Sienna' },
  { hex: '#A67B5B', name: 'Fawn' },
  { hex: '#B87333', name: 'Copper' },
  { hex: '#BC8F8F', name: 'Rosy brown' },
  { hex: '#C19A6B', name: 'Camel' },
  { hex: '#C4956A', name: 'Sand' },
  { hex: '#C9A84C', name: 'Gold ochre' },
  { hex: '#CD853F', name: 'Peru' },
  { hex: '#D2691E', name: 'Burnt orange' },
  { hex: '#D2B48C', name: 'Tan' },
  { hex: '#DAA520', name: 'Goldenrod' },
  { hex: '#DEB887', name: 'Burlywood' },
  { hex: '#E8D5BE', name: 'Warm white' },
  { hex: '#F5DEB3', name: 'Wheat' },
  { hex: '#F5EFE0', name: 'Cream' },
  { hex: '#FAF0E6', name: 'Linen white' },
  { hex: '#FFFAF0', name: 'Floral white' },
  { hex: '#FFFFFF', name: 'Titanium white' },
  { hex: '#F0F8FF', name: 'Cool white' },
  { hex: '#E6E6FA', name: 'Lavender mist' },
  { hex: '#DDA0DD', name: 'Plum tint' },
  { hex: '#C71585', name: 'Magenta rose' },
  { hex: '#DC143C', name: 'Crimson' },
  { hex: '#B22222', name: 'Fire brick' },
  { hex: '#8B0000', name: 'Deep red' },
  { hex: '#CD5C5C', name: 'Indian red' },
  { hex: '#E9967A', name: 'Salmon' },
  { hex: '#FF6347', name: 'Tomato' },
  { hex: '#FF7F50', name: 'Coral' },
  { hex: '#FFA07A', name: 'Light salmon' },
  { hex: '#FFB347', name: 'Peach' },
  { hex: '#FFD700', name: 'Yellow ochre' },
  { hex: '#FFEB3B', name: 'Lemon yellow' },
  { hex: '#F4E99B', name: 'Naples yellow' },
  { hex: '#9ACD32', name: 'Yellow green' },
  { hex: '#6B8E23', name: 'Olive green' },
  { hex: '#556B2F', name: 'Dark olive' },
  { hex: '#2F4F2F', name: 'Forest green' },
  { hex: '#228B22', name: 'Sap green' },
  { hex: '#32CD32', name: 'Lime green' },
  { hex: '#3CB371', name: 'Viridian hint' },
  { hex: '#20B2AA', name: 'Sea green' },
  { hex: '#008B8B', name: 'Teal' },
  { hex: '#48CAE4', name: 'Sky blue' },
  { hex: '#4682B4', name: 'Steel blue' },
  { hex: '#4169E1', name: 'Royal blue' },
  { hex: '#1E3A5F', name: 'Prussian blue' },
  { hex: '#191970', name: 'Midnight blue' },
  { hex: '#4B0082', name: 'Indigo' },
  { hex: '#6A5ACD', name: 'Slate blue' },
  { hex: '#9370DB', name: 'Medium purple' },
  { hex: '#708090', name: 'Blue grey' },
  { hex: '#778899', name: 'Cool grey' },
  { hex: '#A9A9A9', name: 'Neutral grey' },
  { hex: '#696969', name: 'Dim grey' },
  { hex: '#808080', name: 'Grey' },
  { hex: '#BEBEBE', name: 'Silver grey' },
  { hex: '#D3D3D3', name: 'Light grey' },
]

/**
 * Maps a sampled hex to the closest friendly paint / colour name in our palette.
 */
export function approximateColorName(hexInput: string): string {
  const rgb = parseHex(hexInput)
  if (!rgb) return 'Unknown color'
  let best = 'Mixed tone'
  let bestD = Infinity
  for (const { hex, name } of NAMED_SWATCHES) {
    const c = parseHex(hex)
    if (!c) continue
    const d = dist2(rgb, c)
    if (d < bestD) {
      bestD = d
      best = name
    }
  }
  return best
}
