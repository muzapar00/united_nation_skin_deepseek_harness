# Windows installer for the United Nations skin.
#   powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
#   powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Profile web
param(
  [string]$Profile = "",
  [switch]$All,
  [switch]$DryRun,
  [string]$DshHome = ""
)
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Write-Error "Node 22+ is required (it ships with DeepSeek Harness)."; exit 1 }
$argsList = @((Join-Path $here "install.mjs"))
if ($Profile) { $argsList += @("--profile", $Profile) }
if ($All) { $argsList += "--all" }
if ($DryRun) { $argsList += "--dry-run" }
if ($DshHome) { $argsList += @("--dsh-home", $DshHome) }
& node @argsList
exit $LASTEXITCODE
