## First
This repository is the beginnings of a system for creating typographic forms that are not tied to any language. It is for a language that does not exist. It sort-of looks like a phoenetic-based serif-font.

What I need from you is to create this grid using HTML and vanilla CSS which will be put in `typography.css`. You may see that I am using TailwindCSS, but that will be for layout and other application purposes. We will need fine-grain control for these forms, so we will use vanilla CSS whenever assembling our typographic forms in the grid.

You are also using vanilla JS. What we are doing with our grid is, for now, having you generate a random typographic form following these rules.

When I click a generate button, the typographic form will appear. Once the typographic form appears, there will be another button, "Save shape" which will copy a JSON object to my clipboard where I will paste it elsewhere for now.

You will determine the JSON structure.

I will test by generating forms and seeing if we need to fine-tune the code, if so I will subsequently prompt you after this.

Please analyze this repo to familiarize yourself with the overall ideas and paradigms my thoughts thus far are working with.

We are going to start small so that I can ensure the correct rules are being applied to each form. We will start with just short bodies.

## Second
This looks really good so far. The only adjustment needed right now is to constrain the forms to the center 2x2 parts of the grid.

Let's imagine our grid as numbered this way:
 1   2   3   4
 5   6   7   8
 9  10  11  12
13  14  15  16

They should only be allowed to exist inside 6, 7, 10, and 11.

## Third

Next rules we need to add is:
- All SVG objects must be full-height with width auto.
- If the short body is vertical, it cannot be rotated and it can be in a total of 6 positions:
  * centered on the borders between cell 5 and 6
  * centered on the borders between cell 6 and 7
  * centered on the borders between cell 7 and 8
  * centered on the borders between cell 9 and 10
  * centered on the borders between cell 10 and 11
  * centered on the borders between cell 11 and 12
- If the short body is horizontal, it cannot be rotated and it can be in a total of 6 positions:
  * centered on the borders between cell 2 and 6
  * centered on the borders between cell 3 and 7
  * centered on the borders between cell 6 and 10
  * centered on the borders between cell 7 and 11
  * centered on the borders between cell 10 and 14
  * centered on the borders between cell 11 and 15
- If the short body is diagonal (45º), it can only be rotated to 90º divisible values and it can be in a variety of positions, depending on its rotation:
  * Default rotation: Top-right aligned with overflow going out the left side of the grid cell
  * 90º clockwise rotation: Bottom-right aligned with overflow going out the top side of the grid cell
  * 180º clockwise rotation: Bottom-left aligned with overflow going out the right side of the grid cell
  * 270º clockwise rotation: Top-left aligned with overflow going out the bottom side of the grid cell


## Fourth

Okay, let's add more rules with short bodies:
- Default rotation: bottom-aligned
- 90º rotation: right-aligned
- 180º rotation: top-aligned
- 270º rotation: left-aligned

Also, I was apparently wrong, when we are on 90 and 270 rotations for our diagonal, we need to be width full and height auto.

## Fifth
Next rules we need to add/change is:
- If a body is not joining another body, it needs to and in a serif termination. This means if a body is standing by itself, it only has 50% of the needed terminators. We can workaround this by mirroring it vertically from itself for the 0_deg image. For 45_deg, we need to mirror it vertically AND horizontally.
- We need body-joining detection.

## Nope (not a prompt)
It is at this point I am actually working with a 6x6 grid. See `process_work/screenshots_and_photos/IMG_7393.jpeg`
