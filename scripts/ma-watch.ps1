# Math Adventure - tray watcher (auto-push to GitHub Pages).
#   CANARY: deploy-tick.txt in the repo root. Whenever its modified-time changes, the watcher waits a few
#   seconds for edits to settle, then runs scripts\ma-push.ps1 (stage + commit + push). Claude "ticks the
#   canary" after substantial changes; you can also tick it by hand (see scripts\README-deploy.md).
# Tray icon colours: GREEN idle | YELLOW change detected | BLUE pushing | RED last push failed | GRAY paused
# Lives in the system tray with no taskbar window. ASCII-only so PowerShell 5.1 reads it correctly.
$ErrorActionPreference = 'Continue'
$here = $PSScriptRoot
$repo = Split-Path -Parent $here
Set-Location $repo
$logDir = Join-Path $repo 'logs'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
$logFile = Join-Path $logDir 'watcher.log'
function Log($m) { try { Add-Content $logFile ('{0}  {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $m) } catch {} }
trap { Log ('FATAL: ' + $_.Exception.Message); Log ('STACK: ' + $_.ScriptStackTrace); break }
Log '==== process launched ===='

# Single instance.
$script:mutex = New-Object System.Threading.Mutex($false, 'Global\MathAdventureWatcher')
$gotIt = $false
try { $gotIt = $script:mutex.WaitOne(0) } catch { $gotIt = $true }
if (-not $gotIt) { Log 'another watcher is already running - exiting'; return }

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Hide the console (set MA_WATCH_DEBUG=1 to keep it visible).
$sig = '[DllImport("kernel32.dll")] public static extern IntPtr GetConsoleWindow(); [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);'
if (-not $env:MA_WATCH_DEBUG) { try { $w = Add-Type -MemberDefinition $sig -Name 'Win' -Namespace 'Ma' -PassThru; $null = $w::ShowWindow($w::GetConsoleWindow(), 0) } catch {} }

$tickFile  = Join-Path $repo 'deploy-tick.txt'
$pushScript = Join-Path $here 'ma-push.ps1'
$hbFile    = Join-Path $logDir 'heartbeat.txt'
$settleSec = 8

# ---- tray icon drawn in code (no .ico file needed) ----
function New-StateIcon([System.Drawing.Color]$color) {
    $bmp = New-Object System.Drawing.Bitmap 32, 32
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.Clear([System.Drawing.Color]::Transparent)
    $br = New-Object System.Drawing.SolidBrush($color)
    $g.FillEllipse($br, 1, 1, 30, 30)
    $font = New-Object System.Drawing.Font('Arial', 15, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = 'Center'; $fmt.LineAlignment = 'Center'
    $g.DrawString('M', $font, [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF(0, 1, 32, 32)), $fmt)
    $g.Dispose()
    return [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
}
$icons = @{
    green  = New-StateIcon ([System.Drawing.Color]::FromArgb(13, 148, 136))
    yellow = New-StateIcon ([System.Drawing.Color]::FromArgb(217, 160, 0))
    blue   = New-StateIcon ([System.Drawing.Color]::FromArgb(37, 99, 235))
    red    = New-StateIcon ([System.Drawing.Color]::FromArgb(200, 40, 40))
    gray   = New-StateIcon ([System.Drawing.Color]::FromArgb(120, 120, 120))
}
$notify = New-Object System.Windows.Forms.NotifyIcon
$notify.Visible = $true
$script:state = 'green'
function SetState([string]$s, [string]$tip) {
    $script:state = $s
    $notify.Icon = $icons[$s]
    if (-not $tip) { $tip = 'Math Adventure auto-push' }
    if ($tip.Length -gt 60) { $tip = $tip.Substring(0, 60) }
    $notify.Text = $tip
}
function Balloon([string]$t, [string]$m) { try { $notify.BalloonTipTitle = $t; $notify.BalloonTipText = $m; $notify.ShowBalloonTip(6000) } catch {} }

function Get-TickTime { if (Test-Path $tickFile) { try { return (Get-Item $tickFile).LastWriteTimeUtc } catch {} } return [DateTime]::MinValue }
$script:lastTick = Get-TickTime     # do NOT push on startup; only on a NEW tick
$script:dueAt = $null
$script:paused = $false
$script:busy = $false

function Wait-Responsive($p) { while (-not $p.HasExited) { [System.Windows.Forms.Application]::DoEvents(); Start-Sleep -Milliseconds 100 } }

function Run-Push([string]$why) {
    if ($script:busy) { return }
    $script:busy = $true
    try {
        SetState 'blue' 'Math Adventure: pushing...'
        Log "push: starting ($why)"
        $p = Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ('"' + $pushScript + '"'), '-Quiet' -WorkingDirectory $repo -WindowStyle Hidden -PassThru
        Wait-Responsive $p
        $code = $p.ExitCode
        Log "push: exit=$code"
        if ($code -eq 0) {
            SetState 'green' ('Math Adventure: last push OK ' + (Get-Date -Format 'HH:mm'))
            Balloon 'Math Adventure pushed' 'Live at math.jacobsiler.com in about 1-2 minutes.'
        } elseif ($code -eq 2) {
            SetState 'red' 'Math Adventure: push BLOCKED (secret-looking file)'
            Balloon 'Push blocked' 'A secret-looking file is in the changes. See logs\push.log.'
        } else {
            SetState 'red' 'Math Adventure: push FAILED - see log'
            Balloon 'Push failed' 'Nothing was lost. See logs\push.log, then use Push now to retry.'
        }
    } catch { Log "push: EXCEPTION $_"; SetState 'red' 'Math Adventure: push error' }
    finally { $script:busy = $false }
}

# ---- tray menu ----
$menu = New-Object System.Windows.Forms.ContextMenuStrip
$hdr = $menu.Items.Add('Math Adventure auto-push'); $hdr.Enabled = $false
$hdr.Font = New-Object System.Drawing.Font($hdr.Font, [System.Drawing.FontStyle]::Bold)
$null = $menu.Items.Add('-')
($menu.Items.Add('Push now')).add_Click({ $script:dueAt = $null; Run-Push 'menu' })
$pauseItem = $menu.Items.Add('Pause watching')
$pauseItem.add_Click({
    $script:paused = -not $script:paused
    if ($script:paused) { $pauseItem.Text = 'Resume watching'; SetState 'gray' 'Math Adventure: paused' }
    else { $pauseItem.Text = 'Pause watching'; $script:lastTick = Get-TickTime; SetState 'green' 'Math Adventure auto-push' }
    Log ('paused=' + $script:paused)
})
($menu.Items.Add('Open push log')).add_Click({ $f = Join-Path $logDir 'push.log'; if (Test-Path $f) { Start-Process notepad.exe $f } else { Balloon 'No log yet' 'Nothing has been pushed yet.' } })
($menu.Items.Add('Open watcher log')).add_Click({ if (Test-Path $logFile) { Start-Process notepad.exe $logFile } })
($menu.Items.Add('Open live site')).add_Click({ Start-Process 'https://math.jacobsiler.com' })
($menu.Items.Add('Open project folder')).add_Click({ Start-Process explorer.exe $repo })
$null = $menu.Items.Add('-')
($menu.Items.Add('Quit watcher')).add_Click({ $notify.Visible = $false; [System.Windows.Forms.Application]::Exit() })
$notify.ContextMenuStrip = $menu
$notify.add_MouseDoubleClick({ Run-Push 'double-click' })

# ---- canary poll (15 s). Reading the mtime by polling works across any mount / remote writer. ----
function Heartbeat { try { Set-Content -Path $hbFile -Value ('pid={0} time={1} state={2}' -f $PID, (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $script:state) -Encoding ASCII } catch {} }
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 15000
$timer.add_Tick({
    Heartbeat
    if ($script:paused -or $script:busy) { return }
    $m = Get-TickTime
    if ($m -gt $script:lastTick) {
        $script:lastTick = $m
        $script:dueAt = (Get-Date).AddSeconds($settleSec)
        SetState 'yellow' 'Math Adventure: change detected...'
        Log 'canary: deploy-tick.txt changed - pushing shortly'
    }
    if ($script:dueAt -and (Get-Date) -ge $script:dueAt) { $script:dueAt = $null; Run-Push 'canary' }
})
$timer.Start()

SetState 'green' 'Math Adventure auto-push'
Heartbeat
Log '==== watcher started (canary poll 15s) ===='
Balloon 'Math Adventure watcher running' 'Tick deploy-tick.txt to push to GitHub.'
[System.Windows.Forms.Application]::Run()
