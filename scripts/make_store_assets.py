"""Builds LoanPilot's lead Play screenshot and Google Ads image assets from the framed screenshots."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(sys.argv[1])  # store-assets/
SHOTS = ROOT / "screenshots"
ADS = ROOT / "google-ads"
ADS.mkdir(exist_ok=True)
FONT = "/System/Library/Fonts/SFNS.ttf"

# Device frame position inside each 1080x1920 framed screenshot
PHONE_BOX = (178, 352, 902, 1920)
PHONE_RADIUS = 96


def font(size, weight="Bold"):
    f = ImageFont.truetype(FONT, size)
    try:
        f.set_variation_by_name(weight)
    except Exception:
        pass
    return f


def fit_font(draw, text, max_width, size, weight="Bold", min_size=28):
    while size > min_size:
        f = font(size, weight)
        if draw.textlength(text, font=f) <= max_width:
            return f
        size -= 2
    return font(min_size, weight)


def repaint_band(im, top, bottom):
    """Replaces rows top..bottom with a per-column blend of the background just outside."""
    px = im.load()
    for x in range(im.width):
        a, b = px[x, top - 1], px[x, bottom + 1]
        for y in range(top, bottom + 1):
            t = (y - top + 1) / (bottom - top + 2)
            px[x, y] = tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def hide_clipped_heading(im):
    """Covers the half-scrolled section title under the app header (prepay screenshot)."""
    px = im.load()
    for x in range(226, 855):
        fill = px[x, 574]
        for y in range(559, 572):
            px[x, y] = fill


def draw_centered(draw, text, y, f, width, fill):
    w = draw.textlength(text, font=f)
    draw.text(((width - w) / 2, y), text, font=f, fill=fill)


def phone_cutout(shot):
    phone = shot.crop(PHONE_BOX)
    mask = Image.new("L", phone.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, phone.width - 1, phone.height + PHONE_RADIUS), PHONE_RADIUS, fill=255
    )
    phone.putalpha(mask)
    return phone


def gradient(size):
    """Brand blue background matching the screenshots (#0047D6 to #1A66EB)."""
    w, h = size
    top, bottom = (0, 71, 214), (26, 102, 235)
    im = Image.new("RGB", size)
    d = ImageDraw.Draw(im)
    for y in range(h):
        t = y / max(h - 1, 1)
        d.line([(0, y), (w, y)], fill=tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    return im


def brand_row(canvas, x, y, icon_size=72):
    icon = Image.open(ROOT / "icon-512.png").convert("RGBA").resize((icon_size, icon_size), Image.LANCZOS)
    m = Image.new("L", icon.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, icon_size - 1, icon_size - 1), icon_size // 4, fill=255)
    canvas.paste(icon, (x, y), m)
    ImageDraw.Draw(canvas).text(
        (x + icon_size + 18, y + icon_size / 2), "LoanPilot", font=font(int(icon_size * 0.55)),
        fill="white", anchor="lm",
    )


def make_ad(shot, headline, sub, size, out):
    w, h = size
    canvas = gradient(size)
    d = ImageDraw.Draw(canvas)
    phone = phone_cutout(shot)
    note = font(22, "Regular")
    note_text = "Not a lender. Loan tracking & planning tool."

    if w > h:  # 1200x628 landscape: text left, phone right
        brand_row(canvas, 64, 64, 64)
        text_w = 600
        lines = headline.split("\n") if "\n" in headline else [headline]
        y = 200
        for line in lines:
            d.text((64, y), line, font=fit_font(d, line, text_w, 64), fill="white")
            y += 78
        d.text((64, y + 16), sub, font=fit_font(d, sub, text_w, 32, "Regular"), fill=(220, 232, 255))
        d.text((64, h - 56), note_text, font=note, fill=(190, 210, 250))
        scale = 420 / phone.width
        p = phone.resize((420, round(phone.height * scale)), Image.LANCZOS)
        canvas.paste(p, (w - 420 - 90, 56), p)
    else:  # square / portrait: brand + text on top, phone below
        brand_row(canvas, 64, 56, 64)
        text_w = w - 128
        y = 170
        for line in headline.split("\n"):
            f = fit_font(d, line, text_w, 76)
            draw_centered(d, line, y, f, w, "white")
            y += 90
        sf = fit_font(d, sub, text_w, 36, "Regular")
        draw_centered(d, sub, y + 10, sf, w, (220, 232, 255))
        phone_w = 600 if h == w else 700
        scale = phone_w / phone.width
        p = phone.resize((phone_w, round(phone.height * scale)), Image.LANCZOS)
        canvas.paste(p, ((w - phone_w) // 2, y + 90), p)
        # keep the disclaimer readable over the phone
        band_h = 60
        band = Image.new("RGBA", (w, band_h), (0, 56, 170, 255))
        canvas.paste(band, (0, h - band_h), band)
        draw_centered(d, note_text, h - band_h + 18, note, w, (220, 232, 255))

    canvas.save(out, optimize=True)


def main():
    # 1. Lead screenshot: prepayment savings with the result in the headline
    shot = Image.open(SHOTS / "01-prepay-savings.png").convert("RGB")
    hide_clipped_heading(shot)
    prepay_clean = shot.copy()
    repaint_band(shot, 70, 290)
    d = ImageDraw.Draw(shot)
    head = "Prepay ₹1 lakh, save ₹2.88 lakh"
    draw_centered(d, head, 100, fit_font(d, head, 980, 76), 1080, "white")
    sub = "See the interest you save before you pay extra"
    draw_centered(d, sub, 200, fit_font(d, sub, 980, 40, "Regular"), 1080, (225, 235, 255))
    shot.save(SHOTS / "01-prepay-savings.png", optimize=True)

    # 2. Google Ads images: 3 themes x 3 sizes
    themes = [
        ("prepay", prepay_clean, "Prepay ₹1 lakh,\nsave ₹2.88 lakh", "See the interest you save before you pay extra"),
        ("track", Image.open(SHOTS / "02-track-loans.png").convert("RGB"), "Track every\nloan & EMI", "Balance, interest and debt-free date in one place"),
        ("calculators", Image.open(SHOTS / "05-calculators.png").convert("RGB"), "EMI calculator\n& loan tracker", "EMI, SIP, FD, GST and more. Free."),
    ]
    sizes = [(1200, 628), (1200, 1200), (1200, 1500)]
    for name, src, headline, sub in themes:
        for size in sizes:
            hl = headline
            make_ad(src, hl, sub, size, ADS / f"{name}-{size[0]}x{size[1]}.png")
    print("done")


if __name__ == "__main__":
    main()
