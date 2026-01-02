// Dynamically import all wrap color images from the assets folder
// This function will be used to get all available wrap colors

// Use Vite's glob import to load all wrap color images
const wrapColorImages = import.meta.glob<string>('/src/assets/Kleurenwrap/*.jpg', { 
  eager: true,
  import: 'default'
});

export interface WrapColor {
  id: string;
  name: string;
  image: string;
  code?: string;
}

/**
 * Extract color name from filename
 * Example: "S115-Pure-White.jpg" -> "Pure White"
 * Example: "APZ05-Gold-Crack.jpg" -> "Gold Crack"
 */
function extractColorName(filename: string): string {
  // Remove extension
  const withoutExt = filename.replace(/\.(jpg|jpeg|png)$/i, '');
  
  // Remove code prefix (e.g., "S115-", "APZ05-")
  const withoutCode = withoutExt.replace(/^[A-Z0-9]+-/, '');
  
  // Replace hyphens with spaces and capitalize words
  const words = withoutCode.split('-');
  const formatted = words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return formatted;
}

/**
 * Extract color code from filename
 * Example: "S115-Pure-White.jpg" -> "S115"
 */
function extractColorCode(filename: string): string | undefined {
  const match = filename.match(/^([A-Z0-9]+)-/);
  return match ? match[1] : undefined;
}

/**
 * Get all available wrap colors
 */
export function getWrapColors(): WrapColor[] {
  const colors: WrapColor[] = [];
  
  // Get all image paths
  const imageEntries = Object.entries(wrapColorImages);
  
  for (const [path, image] of imageEntries) {
    // Extract filename from path
    const filename = path.split('/').pop() || '';
    const name = extractColorName(filename);
    const code = extractColorCode(filename);
    
    colors.push({
      id: filename.replace(/\.(jpg|jpeg|png)$/i, ''),
      name,
      image: image as string,
      code,
    });
  }
  
  // Sort alphabetically by name
  return colors.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a wrap color by ID
 */
export function getWrapColorById(id: string): WrapColor | undefined {
  return getWrapColors().find(color => color.id === id);
}

