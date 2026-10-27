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

## PI anti-windup

| File | What it shows |
|---|---|
| `pid/pi_anti_windup.json` | A PI controller (Kp = 5, Ki = 1) on the plant 1/(10s+1) with its output limited to 0…1.5, once without anti-windup and once with clamping. |

At the step the PI asks for more than the actuator can give, so its output sits at the upper limit. Without anti-windup the integrator keeps integrating the error during that time and winds up: the output stays at the limit for about 20 s, the plant overshoots by about 30 % and settles only after about 33 s. With clamping the integrator stops while the output is at the limit, so the controller leaves the limit as soon as the plant approaches the setpoint: no overshoot, settled after about 15 s.

In code, the simplest form of clamping is one condition around the integrator update (the block is slightly smarter: while limited it still integrates if that would bring the output back inside the limits):

```
u = Kp*e + I;
if (u > umax) u = umax; else if (u < umin) u = umin;
else I = I + Ki*Ts*e;        // integrate only while the output is not limited
```

What to look for: compare the two curves in the Control signal scope. Then try `umax = 1.2` (stronger saturation, much worse windup) and `umax = 10` (no saturation, the two loops give the same response).

## Sampled control

| File | What it shows |
|---|---|
| `sampled/continuous_vs_sampled_pi.json` | The same PI controller (Kp = 2, Ki = 1) on the plant 1/(s+1)², once continuous and once between an ADC and a DAC, both modelled with Zero-Order Holds of sample time Ts. |

The ADC (ZOH in the feedback path) samples the output every Ts; the DAC (ZOH after the controller) holds the controller output until the next sample. The Control signal scope compares the continuous PI output with the DAC output, the staircase. Between two samples the PI sees a constant error, so its integral grows by exactly Ki·Ts·e[k] per sample. This makes the loop identical to a digital PI running, every Ts:

```
u[k]   = Kp*e[k] + I[k]
I[k+1] = I[k] + Ki*Ts*e[k]
```

What to look for: change Ts in Model variables. The continuous loop overshoots by about 6 %. The sampled loop overshoots by about 9 % at Ts = 0.1, 21 % at Ts = 0.5, 35 % at Ts = 1 and 59 % at Ts = 2, and at Ts = 3 it is unstable. Sampling adds delay to the loop, roughly Ts/2, so gains tuned for the continuous controller lose their margin as Ts grows; with a fast enough sample time the continuous analysis is a good approximation. Try removing one of the two holds as well: with only the DAC the effect looks smaller than it is, and with only the ADC it looks larger.

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
