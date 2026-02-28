import base64
import json
import os
import tempfile

import anthropic
from django.conf import settings
from PIL import Image
import pillow_heif

pillow_heif.register_heif_opener()

VISION_PROMPT = """Analyze this clothing item and return a JSON object with exactly these fields:
- type (string): specific garment name
- color (array of strings): all colors present
- pattern (string): solid, striped, plaid, floral, graphic, etc.
- texture (string): knit, denim, silk, cotton, linen, leather, etc.
- formality (string): one of — casual, smart casual, business casual, formal
- season (array): any combination of spring, summer, fall, winter
- fit (string): slim, relaxed, oversized, fitted, etc.
- tags (array of strings): 3–6 descriptive tags useful for outfit matching

Return only valid JSON. No explanation or prose."""

TEXT_ACCESSORY_PROMPT = """Based on this accessory description, return a JSON object with exactly these fields:
- type (string): specific item name
- color (array of strings): all colors present
- pattern (string): solid, striped, plaid, floral, graphic, etc.
- texture (string): material/texture description
- formality (string): one of — casual, smart casual, business casual, formal
- season (array): any combination of spring, summer, fall, winter
- fit (string): n/a (use this for accessories)
- tags (array of strings): 3–6 descriptive tags useful for outfit matching

Description: {description}
Category: {category}

Return only valid JSON. No explanation or prose."""


def _get_client():
    return anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def _parse_json_response(text: str) -> dict:
    """Strip markdown code fences if Claude wraps the JSON, then parse."""
    text = text.strip()
    if text.startswith('```'):
        lines = text.split('\n')
        # Remove first line (```json or ```) and last line (```)
        text = '\n'.join(lines[1:-1])
    return json.loads(text)


def _get_image_media_type(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()
    return {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
    }.get(ext, 'image/jpeg')


_MAX_CLAUDE_BYTES = 4_800_000   # 5 MB limit with some headroom
_MAX_DIMENSION = 2000           # max pixels on either side before resizing


def _prepare_image_for_claude(image_path: str):
    """
    Return (tmp_path, True) with a temp JPEG safe for Claude (<5 MB, ≤2000px).
    Returns (image_path, False) only when already a small JPEG.
    Caller must delete tmp_path when the bool is True.
    """
    ext = os.path.splitext(image_path)[1].lower()
    needs_convert = ext in ('.heic', '.heif')

    # Check file size without opening if already a JPEG
    if not needs_convert and os.path.getsize(image_path) < _MAX_CLAUDE_BYTES:
        return image_path, False

    img = Image.open(image_path).convert('RGB')

    # Resize if either dimension exceeds the max
    w, h = img.size
    if w > _MAX_DIMENSION or h > _MAX_DIMENSION:
        img.thumbnail((_MAX_DIMENSION, _MAX_DIMENSION), Image.LANCZOS)

    # Write to temp file, reducing quality until under the size cap
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
    tmp.close()
    for quality in (85, 75, 65, 50):
        import io
        buf = io.BytesIO()
        img.save(buf, 'JPEG', quality=quality)
        if buf.tell() < _MAX_CLAUDE_BYTES:
            with open(tmp.name, 'wb') as f:
                f.write(buf.getvalue())
            return tmp.name, True

    # Last resort — save at quality 40
    img.save(tmp.name, 'JPEG', quality=40)
    return tmp.name, True


def analyze_clothing_image(image_path: str) -> dict:
    """Send image to Claude and return structured clothing attributes."""
    client = _get_client()

    # Ensure image is a JPEG under 5 MB (resizes/converts if needed)
    send_path, is_tmp = _prepare_image_for_claude(image_path)
    try:
        with open(send_path, 'rb') as f:
            image_data = base64.standard_b64encode(f.read()).decode('utf-8')
        media_type = _get_image_media_type(send_path)
    finally:
        if is_tmp:
            try:
                os.unlink(send_path)
            except OSError:
                pass

    message = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=1024,
        messages=[{
            'role': 'user',
            'content': [
                {
                    'type': 'image',
                    'source': {
                        'type': 'base64',
                        'media_type': media_type,
                        'data': image_data,
                    },
                },
                {
                    'type': 'text',
                    'text': VISION_PROMPT,
                },
            ],
        }],
    )

    return _parse_json_response(message.content[0].text)


def analyze_clothing_text(description: str, category: str) -> dict:
    """Generate structured attributes for a text-described accessory."""
    client = _get_client()

    prompt = TEXT_ACCESSORY_PROMPT.format(description=description, category=category)

    message = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=1024,
        messages=[{'role': 'user', 'content': prompt}],
    )

    return _parse_json_response(message.content[0].text)


def generate_outfit(occasion: str, wardrobe_items) -> dict:
    """Ask Claude to pick items from the wardrobe for the given occasion."""
    client = _get_client()

    wardrobe_json = json.dumps([
        {
            'id': item.id,
            'category': item.category,
            'notes': item.notes,
            'user_tags': item.user_tags,
            **item.ai_attributes,
        }
        for item in wardrobe_items
    ])

    prompt = f"""You are a personal stylist. The user wants an outfit for: {occasion}.
Here is their wardrobe (JSON array of clothing items): {wardrobe_json}
Recommend a complete outfit by selecting item IDs from the wardrobe.
Return a JSON object with: selected_item_ids (array of integers), outfit_name (string), reasoning (1–2 sentences).
Return only valid JSON."""

    message = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=1024,
        messages=[{'role': 'user', 'content': prompt}],
    )

    return _parse_json_response(message.content[0].text)


def analyze_shopping_pairings(shopping_item_attrs: dict, wardrobe_items) -> dict:
    """Given a potential purchase's attributes, suggest outfits with the user's wardrobe."""
    client = _get_client()

    wardrobe_json = json.dumps([
        {
            'id': item.id,
            'category': item.category,
            'notes': item.notes,
            'user_tags': item.user_tags,
            **item.ai_attributes,
        }
        for item in wardrobe_items
    ])

    prompt = f"""You are a personal stylist. A user is considering buying this item:
{json.dumps(shopping_item_attrs)}

Here is their existing wardrobe:
{wardrobe_json}

Recommend outfit combinations that pair the new item with existing wardrobe pieces.
Return a JSON object with:
- outfits (array, each with: selected_item_ids (array of integers), outfit_name (string), reasoning (string))
- overall_verdict (string): 1–2 sentences on how versatile this item is with their wardrobe

Return only valid JSON."""

    message = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=1024,
        messages=[{'role': 'user', 'content': prompt}],
    )

    return _parse_json_response(message.content[0].text)
