# Simuwire

**Block diagram simulation in your browser.** Build control loops by dragging blocks and wires, run them, and read the results on a scope. No installation, no license, no server: Simuwire is a single HTML file.

It can also open Simulink `.slx` and `.mdl` files directly, so models you built in the past keep running after your MATLAB license is gone.

![Simuwire running a PI control loop with dead time](docs/screenshot.png)

## Try it

- **Online:** [senolgulgonul.github.io/simuwire](https://senolgulgonul.github.io/simuwire/)
- **Offline:** download `index.html` and open it in any modern browser (Chrome, Edge, Firefox, Safari).

Click **Examples** to load one of the built-in models. The same models are also in [`examples/`](examples/): basic system responses, a mass-spring-damper, the Van der Pol oscillator, sampling, a continuous and a sampled PI controller side by side, on-off temperature control with a Relay, and PID control of a first-order-plus-dead-time (FOPDT) process with Ziegler–Nichols and SIMC tuning. Press **Run**.

## Features

- Simulink-style editor: block library, drag-and-drop, orthogonal wiring, branches, draggable wire segments, block flipping, undo
- Fixed-step solvers: `ode4` (Runge–Kutta, default) and `ode1` (Euler), with automatic step selection
- MATLAB-style parameters: numbers, vectors like `[T 1]`, expressions like `2*K`, and model variables defined once in Settings
- Scope windows with multiple inputs, hover readout, zoom (mouse wheel), pan (drag) and double-click to fit, and a black-and-white style that prints well
- Opens Simulink `.slx` files (both the current and the older layout) and classic `.mdl` files: blocks, positions, connections, model workspace variables and stop time are read automatically
- Saves models as `.json` files; the current model is also kept in the browser between sessions
- Detects algebraic loops and unconnected inputs, and highlights the block that caused an error
- Light and dark mode, works on tablets and phones

## Blocks

| Category | Blocks |
|---|---|
| Continuous | Integrator, Derivative, Transfer Fcn, Transport Delay, PID Controller |
| Discontinuities | Saturation, Dead Zone, Relay |
| Discrete | Unit Delay, Zero-Order Hold |
| Math Operations | Sum, Gain, Product, Abs |
| Signal Routing | Switch |
| Sinks | Scope, Display |
| Sources | Constant, Step, Sine Wave, Ramp, Pulse Generator, Clock |
| User-Defined Functions | Fcn (e.g. `2*u^2 + sin(t)`) |

The PID Controller supports P, PI, PD, PID and I types, parallel and ideal forms, and a first-order derivative filter (coefficient N). Its anti-windup is Limit integrator (clamping), which keeps the integral of the error, ∫e dt, within its limits, like `integral = constrain(integral, imin, imax)` in microcontroller code. The actuator limit is a separate Saturation block after the controller, like `output = constrain(output, umin, umax)`. To model a digital controller, put a Zero-Order Hold on the measurement (ADC) and one on the controller output (DAC); see the sampled PI example.

The Relay block is an on-off switch with hysteresis for thermostat-style control. Set the switch-on and switch-off points apart to get a hysteresis band; with the defaults (both `eps`) it switches at zero.

## Validation

A PI controller (Kp = 1, Ki = 1) on the plant 1/(s+1) with a 1 s transport delay was simulated in both Simulink and Simuwire. The responses match: a 1.5 peak at t ≈ 3 s, a dip to about 0.76 at t ≈ 5.3 s, and a value of 0.947 at t = 10 s. The `.slx` version of `examples/pid/pi_fopdt_with_and_without_dead_time.json` was also imported and checked against an independent Python simulation of the same loop.

## Tests

`tests/block_tests.js` checks every block against an analytic answer: 58 tests covering all 24 blocks, all PID variants including the integrator limit, both solvers and the error checks (algebraic loops, undefined variables, improper transfer functions). To run it, open Simuwire, open the browser console (F12), paste the file and press Enter.

## Importing Simulink models

Use **Open** and pick an `.slx` or `.mdl` file. Both the current `.slx` layout and the older one (a single `blockdiagram.xml`), as well as classic text `.mdl` files, are supported. Supported blocks are converted automatically; unsupported ones (for example subsystems or Stateflow charts) appear with a dashed outline so you can see what needs to be rebuilt. Variables stored in the model workspace are loaded into Settings; variables that lived only in the MATLAB base workspace are set to 1 and listed so you can enter their values.

Simulink files are only read, never modified. Variables in `.mdl` files and older `.slx` files are usually stored in the MATLAB base workspace rather than in the model, so they are listed with a value of 1 for you to fill in.

## Keyboard shortcuts

| Key | Action |
|---|---|
| Ctrl+T | Run the simulation |
| Ctrl+S | Save the model to a file |
| Ctrl+Z | Undo |
| Ctrl+I | Flip the selected block |
| Delete | Delete the selected block or line |
| Enter | Open the selected block’s parameters |
| Space | Fit the model to the view |

In a Scope window, scroll to zoom (over an axis, only that axis zooms), drag to pan, and double-click the plot to see the whole signal.

Drag a wire segment to move it, double-click a wire to return it to automatic routing, and Ctrl+drag a wire to branch it.

## Hosting on GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.
3. After a minute the app is live at `https://<your-username>.github.io/<repository-name>/`.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Roadmap

- Subsystems
- Mux/Demux and vector signals
- Scope export to PNG and CSV
- Derivative on measurement (setpoint weighting) for the PID block
- Variable-step solver
- Arduino I/O blocks and code generation, and a Code block for writing controllers as C-like code

## How it works

Everything runs in the browser. The `.slx` reader unzips the file and parses its XML; a small expression evaluator handles MATLAB-style parameters; the engine orders blocks by signal flow and integrates continuous states with a fixed-step Runge–Kutta method. The only external dependency is [JSZip](https://stuk.github.io/jszip/), loaded from a CDN, for reading `.slx` files.

## Citing Simuwire

Simuwire is free to use under the MIT License. If you use it in a course, a thesis or a paper, a citation is appreciated:

> Gülgönül, Ş. (2026). *Simuwire: a browser-based block diagram simulator* (Version 1.8) [Computer software]. https://github.com/senolgulgonul/simuwire

```bibtex
@software{gulgonul_simuwire_2026,
  author  = {G{\"u}lg{\"o}n{\"u}l, {\c{S}}enol},
  title   = {Simuwire: a browser-based block diagram simulator},
  year    = {2026},
  version = {1.8},
  url     = {https://github.com/senolgulgonul/simuwire}
}
```

GitHub also shows a **Cite this repository** button for this project, generated from `CITATION.cff`.

## Disclaimer

Simuwire is an independent project and is not affiliated with, endorsed by, or sponsored by The MathWorks, Inc. MATLAB and Simulink are registered trademarks of The MathWorks, Inc.

## License

[MIT](LICENSE)
