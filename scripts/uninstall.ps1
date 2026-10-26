param([string]$Profile = "", [switch]$All, [string]$DshHome = "")
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$argsList = @((Join-Path $here "uninstall.mjs"))
if ($Profile) { $argsList += @("--profile", $Profile) }
if ($All) { $argsList += "--all" }
if ($DshHome) { $argsList += @("--dsh-home", $DshHome) }
& node @argsList
exit $LASTEXITCODE
