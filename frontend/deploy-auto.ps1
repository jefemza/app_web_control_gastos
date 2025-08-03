#!/usr/bin/env pwsh
# Script de Deployment Automatizado para Vercel
# Uso: .\deploy-auto.ps1

Write-Host "🚀 Iniciando deployment automatizado..." -ForegroundColor Green

# Verificar que estamos en el directorio correcto
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json" -ForegroundColor Red
    exit 1
}

# Limpiar cache y node_modules si es necesario
Write-Host "🧹 Limpiando cache..." -ForegroundColor Yellow
npm cache clean --force

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm ci

# Build del proyecto
Write-Host "🔨 Construyendo proyecto..." -ForegroundColor Yellow
npm run build

# Verificar que el build fue exitoso
if (!(Test-Path "dist")) {
    Write-Host "❌ Error: Build falló, no se encontró directorio dist" -ForegroundColor Red
    exit 1
}

# Deploy a Vercel con confirmación automática
Write-Host "🌐 Desplegando a Vercel..." -ForegroundColor Yellow
$env:CI = "true"
$env:FORCE_COLOR = "0"

# Ejecutar deployment
vercel --prod --yes --confirm --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment completado exitosamente!" -ForegroundColor Green
    
    # Obtener URL del proyecto
    Write-Host "🔗 Obteniendo URL del proyecto..." -ForegroundColor Yellow
    vercel ls --json | ConvertFrom-Json | Select-Object -First 1 | ForEach-Object {
        Write-Host "📱 URL Principal: https://$($_.name).vercel.app" -ForegroundColor Cyan
        Write-Host "🔗 URL Deployment: https://$($_.url)" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Error en el deployment" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Proceso completado!" -ForegroundColor Green