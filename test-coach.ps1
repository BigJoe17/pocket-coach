$body = @{
    coachId = 'focus'
    messages = @(
        @{
            role = 'user'
            content = 'I feel overwhelmed today'
        }
    )
} | ConvertTo-Json -Depth 3

Write-Host "Request body:"
Write-Host $body
Write-Host ""
Write-Host "Making request..."

try {
    $response = Invoke-RestMethod -Uri 'https://oezrjqeyatblxdabgkuu.supabase.co/functions/v1/coach' -Method Post -Body $body -ContentType 'application/json'
    Write-Host "Success!"
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "Error:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body:"
        Write-Host $responseBody
    }
}
