# Opens 4 separate PowerShell windows, one per agent role, each launching
# `claude` in its own folder. Run this from the project root:
#   powershell -ExecutionPolicy Bypass -File .\start-agents.ps1

$root = $PSScriptRoot

$roles = @(
    @{ Name = "Frontend"; Path = Join-Path $root "frontend" },
    @{ Name = "Backend";  Path = Join-Path $root "backend" },
    @{ Name = "DB";       Path = Join-Path $root "db" }
)
# No separate PM window — the coordinating chat session (this conversation)
# acts as PM directly and talks to these 3 via docs/TASKS.md + SendMessage.

foreach ($role in $roles) {
    $title = "claude - $($role.Name)"
    # --name gives each session a fixed, predictable address for SendMessage,
    # independent of ListAgents discovery (which proved unreliable across
    # subfolders in practice).
    $cmd = "`$Host.UI.RawUI.WindowTitle = '$title'; Set-Location '$($role.Path)'; claude --name $($role.Name)"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd
    Start-Sleep -Milliseconds 500
}

Write-Host "Launched 3 windows: Frontend, Backend, DB."
Write-Host "Type anything in each window once so it registers, then tell the PM chat session."
