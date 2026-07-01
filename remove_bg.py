import sys
try:
    from PIL import Image
    import math

    img = Image.open('frontend/public/Spray.png').convert('RGBA')
    pixels = img.load()
    width, height = img.size
    
    # Get background color from top-left pixel
    bg_color = pixels[0, 0]
    
    # Process all pixels
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Distance from background color
            dist = math.sqrt((r - bg_color[0])**2 + (g - bg_color[1])**2 + (b - bg_color[2])**2)
            
            if dist < 20: # Threshold
                pixels[x, y] = (r, g, b, 0)
            elif dist < 40:
                # Semi transparent edge
                alpha = int(((dist - 20) / 20.0) * 255)
                pixels[x, y] = (r, g, b, alpha)
                
    img.save('frontend/public/Spray.png')
    print("Successfully processed Spray.png")
except Exception as e:
    print(f"Error: {e}")
