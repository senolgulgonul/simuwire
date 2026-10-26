# Changelog

Versions follow MAJOR.MINOR.PATCH: a new feature raises MINOR (1.1 → 1.2), a bug fix raises PATCH (1.1 → 1.1.1).

## v1.5 (2026-10-26)

- New example: digital vs continuous PI (Examples → Discrete control). The same PI gains run as a continuous controller and as a sampled controller built from a Zero-Order Hold, two Gains and a Unit Delay accumulator. Raising the sample time increases the overshoot, and at Ts = 2 the digital loop becomes unstable.
- Fixed: in Model variables, a `;` inside a `%` comment split the line and caused an error. Comments are now removed before the line is split.
- One new test for the comment fix (51 tests in total).

## v1.4.1 (2026-10-26)

- The Scope window no longer has a Fit button: double-click the plot to see the whole signal. The Fit button in the main toolbar stays.

## v1.4 (2026-10-26)

- Scope windows can be zoomed and panned: scroll to zoom around the pointer (over the time or value axis, only that axis zooms), drag with the left button to pan, and press **Fit** or double-click the plot to see the whole signal again. The zoom is kept when you run the simulation again, so you can compare runs at the same spot.

## v1.3.1 (2026-10-26)

- Blocks are drawn without a drop shadow, for a plainer look that also prints more cleanly.

## v1.3 (2026-10-26)

- New **Relay** block (Discontinuities) for on-off control: switch-on and switch-off points with hysteresis, and adjustable on and off output values. It is also read from Simulink `.slx` and `.mdl` files.
- New example: on-off temperature control of an oven with dead time (Examples → On-off control).
- Fixed: two error messages (negative transport delay, invalid Fcn expression) were shown in Turkish; they are now in English.
- Five new Relay tests (50 tests in total).

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
