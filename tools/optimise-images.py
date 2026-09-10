"""
Resize and compress the school photographs for the web.

Source : asset/            (originals, straight off the camera / Facebook)
Output : assets/img/       (1600px wide "full" + 640px wide "thumb")

Run:  python tools/optimise-images.py
"""

import os
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "asset")
OUT = os.path.join(ROOT, "assets", "img")

FULL_W = 1280          # lightbox / hero slides
THUMB = (480, 360)     # gallery tiles, centre-cropped to a uniform 4:3
FULL_Q = 74
THUMB_Q = 72

# original filename -> clean semantic name
MAP = {
    "468300107_550173821239006_4590905836564389509_n.jpg": "gate",
    "726717761_998399669749750_3505075487047250181_n.jpg": "campus-assembly",
    "467811979_548936208029434_8313446833572241670_n.jpg": "sports-pyramid",
    "475804198_598846096371778_723597945041401251_n.jpg": "dance-folk",
    "475998432_598846133038441_3163171384418506191_n.jpg": "dance-classical",
    "481244785_619353860987668_516448678025873592_n.jpg": "sports-race",
    "476635087_603208249268896_6026172033834391630_n.jpg": "classroom",
    "723197149_992750193648031_7105725184203116216_n.jpg": "yoga",
    "621747481_877037605219291_3055443036230866733_n.jpg": "saraswati-puja",
    "468054472_548931514696570_2882758564456644485_n.jpg": "mural",
    "476642745_605371052385949_979081746872711873_n.jpg": "excursion-sivok",
    "f1.png": "excursion-hills",
    "747614076_1019095247680192_7667180349535458040_n.jpg": "tree-plantation",
}


def save_full(img, path):
    w, h = img.size
    if w > FULL_W:
        img = img.resize((FULL_W, round(h * FULL_W / w)), Image.LANCZOS)
    img.save(path, "JPEG", quality=FULL_Q, optimize=True, progressive=True)
    return os.path.getsize(path)


def save_thumb(img, path):
    # centre-crop every tile to the same 4:3 box so the gallery grid is even
    img = ImageOps.fit(img, THUMB, Image.LANCZOS, centering=(0.5, 0.4))
    img.save(path, "JPEG", quality=THUMB_Q, optimize=True, progressive=True)
    return os.path.getsize(path)


def main():
    os.makedirs(OUT, exist_ok=True)
    total_in = total_out = 0

    # A landscape crop of the gate, for the full-screen opening sequence.
    # Centred a little above the middle so the arch, the school name and
    # the motto all survive the crop.
    gate_src = os.path.join(SRC, "468300107_550173821239006_4590905836564389509_n.jpg")
    if os.path.exists(gate_src):
        g = ImageOps.exif_transpose(Image.open(gate_src)).convert("RGB")
        g = ImageOps.fit(g, (1600, 900), Image.LANCZOS, centering=(0.5, 0.34))
        g.save(os.path.join(OUT, "gate-wide.jpg"), "JPEG",
               quality=FULL_Q, optimize=True, progressive=True)
        print("ok: gate-wide")

    for src_name, slug in MAP.items():
        src_path = os.path.join(SRC, src_name)
        if not os.path.exists(src_path):
            print("MISSING:", src_name)
            continue

        total_in += os.path.getsize(src_path)

        img = Image.open(src_path)
        img = ImageOps.exif_transpose(img)      # honour camera rotation
        img = img.convert("RGB")                # drop alpha for JPEG

        total_out += save_full(img.copy(), os.path.join(OUT, slug + ".jpg"))
        total_out += save_thumb(img.copy(), os.path.join(OUT, slug + "-thumb.jpg"))
        print("ok:", slug)

    print("\nsource : %.1f MB" % (total_in / 1048576))
    print("output : %.1f MB" % (total_out / 1048576))


if __name__ == "__main__":
    main()
