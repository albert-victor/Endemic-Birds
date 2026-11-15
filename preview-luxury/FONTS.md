# Local font handoff

Both font families are already downloaded as TTF files in `preview-luxury/fonts/`.
The exact file-to-family/style/weight mapping is in `preview-luxury/fonts.css`.
The long filenames are Google Fonts asset names, not font family names.

## Approved pairing

| Use | Family | Weight / style |
| --- | --- | --- |
| Hero and large section headings | Playfair Display | 400 normal |
| Emphasized words in large headings | Playfair Display | 400 italic |
| Card titles | DM Sans | 600 normal; 21px desktop, 22px mobile |
| Body text and card descriptions | DM Sans | 400 normal |
| Navigation and form labels | DM Sans | 500 normal as needed |
| Buttons and card actions | DM Sans | 600 normal |

Downloaded weights: DM Sans 400, 500, 600, 700 normal; Playfair Display 400, 500, 600 normal and 400 italic.

## Integration

Load `fonts.css` before the site's main stylesheet. Adjust the HTML link to the page's directory:

```html
<!-- Example for the root index.html -->
<link rel="stylesheet" href="preview-luxury/fonts.css">
```

```css
:root {
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'DM Sans', Arial, sans-serif;
}
body { font-family: var(--font-body); }
h1, h2 { font-family: var(--font-display); font-weight: 400; }
.card-title {
  font-family: var(--font-body);
  font-size: 21px;
  font-weight: 600;
  line-height: 1.32;
  letter-spacing: -.025em;
}
@media (max-width: 760px) {
  .card-title { font-size: 22px; }
}
```

Keep `fonts.css` beside its `fonts/` directory if copying them elsewhere, or update its relative URLs. No Google Fonts network request is required.

Use `preview-luxury/preview.css` as the visual reference, especially the final card typography and bevel rules. Keep serif typography on large headings; card titles use sans serif. This handoff does not apply changes to the main site.
