import struct

def get_image_info(data):
    if data.startswith(b'\211PNG\r\n\032\n'):
        w, h = struct.unpack('>LL', data[16:24])
        return int(w), int(h)
    return None

files = ['public/nav-mustache.png', 'public/btn-submit.png', 'public/nav-mustache-active.png']
for f in files:
    try:
        with open(f, 'rb') as fp:
            info = get_image_info(fp.read(30))
            if info:
                print(f"{f}: {info[0]}x{info[1]}")
            else:
                print(f"{f}: Not a PNG")
    except Exception as e:
        print(f"{f}: {e}")
