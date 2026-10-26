# Simuwire examples

Every model here is also built into the app: click **Examples** in the toolbar and pick one. You can also open these files with **Open**. Then press **Run**. Each model keeps its parameters in **Settings → Model variables**, so you can change them and rerun without touching the blocks.

## Basics

| File | What it shows |
|---|---|
| `basics/01_first_order_step_response.json` | Step response of K/(Ts+1). The output reaches 63% of its final value after one time constant T; a Display block shows the final value K. |
| `basics/02_second_order_damping.json` | Three second-order systems ωn²/(s² + 2ζωn s + ωn²) with damping ratios 0.2, 0.5 and 1 on one Scope: from 53% overshoot down to none. |
| `basics/03_mass_spring_damper.json` | m·x″ = F − c·x′ − k·x built from integrators and gains. A unit force settles the mass at F/k = 0.5 m. |
| `basics/04_van_der_pol_oscillator.json` | The nonlinear Van der Pol oscillator x″ = μ(1 − x²)x′ − x, using Fcn and Product blocks. It settles into a limit cycle of amplitude ≈ 2 for any starting point. |
| `basics/05_saturation_and_dead_zone.json` | A sine wave passed through Saturation (±1) and Dead Zone (±0.5), plotted together. |
| `basics/06_sample_and_hold.json` | Sampling a sine with a Zero-Order Hold and delaying it by one sample with a Unit Delay (Ts = 0.5 s). |

## Discrete control

| File | What it shows |
|---|---|
| `discrete/digital_vs_continuous_pi.json` | The same PI controller (Kp = 2, Ki = 1) on the plant 1/(s+1)², once continuous and once digital with sample time Ts. |

The digital PI is built from basic blocks so the difference equation is visible: the Zero-Order Hold samples the error, e[k] = e(kTs); the accumulator (a Sum with a Unit Delay in its feedback path) computes I[k] = I[k−1] + Ki·Ts·e[k]; and u[k] = Kp·e[k] + I[k]. Because both the sampler and the Unit Delay update only at multiples of Ts, u[k] is held constant between samples, which is the staircase in the Control signal scope.

What to look for: change Ts in Model variables. The continuous loop overshoots by about 6 %. With the same gains the digital loop overshoots by about 9 % at Ts = 0.1, 22 % at Ts = 0.5, 44 % at Ts = 1 and 74 % at Ts = 1.5, and at Ts = 2 it is unstable. Sampling adds delay to the loop, roughly Ts/2, and gains tuned for the continuous controller lose their margin as Ts grows.

## On-off control

| File | What it shows |
|---|---|
| `onoff/onoff_temperature_control.json` | A thermostat (Relay) heats an oven K·e^(−Ls)/(Ts+1) from 20 °C to a 50 °C setpoint with a ±1 °C hysteresis band. |

What to look for: the heater only switches on and off, so the temperature never settles; it cycles around the setpoint. The relay switches at 49 °C and 51 °C, but because of the 2 s dead time the temperature keeps moving after each switch and actually swings between about 47.3 °C and 52.7 °C. Set `L = 0` in Model variables and the swing shrinks to about the ±1 °C band; make `h` smaller and the heater switches more often.

## PID control of a FOPDT process

A first-order-plus-dead-time process, G(s) = K·e^(−Ls)/(Ts + 1), is the standard model for many industrial loops (temperature, level, flow).

| File | What it shows |
|---|---|
| `pid/pi_fopdt_with_and_without_dead_time.json` | The same PI controller on K/(Ts+1), once with a 1 s dead time and once without. Dead time is what makes the loop overshoot. |
| `pid/pid_fopdt_tuning_comparison.json` | K = 1, T = 5 s, L = 1 s controlled three ways: P and PID tuned with Ziegler–Nichols (reaction curve) and PI tuned with SIMC. A load disturbance of 0.5 enters at t = 30 s. |

What to look for in the tuning comparison:

- **P (Ziegler–Nichols)** never reaches the setpoint: a proportional-only controller leaves a steady-state error of 1/(1 + K·Kp) ≈ 17%, and the disturbance shifts it further.
- **PID (Ziegler–Nichols)** is the fastest but overshoots by about 85%; Ziegler–Nichols tuning is known to be aggressive.
- **PI (SIMC)** rises a little slower, overshoots by about 15%, and removes both the setpoint error and the disturbance.

All tuning formulas are written in Model variables, so you can change K, T or L and the controller gains update automatically.
