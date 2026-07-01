from PIL import Image

try:
    bottle_img = Image.open('frontend/public/Spray.png').convert('RGBA')
    bw, bh = bottle_img.size
    
    size = 600
    square_img = Image.new('RGBA', (size, size), (60, 90, 65, 255))
    
    offset_x = (size - bw) // 2
    offset_y = (size - bh) // 2
    
    square_pixels = square_img.load()
    bottle_pixels = bottle_img.load()
    
    for y in range(bh):
        for x in range(bw):
            r, g, b, a = bottle_pixels[x, y]
            
            # The dots are likely caused by low-alpha artifacts.
            # If the pixel is mostly transparent (a < 100), treat it as fully transparent (so the square remains fully opaque).
            # If the pixel is very opaque (a > 200), treat it as fully opaque (so the square gets a fully transparent hole).
            # If it's in between, we can use a steeper gradient or just a hard threshold.
            
            if a < 100:
                inv_a = 255 # Solid green
            elif a > 150:
                inv_a = 0   # Transparent hole
            else:
                # Smooth transition for anti-aliasing
                # Map 100-150 to 255-0
                inv_a = int(255 - (a - 100) * (255 / 50))
                if inv_a < 0: inv_a = 0
                if inv_a > 255: inv_a = 255
            
            sx = x + offset_x
            sy = y + offset_y
            
            sr, sg, sb, sa = square_pixels[sx, sy]
            square_pixels[sx, sy] = (sr, sg, sb, inv_a)
            
    square_img.save('frontend/public/spray-square.png')
    print(f"Created spray-square.png without dots!")
except Exception as e:
    print("Error:", e)
