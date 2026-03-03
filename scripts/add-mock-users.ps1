# PowerShell script to add mock users to the server
# Usage: .\add-mock-users.ps1

$API_URL = "http://localhost:3000"

# Step 1: Login as admin to get token
Write-Host "🔐 Logging in as admin..." -ForegroundColor Cyan

$loginBody = @{
    email = "admin@alphatauri.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    
    $TOKEN = $loginResponse.token
    
    if (-not $TOKEN) {
        Write-Host "❌ Login failed! Please check credentials." -ForegroundColor Red
        Write-Host "Response: $($loginResponse | ConvertTo-Json)" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Login successful! Token obtained." -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Login error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# Step 2: Create users
Write-Host "📝 Creating users..." -ForegroundColor Cyan

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $TOKEN"
}

# User 1: Rahul Sharma
$user1 = @{
    name = "Rahul Sharma"
    email = "rahul@alphatauri.com"
    password = "password123"
    emp_id = "EMP001"
    department = "IT"
    designation = "Software Developer"
    status = "Present"
    phone = "+91 98765 43210"
    role = "emp"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/users" `
        -Method POST `
        -Headers $headers `
        -Body $user1
    Write-Host "✅ Created: Rahul Sharma (rahul@alphatauri.com)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error creating Rahul Sharma: $($_.Exception.Message)" -ForegroundColor Yellow
}

# User 2: Ankit Patel
$user2 = @{
    name = "Ankit Patel"
    email = "ankit@alphatauri.com"
    password = "password123"
    emp_id = "EMP002"
    department = "HR"
    designation = "HR Manager"
    status = "Absent"
    phone = "+91 98765 43211"
    role = "emp"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/users" `
        -Method POST `
        -Headers $headers `
        -Body $user2
    Write-Host "✅ Created: Ankit Patel (ankit@alphatauri.com)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error creating Ankit Patel: $($_.Exception.Message)" -ForegroundColor Yellow
}

# User 3: Pooja Singh
$user3 = @{
    name = "Pooja Singh"
    email = "pooja@alphatauri.com"
    password = "password123"
    emp_id = "EMP003"
    department = "Finance"
    designation = "Accountant"
    status = "Present"
    phone = "+91 98765 43212"
    role = "emp"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/users" `
        -Method POST `
        -Headers $headers `
        -Body $user3
    Write-Host "✅ Created: Pooja Singh (pooja@alphatauri.com)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error creating Pooja Singh: $($_.Exception.Message)" -ForegroundColor Yellow
}

# User 4: Ravi Kumar
$user4 = @{
    name = "Ravi Kumar"
    email = "ravi@alphatauri.com"
    password = "password123"
    emp_id = "EMP004"
    department = "IT"
    designation = "Senior Developer"
    status = "Present"
    phone = "+91 98765 43213"
    role = "emp"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/users" `
        -Method POST `
        -Headers $headers `
        -Body $user4
    Write-Host "✅ Created: Ravi Kumar (ravi@alphatauri.com)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error creating Ravi Kumar: $($_.Exception.Message)" -ForegroundColor Yellow
}

# User 5: Sneha Verma
$user5 = @{
    name = "Sneha Verma"
    email = "sneha@alphatauri.com"
    password = "password123"
    emp_id = "EMP005"
    department = "Marketing"
    designation = "Marketing Manager"
    status = "Absent"
    phone = "+91 98765 43214"
    role = "emp"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/users" `
        -Method POST `
        -Headers $headers `
        -Body $user5
    Write-Host "✅ Created: Sneha Verma (sneha@alphatauri.com)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error creating Sneha Verma: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ All users created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "  - Total users: 5" -ForegroundColor White
Write-Host "  - Default password for all users: password123" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Login credentials for testing:" -ForegroundColor Cyan
Write-Host "  - Email: rahul@alphatauri.com / Password: password123" -ForegroundColor White
Write-Host "  - Email: ankit@alphatauri.com / Password: password123" -ForegroundColor White
Write-Host "  - Email: pooja@alphatauri.com / Password: password123" -ForegroundColor White
Write-Host "  - Email: ravi@alphatauri.com / Password: password123" -ForegroundColor White
Write-Host "  - Email: sneha@alphatauri.com / Password: password123" -ForegroundColor White
