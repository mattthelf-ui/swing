# Swing
Swing-based runner. Play: https://mattthelf-ui.github.io/swing/
Controls: hold Space/Up/W (or touch) = grab nearest highlighted point, let go = launch; Left/Right or A/D (bottom screen halves on touch) = pump; R = restart; Esc = menu.
Physics (sim.js): angular pendulum (angle, angular velocity, fixed rope length set at grab distance), semi-implicit Euler at 120 Hz. On grab, the player's velocity is projected onto the rope tangent to get angular velocity; on release, tangential velocity L*w is handed back for ballistic flight. Pumping adds angular acceleration only in the direction of motion.
Tests: `cd test && npm i && node physics.js && node browser.js`.
