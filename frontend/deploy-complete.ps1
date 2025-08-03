# Automated Vercel deployment script
# Executes complete deployment process without manual intervention

$ErrorActionPreference = "Continue"

Write-Host "`nStarting Automated Deployment" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

# Check prerequisites
if (!(Test-Path "package.json")) {
    Write-Host "Error: package.json not found" -ForegroundColor Red
    exit 1
}

if (!(Test-Path ".env.production")) {
    Write-Host "Error: .env.production not found" -ForegroundColor Red
    exit 1
}

# STEP 1: Configure environment variables
Write-Host "`nSTEP 1: Configuring environment variables..." -ForegroundColor Yellow

$envContent = Get-Content ".env.production"
foreach ($line in $envContent) {
    if ($line -and !$line.StartsWith("#") -and $line.Contains("=")) {
        $parts = $line.Split("=", 2)
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            
            Write-Host "   Setting: $key" -ForegroundColor Gray
            
            # Execute Vercel command using cmd
            $cmdLine = "echo $value | vercel env add $key production --yes"
            $result = cmd /c $cmdLine 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   Success: $key configured" -ForegroundColor Green
            } else {
                Write-Host "   Warning: $key already exists or error" -ForegroundColor Yellow
            }
            
            Start-Sleep -Milliseconds 500
        }
    }
}

Write-Host "Environment variables processed" -ForegroundColor Green

# STEP 2: Clean cache
Write-Host "`nSTEP 2: Cleaning cache..." -ForegroundColor Yellow
npm cache clean --force
if ($LASTEXITCODE -eq 0) {
    Write-Host "Cache cleaned successfully" -ForegroundColor Green
} else {
    Write-Host "Error cleaning cache" -ForegroundColor Red
    exit 1
}

# STEP 3: Install dependencies
Write-Host "`nSTEP 3: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "Error installing dependencies" -ForegroundColor Red
    exit 1
}

# STEP 4: Build project
Write-Host "`nSTEP 4: Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build completed successfully" -ForegroundColor Green
} else {
    Write-Host "Build failed" -ForegroundColor Red
    exit 1
}

if (!(Test-Path "dist")) {
    Write-Host "Error: dist directory not generated" -ForegroundColor Red
    exit 1
}

# STEP 5: Deploy to Vercel
Write-Host "`nSTEP 5: Deploying to Vercel..." -ForegroundColor Yellow

$deployCmd = "vercel --prod --yes --confirm"
Write-Host "Executing: $deployCmd" -ForegroundColor Cyan

Invoke-Expression $deployCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    
    Write-Host "`nDEPLOYMENT INFORMATION:" -ForegroundColor Magenta
    Write-Host "======================" -ForegroundColor Magenta
    
    # Try to get deployment information
    $deployInfo = vercel ls --json 2>$null
    if ($deployInfo) {
        Write-Host "Main URL: https://app-web-control-gastos.vercel.app" -ForegroundColor Cyan
        Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
    } else {
        Write-Host "Warning: Could not get detailed information" -ForegroundColor Yellow
    }
    
    Write-Host "`nPROCESS COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "Application is ready in production" -ForegroundColor Cyan
    
} else {
    Write-Host "Deployment to Vercel failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n" -ForegroundColor White