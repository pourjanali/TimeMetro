param(
    [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$errors = [System.Collections.Generic.List[string]]::new()

function Add-CheckError([string]$Message) {
    $script:errors.Add($Message)
}

function Get-Attribute([string]$Tag, [string]$Name) {
    $pattern = '(?is)\b' + [regex]::Escape($Name) + '\s*=\s*["'']([^"'']*)["'']'
    $match = [regex]::Match($Tag, $pattern)
    if ($match.Success) { return $match.Groups[1].Value }
    return $null
}

$indexPath = Join-Path $Root 'index.html'
$robotsPath = Join-Path $Root 'robots.txt'
$sitemapPath = Join-Path $Root 'sitemap.xml'
$html = Get-Content -Raw -Encoding UTF8 $indexPath

$titles = [regex]::Matches($html, '(?is)<title\b[^>]*>(.*?)</title>')
if ($titles.Count -ne 1 -or [string]::IsNullOrWhiteSpace($titles[0].Groups[1].Value)) {
    Add-CheckError 'index.html must contain exactly one non-empty title.'
}

$descriptions = [regex]::Matches($html, '(?is)<meta\b[^>]*\bname\s*=\s*["'']description["''][^>]*>')
if ($descriptions.Count -ne 1 -or [string]::IsNullOrWhiteSpace((Get-Attribute $descriptions[0].Value 'content'))) {
    Add-CheckError 'index.html must contain exactly one non-empty meta description.'
}

if ([regex]::IsMatch($html, '(?is)<meta\b[^>]*\bname\s*=\s*["'']keywords["'']')) {
    Add-CheckError 'Obsolete meta keywords tag must not be present.'
}

if ([regex]::Matches($html, '(?is)<h1\b').Count -ne 1) {
    Add-CheckError 'index.html must contain exactly one H1.'
}

$canonicalTags = [regex]::Matches($html, '(?is)<link\b[^>]*\brel\s*=\s*["'']canonical["''][^>]*>')
$canonical = if ($canonicalTags.Count -eq 1) { Get-Attribute $canonicalTags[0].Value 'href' } else { $null }
if ($canonicalTags.Count -ne 1 -or $canonical -ne 'https://timemetro.ir/') {
    Add-CheckError 'Canonical must be exactly https://timemetro.ir/.'
}

foreach ($page in @(
    @{ Path = 'privacy.html'; Canonical = 'https://timemetro.ir/privacy' },
    @{ Path = 'terms.html'; Canonical = 'https://timemetro.ir/terms' }
)) {
    $pagePath = Join-Path $Root $page.Path
    if (-not (Test-Path -LiteralPath $pagePath -PathType Leaf)) {
        Add-CheckError "Missing required legal page: $($page.Path)"
        continue
    }

    $pageHtml = Get-Content -Raw -Encoding UTF8 $pagePath
    if ([regex]::Matches($pageHtml, '(?is)<title\b[^>]*>(.*?)</title>').Count -ne 1) {
        Add-CheckError "$($page.Path) must contain exactly one title."
    }
    $pageDescription = [regex]::Matches($pageHtml, '(?is)<meta\b[^>]*\bname\s*=\s*["'']description["''][^>]*>')
    if ($pageDescription.Count -ne 1 -or [string]::IsNullOrWhiteSpace((Get-Attribute $pageDescription[0].Value 'content'))) {
        Add-CheckError "$($page.Path) must contain exactly one non-empty meta description."
    }
    $pageCanonicalTags = [regex]::Matches($pageHtml, '(?is)<link\b[^>]*\brel\s*=\s*["'']canonical["''][^>]*>')
    $pageCanonical = if ($pageCanonicalTags.Count -eq 1) { Get-Attribute $pageCanonicalTags[0].Value 'href' } else { $null }
    if ($pageCanonicalTags.Count -ne 1 -or $pageCanonical -ne $page.Canonical) {
        Add-CheckError "$($page.Path) has an invalid canonical URL."
    }
    if ([regex]::Matches($pageHtml, '(?is)<h1\b').Count -ne 1) {
        Add-CheckError "$($page.Path) must contain exactly one H1."
    }
    if (-not [regex]::IsMatch($pageHtml, '(?is)<html\b[^>]*\blang\s*=\s*["'']fa["''][^>]*\bdir\s*=\s*["'']rtl["'']')) {
        Add-CheckError "$($page.Path) must declare lang=\"fa\" and dir=\"rtl\"."
    }
}

if (-not [regex]::IsMatch($html, '(?is)<html\b[^>]*\blang\s*=\s*["'']fa["''][^>]*\bdir\s*=\s*["'']rtl["'']')) {
    Add-CheckError 'The document must declare lang="fa" and dir="rtl".'
}

$ids = [regex]::Matches($html, '(?is)\bid\s*=\s*["'']([^"'']+)["'']') | ForEach-Object { $_.Groups[1].Value }
$duplicates = $ids | Group-Object | Where-Object Count -gt 1
if ($duplicates) {
    Add-CheckError ('Duplicate HTML ids: ' + (($duplicates | ForEach-Object Name) -join ', '))
}

$images = [regex]::Matches($html, '(?is)<img\b[^>]*>')
foreach ($image in $images) {
    if (-not [regex]::IsMatch($image.Value, '(?is)\balt\s*=\s*["'']')) {
        Add-CheckError 'Every img element must have an alt attribute.'
        break
    }
}

$jsonLd = [regex]::Matches($html, '(?is)<script\b[^>]*\btype\s*=\s*["'']application/ld\+json["''][^>]*>(.*?)</script>')
if ($jsonLd.Count -eq 0) {
    Add-CheckError 'At least one JSON-LD block is required.'
} else {
    foreach ($block in $jsonLd) {
        try { $null = $block.Groups[1].Value | ConvertFrom-Json } catch { Add-CheckError 'JSON-LD contains invalid JSON.' }
    }
}

$robots = Get-Content -Raw -Encoding UTF8 $robotsPath
if (-not [regex]::IsMatch($robots, '(?im)^\s*Sitemap:\s*https://timemetro\.ir/sitemap\.xml\s*$')) {
    Add-CheckError 'robots.txt must reference the canonical sitemap URL.'
}

$sitemap = [xml](Get-Content -Raw -Encoding UTF8 $sitemapPath)
$locs = @($sitemap.SelectNodes("//*[local-name()='loc']") | ForEach-Object { $_.InnerText.Trim() })
if ($locs.Count -eq 0) { Add-CheckError 'sitemap.xml must contain at least one URL.' }
if (($locs | Sort-Object -Unique).Count -ne $locs.Count) { Add-CheckError 'sitemap.xml contains duplicate URLs.' }
foreach ($loc in $locs) {
    $allowedLocs = @(
        'https://timemetro.ir/',
        'https://timemetro.ir/privacy',
        'https://timemetro.ir/terms'
    )
    if ($loc -match '[?#]' -or $loc -notin $allowedLocs) {
        Add-CheckError "Non-canonical or parameterized sitemap URL: $loc"
    }
}

$redirectsPath = Join-Path $Root '_redirects'
if (-not (Test-Path -LiteralPath $redirectsPath -PathType Leaf)) {
    Add-CheckError 'Missing _redirects compatibility rules.'
} else {
    $redirects = Get-Content -Raw -Encoding UTF8 $redirectsPath
    foreach ($rule in @('/privacy.html /privacy 301', '/terms.html /terms 301')) {
        if ($redirects -notmatch [regex]::Escape($rule)) {
            Add-CheckError "Missing legacy redirect: $rule"
        }
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $Root 'app.js') -PathType Leaf)) {
    Add-CheckError 'Missing legacy app.js compatibility file.'
}

if ([regex]::IsMatch($html, '(?is)<a\b[^>]*\bhref\s*=\s*["'']#["'']')) {
    Add-CheckError 'No anchor should use href="#" as a dead link.'
}

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Output "SEO checks passed for $Root"
