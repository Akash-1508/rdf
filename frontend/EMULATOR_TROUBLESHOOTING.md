# Android Emulator Troubleshooting Commands

## Commands 1-6 for Fixing Emulator Issues

### Command 1: List Available Emulators
```powershell
C:\Users\DELL\AppData\Local\Android\Sdk\emulator\emulator.exe -list-avds
```
**Result:** Shows available AVDs (Medium_Phone, Pixel_8, Pixel_8a)

### Command 2: Check Running Emulator Processes
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*emulator*" -or $_.ProcessName -like "*qemu*"} | Select-Object ProcessName, Id
```
**Purpose:** Check if any emulator processes are already running

### Command 3: Start Emulator Manually (Medium_Phone)
```powershell
C:\Users\DELL\AppData\Local\Android\Sdk\emulator\emulator.exe -avd Medium_Phone
```
**Alternative with verbose output:**
```powershell
C:\Users\DELL\AppData\Local\Android\Sdk\emulator\emulator.exe -avd Medium_Phone -verbose
```

### Command 4: Check ADB Device Connection
```powershell
adb devices
```
**Purpose:** Verify if emulator is detected and authorized

### Command 5: Restart ADB Server
```powershell
adb kill-server
adb start-server
adb devices
```
**Purpose:** Fix connection issues between ADB and emulator

### Command 6: Start Alternative Emulator (if Medium_Phone fails)
```powershell
# Try Pixel_8 emulator
C:\Users\DELL\AppData\Local\Android\Sdk\emulator\emulator.exe -avd Pixel_8

# Or Pixel_8a
C:\Users\DELL\AppData\Local\Android\Sdk\emulator\emulator.exe -avd Pixel_8a
```

## Additional Troubleshooting Steps

### Check Emulator Path
```powershell
Test-Path "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe"
```

### Verify Android SDK Location
```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"
```

### Start Emulator with Cold Boot (no snapshot)
```powershell
C:\Users\DELL\AppData\Local\Android\Sdk\emulator\emulator.exe -avd Medium_Phone -no-snapshot-load
```

### Wait for Emulator to Fully Boot
After starting the emulator, wait 30-60 seconds for it to fully boot before running:
```powershell
npx react-native run-android
```

## Current Status
- ✅ Emulator path exists
- ✅ Android SDK found at: `C:\Users\DELL\AppData\Local\Android\Sdk`
- ✅ 3 AVDs available: Medium_Phone, Pixel_8, Pixel_8a
- ⚠️ Emulator may need time to fully boot before running the app

## Recommended Solution
1. Start the emulator manually using Command 3
2. Wait for the emulator to fully boot (home screen appears)
3. Run `npx react-native run-android` in a separate terminal



