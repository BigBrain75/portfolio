# Builds ONE self-contained HTML file: CSS, JS and images are inlined,
# so the page works when it is sent alone (Telegram, Discord, email, zip).
# Usage (from this folder):  powershell -ExecutionPolicy Bypass -File build.ps1
param([string]$Out = "dist\marakuya-portfolio.html")
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$utf8 = New-Object Text.UTF8Encoding($false)
function Read-Text([string]$rel) { [IO.File]::ReadAllText((Join-Path $root $rel), [Text.Encoding]::UTF8) }

$html = Read-Text 'index.html'

# styles
$html = [regex]::Replace($html, '<link rel="stylesheet" href="(css/[^"]+)">', {
  param($m) "<style>`n" + (Read-Text $m.Groups[1].Value) + "</style>"
})

# scripts (kept as separate classic scripts, same order)
$html = [regex]::Replace($html, '<script src="(js/[^"]+)"></script>', {
  param($m) "<script>`n" + (Read-Text $m.Groups[1].Value) + "</script>"
})

# images and favicon -> data URIs
$mime = @{ '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.png' = 'image/png'; '.svg' = 'image/svg+xml'; '.webp' = 'image/webp' }
$html = [regex]::Replace($html, '(src|href)="(img/[^"]+)"', {
  param($m)
  $path = Join-Path $root $m.Groups[2].Value
  $ext = [IO.Path]::GetExtension($path).ToLower()
  $b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($path))
  $m.Groups[1].Value + '="data:' + $mime[$ext] + ';base64,' + $b64 + '"'
})

$left = [regex]::Matches($html, '(src|href)="(css|js|img)/').Count
if ($left -gt 0) { throw "Not everything was inlined: $left local links left" }

$dest = Join-Path $root $Out
New-Item -ItemType Directory -Force (Split-Path -Parent $dest) | Out-Null
[IO.File]::WriteAllText($dest, $html, $utf8)
"Built: {0} ({1} KB)" -f $dest, [math]::Round((Get-Item -LiteralPath $dest).Length / 1KB)
