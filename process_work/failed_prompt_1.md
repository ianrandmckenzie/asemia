This repository is the beginnings of a system for creating typographic forms that are not tied to any language. It is for a language that does not exist. It sort-of looks like a phoenetic-based serif-font.

It is comprised of an adherence to a 4x4 grid. Bodies, whether long or short, can only exist within the center 2x2 of that grid.

Joins are a component that bring a seamless transition between bodies in their angles. We always join bodies whenever their shapes form an angle.

Joins can exist at the following 16 angles which are any multiple of 22.5 up to 360 and including 0:
0º
22.5º
45º
67.5º
90º
etc

I have made joins for 22.5 up to 167.5. In instances where joins are needed at other angles, we simply recycle our existing joins by rotating them to suite the correct positioning within the grid.

We use "serif" bodies anytime the body terminates on the sides of the 2x2 square which touches the outer 4x4/.

We also use "serif" bodies anytime their terminus is not touching another body.

What I need from you is to create this grid using HTML and vanilla CSS which will be put in `typography.css`. You may see that I am using TailwindCSS, but that will be for layout and other application purposes. We will need fine-grain control for these forms, so we will use vanilla CSS whenever assembling our typographic forms in the grid.

You are also using vanilla JS. What we are doing with our grid is, for now, having you generate a random typographic form following these rules.

When I click a generate button, a form will appear. Once the form appears, there will be another button, "Save shape" which will copy a JSON object to my clipboard where I will paste it elsewhere for now.

You will determine the JSON structure.

I will test by generating forms and seeing if we need to fine-tune the code, if so I will subsequently prompt you after this.

Please analyze this repo to familiarize yourself with the overall ideas and paradigms my thoughts thus far are working with.

Okay, let's add some clarity:

All SVG typographic forms should be precisely proportional to each other. If an svg is being resized to fit within the grid, all other forms must be resized proportionally.

Let's imagine our grid as numbered this way:
 1   2   3   4
 5   6   7   8
 9  10  11  12
13  14  15  16

Short bodies should only fit in a 1x1 space. If it is vertical, it must be centered to the borders of the grid, between:
5 and 6,
6 and 7,
7 and 8,
9 and 10,
10 and 11,
11 and 12

If short bodies horizontal, it must be centered to the borders of the grid, between:
2 and 6,
3 and 7,
6 and 10,
7 and 11,
10 and 14,
11 and 15

If short bodies are diagonal, in their original orientation, the must be top-right aligned within the 1x1 square.

If the diagonal short bodies are rotated, they must always be aligned to the corner in which was originally top-right in the default rotation.

If the diagonal short bodies are reflected (mirrored) horizontally, making their original top-right put into the top-left position, they must subsequently then be aligned top-left within the 1x1 square.

If the horizontal reflected (mirrored) diagonal short bodies are rotated, they must always be aligned to the corner in which was originally top-left in the default rotation.

Vertical long bodies should only fit in a 2 (height) x 1 (width) space. Vertical long bodies must be centered to the borders of the grid, between:
5+9 and 6+10,
6+10 and 7+11,
7+11 and 8+12

Horizontal long bodies should only fit in a 1 (height) x 2 (width) space. Horizontal long bodies must be centered to the borders of the grid, between:
2+3 and 6+7,
6+7 and 10+11,
10+11 and 14+15

45º diagonal long bodies, in their original orientation, must be top-right aligned, occupying a 2x2 space, 6, 10, 7, and 11 only.

If the 45º diagonal long bodies are rotated, they must always be aligned to the corner in which was originally top-right in the default rotation.

If the 45º diagonal long bodies are reflected (mirrored) horizontally, making their original top-right put into the top-left position, they must subsequently then be aligned top-left within the 2x2 space.

If the horizontal reflected (mirrored) 45º diagonal long bodies are rotated, they must always be aligned to the corner in which was originally top-left in the default rotation.

For now, let's omit the 22.5 long bodies to simplify our iteration process.
