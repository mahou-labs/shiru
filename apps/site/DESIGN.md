---
name: Shiru (shiru.sh)
description: SHIRU(1), a manual page set once for people and once, as plain Markdown, for agents.
colors:
  paper: "#ffffff"
  ink: "#1a1a1a"
  ink-strong: "#000000"
  ink-muted: "#5c5c5c"
  rule: "#d4d4d4"
  link: "#1f4fbf"
  mark: "#1a1a1a"
  paper-dark: "#121212"
  ink-dark: "#e8e8e6"
  ink-strong-dark: "#ffffff"
  ink-muted-dark: "#a3a3a3"
  rule-dark: "#333333"
  link-dark: "#8ab4ff"
  mark-dark: "#e8e8e6"
typography:
  display:
    fontFamily: "STIX Two Text, Times New Roman, Times, serif"
    fontSize: "clamp(min(2.125rem, 8.6vw), 5.5vw, 4.25rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "STIX Two Text, Times New Roman, Times, serif"
    fontSize: "1.1875rem"
    fontWeight: 700
    lineHeight: 1.6
    letterSpacing: "0.02em"
  body:
    fontFamily: "STIX Two Text, Times New Roman, Times, serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.6
  command:
    fontFamily: "Courier Prime, Courier New, ui-monospace, monospace"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
  code-block:
    fontFamily: "Courier Prime, Courier New, ui-monospace, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  source:
    fontFamily: "Courier Prime, Courier New, ui-monospace, monospace"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Courier Prime, Courier New, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: "0px"
spacing:
  page-gutter: "2rem"
  page-gutter-narrow: "1rem"
  margin-column: "11rem"
  column-gap: "2.5rem"
  paragraph: "1rem"
  list-item: "0.75rem"
  hanging-indent: "2rem"
  section: "3.25rem"
  section-narrow: "2.5rem"
  body-indent-narrow: "1.5rem"
components:
  button-command:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.command}"
    rounded: "{rounded.none}"
    padding: "0.25rem 1ch"
    height: "2.75rem"
  button-command-hover:
    backgroundColor: "{colors.ink-strong}"
    textColor: "{colors.paper}"
  input-argument:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.command}"
    rounded: "{rounded.none}"
    padding: "0.125rem 0"
    width: "17ch"
  view-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "0.125rem 0.75ch"
  view-toggle-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  header-line:
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    padding: "1.5rem 0 0.75rem"
  section-head:
    textColor: "{colors.ink-strong}"
    typography: "{typography.title}"
    width: "{spacing.margin-column}"
---

# Design System: Shiru (shiru.sh)

Scope: the marketing site in `apps/site` only. The dashboard and `packages/ui` run a separate shadcn-based system that is not part of this world.

## Overview

**Creative North Star: "The Manual Page"**

shiru.sh is SHIRU(1): one source, typeset for people and plain for agents, the way troff and nroff render one man page twice. The page is white manual paper with black ink and a single manual blue for links. A mono header line and footer line frame it like a printed manual. Section names hang in a left margin in bold caps, and their bodies sit in a hanging indent beside them. Everything else is running text, command lines and example blocks.

Density is a reference document's density: one long column with a fixed measure, generous section breaks and no decorative furniture. Hierarchy comes from the margin, weight and the move between serif and mono, not from size steps, colour fields or containers. The only large type on the page is the NAME line. Dark mode is the same page on a terminal: the tokens invert and nothing else changes.

The page can re-set itself. A view switch on the header rule crossfades the typeset article into its own Markdown source, which is the same string served at `/index.md`. Every new surface in this world has to survive that test: it must still make sense as plain Markdown.

**Key Characteristics:**

- Paper, ink and one blue. No other hues.
- STIX Two Text for the typeset view, Courier Prime for commands, code, source and the frame lines.
- Bold caps section names hung in an 11rem margin; bodies in the second column at a 68ch measure.
- Underlines mark links and emphasis, as nroff marks italics.
- Flat and square: no cards, shadows, gradients, radii or decorative icons.
- One signature motion, the 200ms typeset/markdown crossfade.

## Colors

A monochrome manual with one functional blue; every value has a terminal counterpart for dark mode.

### Primary

- **Manual Blue** (`link`; `link-dark` on the terminal): links only, in body text, the header nav and SEE ALSO. Also the form `accent-color`. Never a fill, never a background, never decoration.

### Neutral

- **Manual Paper** (`paper` / `paper-dark`): the page ground, and the text colour of inverted blocks (submit button, pressed view toggle, skip link).
- **Ink** (`ink` / `ink-dark`): running text, input text, caret, focus outline, and the fill of inverted blocks.
- **Bold Ink** (`ink-strong` / `ink-strong-dark`): bold runs and section heads, and the hover fill of the submit button. One step darker than ink so bold reads as weight plus density, the way overstrike does in nroff.
- **Margin Grey** (`ink-muted` / `ink-muted-dark`): the header and footer lines and input placeholders. Never body copy.
- **Rule Grey** (`rule` / `rule-dark`): the two hairlines that frame the page (header bottom, footer top) and the code block scrollbar thumb. Nothing else is ruled.
- **Selection** (`mark` / `mark-dark`): text selection is reverse video, mark on paper. The token currently equals ink.

### Named Rules

**The One Blue Rule.** Blue means "this goes somewhere." If an element is blue and not a link (or the form accent), it is wrong.

**The Reverse Video Rule.** The only filled surfaces are ink blocks with paper text: the command submit, the pressed view toggle, the skip link, and selection. There is no tinted or grey surface anywhere.

## Typography

**Display Font:** STIX Two Text (with Times New Roman, Times, serif)
**Body Font:** STIX Two Text (with Times New Roman, Times, serif)
**Label/Mono Font:** Courier Prime (with Courier New, ui-monospace, monospace)

**Character:** A book serif for what people read and a typewriter mono for what machines read or what you would type. The switch between them carries meaning: mono means literal.

Fonts load from Google Fonts: Courier Prime 400/700 and STIX Two Text 400, 400 italic and 700.

### Hierarchy

- **Display** (400 with a 700 command name, clamp(min(2.125rem, 8.6vw), 5.5vw, 4.25rem), 1.05, -0.02em): the NAME line only: bold "shiru", an en dash, and the one-line description. It is capped at 10em wide. A floated `shape-outside` wedge (2.4em by 3lh) keeps the first line full and narrows the two below it. The 2.125rem floor (not 2.25rem) is what keeps "shiru –" from sitting alone on a line on phones.
- **Title** (700, 1em of body, 0.02em tracking, uppercase in the source text): section names (NAME, SYNOPSIS, DESCRIPTION...). They are the same size as body. The margin and the weight do the work.
- **Body** (400, 1.1875rem, 1.6, max 68ch): all running prose. Bold runs at 700 in Bold Ink lead definitions ("**People** get...").
- **Command** (Courier Prime 400/700, 1.0625rem, 1.5): the SYNOPSIS command line and its status output.
- **Code block** (Courier Prime, 1rem, 1.5; 0.875rem below 45rem): console examples. Inline code sits at 0.95em of its context.
- **Source** (Courier Prime, 0.95rem, 1.55, pre-wrap): the Markdown view of the whole page.
- **Label** (Courier Prime 400, 0.875rem, 1.5): header line, footer line, view switch, skip link.

### Named Rules

**The Same-Size Head Rule.** Section heads are body size. Do not add heading sizes. The display line is the one exception, and there is only one per page.

**The Underline-Is-Italic Rule.** `em` is set upright with a 1px underline at 0.18em offset, as nroff renders italics. The italic face is loaded but the typeset view does not use it for emphasis.

**The Mono-Is-Literal Rule.** Anything a reader would type, fetch or paste (commands, paths, filenames, URLs used as values) is set in Courier Prime and marked `translate="no"`.

## Layout

One centred column, max 60rem, with 2rem side gutters (1rem below 45rem). From the top: a header line (1.5rem top, 0.75rem bottom, hairline below), the article 2.5rem under it, and a footer line 6rem after the last section (hairline above, 0.75rem top, 2.5rem bottom).

The article is a two-column grid: an 11rem margin column for section heads, a 2.5rem gap, and a body column whose children cap at 68ch. Heads and bodies align on baseline. Sections are 3.25rem apart. Paragraphs are 1rem apart and list items 0.75rem. Lists use a 2rem hanging indent: the bold term starts flush and wrapped lines indent under it. Code blocks are indented 2rem inside the body column.

Below 45rem (the `wide` breakpoint) the grid collapses to a single flow. Heads sit above their bodies, 2.5rem between sections and 0.5rem from head to body. Bodies indent 1.5rem from the head. Code blocks lose their extra indent and wrap rather than scroll. The header drops its centre title ("Shiru Manual") and the footer drops its date, leaving left and right only.

On coarse pointers, header links and view toggles extend invisible hit areas vertically, and the header grows bottom padding (1.75rem) so those targets don't overlap the article. The submit button is at least 44px tall.

**The Hanging Margin Rule.** Every section is a margin head plus an indented body. New content goes into a named section, not into a new layout.

## Elevation & Depth

None. The page is flat paper. There are no shadows, no layered surfaces and no z-depth beyond what overlays need (the view switch sits on the header rule with a paper backing so the rule breaks behind it). Structure comes from the margin, hairlines and reverse-video blocks.

**The Flat Paper Rule.** No box-shadow, no tinted panels, no cards. If something needs separating, give it its own section or a hairline in Rule Grey.

## Shapes

Square everywhere (0px). The email input is explicitly `rounded-none` to stop UA rounding. Forms are lines, not boxes: an input is a single underline in the current colour, and a button is a solid ink rectangle. The only curved shape on the page is the open-book logo mark.

## Components

### Buttons

Typewriter keys: solid, square, inverse.

- **Shape:** square (0px).
- **Primary (command submit):** Ink fill, Paper text, Courier Prime 700 at the command size, 1ch horizontal and 0.25rem vertical padding, at least 2.75rem tall.
- **Hover / Active:** fill shifts to Bold Ink on hover. On press it scales to 0.97. Both transition over 160ms on the shared ease-out curve. While sending, it is disabled with a progress cursor, its label reads "Joining…", and the input goes read-only.
- **Text button:** buttons that act like links (the "Switch the view to markdown" control in prose) are styled exactly as links: Manual Blue with a 1px underline that thickens to 2px on hover.

### Inputs / Fields

The command argument. The field is part of a command line, not a form row.

- **Style:** `shiru join --email` in bold Courier Prime, followed by an input with a transparent background, a 1px bottom border in the current colour, Ink text, a Margin Grey placeholder, and content-based sizing from 17ch up to full width. It grows to fill the line below 45rem.
- **Focus:** the global focus ring: 2px solid Ink outline, 3px offset.
- **Error / Success:** messages are mono lines in a polite live region under the command, never coloured. On success the command line hides and the output line takes focus.

### Navigation

- **Header line:** mono label size, Margin Grey, no wrapping. SHIRU(1) on the left, "Shiru Manual" in the centre, and links on the right (index.md, llms.txt, GitHub) in Manual Blue with underlines. A Rule Grey hairline runs beneath it.
- **Footer line:** a mirror of the header. Logo mark and "Shiru (pre-release)" on the left, the date in the centre, and SHIRU(1) on the right, over a hairline.
- **Links (global):** Manual Blue, 1px underline at 0.18em offset. On hover with a fine pointer, the underline thickens to 2px. Bold inside links takes the link colour.

### View Switch (signature)

`view: typeset | markdown` in label mono. It sits on the header rule at the right edge, shifted down by half its height, on a paper backing. Unpressed options are underlined Ink. On hover the underline goes to 2px and the text to Bold Ink. The pressed option is reverse video (Ink fill, Paper text, no underline). Switching crossfades the panes over 200ms on cubic-bezier(0.23, 1, 0.32, 1) with a 2px blur on the outgoing pane. Under reduced motion it fades opacity only. The hidden pane is `inert`, and the state is kept in the `#markdown` hash. The switch renders only when JavaScript runs.

### Example Block

Console examples are unboxed Courier Prime blocks with a `$` prompt. They have no background, border or syntax colour, and are indented 2rem. They are focusable and scroll horizontally with a thin Rule Grey scrollbar, and wrap below 45rem.

### Skip Link

"Skip to the manual" is an ink block with paper text in label mono. It sits off-screen and slides in on focus.

## Do's and Don'ts

### Do:

- **Do** put every piece of content in a named section with a bold caps head in the 11rem margin and its body at a 68ch measure.
- **Do** keep blue for links. Use reverse video (Ink fill, Paper text) for the one primary action and pressed states.
- **Do** set anything literal (commands, paths, URLs) in Courier Prime with `translate="no"`.
- **Do** make every component degrade to plain Markdown. Each MDX component needs a Markdown fallback, or `/index.md` breaks.
- **Do** define every colour in both the paper and terminal palettes, and change nothing else for dark mode.
- **Do** use the shared ease-out curve (cubic-bezier(0.23, 1, 0.32, 1)) at 160–200ms for state changes, and drop blur and scale under reduced motion.

### Don't:

- **Don't** add cards, shadows, gradients, rounded corners or tinted panels.
- **Don't** add decorative or UI icons. The open-book logo mark is the only drawn glyph, and it appears as the brand mark (favicon, footer).
- **Don't** add heading sizes. Section heads stay at body size, and the display size belongs to the NAME line alone.
- **Don't** remove link underlines or use colour alone for emphasis. Emphasis is an underline.
- **Don't** introduce a second accent hue, including for error or success states.
- **Don't** set body copy in Margin Grey. It is for the frame lines and placeholders.
