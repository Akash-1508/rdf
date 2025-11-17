# PowerShell Script to Fix Android Emulator Issues (Lines 41-52)
# Addresses: Emulator launch failure and installDebug task failure

Write-Host "=== Android Emulator Troubleshooting Script ===" -ForegroundColor Cyan
Write-Host ""

# Command 1: Check ADB connection
Write-Host "[1/6] Checking ADB connection..." -ForegroundColor Yellow
$adbPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
if (Test-Path $adbPath) {
    Write-Host "ADB found at: $adbPath" -ForegroundColor Green
    & $adbPath kill-server
    Start-Sleep -Seconds 2
    & $adbPath start-server
} else {
    Write-Host "ERROR: ADB not found. Please check Android SDK installation." -ForegroundColor Red
    exit 1
}

# Command 2: List available emulators
Write-Host ""
Write-Host "[2/6] Listing available emulators..." -ForegroundColor Yellow
$emulatorPath = "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe"
if (Test-Path $emulatorPath) {
    Write-Host "Available AVDs:" -ForegroundColor Green
    & $emulatorPath -list-avds
} else {
    Write-Host "ERROR: Emulator not found." -ForegroundColor Red
    exit 1
}

# Command 3: Check for running emulator processes
Write-Host ""
Write-Host "[3/6] Checking for running emulator processes..." -ForegroundColor Yellow
$runningProcesses = Get-Process | Where-Object {$_.ProcessName -like "*emulator*" -or $_.ProcessName -like "*qemu*"}
if ($runningProcesses) {
    Write-Host "Found running emulator processes. Killing them..." -ForegroundColor Yellow
    $runningProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    Write-Host "Processes killed" -ForegroundColor Green
} else {
    Write-Host "No conflicting processes found" -ForegroundColor Green
}

# Command 4: Check connected devices
Write-Host ""
Write-Host "[4/6] Checking connected devices..." -ForegroundColor Yellow
$devices = & $adbPath devices
Write-Host $devices
if ($devices -match "device$") {
    Write-Host "Device already connected!" -ForegroundColor Green
    exit 0
}

# Command 5: Try to start emulator (try different AVDs)
Write-Host ""
Write-Host "[5/6] Attempting to start emulator..." -ForegroundColor Yellow
$avds = @("Pixel_8", "Pixel_8a", "Medium_Phone")
$emulatorStarted = $false

foreach ($avd in $avds) {
    Write-Host "Trying AVD: $avd" -ForegroundColor Cyan
    try {
        Start-Process -FilePath $emulatorPath -ArgumentList "-avd", $avd, "-no-snapshot-load" -WindowStyle Normal -ErrorAction Stop
        Write-Host "Started $avd emulator" -ForegroundColor Green
        $emulatorStarted = $true
        break
    } catch {
        Write-Host "Failed to start $avd : $_" -ForegroundColor Red
    }
}

if (-not $emulatorStarted) {
    Write-Host ""
    Write-Host "ERROR: Could not start any emulator automatically." -ForegroundColor Red
    Write-Host "Please start manually using:" -ForegroundColor Yellow
    Write-Host "  $emulatorPath -avd Pixel_8" -ForegroundColor White
    exit 1
}

# Command 6: Wait for emulator to boot and verify connection
Write-Host ""
Write-Host "[6/6] Waiting for emulator to boot (this may take 60-90 seconds)..." -ForegroundColor Yellow
$maxWaitTime = 120
$checkInterval = 5
$elapsed = 0

while ($elapsed -lt $maxWaitTime) {
    Start-Sleep -Seconds $checkInterval
    $elapsed += $checkInterval
    $devices = & $adbPath devices
    
    if ($devices -match "device$") {
        Write-Host ""
        Write-Host "SUCCESS! Emulator is ready and connected!" -ForegroundColor Green
        Write-Host "Connected devices:" -ForegroundColor Cyan
        & $adbPath devices
        Write-Host ""
        Write-Host "You can now run: npx react-native run-android" -ForegroundColor Green
        exit 0
    }
    
    $progress = [math]::Round(($elapsed / $maxWaitTime) * 100)
    $elapsedStr = $elapsed.ToString()
    $maxWaitStr = $maxWaitTime.ToString()
    $progressStr = $progress.ToString()
    $statusMsg = "  Waiting... (" + $elapsedStr + "/" + $maxWaitStr + " seconds - " + $progressStr + "%)"
    Write-Host $statusMsg -ForegroundColor Gray
}

Write-Host ""
Write-Host "WARNING: Emulator did not become ready within $maxWaitTime seconds." -ForegroundColor Yellow
Write-Host "Please check the emulator window manually." -ForegroundColor Yellow
Write-Host "Once the emulator home screen appears, run: adb devices" -ForegroundColor Yellow
& $adbPath devices
