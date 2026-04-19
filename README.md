# ZARSHAH — Shopify Theme

Premium men's unstitched clothing — Shopify theme for [zarshah.pk](https://zarshah.pk)

**ہر تار ایک کہانی ہے** — *Every thread holds a story*

---

## Theme Structure

```
/
├── layout/           # Main theme wrapper
├── templates/        # Page templates (index, product, cart, collection, page, 404)
├── sections/         # Editable sections (navbar, hero, footer, etc.)
├── snippets/         # Reusable snippets (product-card)
├── assets/           # CSS, JS, images (logos, bg-texture)
├── config/           # Theme settings schema + data
└── locales/          # Translations
```

## Local Development

To preview the theme locally, use the [Shopify CLI](https://shopify.dev/docs/themes/tools/cli):

```bash
# Install CLI
npm install -g @shopify/cli @shopify/theme

# Connect to your store
shopify theme dev --store=your-store.myshopify.com
```

## GitHub → Shopify Integration

1. Push this repo to GitHub
2. In Shopify Admin: **Online Store → Themes → Add theme → Connect from GitHub**
3. Authorize Shopify to access the repo
4. Select branch (usually `main`)
5. Changes pushed to GitHub automatically deploy to the theme

## Brand

- **Name:** Zarshah
- **Tagline:** ہر تار ایک کہانی ہے — "Every thread holds a story"
- **Colors:** Navy (#0D1B2A), Gold (#C9A84C), Cream (#F0E6D3)
- **Fonts:** Space Grotesk, DM Sans, Noto Nastaliq Urdu

## License

© 2026 ZARSHAH. All rights reserved.
