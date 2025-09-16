# TODO

## Refactoring SVGs (again)
- Turns out, this is not as workable unless using a 6x6 grid.
- Bodies are not shafts, they are instead half-shaft with terminals (serifs)
- These terminating bodies favor top over bottom and bottom over sides orientation like usual
- These terminating bodies favor being centered between the cell borders which mean they are to be on a separate grid that overlaps (underlaps?) the "joining body" grid.
- If this overlapping grid system is utilized, this means the terminating bodies are centered to the cell within their dedicated grid.
- Joins are not attachments for bodies, they are instead the bodies themselves, where applicable
- Joins are centered to the cell, going to the very edge where they terminate

## TLDR
- SVGs need to be redone
- HTML needs 2 grids, offset by 50% of the cell size.
