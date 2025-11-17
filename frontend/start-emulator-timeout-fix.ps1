# PowerShell Script to Fix Emulator Timeout Issues
# Addresses: "It took too long to start and connect with Android emulator"

Write-Host "=== Android Emulator Timeout Fix ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean up any existing processes
Write-Host "[1/4] Cleaning up existing emulator processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*emulator*" -or $_.ProcessName -like "*qemu*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 2: Restart ADB
Write-Host "[2/4] Restarting ADB..." -ForegroundColor Yellow
$adbPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adbPath kill-server
Start-Sleep -Seconds 2
& $adbPath start-server
Write-Host "ADB restarted" -ForegroundColor Green

# Step 3: Start emulator in background with better performance settings
Write-Host ""
Write-Host "[3/4] Starting Medium_Phone emulator with optimized settings..." -ForegroundColor Yellow
$emulatorPath = "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe"

# Try starting with performance optimizations
$emulatorArgs = @(
    "-avd", "Medium_Phone",
    "-no-snapshot-load",  # Cold boot for stability
    "-gpu", "swiftshader_indirect",  # Software rendering (more compatible)
    "-no-audio",  # Disable audio for faster boot
    "-no-boot-anim"  # Skip boot animation
)

Write-Host "Starting emulator with args: $($emulatorArgs -join ' ')" -ForegroundColor Cyan
Start-Process -FilePath $emulatorPath -ArgumentList $emulatorArgs -WindowStyle Normal

Write-Host "Emulator process started. Waiting for boot..." -ForegroundColor Green

# Step 4: Wait for emulator with extended timeout and better detection
Write-Host ""
Write-Host "[4/4] Waiting for emulator to connect (extended timeout: 5 minutes)..." -ForegroundColor Yellow
Write-Host "Note: First boot can take 2-3 minutes. Please be patient." -ForegroundColor Gray
Write-Host ""

$maxWaitTime = 300  # 5 minutes
$checkInterval = 10  # Check every 10 seconds
$elapsed = 0
$connected = $false

while ($elapsed -lt $maxWaitTime -and -not $connected) {
    Start-Sleep -Seconds $checkInterval
    $elapsed += $checkInterval
    
    $devices = & $adbPath devices
    
    # Check for device in any state (device, offline, unauthorized)
    if ($devices -match "emulator") {
        Write-Host "Emulator detected! Status: $($devices -split "`n" | Select-String "emulator")" -ForegroundColor Cyan
        
        # Wait a bit more for it to become "device" state
        if ($devices -match "device$") {
            Write-Host ""
            Write-Host "SUCCESS! Emulator is ready and authorized!" -ForegroundColor Green
            & $adbPath devices
            $connected = $true
            break
        }
    }
    
    $progress = [math]::Round(($elapsed / $maxWaitTime) * 100)
    $elapsedMin = [math]::Floor($elapsed / 60)
    $elapsedSec = $elapsed % 60
    $statusMsg = "  Waiting... ($elapsedMin min $elapsedSec sec / 5 min - $progress%)"
    Write-Host $statusMsg -ForegroundColor Gray
}

if ($connected) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Emulator is ready!" -ForegroundColor Green
    Write-Host "You can now run: npx react-native run-android" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "WARNING: Emulator did not connect within 5 minutes." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Cyan
    Write-Host "1. Check if emulator window is visible" -ForegroundColor White
    Write-Host "2. Wait for emulator home screen to appear" -ForegroundColor White
    Write-Host "3. Run manually: adb devices" -ForegroundColor White
    Write-Host "4. If still unauthorized, try: adb kill-server && adb start-server" -ForegroundColor White
    Write-Host ""
    & $adbPath devices
}



