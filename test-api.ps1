try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/v1/maintenance" -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Body: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
