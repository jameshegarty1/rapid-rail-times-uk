from PIL import Image

def generate_icons(input_file):
    # Open original image
    img = Image.open(input_file)

    # Web app icons
    sizes = {
        'logo512.png': (512, 512),
        'logo192.png': (192, 192)
    }

    # Generate PNG files
    for filename, size in sizes.items():
        img_copy = img.copy()
        img_copy.thumbnail(size, Image.Resampling.LANCZOS)
        img_copy.save(filename, 'PNG')

    # Generate favicon with multiple sizes
    favicon_sizes = [(64, 64), (32, 32), (24, 24), (16, 16)]
    img_copy = img.copy()
    img_copy.save('favicon.ico', sizes=favicon_sizes)

# Usage example:
generate_icons('train-front.png')