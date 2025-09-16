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
