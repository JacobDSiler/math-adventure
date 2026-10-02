<#
.SYNOPSIS
    Math Adventure push: stage -> commit -> push to origin (GitHub Pages serves math.jacobsiler.com).

.DESCRIPTION
    Run by push.cmd (double-click) or by the tray watcher (scripts\ma-watch.ps1, with -Quiet).
      1. Refuses to continue if a secret-looking file is about to be committed.
      2. Fetches origin; if origin is ahead, rebases (never force-pushes).
      3. git add -A (respects .gitignore), commits with .pending-commit.txt if present
         (otherwise an automatic message), then pushes the current branch.
    Exit codes: 0 = pushed or nothing to push, 1 = failed, 2 = blocked by the secret guard.
    ASCII-only on purpose so Windows PowerShell 5.1 reads it correctly.
#>
param([switch]$Quiet)

$ErrorActionPreference = 'Continue'
$repo = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $repo
$logDir = Join-Path $repo 'logs'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
$logFile = Join-Path $logDir 'push.log'

function Log([string]$m, [string]$c = 'Gray') {
    $line = ('{0}  {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $m)
    try { Add-Content -Path $logFile -Value $line } catch {}
    if (-not $Quiet) { Write-Host $line -ForegroundColor $c }
}
function Done([int]$code) {
    if (-not $Quiet -and -not $env:MA_NO_PAUSE) { Write-Host ''; Read-Host 'Press Enter to close' | Out-Null }
    exit $code
}
function Run-Git([string[]]$gitArgs) {
    $o = & git @gitArgs 2>&1
    $script:gc = $LASTEXITCODE
    foreach ($l in $o) { $t = "$l".Trim(); if ($t) { Log ('  git: ' + $t) 'DarkGray' } }
    return $o
}

Log '=== Math Adventure push ===' 'Cyan'
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Log 'git is not on PATH.' 'Red'; Done 1 }
$null = & git rev-parse --is-inside-work-tree 2>&1
if ($LASTEXITCODE -ne 0) { Log "Not a git repository: $repo" 'Red'; Done 1 }
$branch = ((& git rev-parse --abbrev-ref HEAD) | Out-String).Trim()
Log "Repo: $repo   Branch: $branch"

# 1. Secret guard: look at everything git would add.
$secretPattern = '(^|/)(\.secrets/|\.env($|\.)|tokens\.json|credentials|serviceAccount|[^/]*service-account[^/]*\.json|[^/]*\.(pem|key|keystore|jks|p12)$|firebase-adminsdk|\.netlify/)'
$changed = @(& git status --porcelain --untracked-files=all 2>$null | ForEach-Object { ($_.Substring(3)).Trim('"') })
$bad = @($changed | Where-Object { $_ -imatch $secretPattern })
if ($bad.Count -gt 0) {
    Log 'BLOCKED: these files look like secrets and will NOT be committed:' 'Red'
    foreach ($b in $bad) { Log "  $b" 'Red' }
    Log 'Add them to .gitignore (or delete them), then push again.' 'Yellow'
    Done 2
}

# 2. Sync with origin (no force pushes, ever).
$null = Run-Git @('fetch', 'origin')
if ($script:gc -ne 0) { Log 'git fetch failed (offline or not signed in to GitHub?).' 'Red'; Done 1 }
$behind = 0
$cnt = (& git rev-list --count "HEAD..origin/$branch" 2>$null | Out-String).Trim()
if ($cnt -match '^\d+$') { $behind = [int]$cnt }
if ($behind -gt 0) {
    Log "origin/$branch is $behind commit(s) ahead - rebasing first." 'Yellow'
    $null = Run-Git @('pull', '--rebase', '--autostash', 'origin', $branch)
    if ($script:gc -ne 0) {
        $null = Run-Git @('rebase', '--abort')
        Log 'Rebase failed (conflict). Nothing was pushed. Resolve it by hand, then push again.' 'Red'
        Done 1
    }
}

# 3. Stage + commit.
$null = Run-Git @('add', '-A')
$null = & git diff --cached --quiet
$hasStaged = ($LASTEXITCODE -ne 0)
if ($hasStaged) {
    $pending = Join-Path $repo '.pending-commit.txt'
    if (Test-Path $pending) {
        $null = Run-Git @('commit', '-F', $pending)
        Remove-Item $pending -Force -ErrorAction SilentlyContinue
    } else {
        $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
        $null = Run-Git @('commit', '-m', "Update Math Adventure ($stamp)")
    }
    if ($script:gc -ne 0) { Log 'Commit failed.' 'Red'; Done 1 }
} else {
    Log 'No new file changes to commit.'
}

# 4. Push if there is anything origin does not have.
$ahead = 0
$cnt = (& git rev-list --count "origin/$branch..HEAD" 2>$null | Out-String).Trim()
if ($cnt -match '^\d+$') { $ahead = [int]$cnt }
if ($ahead -eq 0) { Log 'Nothing to push - GitHub is already up to date.' 'Green'; Done 0 }
Log "Pushing $ahead commit(s) to origin/$branch ..." 'Cyan'
$null = Run-Git @('push', 'origin', $branch)
if ($script:gc -ne 0) { Log 'Push failed. The commit is safe locally; fix the error above and push again.' 'Red'; Done 1 }
Log 'Pushed. GitHub Pages redeploys math.jacobsiler.com in about 1-2 minutes.' 'Green'
Done 0
