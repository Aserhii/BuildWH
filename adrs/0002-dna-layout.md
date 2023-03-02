# DNA Structure, Layouts

## Prior

We didn't use grid type or grid unit

The 2D DNA could be derived from the 1D DNA and each row would be exactly the same length, so columns were all just 1 module long

## Now

We have variable length modules (grid units per grid type)

The DNA string is split at every 2nd occurrence of an `END` module

So that’s rows

Then we need to carve columns out

So we count grid units per grid type per level… If there are smaller denominations than simply the entire section of that grid type, then we wrap in `[]`, this is a column (see `columnify`).

We need columns for stretch interaction
