/**
 * Utility function to generate complementary color palette based on a skin tone
 * 
 * This function takes a hex color code representing a skin tone and returns
 * an array of complementary hex color codes that would work well with that skin tone.
 * 
 * @param skinTone Hex color code representing the skin tone (e.g., "#9F8880")
 * @returns Array of complementary hex color codes
 */
export const generateComplementaryPalette = (skinTone: string): string[] => {
  // This is a simplified implementation
  // In a production environment, you might use a color theory library
  // or implement a more sophisticated algorithm
  
  // Remove the # if present
  const hex = skinTone.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Generate complementary color (simple inversion)
  const compR = 255 - r;
  const compG = 255 - g;
  const compB = 255 - b;
  
  // Convert back to hex
  const complementary = `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`;
  
  // Generate analogous colors (simplified)
  const analogous1 = shiftHue(r, g, b, 30);
  const analogous2 = shiftHue(r, g, b, -30);
  
  // Generate a monochromatic variant (lighter)
  const mono = `#${Math.min(r + 40, 255).toString(16).padStart(2, '0')}${Math.min(g + 40, 255).toString(16).padStart(2, '0')}${Math.min(b + 40, 255).toString(16).padStart(2, '0')}`;
  
  // Generate a triadic color
  const triadic = shiftHue(r, g, b, 120);
  
  return [complementary, analogous1, analogous2, mono, triadic];
};

/**
 * Helper function to shift the hue of a color by a given degree
 * This is a simplified implementation
 * 
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @param degrees Degrees to shift the hue (-180 to 180)
 * @returns Hex color code after shifting the hue
 */
const shiftHue = (r: number, g: number, b: number, degrees: number): string => {
  // Convert RGB to HSL
  const [h, s, l] = rgbToHsl(r, g, b);
  
  // Shift the hue
  let newH = h + degrees / 360;
  if (newH > 1) newH -= 1;
  if (newH < 0) newH += 1;
  
  // Convert back to RGB
  const [newR, newG, newB] = hslToRgb(newH, s, l);
  
  // Convert to hex
  return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
};

/**
 * Convert RGB to HSL
 * 
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns [h, s, l] where h, s, l are in the range [0, 1]
 */
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  return [h, s, l];
};

/**
 * Convert HSL to RGB
 * 
 * @param h Hue (0-1)
 * @param s Saturation (0-1)
 * @param l Lightness (0-1)
 * @returns [r, g, b] where r, g, b are in the range [0, 255]
 */
const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return [r * 255, g * 255, b * 255];
};
