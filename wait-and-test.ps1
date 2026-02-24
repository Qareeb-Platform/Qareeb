# Wait for server to start
Start-Sleep -Seconds 20

# Test the API
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/v1/maintenance" -Method GET -UseBasicParsing -TimeoutSec 10
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

# Test POST request
$body = @{
    mosque_name = "Test Mosque"
    governorate = "Cairo"
    city = "Cairo"
    lat = 30.0444
    lng = 31.2357
    maintenance_types = @("Plumbing")
    description = "Test"
    whatsapp = "+201000000000"
} | ConvertTo-Json

Write-Host "`nTesting POST request..."
try {
    $postResponse = Invoke-WebRequest -Uri "http://localhost:3001/v1/maintenance" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    Write-Host "POST Status Code: $($postResponse.StatusCode)"
    Write-Host "POST Response: $($postResponse.Content)"
} catch {
    Write-Host "POST Error: $($_.Exception.Message)"
}
