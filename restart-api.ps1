# Kill all node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a bit
Start-Sleep -Seconds 2

# Start the API
Start-Process -FilePath "npm" -ArgumentList "run","start:dev" -WorkingDirectory "F:\Qareeb\apps\api" -NoNewWindow -WindowStyle Hidden

# Wait for server to start
Start-Sleep -Seconds 15

# Test the API
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/v1/maintenance" -Method GET -UseBasicParsing -TimeoutSec 10
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
