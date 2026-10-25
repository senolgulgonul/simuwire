# Changelog

## v1.1 (2026-10-25)

- Blocks can be resized: select a block and drag one of its corner handles. Ports and wires follow the new size; Sum blocks stay round.
- Help → About links to the GitHub repository.

## v1.0 (2026-10-25)

First public release.

- Browser-based block diagram editor with a Simulink-style block library, orthogonal wiring, branches, draggable wire segments, block flipping and undo
- 23 blocks, including PID Controller, Transfer Fcn, Transport Delay, Integrator, Sum, Gain and Scope
- Fixed-step ode4 (Runge–Kutta) and ode1 (Euler) solvers with automatic step selection
- Opens Simulink `.slx` files; saves models as timestamped `.json` files
- Eight built-in examples, from second-order damping to PID tuning on a FOPDT process
- Black-and-white, print-friendly Scope
