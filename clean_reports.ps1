$file = "d:\Rnd files\event-analytics-main\src\data\trainingReports.ts"
$content = Get-Content $file -Raw -Encoding UTF8
$content = $content.Replace("â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” â” ", "------------------------------------------------------------------------------")
$content = $content.Replace("â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€", "------------------------------------------------------------------------------")
$content = $content.Replace("â”", "|")
$content = $content.Replace("â€”", "--")
$content = $content.Replace("â†“", "v")
$content = $content.Replace("â†‘", "^")
$content = $content.Replace("â†’", "->")
$content = $content.Replace("â–ˆ", "#")
$content = $content.Replace("â–„", "=")
$content = $content.Replace("Â·", ".")
$content | Set-Content $file -Encoding UTF8
Write-Output "Cleaned up invalid characters in $file"
