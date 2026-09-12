# Cell to Self Brand and Website Style Guide

This guide keeps the Cell to Self website, social graphics, email, print materials, and future products visually and editorially consistent. The work should always feel unmistakably Amy: honest, specific, funny beside painful, hopeful without pretending, and written from the middle of real life.

## Brand foundation

### What Cell to Self is

Cell to Self is Amy's living record of life after prison while she is still figuring it out. It holds recovery, reentry, family, faith, grief, work, relationships, humor, and the ordinary details of freedom in the same honest frame.

### Core promise

Tell the truth from the middle of the story, before it has been polished into a lesson.

### Tagline

> Real life after prison, written in real time.

### Supporting language

- Just figuring it out as I go.
- This time, I tell the story.
- Never underestimate the beauty of an ordinary day.
- Messy. Beautiful. Chaotic. Hilarious. Grateful. Free.

### Brand qualities

| The brand is | The brand is not |
|---|---|
| Honest, specific, and emotionally alive | Institutional or sanitized |
| Funny beside painful | Trauma packaged as inspiration |
| Editorial and handmade | Generic lifestyle branding |
| Hopeful without pretending | Perfect, preachy, or resolved |

## Voice and writing

### Voice principles

1. Write as Amy, not as a brand department. Use first person, concrete details, and the words Amy would actually say.
2. Let humor and pain coexist. Do not force a tidy moral onto an experience that is still unfolding.
3. Name prison and reentry directly. Avoid euphemisms, spectacle, and language that turns people into case studies.
4. Prefer specific scenes over broad claims. The ordinary details of freedom are part of the story.
5. Keep calls to action plain and human: **Read the Story**, **Explore All Stories**, **Meet Amy**, and **Stay Connected**.

### Editorial rhythm

Use short sentences for impact, conversational paragraphs for movement, and occasional fragments when they sound natural. Profanity can stay when it is truthful to the moment. Preserve Amy's humor, timing, and emotional turns during editing.

### Language to avoid

- Generic comeback-story language or redemption clichés
- Clinical labels where a human description is clearer
- Performative inspiration, pity, or false certainty
- Corporate filler such as *journey*, *empower*, *leverage*, and *impactful* unless the sentence truly needs it
- Overexplaining a joke or ending every post with a lesson

### Capitalization and punctuation

Use sentence case for ordinary headings and title case for story titles. Use contractions. Use an em dash sparingly.

Category names remain:

- Dear Prison Pals
- After the Headline
- Healing in Real Time
- Ink on the Inside

## Color system

The palette should feel warm, editorial, imperfect, and grounded. Turquoise carries movement and freedom; rose adds humanity and friction; ink and paper hold the system together.

| Color | Hex | Primary use |
|---|---|---|
| Ink | `#11100E` | Headlines, body copy, rules, borders, and dark backgrounds |
| Paper | `#F3EFE4` | Primary page background and editorial canvas |
| Cream | `#FFF9EB` | Light text and warm pale surfaces |
| Light Turquoise | `#58B7AA` | Primary actions, feature surfaces, and handwritten emphasis |
| Dark Turquoise | `#194F49` | Deep brand sections, strong accents, and dark teal text |
| Rose | `#B77D6B` | Emotional accents, stamps, selected surfaces, and details |
| Soft Pink | `#F0B7C1` | Occasional supporting editorial surface |

### Color rules

- Use only `#58B7AA` and `#194F49` for turquoise. Do not drift toward bright cyan or aqua.
- Use `#B77D6B` through the `--rose` variable. Do not reintroduce `--gold`, `--red`, or `--rose-gold`.
- Keep Paper as the default page background and Ink as the default text color.
- Use Cream on dark backgrounds and test every combination for readable contrast.
- Soft Pink is a supporting color, not a replacement for turquoise or rose.

### Canonical website variables

```css
:root {
  --ink: #11100E;
  --paper: #F3EFE4;
  --cream: #FFF9EB;
  --teal: #58B7AA;
  --teal-dark: #194F49;
  --rose: #B77D6B;
  --pink: #F0B7C1;
}
```

See the [separate color guide](COLOR-GUIDE.md) for a compact color reference.

## Typography

| Role | Family | Use |
|---|---|---|
| Primary sans | Inter | Navigation, bold display headlines, interface copy, and labels |
| Editorial serif | Georgia | Article body, quotes, reflective lines, and italic accents |
| Handwritten | Qwitcher Grypen | The word *rewritten* and rare expressive emphasis |
| Utility mono | Space Mono | Dates, categories, metadata, and compact editorial labels |

### Hierarchy

- Display headlines use Inter at a heavy weight with tight tracking and responsive sizing.
- Page and card titles use Inter or Georgia according to the existing editorial composition.
- Article copy uses Georgia at a comfortable reading size, generous line height, and narrow measure.
- Metadata and buttons use Space Mono or Inter. Keep them readable on mobile; uppercase with modest tracking.
- Handwritten type is limited to one focal phrase at a time. Never use it for paragraphs or essential navigation.

### The rewritten treatment

Set *rewritten* in Qwitcher Grypen Bold, Light Turquoise, slightly rotated, oversized, and overlapping with intention. It should feel handwritten and alive without covering a face or blocking required text.

## Logo system

### Primary horizontal logo

Use the horizontal logo in the global header and footer when horizontal space allows. Preserve its aspect ratio and keep the artwork legible against its background.

### Seal

Use the CS seal for favicons, social avatars, small stamps, and compact placements. It can support the wordmark, but should not compete with a full logo in the same small area.

### Clear space and minimum size

- Leave clear space around the logo equal to at least the height of the small tagline letters.
- Do not compress, stretch, redraw, recolor, crop through, or add shadows to the logo artwork.
- Use the horizontal logo at 180 pixels wide or larger when the full signature must remain readable.
- At smaller sizes, switch to the seal or an accessible text wordmark.
- On dark sections, use the prepared treatment that visually fades into the background. Never show a gray checkerboard or hard rectangle behind the artwork.

## Photography and imagery

Choose images that feel lived-in, personal, and specific. Amy should look like a real person inside a real day, not a stock spokesperson. The visual story can move from darkness toward light, but it should not turn incarceration into decoration.

### Use

- Real photographs of Amy and meaningful places, objects, letters, and ordinary freedoms
- Natural expressions, humor, movement, work, family, and imperfect moments
- Editorial crops with a clear focal point and enough negative space for nearby typography
- Color photography by default; selective monochrome only when it serves the story
- Transparent or softly faded cutouts only when the edge treatment is clean at full size

### Avoid

- Generic prison bars, handcuffs, courtroom stock photography, or sensational crime imagery
- Heavy beauty filtering that makes Amy look unlike herself
- Text over faces, especially at tablet and narrow desktop widths
- Visible transparency grids, hard rectangular halos, or poor background removal
- Oversized source files when an optimized WebP can preserve the visible quality

### Alt text

Describe what matters in the image and its purpose in the story. Give decorative artwork empty alt text. Do not begin with “image of” or “photograph of” unless that distinction matters.

## Website experience

### Global navigation

Use the same global header on every page:

- Home
- Start Here
- Stories
- Dear Prison Pals
- About Amy
- Stay Connected

Each destination must be a dedicated page, and the current page should be visibly identified.

### Calls to action

- Use clear labels: **Read the Story**, **Explore All Stories**, **Read Dear Prison Pals**, **Meet Amy**, **Stay Connected**, and **Back to Top**.
- Primary buttons use Light Turquoise with Ink text. Rose may identify a special or secondary action.
- Do not rely on a repeated arrow by itself to explain where a link goes.
- Buttons and links need visible hover and keyboard-focus states.

### Story cards

Each archive card includes a title, date, category, short description, image when available, and a **Read Story** action. Card styles may vary in scale and color, but the information pattern must stay predictable.

### Story pages

Every story page includes:

- Global header and footer
- Title, date, and category
- Readable article column with semantic headings
- Back to Stories plus previous and next story navigation
- Subscription or Stay Connected invitation
- The preserved chronological **Read in Order** sequence, maintained independently from publication-date sorting

### Editorial texture

Scrapbook details, tilted frames, underlines, stamps, and limited movement are welcome when they clarify hierarchy or add personality. Keep them rare enough to feel intentional. Avoid generic gradients, excessive animation, decorative icon clutter, and interchangeable template sections.

## Responsive and accessible design

### Responsive priorities

| Range | Priority | Check |
|---|---|---|
| Mobile up to 560 px | Single-column clarity | No overflow; menu works; faces and headline remain separate |
| Tablet 561–900 px | Reflow before shrinking | Cards stack cleanly; type remains readable; controls have room |
| Narrow desktop 901–1180 px | Protect the hero composition | Portrait does not cover *Time*; header does not run together |
| Wide desktop above 1180 px | Preserve editorial scale | Intentional whitespace and a comfortable reading measure |

### Accessibility baseline

- Use one H1 per page, followed by semantic H2 and H3 levels in order.
- Navigation and menus must work by keyboard and expose the correct expanded states.
- Focus indicators must be clearly visible against every background.
- Color cannot be the only signal for state, category, or required information.
- Maintain adequate color contrast and readable type sizes. Never sacrifice readability for the collage effect.
- Use descriptive link text and alt text, labels for form controls, and error messages connected to their fields.

### Performance

Prefer optimized WebP images sized for their actual display. Keep original masters outside the production path. Avoid unnecessary scripts, duplicate fonts, autoplay media, and animation that runs continuously without purpose. Respect reduced-motion preferences.

## Content and publishing checklist

Before publishing a page or story:

1. Confirm the title, date, category, excerpt, image, and alt text.
2. Check the story's place in the preserved Read in Order sequence when applicable.
3. Test every internal and external link, including previous and next story links.
4. Preview mobile, tablet, narrow desktop, and wide desktop layouts.
5. Confirm no image covers essential text or a face and no element extends beyond the viewport.
6. Check keyboard navigation, focus states, headings, form labels, and color contrast.
7. Optimize new media without visibly reducing quality.
8. Run the site build and automated link and asset check before deployment.

## Ownership and updates

Amy owns the voice and final editorial judgment. Update this guide when a new repeated design decision becomes part of the system. One-off experiments do not become standards until they prove useful across the site.

### Current decisions still to make

- Choose and connect a long-term email subscription service.
- Choose a donation or support platform and provide the final destination link.
- Confirm any additional social profiles before adding them. Do not invent URLs.
- Define a privacy and data-retention policy for contact-form and subscription submissions.
