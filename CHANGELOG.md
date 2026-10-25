# Changelog

Versions follow MAJOR.MINOR.PATCH: a new feature raises MINOR (1.1 → 1.2), a bug fix raises PATCH (1.1 → 1.1.1).

## v1.2 (2026-10-25)

- Opens `.slx` files saved by older Simulink releases (diagram stored in a single `blockdiagram.xml`, lines connected by block name).
- Opens classic `.mdl` text files, including newer `.mdl` files that embed the diagram as XML.

## v1.1.1 (2026-10-25)

- Fixed: Unit Delay now holds its initial condition for the first full sample period (it switched one sample too early).
- Added a block test suite (`tests/block_tests.js`, 45 tests covering every block).

## v1.1 (2026-10-25)

- Blocks can be resized: select a block and drag one of its corner handles. Ports and wires follow the new size; Sum blocks stay round.
- Help → About links to the GitHub repository.

## v1.0 (2026-10-25)

First public release.

- Browser-based block diagram editor with a Simulink-style block library, orthogonal wiring, branches, draggable wire segments, block flipping and undo
- 23 blocks, including PID Controller, Transfer Fcn, Transport Delay, Integrator, Sum, Gain and Scope
- Fixed-step ode4 (Runge–Kutta) and ode1 (Euler) solvers with automatic step selection
- Opens Simulink `.slx` files; saves models as timestamped `.json` files
- Fixed before release: a Sine Wave block connected to a Scope stopped the simulation
- Eight built-in examples, from second-order damping to PID tuning on a FOPDT process
- Black-and-white, print-friendly Scope
