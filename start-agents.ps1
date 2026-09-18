# Opens 4 separate PowerShell windows, one per agent role, each launching
# `claude` in its own folder. Run this from the project root:
#   powershell -ExecutionPolicy Bypass -File .\start-agents.ps1

$root = $PSScriptRoot

$roles = @(
    @{ Name = "PM";       Path = $root },
    @{ Name = "Frontend"; Path = Join-Path $root "frontend" },
    @{ Name = "Backend";  Path = Join-Path $root "backend" },
    @{ Name = "DB";       Path = Join-Path $root "db" }
)

foreach ($role in $roles) {
    $title = "claude - $($role.Name)"
    $cmd = "`$Host.UI.RawUI.WindowTitle = '$title'; Set-Location '$($role.Path)'; claude"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd
    Start-Sleep -Milliseconds 500
}

Write-Host "Launched 4 windows: PM, Frontend, Backend, DB."
Write-Host "In the PM window, ask it to bootstrap (find the other 3 sessions via ListAgents)."
