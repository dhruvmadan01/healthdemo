// js/emergency.js
// SOS Countdown, Location Coordinates, and Emergency Dispatch Simulation

class EmergencyFlow {
    constructor() {
        this.countdownInterval = null;
        this.secondsRemaining = 5;
        this.isDispatched = false;
    }

    openSOS() {
        // Reset countdown state
        this.secondsRemaining = 5;
        this.isDispatched = false;
        
        // Hide Bottom Nav during critical SOS
        document.getElementById('mainBottomNav').style.display = 'none';

        const numEl = document.getElementById('sosCountdownNumber');
        const lblEl = document.getElementById('sosCountdownLabel');
        numEl.innerText = this.secondsRemaining;
        numEl.style.color = "hsl(var(--danger-hsl))";
        lblEl.innerText = "Initializing emergency call... Tap to trigger immediately.";

        // Mock coordinate updates
        this.updateCoordinates();

        app.navigateTo('emergency-screen');

        // Start 5-second countdown
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        
        this.countdownInterval = setInterval(() => {
            this.secondsRemaining--;
            if (this.secondsRemaining > 0) {
                numEl.innerText = this.secondsRemaining;
            } else {
                clearInterval(this.countdownInterval);
                this.dispatchEmergency();
            }
        }, 1000);
    }

    updateCoordinates() {
        // Add random micro-offsets to coordinates to simulate active GPS tracking
        const lat = 40.7128 + (Math.random() - 0.5) * 0.001;
        const lng = -74.0060 + (Math.random() - 0.5) * 0.001;
        document.getElementById('sosLocationText').innerText = `${lat.toFixed(5)}° N, ${Math.abs(lng).toFixed(5)}° W`;
    }

    triggerSOSImmediate() {
        if (this.isDispatched) return;
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.dispatchEmergency();
    }

    dispatchEmergency() {
        this.isDispatched = true;
        const numEl = document.getElementById('sosCountdownNumber');
        const lblEl = document.getElementById('sosCountdownLabel');

        numEl.innerText = "SOS";
        numEl.style.color = "hsl(var(--success-hsl))";
        
        // Get emergency contact info
        const user = db.getCurrentUser();
        const contact = user.emergencyContact;

        lblEl.innerHTML = `
            <div style="background-color: rgba(239, 68, 68, 0.15); padding: 12px; border-radius: 12px; border: 1px solid hsl(var(--danger-hsl)); margin-top: 10px;">
                <strong style="color: hsl(var(--danger-hsl)); display: block; margin-bottom: 4px;">🚨 AMBULANCE DISPATCHED</strong>
                Rescue coordinates transmitted. EMS unit is en route.<br>
                Simulated SMS alert broadcasted to Emergency Contact:<br>
                <b>${contact.name} (${contact.relation}) - ${contact.phone}</b>
            </div>
        `;
        
        // Play mock alert beep via AudioContext (Web Audio API)
        this.playSirenBeep();
    }

    cancelSOS() {
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        
        // Show Bottom Nav again if logged in
        if (localStorage.getItem('is_authenticated') === 'true') {
            document.getElementById('mainBottomNav').style.display = 'flex';
            app.navigateTo('home-screen');
        } else {
            app.navigateTo('welcome-screen');
        }
    }

    playSirenBeep() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Alarm Tone 1 (High)
            const osc1 = audioCtx.createOscillator();
            const gainNode1 = audioCtx.createGain();
            osc1.connect(gainNode1);
            gainNode1.connect(audioCtx.destination);
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
            gainNode1.gain.setValueAtTime(0.1, audioCtx.currentTime);
            osc1.start();
            osc1.stop(audioCtx.currentTime + 0.3);

            // Alarm Tone 2 (Low)
            setTimeout(() => {
                const osc2 = audioCtx.createOscillator();
                const gainNode2 = audioCtx.createGain();
                osc2.connect(gainNode2);
                gainNode2.connect(audioCtx.destination);
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(660, audioCtx.currentTime); // E5
                gainNode2.gain.setValueAtTime(0.1, audioCtx.currentTime);
                osc2.start();
                osc2.stop(audioCtx.currentTime + 0.3);
            }, 300);

        } catch (e) {
            console.log("Audio siren not supported in this environment.", e);
        }
    }
}

const emergencyFlow = new EmergencyFlow();
window.emergencyFlow = emergencyFlow;
