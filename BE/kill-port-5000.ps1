Write-Host "🔍 Checking for processes on port 5000..." -ForegroundColor Yellow

$processes = netstat -ano | Select-String ":5000"

if ($processes) {
    Write-Host "Found processes on port 5000:" -ForegroundColor Red
    $processes | ForEach-Object { Write-Host $_.Line -ForegroundColor Gray }
    
    Write-Host "`n🛑 Killing processes on port 5000..." -ForegroundColor Yellow
    
    $processes | ForEach-Object {
        $pid = ($_.Line -split '\s+')[-1]
        if ($pid -match '^\d+$') {
            try {
                Write-Host "Killing process $pid" -ForegroundColor Cyan
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            } catch {
                Write-Host "Could not kill process $pid" -ForegroundColor Red
            }
        }
    }
    
    Write-Host "`n✅ Port 5000 should now be free!" -ForegroundColor Green
} else {
    Write-Host "✅ No processes found on port 5000" -ForegroundColor Green
}

Write-Host "`n🚀 You can now start the server with: npm run dev" -ForegroundColor Cyan
Read-Host "Press Enter to continue"
