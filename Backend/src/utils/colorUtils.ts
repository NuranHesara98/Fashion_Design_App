/**
 * Generates a complementary color palette based on a skin tone hex code
 * 
 * @param skinToneHex Hex color code for skin tone
 * @returns Array of complementary colors as hex codes
 */
export const generateComplementaryPalette = (skinToneHex: string): string[] => {
  // Ensure the hex code is valid
  if (!skinToneHex || !skinToneHex.match(/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i)) {
    // Default to a neutral palette if invalid hex code
    return ['#E0C9A6', '#7D5A50', '#B4846C', '#E5B299'];
  }

  // Remove # if present
  const hex = skinToneHex.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
  const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
  const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
  
  // Calculate HSL values
  const [h, s, l] = rgbToHsl(r, g, b);
  
  // Generate complementary colors
  const palette: string[] = [];
  
  // Add original color
  palette.push(skinToneHex);
  
  // Add complementary color (opposite hue)
  const complementaryHue = (h + 0.5) % 1;
  palette.push(hslToHex(complementaryHue, s, l));
  
  // Add analogous colors (adjacent hues)
  const analogous1 = (h + 0.1) % 1;
  const analogous2 = (h - 0.1 + 1) % 1;
  palette.push(hslToHex(analogous1, s, l));
  palette.push(hslToHex(analogous2, s, l));
  
  return palette;
};

/**
 * Converts RGB to HSL color values
 * 
 * @param r Red value (0-255)
 * @param g Green value (0-255)
 * @param b Blue value (0-255)
 * @returns Array of [hue, saturation, lightness] values (0-1)
 */
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
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
 * Converts HSL to hex color code
 * 
 * @param h Hue (0-1)
 * @param s Saturation (0-1)
 * @param l Lightness (0-1)
 * @returns Hex color code
 */
const hslToHex = (h: number, s: number, l: number): string => {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
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
  
  // Convert to hex
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
