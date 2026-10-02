# Math Adventure - push + auto-push watcher

Live site: https://math.jacobsiler.com (GitHub Pages, branch `main`, repo root).

## One-off push
Double-click `push.cmd` in the repo root. It refuses to commit secret-looking files, rebases if GitHub is
ahead (never force-pushes), commits everything (message from `.pending-commit.txt` if present), and pushes.

## Auto-push (tray watcher)
1. Double-click `scripts\ma-start-watcher.cmd` once. It starts the watcher and adds it to Windows startup.
2. A blue-green "M" appears in the system tray. Right-click: Push now, Pause, logs, open site, Quit.
3. The canary is `deploy-tick.txt` (gitignored). Any time its modified-time changes, the watcher waits
   ~8 s and runs the push. Tick it by hand with:  `echo %date% %time% > deploy-tick.txt`
   Claude ticks it after finishing substantial changes.
Colours: green idle, yellow change detected, blue pushing, red failed, gray paused.
Stop it with `scripts\ma-stop-watcher.cmd`. Logs: `logs\push.log`, `logs\watcher.log`.
