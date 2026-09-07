# Cell to Self Color Guide

## Core brand colors

| Color | Hex | Current use |
|---|---|---|
| Black / Ink | `#11100E` | Headlines, body text, borders, and dark backgrounds |
| Paper | `#F3EFE4` | Main page background |
| Cream | `#FFF9EB` | Light text and pale surfaces |
| Bright Turquoise | `#20B9AA` | “Rewritten” and the “Enter the story” button |
| Soft Turquoise | `#58B7AA` | Feature surfaces and secondary turquoise accents |
| Dark Turquoise | `#194F49` | About-section background and deep teal accents |
| Rose Gold | `#B77D6B` | Former orange and red accents, highlighted surfaces, buttons, and details |

## Supporting colors

| Color | Hex | Current use |
|---|---|---|
| Soft Pink | `#F0B7C1` | Reserved supporting color in the stylesheet |
| Medium Gray | `#777777` | Muted interface text |
| Light Gray | `#BBBBBB` | Subtle interface borders |

## CSS variables

```css
:root {
  --ink: #11100E;
  --paper: #F3EFE4;
  --cream: #FFF9EB;
  --teal: #58B7AA;
  --teal-dark: #194F49;
  --gold: #B77D6B;
  --red: #B77D6B;
  --pink: #F0B7C1;
  --rose-gold: #B77D6B;
}
```

The legacy variable names `--gold` and `--red` are retained in the site code, but both now display the Cell to Self rose gold `#B77D6B`.
