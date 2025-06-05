# Infeasibility Example

The user provided this example of an infeasible problem:

## Original Problem
```
min z = 3x1 + 2x2
s.a: x1 + x2 ≥ 10
     x1 + x2 ≥ 15
     x1, x2 ≥ 0
```

## Standard Form
```
min z = 3x1 + 2x2
s.a: x1 + x2 - s1 = 10
     x1 + x2 - s2 = 15
     x1, x2, s1, s2 ≥ 0
```

## Phase I with Artificial Variables
```
min w = a1 + a2
s.a: x1 + x2 - s1 + a1 = 10
     x1 + x2 - s2 + a2 = 15
     x1, x2, s1, s2, a1, a2 ≥ 0
```

## Initial Tableau for Phase I
```
Basic | x1 | x2 | s1 | s2 | a1 | a2 | RHS
------+----+----+----+----+----+----+-----
  w   | -2 | -2 |  2 |  2 |  0 |  0 | -25
  a1  |  1 |  1 | -1 |  0 |  1 |  0 |  10
  a2  |  1 |  1 |  0 | -1 |  0 |  1 |  15
```

Note: The objective row is set up by subtracting the sum of rows with artificial variables from the initial w row (which starts as all zeroes). This makes the coefficients for artificial variables zero in the objective row.

## Why This Problem Is Infeasible

The constraints x1 + x2 ≥ 10 and x1 + x2 ≥ 15 are contradictory since they can't both be satisfied at the "boundary" - one requires x1 + x2 to be at least 10, while the other requires the same sum to be at least 15. This means x1 + x2 must be at least 15.

But these constraints both use the same coefficients (1, 1), so they're parallel lines in the solution space. This means we can't eliminate both artificial variables - at least one will remain in the basis with a positive value, proving that the problem is infeasible.

When running Phase I simplex on this problem, we would not be able to drive the objective value to zero, which confirms that the problem is infeasible.

This is what our implementation should detect when it encounters such contradictory constraints.