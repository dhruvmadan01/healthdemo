// build-apks.js
// Automated script to compile both the Patient APK and the Doctor APK using Capacitor and Gradle

// Set JAVA_HOME path dynamically for Gradle wrapper
process.env.JAVA_HOME = 'C:\\Program Files\\Android\\Android Studio\\jbr';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function runCommand(command, cwd = '.') {
    console.log(`Running: ${command} in ${cwd}`);
    try {
        execSync(command, { cwd, stdio: 'inherit' });
    } catch (e) {
        console.error(`Command failed: ${command}`);
        throw e;
    }
}

try {
    console.log('--- STARTING CLINICAL BUILD PIPELINE ---');

    // Step 1: Rebuild standard web assets into www/
    runCommand('node build.js');

    // --- BUILD 1: PATIENT APK ---
    console.log('\n--- BUILDING PATIENT APP APK ---');
    
    // Sync Capacitor assets (loads Patient index.html as entry point)
    runCommand('npx cap sync android');
    
    // Compile using Android Gradle Wrapper
    runCommand('.\\gradlew.bat assembleDebug', 'android');
    
    // Copy compiled APK to workspace root
    const compiledApkPath = 'android/app/build/outputs/apk/debug/app-debug.apk';
    const patientDest = 'oneminute-patient.apk';
    if (fs.existsSync(compiledApkPath)) {
        fs.copyFileSync(compiledApkPath, patientDest);
        console.log(`Success: Patient App APK copied to ${path.resolve(patientDest)}`);
    } else {
        throw new Error('Patient app-debug.apk not found after build!');
    }

    // --- BUILD 2: DOCTOR APK ---
    console.log('\n--- BUILDING DOCTOR APP APK ---');
    
    // Swap entrance: Copy doctor.html to index.html in www/ so Capacitor boots into Doctor Portal
    fs.copyFileSync('www/doctor.html', 'www/index.html');
    
    // Sync Capacitor assets with the swapped doctor index.html
    runCommand('npx cap sync android');
    
    // Clean and Compile using Gradle
    runCommand('.\\gradlew.bat clean', 'android');
    runCommand('.\\gradlew.bat assembleDebug', 'android');
    
    // Copy compiled APK to workspace root
    const doctorDest = 'oneminute-doctor.apk';
    if (fs.existsSync(compiledApkPath)) {
        fs.copyFileSync(compiledApkPath, doctorDest);
        console.log(`Success: Doctor App APK copied to ${path.resolve(doctorDest)}`);
    } else {
        throw new Error('Doctor app-debug.apk not found after build!');
    }

    // --- RESTORE ORIGINAL ---
    console.log('\n--- CLEANING UP & RESTORING ASSETS ---');
    fs.copyFileSync('index.html', 'www/index.html'); // Restore patient index.html
    runCommand('npx cap sync android'); // Re-sync Android project to patient state for safety
    
    console.log('\n--- BUILD COMPLETED SUCCESSFULLY ---');
    console.log(`Patient App: ${path.resolve(patientDest)}`);
    console.log(`Doctor App:  ${path.resolve(doctorDest)}`);

} catch (err) {
    console.error('APK compilation failed:', err.message);
    process.exit(1);
}
