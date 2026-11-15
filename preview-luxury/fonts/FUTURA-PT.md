# Futura PT Book — screenshot reference

The paragraph beginning "Neema Crafts, in partnership..." on https://www.neemacrafts.com/guesthouse/ uses the site's `ftnk` font alias with weight 400.

Verified on 2026-11-16 by inspecting the page CSS, its Typekit configuration, and the downloaded WOFF2 name table:

- Family: Futura PT Web
- Subfamily: Book
- Full name: Futura PT Web Book
- PostScript name: FuturaPTWeb-Book
- CSS weight/style: 400 normal

## Local files

- `FuturaPTWeb-Book.woff2`: downloaded webfont (44,852 bytes).
- `futura-pt.css`: local @font-face declaration using the readable family name `Futura PT`.

Example, from a page in `preview-luxury/`:

```html
<link rel="stylesheet" href="fonts/futura-pt.css">
```

```css
.details {
  font-family: 'Futura PT', Arial, sans-serif;
  font-weight: 400;
  line-height: 1.6;
}
```

This is a commercial Adobe Fonts/ParaType font, not a Google Fonts download. The reference site's font delivery does not establish a license for this project. Keep this downloaded asset as a design reference; use the project's own appropriate webfont license/delivery before publishing. An Adobe-hosted webfont entitlement should not be assumed to permit self-hosting this file.

Official family: https://fonts.adobe.com/fonts/futura-pt

License URL embedded in the font: https://fonts.adobe.com/eulas/000000000000000077586b59

Original public asset: https://use.typekit.net/af/26b618/000000000000000077586b59/31/l?subset_id=2&fvd=n4&v=3

No existing preview or main-site font styling was changed.
