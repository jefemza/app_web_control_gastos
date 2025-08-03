#!/usr/bin/env pwsh
# Script para configurar variables de entorno en Vercel automáticamente
# Uso: .\setup-env-vercel.ps1

Write-Host "🔧 Configurando variables de entorno en Vercel..." -ForegroundColor Green

# Verificar que existe el archivo .env.production
if (!(Test-Path ".env.production")) {
    Write-Host "❌ Error: No se encontró .env.production" -ForegroundColor Red
    exit 1
}

# Leer variables del archivo .env.production
$envVars = @{}
Get-Content ".env.production" | ForEach-Object {
    if ($_ -match "^([^#][^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

Write-Host "📋 Variables encontradas: $($envVars.Count)" -ForegroundColor Yellow

# Configurar cada variable en Vercel
foreach ($var in $envVars.GetEnumerator()) {
    Write-Host "⚙️  Configurando $($var.Key)..." -ForegroundColor Cyan
    
    # Usar echo para pasar el valor a vercel env add
    $command = "echo '$($var.Value)' | vercel env add $($var.Key) production --yes"
    
    try {
        Invoke-Expression $command
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $($var.Key) configurada" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Error configurando $($var.Key)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 500  # Pequeña pausa entre requests
}

Write-Host "🎉 Configuración de variables completada!" -ForegroundColor Green
Write-Host "💡 Tip: Ejecuta .\deploy-auto.ps1 para hacer deployment con las nuevas variables" -ForegroundColor Cyan