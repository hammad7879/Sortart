// Placeholder color picking function
// This will be implemented by the backend teammate
// For now, returns a dummy color for frontend development

export interface ColorResult {
  hex: string
  name: string
}

export async function pickColour(): Promise<ColorResult> {
  // Placeholder implementation
  // Returns Burnt Sienna as a default color
  return {
    hex: '#8B4513',
    name: 'Burnt Sienna'
  }
}
