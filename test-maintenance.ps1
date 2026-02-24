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

Invoke-RestMethod -Uri "http://localhost:3001/v1/maintenance" -Method POST -Body $body -ContentType "application/json"
