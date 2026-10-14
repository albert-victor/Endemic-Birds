$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$htmlPath = Join-Path $env:TEMP 'endemic-home.html'
if (-not (Test-Path $htmlPath)) {
    curl.exe -sL 'https://endemicbirds.co.tz/index.php/' -o $htmlPath
}
$html = [System.IO.File]::ReadAllText($htmlPath)

$imagesRoot = Join-Path $projectRoot 'assets\images\from-live-site'
$dirs = @('hero', 'destinations', 'packages', 'gallery', 'brand', 'blog', 'misc')
foreach ($d in $dirs) {
    New-Item -ItemType Directory -Force -Path (Join-Path $imagesRoot $d) | Out-Null
}

function Get-SafeFileName([string]$name) {
    $invalid = [IO.Path]::GetInvalidFileNameChars() -join ''
    $pattern = "[{0}]" -f [Regex]::Escape($invalid)
    $s = ($name -replace $pattern, '-').Trim('-')
    if ([string]::IsNullOrWhiteSpace($s)) { return 'untitled' }
    $s = $s -replace '\s+', '-'
    if ($s.Length -gt 120) { $s = $s.Substring(0, 120) }
    return $s.ToLowerInvariant()
}

function Get-ExtensionFromUrl([string]$url) {
    $path = ([Uri]$url).AbsolutePath
    $ext = [IO.Path]::GetExtension($path)
    if ($ext) { return $ext.ToLowerInvariant() }
    return '.jpg'
}

function Resolve-FullSizeUrl([string]$url) {
    if ($url -match '-\d+x\d+(\.[a-z]+)$') {
        return $url -replace '-\d+x\d+(\.[a-z]+)$', '$1'
    }
    return $url
}

$entries = @()

# Hero background slides
[regex]::Matches($html, "background-image:\s*url\('([^']+)'\)") | ForEach-Object {
    $url = $_.Groups[1].Value
    if ($url -notmatch 'endemicbirds') { return }
    $base = [IO.Path]::GetFileNameWithoutExtension(([Uri]$url).AbsolutePath)
    $entries += [PSCustomObject]@{
        category = 'hero'
        title    = "Hero slide - $base"
        url      = $url
        slug     = "hero-$base"
    }
}

# Figcaption-linked cards (destinations + packages on homepage)
[regex]::Matches($html, 'src="(https://endemicbirds\.co\.tz/wp-content/uploads/[^"]+)"[^>]*>[^<]*</a>\s*<figcaption[^>]*>([^<]+)</figcaption>', 'Singleline') | ForEach-Object {
    $url = $_.Groups[1].Value
    $title = $_.Groups[2].Value.Trim()
    $cat = if ($title -match '^\d+\s+DAYS') { 'packages' } else { 'destinations' }
    $entries += [PSCustomObject]@{
        category = $cat
        title    = $title
        url      = Resolve-FullSizeUrl $url
        slug     = Get-SafeFileName $title
    }
}

# Gallery images with title attribute (_MG_xxxx)
[regex]::Matches($html, '<img[^>]+>') | ForEach-Object {
    $tag = $_.Value
    if ($tag -notmatch 'src="(https://endemicbirds\.co\.tz/wp-content/uploads/[^"]+)"') { return }
    $url = $Matches[1]
    $title = ''
    if ($tag -match 'title="([^"]*)"') { $title = $Matches[1].Trim() }
    if (-not $title -and $tag -match 'alt="([^"]*)"') { $title = $Matches[1].Trim() }
    if ($title -match '^(logo|)$' -and $url -match 'BIRD-LOGO') { $title = 'Bird logo' }
    if ($title -match '^(logo|)$' -and $url -match 'PosterMyWall') { $title = 'Site banner design' }
    if ([string]::IsNullOrWhiteSpace($title)) {
        $title = [IO.Path]::GetFileNameWithoutExtension(([Uri]$url).AbsolutePath)
    }
    $cat = 'misc'
    if ($url -match 'BIRD-LOGO|PosterMyWall|cropped-A-New') { $cat = 'brand' }
    elseif ($title -match '^_MG_' -or $title -match '^MG_') { $cat = 'gallery' }
    $slug = Get-SafeFileName $title
    if ($entries | Where-Object { $_.url -eq (Resolve-FullSizeUrl $url) -and $_.title -eq $title }) { return }
    $entries += [PSCustomObject]@{
        category = $cat
        title    = $title
        url      = Resolve-FullSizeUrl $url
        slug     = $slug
    }
}

# Blog swiper: image + h4 title
[regex]::Matches($html, '<div class="swiper-slide">\s*<div class="row g-4">.*?<img[^>]+src="([^"]+)"[^>]*>.*?<h4><a[^>]+>([^<]+)</a></h4>', 'Singleline') | ForEach-Object {
    $url = $_.Groups[1].Value
    $title = ($_.Groups[2].Value -replace '\s+', ' ').Trim()
    if ($url -notmatch 'endemicbirds') { return }
    $entries += [PSCustomObject]@{
        category = 'blog'
        title    = $title
        url      = Resolve-FullSizeUrl $url
        slug     = Get-SafeFileName $title
    }
}

# Deduplicate by download URL (prefer entry with longer/more descriptive title)
$byUrl = @{}
foreach ($e in $entries) {
    $key = $e.url
    if (-not $byUrl.ContainsKey($key) -or $e.title.Length -gt $byUrl[$key].title.Length) {
        $byUrl[$key] = $e
    }
}
$entries = @($byUrl.Values)

$manifest = @()
$seenFiles = @{}

foreach ($e in ($entries | Sort-Object category, title)) {
    $ext = Get-ExtensionFromUrl $e.url
    $fileBase = $e.slug
    $n = 1
    $fileName = "$fileBase$ext"
    while ($seenFiles.ContainsKey($fileName)) {
        $n++
        $fileName = "$fileBase-$n$ext"
    }
    $seenFiles[$fileName] = $true
    $destDir = Join-Path $imagesRoot $e.category
    $destPath = Join-Path $destDir $fileName

    if (-not (Test-Path $destPath)) {
        Write-Host "Downloading: $($e.title)"
        curl.exe -sL $e.url -o $destPath
        if (-not (Test-Path $destPath) -or (Get-Item $destPath).Length -lt 100) {
            Write-Warning "Retry thumbnail URL for $($e.title)"
            curl.exe -sL ($e.url -replace '-\d+x\d+(\.[a-z]+)$', '-1024x683$1') -o $destPath
        }
    } else {
        Write-Host "Exists: $fileName"
    }

    $manifest += [ordered]@{
        title         = $e.title
        category      = $e.category
        sourceUrl     = $e.url
        localPath     = "assets/images/from-live-site/$($e.category)/$fileName"
    }
}

$manifestPath = Join-Path $projectRoot 'content\homepage-images.json'
New-Item -ItemType Directory -Force -Path (Split-Path $manifestPath) | Out-Null
$manifest | ConvertTo-Json -Depth 5 | Set-Content -Path $manifestPath -Encoding UTF8

Write-Host "`nDone. $($manifest.Count) images catalogued."
Write-Host "Manifest: $manifestPath"
