// js/ai.js
// AI Clinical Assistant Chat Simulator with custom triage diagnostic filters

class AIChat {
    constructor() {
        this.messagesContainer = null;
    }

    sendMessage() {
        this.messagesContainer = document.getElementById('aiChatMessages');
        const input = document.getElementById('aiChatInput');
        const text = input.value.trim();
        if (!text) return;

        // Render User Bubble
        this.appendBubble(text, 'user');
        input.value = '';

        // Generate response loading delay
        this.appendLoadingIndicator();

        setTimeout(() => {
            this.removeLoadingIndicator();
            const response = this.generateResponse(text);
            this.appendBubble(response, 'bot');
        }, 1000);
    }

    appendBubble(text, sender) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender}`;
        bubble.innerHTML = text;
        this.messagesContainer.appendChild(bubble);
        this.scrollChatToBottom();
    }

    appendLoadingIndicator() {
        const loader = document.createElement('div');
        loader.className = 'chat-bubble bot';
        loader.id = 'aiChatLoader';
        loader.innerHTML = `<i class="fa-solid fa-ellipsis fa-fade"></i> AI is thinking...`;
        this.messagesContainer.appendChild(loader);
        this.scrollChatToBottom();
    }

    removeLoadingIndicator() {
        const loader = document.getElementById('aiChatLoader');
        if (loader) loader.remove();
    }

    scrollChatToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    generateResponse(msg) {
        const lower = msg.toLowerCase();

        // 1. SOS Critical Warnings
        if (lower.includes('chest pain') || lower.includes('tightness') || lower.includes('heart') || lower.includes('short of breath') || lower.includes('breathing')) {
            return `
                <div style="color: hsl(var(--danger-hsl)); font-weight: 700; display: flex; gap: 8px; align-items: flex-start;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.2rem; margin-top: 2px;"></i>
                    <div>
                        CRITICAL MEDICAL ALERT:<br>
                        Symptoms like chest tightness, pressure, or shortness of breath require immediate medical attention. 
                        Please click the <strong style="text-decoration: underline; cursor: pointer;" onclick="emergencyFlow.openSOS()">RED EMERGENCY SOS BUTTON</strong> on your home dashboard or call 911 immediately.
                    </div>
                </div>
            `;
        }

        // 2. Asthma
        if (lower.includes('asthma') || lower.includes('wheez') || lower.includes('inhaler')) {
            return `
                Asthma symptoms require careful management. Since you have a documented history of <b>Mild Asthma</b>, 
                ensure your Albuterol Rescue Inhaler is accessible. Limit outdoor cardiovascular workouts during high pollen spikes. 
                If wheezing persists, schedule a follow-up consultation with Dr. Elizabeth Vance.
            `;
        }

        // 3. Cough / Fever
        if (lower.includes('cough') || lower.includes('fever') || lower.includes('cold') || lower.includes('flu')) {
            return `
                Cough and fever are typical indicators of viral respiratory infections. 
                • Get adequate bed rest and stay hydrated with electrolytes.<br>
                • Monitor body temperature periodically.<br>
                • If temperatures rise above 101.5°F (38.6°C) or last more than 3 days, consider booking an appointment with 
                <b>Dr. Marcus Vance</b> (Pediatrics) or <b>Dr. Sarah Lin</b> (General Medicine/Dermatology).
            `;
        }

        // 4. Booking assist
        if (lower.includes('book') || lower.includes('appointment') || lower.includes('schedule') || lower.includes('doctor')) {
            return `
                I can help you coordinate a consultation. Click here to launch the 
                <strong style="color: hsl(var(--accent-hsl)); cursor: pointer;" onclick="bookingFlow.startBooking()">Appointment Booking Form</strong>. 
                You can select a physician, choose date/time slots, upload prior files, and pay consulting co-pays securely.
            `;
        }

        // 5. Basic greetings
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('help')) {
            return `
                Hello! I am your AI Health Copilot. I can parse symptoms, summarize clinic instructions, and answer wellness questions. 
                What symptoms are you experiencing today?
            `;
        }

        // Default medical assistant response
        return `
            Based on your query, I suggest monitoring your vitals and logging daily details in your profile settings. 
            Remember, I am an AI assistant for guidance; consult our licensed HealthFlow network physicians like 
            Dr. Vance or Dr. Reyes for definitive clinical diagnoses.
        `;
    }
}

const aiChat = new AIChat();
window.aiChat = aiChat;
