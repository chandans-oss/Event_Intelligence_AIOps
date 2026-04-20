$file = "d:\Rnd files\event-analytics-main\src\pages\TrainingAnalysisPage.tsx"
$lines = Get-Content $file
$start = -1
$end = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "const REPORTS: Record<string, string> = {") {
        $start = $i
    }
    if ($start -ne -1 -and $lines[$i] -match "READY FOR ALGORITHMIC EXECUTION") {
        # The next line or the one after should be the };
        if ($lines[$i+1] -match "};") {
            $end = $i + 1
            break
        } elseif ($lines[$i+2] -match "};") {
            $end = $i + 2
            break
        }
    }
}
if ($start -ne -1 -and $end -ne -1) {
    $newLines = $lines[0..($start-1)] + $lines[($end+1)..($lines.Length-1)]
    $newLines | Set-Content $file
    Write-Output "Successfully removed REPORTS from $file (lines $($start+1) to $($end+1))"
} else {
    Write-Error "Could not find REPORTS block ($start, $end)"
}
