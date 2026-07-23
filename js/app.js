// js/app.js
// Core Routing, Navigation, Auth Flow, and App State Management

class HealthcareApp {
    constructor() {
        this.currentScreen = 'splash-screen';
        this.currentTab = 'home-screen';
        this.searchTab = 'doctors'; // 'doctors' or 'hospitals'
        this.selectedFilters = {
            consultType: [],
            distance: [],
            price: [],
            availability: [],
            language: []
        };
        
        this.init();
    }

    init() {
        // Initialize Status Bar Clock
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);

        // Splash screen transition delay (1.5 seconds)
        setTimeout(() => {
            if (window.supabaseSession && window.supabaseSession.user) {
                this.handleSupabaseUserLoggedIn(window.supabaseSession.user);
            } else if (this.currentScreen === 'splash-screen') {
                this.navigateTo('welcome-screen');
            }
        }, 1500);

        this.setupFilterChips();
        this.renderHealthTip();

        // Check family notifications periodically
        this.checkNotifications();
        setInterval(() => this.checkNotifications(), 15000);
    }

    updateClock() {
        const timeSpan = document.getElementById('statusBarTime');
        if (timeSpan) {
            const now = new Date();
            let hours = now.getHours();
            let minutes = now.getMinutes();
            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            timeSpan.innerText = `${hours}:${minutes}`;
        }
    }

    // View Navigation Router
    navigateTo(screenId) {
        // Hide active screens
        const activeScreens = document.querySelectorAll('.screen.active');
        activeScreens.forEach(s => s.classList.remove('active'));

        // Activate new screen
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add('active');
            this.currentScreen = screenId;
            
            // Execute view-specific rendering
            if (screenId === 'home-screen') {
                this.renderHomeDashboard();
            } else if (screenId === 'search-screen') {
                this.handleSearch();
            } else if (screenId === 'profile-screen') {
                this.renderProfileScreen();
            }
        }
    }

    // Bottom Navigation Bar Controller
    navigateTab(screenId) {
        this.navigateTo(screenId);
        this.currentTab = screenId;
        
        // Update nav item state styling
        const items = document.querySelectorAll('.bottom-nav-item');
        items.forEach(item => item.classList.remove('active'));

        const activeItem = Array.from(items).find(item => {
            const clickAttr = item.getAttribute('onclick');
            return clickAttr && clickAttr.includes(screenId);
        });
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    // Auth Flows
    async handleEmailLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const origText = submitBtn.innerText;
        submitBtn.innerText = "Signing in...";
        submitBtn.disabled = true;

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                alert(`Login failed: ${error.message}`);
            } else {
                console.log("Logged in successfully:", data.user);
            }
        } catch (err) {
            console.error(err);
            alert(`An unexpected error occurred during login: ${err.message}`);
        } finally {
            submitBtn.innerText = origText;
            submitBtn.disabled = false;
        }
    }

    async handleEmailRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const phone = document.getElementById('registerPhone').value;
        const dob = document.getElementById('registerDOB').value;
        const gender = document.getElementById('registerGender').value;
        const bloodGroup = document.getElementById('registerBloodGroup').value;
        const height = parseFloat(document.getElementById('registerHeight').value);
        const weight = parseFloat(document.getElementById('registerWeight').value);

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const origText = submitBtn.innerText;
        submitBtn.innerText = "Signing up...";
        submitBtn.disabled = true;

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name,
                        phone: phone,
                        dob: dob,
                        gender: gender,
                        blood_group: bloodGroup,
                        height: height,
                        weight: weight
                    }
                }
            });

            if (error) {
                alert(`Registration failed: ${error.message}`);
            } else {
                if (data.session) {
                    alert("Registration successful! Logging you in...");
                } else {
                    alert("Registration successful! Please check your email to verify your account before logging in.");
                    this.navigateTo('login-screen');
                }
            }
        } catch (err) {
            console.error(err);
            alert(`An unexpected error occurred during registration: ${err.message}`);
        } finally {
            submitBtn.innerText = origText;
            submitBtn.disabled = false;
        }
    }

    async signInWithGoogle() {
        try {
            const { data, error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err) {
            console.error(err);
            alert(`Google login failed: ${err.message}`);
        }
    }

    async handleSupabaseUserLoggedIn(user) {
        // Sync user clinical data from Supabase
        await db.syncUserData(user.id);
        let patient = db.data.patients[user.id];
        let needsCompletion = false;
        
        // Try locating profile by email if not found by UUID
        if (!patient) {
            patient = Object.values(db.data.patients).find(p => p.email.toLowerCase() === user.email.toLowerCase());
            if (patient) {
                const oldId = patient.id;
                patient.id = user.id;
                db.data.patients[user.id] = patient;
                delete db.data.patients[oldId];
                
                if (db.data.currentUser === oldId) {
                    db.data.currentUser = user.id;
                }
                
                db.data.appointments.forEach(app => {
                    if (app.patientId === oldId) app.patientId = user.id;
                });
                db.data.labReports.forEach(rep => {
                    if (rep.patientId === oldId) rep.patientId = user.id;
                });
                db.data.insuranceAlerts.forEach(al => {
                    if (al.patientId === oldId) al.patientId = user.id;
                });
            }
        }

        if (!patient) {
            const meta = user.user_metadata || {};
            const h = parseFloat(meta.height || 170);
            const w = parseFloat(meta.weight || 70);
            const bmi = parseFloat((w / ((h / 100) * (h / 100))).toFixed(1));

            if (!meta.dob || !meta.gender) {
                needsCompletion = true;
            }

            patient = {
                id: user.id,
                name: meta.full_name || user.email.split('@')[0],
                dob: meta.dob || "",
                gender: meta.gender || "Unspecified",
                bloodGroup: meta.blood_group || "O+",
                height: h,
                weight: w,
                bmi: bmi,
                email: user.email,
                phone: meta.phone || user.phone || "",
                emergencyContact: { name: "", relation: "", phone: "" },
                settings: { language: "English", organDonor: false, darkMode: false, biometricsEnabled: false },
                medicalHistory: { allergies: [], chronicDiseases: [], surgeries: [], currentMedicines: [] },
                lifestyle: { smoking: "Never", alcohol: "Never", exercise: "None", sleep: "8 hours" },
                healthScore: 80
            };
            db.data.patients[user.id] = patient;
            
            // Upload newly created profile to Supabase
            await db.saveProfileToSupabase(patient);
        } else {
            if (!patient.dob || patient.gender === "Unspecified") {
                needsCompletion = true;
            }
        }

        db.save();
        this.loginUser(user.id);

        if (needsCompletion) {
            setTimeout(() => {
                this.openModal('completeProfileModal');
            }, 800);
        }
    }

    async handleCompleteProfile(e) {
        e.preventDefault();
        const phone = document.getElementById('completePhone').value;
        const dob = document.getElementById('completeDOB').value;
        const gender = document.getElementById('completeGender').value;
        const bloodGroup = document.getElementById('completeBloodGroup').value;
        const height = parseFloat(document.getElementById('completeHeight').value);
        const weight = parseFloat(document.getElementById('completeWeight').value);

        const patient = db.getPatient(db.data.currentUser);
        if (patient) {
            patient.phone = phone;
            patient.dob = dob;
            patient.gender = gender;
            patient.bloodGroup = bloodGroup;
            patient.height = height;
            patient.weight = weight;
            patient.bmi = parseFloat((weight / ((height / 100) * (height / 100))).toFixed(1));
            
            db.save();
            
            try {
                // Sync profile to Supabase
                await db.saveProfileToSupabase(patient);

                await supabaseClient.auth.updateUser({
                    data: {
                        phone: phone,
                        dob: dob,
                        gender: gender,
                        blood_group: bloodGroup,
                        height: height,
                        weight: weight
                    }
                });
            } catch (err) {
                console.error("Failed to update Supabase profile details:", err);
            }

            alert("Profile setup completed successfully!");
            this.closeModal('completeProfileModal');
            this.renderHomeDashboard();
        }
    }

    handleSupabaseUserLoggedOut() {
        localStorage.setItem('is_authenticated', 'false');
        document.getElementById('mainBottomNav').style.display = 'none';
        if (
            this.currentScreen !== 'welcome-screen' &&
            this.currentScreen !== 'login-screen' &&
            this.currentScreen !== 'register-screen' &&
            this.currentScreen !== 'forgot-password-screen'
        ) {
            this.navigateTo('welcome-screen');
        }
    }

    handleOTPVerify() {
        const user = db.getCurrentUser();
        if (user) {
            this.loginUser(user.id);
        }
    }

    triggerBiometricLogin() {
        // Find last active profile or fallback to Alex Mercer (p1)
        let userId = db.data.currentUser || "p1";
        let targetPatient = db.getPatient(userId);
        
        if (!targetPatient) {
            targetPatient = {
                id: "p1",
                name: "Alex Mercer",
                image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
            };
            userId = "p1";
        }
        
        this.navigateTo('biometrics-screen');

        // Populate card content
        const avatar = document.getElementById('biometricUserAvatar');
        const nameText = document.getElementById('biometricUserName');
        if (avatar) {
            avatar.src = targetPatient.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
        }
        if (nameText) {
            nameText.innerText = targetPatient.name;
        }
        
        const icon = document.getElementById('biometricIcon');
        const title = document.getElementById('biometricScanTitle');
        const desc = document.getElementById('biometricScanDesc');
        
        icon.className = "fa-solid fa-face-id";
        icon.style.color = "";
        title.innerText = "Scanning Face ID...";
        desc.innerText = "Please look at the front camera of your device.";
        
        setTimeout(() => {
            icon.className = "fa-solid fa-circle-check";
            icon.style.color = "hsl(var(--success-hsl))";
            title.innerText = "Biometrics Verified";
            desc.innerText = "Secure login successful.";
            
            setTimeout(() => {
                this.loginUser(userId);
                icon.style.color = "";
            }, 1000);
        }, 1500);
    }

    cancelBiometric() {
        this.navigateTo('welcome-screen');
    }

    handleForgotPassword(e) {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;
        alert(`A password reset link and instruction email has been sent to: ${email}`);
        this.navigateTo('login-screen');
    }

    loginUser(patientId) {
        db.data.currentUser = patientId;
        db.save();
        localStorage.setItem('is_authenticated', 'true');
        
        document.getElementById('mainBottomNav').style.display = 'flex';
        
        const user = db.getCurrentUser();
        if (user) {
            this.syncTheme(user.settings.darkMode);
        }
        this.checkNotifications();
        this.navigateTab('home-screen');
    }

    async handleLogout() {
        try {
            await supabaseClient.auth.signOut();
        } catch (err) {
            console.error("Supabase signOut error:", err);
        }
        localStorage.setItem('is_authenticated', 'false');
        document.getElementById('mainBottomNav').style.display = 'none';
        this.navigateTo('welcome-screen');
    }

    // Dashboard Renderers
    renderHomeDashboard() {
        const user = db.getCurrentUser();
        if (!user) return;

        // Header Name
        document.getElementById('userNameHeading').innerText = user.name;
        // Avatar initials
        const initials = user.name.split(' ').map(n => n[0]).join('');
        document.getElementById('avatarBadge').innerText = initials;

        // BMI Card info
        document.getElementById('healthScoreBMI').innerText = user.bmi;
        document.getElementById('healthScoreDonor').innerText = user.settings.organDonor ? "Yes" : "No";

        // Gauge Score
        document.getElementById('healthScoreValue').innerText = user.healthScore;
        const stroke = document.getElementById('healthGaugeStroke');
        if (stroke) {
            // circumference of circle r=28 is 2 * pi * 28 = 176
            const offset = 176 - (176 * user.healthScore) / 100;
            stroke.style.strokeDashoffset = offset;
        }

        // Render dynamic alert & appointment widgets
        this.renderDynamicWidgets(user.id);
    }

    renderDynamicWidgets(patientId) {
        const listArea = document.getElementById('dynamicWidgetsArea');
        listArea.innerHTML = ''; // clear

        // Find active appointments for this patient
        const appointments = db.getAppointments(patientId).filter(app => app.status !== 'Completed');

        if (appointments.length === 0) {
            // Fallback placeholder card
            listArea.innerHTML = `
                <div class="card" style="text-align: center; padding: 20px; border-style: dashed; border-width: 2px;">
                    <i class="fa-solid fa-calendar-xmark" style="font-size: 1.8rem; color: var(--text-muted); margin-bottom: 8px;"></i>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);">No upcoming appointments scheduled today.</p>
                    <button class="btn btn-secondary" onclick="bookingFlow.startBooking()" style="margin-top: 10px; padding: 6px 12px; font-size: 0.75rem; width: auto;">
                        Schedule Now
                    </button>
                </div>
            `;
        } else {
            appointments.forEach(app => {
                const doctor = db.getDoctor(app.doctorId);
                const hospital = db.getHospital(app.hospitalId);

                // Determine Check-in actions
                let checkinBtn = '';
                if (app.checkInStatus === 'Not Checked In') {
                    checkinBtn = `
                        <button class="btn btn-accent" onclick="bookingFlow.openCheckIn('${app.id}')" style="margin-top: 10px; padding: 8px 12px; font-size: 0.75rem;">
                            <i class="fa-solid fa-location-dot"></i> Check In Upon Arrival
                        </button>
                    `;
                } else if (app.checkInStatus === 'Checked In' && app.status === 'Upcoming') {
                    checkinBtn = `
                        <div class="widget-alert success" style="margin-top: 10px; margin-bottom: 0;">
                            <i class="fa-solid fa-circle-check"></i>
                            <div class="widget-alert-content">
                                <div class="widget-alert-title">Successfully Registered</div>
                                <div class="widget-alert-desc">Waiting in live queue. Now serving token ${app.queue.currentSpeaker}.</div>
                            </div>
                        </div>
                    `;
                }

                // Appointment card
                listArea.innerHTML += `
                    <div class="card" style="border-left: 5px solid hsl(var(--primary-hsl));">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <div>
                                <span class="chip" style="background-color: rgba(15, 76, 129, 0.1); color: hsl(var(--primary-hsl)); font-size: 0.65rem; margin-bottom: 6px; padding: 2px 8px;">
                                    ${app.status} Appointment
                                </span>
                                <h4 style="font-size: 0.95rem;">${doctor.name}</h4>
                                <p style="font-size: 0.75rem; color: var(--text-secondary);">${hospital.name}</p>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.8rem; font-weight: 700; color: hsl(var(--accent-hsl));">${app.time}</div>
                                <div style="font-size: 0.7rem; color: var(--text-muted);">${app.date}</div>
                            </div>
                        </div>
                        <div class="detail-row" style="padding: 6px 0; border: none; font-size: 0.75rem;">
                            <span class="detail-label">Token ID:</span>
                            <span class="detail-value" style="color: hsl(var(--primary-hsl));">${app.visitToken}</span>
                        </div>
                        ${checkinBtn}
                    </div>
                `;

                // Add queue tracker if user is checked in
                if (app.checkInStatus === 'Checked In') {
                    listArea.innerHTML += `
                        <div class="card" style="border-left: 5px solid hsl(var(--accent-hsl)); background-color: rgba(20, 184, 166, 0.03);">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h4 style="font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
                                        <i class="fa-solid fa-spinner fa-spin" style="color: hsl(var(--accent-hsl));"></i> Live Queue Status
                                    </h4>
                                    <p style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 4px;">
                                        Room: <b>${app.queue.room}</b> | Wait: <b style="color: hsl(var(--warning-hsl));">${app.queue.estWaitTime}m</b>
                                    </p>
                                </div>
                                <div style="text-align: right; background-color: hsl(var(--accent-hsl)); color: #fff; padding: 6px 12px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer;" onclick="app.navigateTab('queue-screen')">
                                    Pos #${app.queue.position}
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
        }

        // Add Active Prescription reminder list
        const patient = db.getPatient(patientId);
        if (patient && patient.medicalHistory.currentMedicines.length > 0) {
            let medListHTML = '';
            patient.medicalHistory.currentMedicines.forEach(med => {
                medListHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 0.75rem; border-bottom: 1px solid var(--border-color);">
                        <div>
                            <strong>${med.name}</strong> - ${med.dose}
                            <span style="display: block; font-size: 0.65rem; color: var(--text-muted);">${med.foodInstructions}</span>
                        </div>
                        <span class="chip" style="font-size: 0.65rem; padding: 2px 8px; background-color: var(--bg-tertiary);">${med.duration}</span>
                    </div>
                `;
            });

            listArea.innerHTML += `
                <div class="card">
                    <h4 style="font-size: 0.85rem; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-pills" style="color: hsl(var(--accent-hsl));"></i> Daily Prescription Reminders
                    </h4>
                    ${medListHTML}
                </div>
            `;
        }
    }

    renderHealthTip() {
        const list = db.data.healthTips;
        const tipEl = document.getElementById('dailyTipText');
        if (tipEl && list) {
            // Select random tip from list
            const index = Math.floor(Math.random() * list.length);
            tipEl.innerText = list[index];
        }
    }

    // Theme Management
    toggleTheme() {
        const user = db.getCurrentUser();
        if (user) {
            user.settings.darkMode = !user.settings.darkMode;
            db.save();
            this.syncTheme(user.settings.darkMode);
        }
    }

    toggleThemeCheckbox(checkbox) {
        const user = db.getCurrentUser();
        if (user) {
            user.settings.darkMode = checkbox.checked;
            db.save();
            this.syncTheme(checkbox.checked);
        }
    }

    syncTheme(isDark) {
        const themeIcon = document.getElementById('themeIcon');
        const settingsCheck = document.getElementById('settingsDarkMode');
        
        if (isDark) {
            document.body.classList.add('dark-mode');
            if (themeIcon) themeIcon.className = "fa-solid fa-sun";
            if (settingsCheck) settingsCheck.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            if (themeIcon) themeIcon.className = "fa-solid fa-moon";
            if (settingsCheck) settingsCheck.checked = false;
        }
    }

    toggleBiometrics(checkbox) {
        const user = db.getCurrentUser();
        if (user) {
            user.settings.biometricsEnabled = checkbox.checked;
            db.save();
        }
    }

    updateOrganDonor(checkbox) {
        const user = db.getCurrentUser();
        if (user) {
            user.settings.organDonor = checkbox.checked;
            db.save();
            this.renderHomeDashboard();
        }
    }

    changeLanguage(lang) {
        const user = db.getCurrentUser();
        if (user) {
            user.settings.language = lang;
            db.save();
            alert(`Application UI translated to ${lang}.`);
        }
    }

    // Profile Settings screen initial sync
    renderProfileScreen() {
        const user = db.getCurrentUser();
        if (!user) return;

        document.getElementById('profileName').innerText = user.name;
        document.getElementById('profileEmail').innerText = user.email;
        
        const healthIdEl = document.getElementById('profileHealthId');
        if (healthIdEl) {
            healthIdEl.innerText = `Health ID: ${user.health_id || 'Not Assigned'}`;
        }
        document.getElementById('profileHeight').innerText = `${user.height} cm`;
        document.getElementById('profileWeight').innerText = `${user.weight} kg`;
        document.getElementById('profileBMI').innerText = user.bmi;
        document.getElementById('profileBlood').innerText = user.bloodGroup;
        document.getElementById('profileChronic').innerText = user.medicalHistory.chronicDiseases.join(', ') || 'None';
        document.getElementById('profileAllergies').innerText = user.medicalHistory.allergies.join(', ') || 'None';
        document.getElementById('profileOrganDonor').checked = user.settings.organDonor;
        document.getElementById('settingsLanguage').value = user.settings.language;
        document.getElementById('settingsDarkMode').checked = user.settings.darkMode;
        document.getElementById('settingsBiometrics').checked = user.settings.biometricsEnabled;
        
        const initials = user.name.split(' ').map(n => n[0]).join('');
        document.getElementById('profileAvatar').innerText = initials;
    }

    // Modals Core Functions
    openModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('open');
    }

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('open');
    }

    // Quick Action Dialog Modals
    openMyReports() {
        this.openModal('reportsModal');
        const container = document.getElementById('reportsModalList');
        container.innerHTML = '';
        
        const list = db.getLabReports(db.data.currentUser);
        if (list.length === 0) {
            container.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted); text-align: center;">No diagnostic laboratory reports ready.</p>`;
            return;
        }

        list.forEach(r => {
            container.innerHTML += `
                <div class="card" style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="font-size: 0.85rem;">${r.testName}</h4>
                            <p style="font-size: 0.7rem; color: var(--text-muted);">Collected: ${r.date} | Phys: ${r.doctor}</p>
                        </div>
                        <button class="btn btn-secondary" onclick="app.viewReportFile('${r.id}')" style="padding: 6px 10px; font-size: 0.7rem; width: auto;">
                            <i class="fa-solid fa-file-pdf" style="color: hsl(var(--danger-hsl));"></i> View
                        </button>
                    </div>
                </div>
            `;
        });
    }

    viewReportFile(reportId) {
        const report = db.data.labReports.find(r => r.id === reportId);
        if (report && report.file) {
            if (report.file.startsWith('http') || report.file.startsWith('blob:') || report.file.startsWith('data:')) {
                window.open(report.file, '_blank');
            } else {
                alert(`Simulating secure HIPAA diagnostic PDF download: ${report.file}`);
            }
        } else {
            alert("Report file not found.");
        }
    }

    async handleReportUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const statusSpan = document.getElementById('reportUploadStatus');
        statusSpan.innerText = "Uploading...";
        statusSpan.style.color = "var(--text-secondary)";

        try {
            const fileName = `Report-${Date.now()}-${file.name}`;
            const filePath = `${db.data.currentUser}/${fileName}`;

            let fileUrl = "";
            try {
                const { data, error } = await supabaseClient.storage
                    .from('healthcare-files')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (error) throw error;

                const { data: urlData } = supabaseClient.storage
                    .from('healthcare-files')
                    .getPublicUrl(filePath);

                fileUrl = urlData.publicUrl;
            } catch (storageErr) {
                console.warn("Supabase storage upload failed, using local simulation. Ensure a public bucket named 'healthcare-files' exists in Supabase.", storageErr);
                fileUrl = URL.createObjectURL(file);
            }

            const newReport = {
                id: 'lr_' + Date.now(),
                patientId: db.data.currentUser,
                testName: file.name.replace('.pdf', '') || 'Uploaded Lab Report',
                date: new Date().toISOString().split('T')[0],
                status: 'Ready',
                doctor: 'Self-Uploaded',
                file: fileUrl
            };

            db.addLabReport(newReport);

            statusSpan.innerText = "Uploaded!";
            statusSpan.style.color = "hsl(var(--success-hsl))";
            
            this.openMyReports();
            event.target.value = '';

        } catch (err) {
            console.error("Report upload error:", err);
            statusSpan.innerText = "Failed.";
            statusSpan.style.color = "hsl(var(--danger-hsl))";
        }
    }

    openMyPrescriptions() {
        this.openModal('prescriptionsModal');
        const container = document.getElementById('prescriptionsModalList');
        container.innerHTML = '';
        
        const list = db.getPrescriptions(db.data.currentUser);
        if (list.length === 0) {
            container.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted); text-align: center;">No prescription records found.</p>`;
            return;
        }

        list.forEach(p => {
            const doc = db.getDoctor(p.doctorId) || { name: p.doctor || 'Self-Uploaded' };
            
            container.innerHTML += `
                <div class="card" style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="font-size: 0.85rem;">Prescription (${p.id.startsWith('pr_self_') ? 'Personal' : p.id.replace('pr_', 'RX-')})</h4>
                            <p style="font-size: 0.7rem; color: var(--text-muted);">Date: ${p.date} | Phys: ${doc.name}</p>
                        </div>
                        <button class="btn btn-secondary" onclick="app.viewPrescription('${p.id}')" style="padding: 6px 10px; font-size: 0.7rem; width: auto;">
                            <i class="fa-solid fa-file-invoice" style="color: hsl(var(--accent-hsl));"></i> View
                        </button>
                    </div>
                </div>
            `;
        });
    }

    viewPrescription(prescId) {
        const presc = db.data.prescriptions.find(p => p.id === prescId);
        if (!presc) return;

        this.closeModal('prescriptionsModal');

        if (presc.id.startsWith('pr_self_')) {
            if (presc.file) {
                window.open(presc.file, '_blank');
            } else {
                alert("Prescription file not found.");
            }
        } else {
            consultationModule.renderPrescriptionScreen(prescId);
        }
    }

    async handlePersonalPrescriptionUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const statusSpan = document.getElementById('prescriptionUploadStatus');
        statusSpan.innerText = "Uploading...";
        statusSpan.style.color = "var(--text-secondary)";

        try {
            const fileName = `Prescription-${Date.now()}-${file.name}`;
            const filePath = `${db.data.currentUser}/${fileName}`;

            let fileUrl = "";
            try {
                const { data, error } = await supabaseClient.storage
                    .from('healthcare-files')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (error) throw error;

                const { data: urlData } = supabaseClient.storage
                    .from('healthcare-files')
                    .getPublicUrl(filePath);

                fileUrl = urlData.publicUrl;
            } catch (storageErr) {
                console.warn("Supabase storage upload failed, using local simulation. Ensure a public bucket named 'healthcare-files' exists in Supabase.", storageErr);
                fileUrl = URL.createObjectURL(file);
            }

            const newPresc = {
                id: 'pr_self_' + Date.now(),
                appointmentId: null,
                patientId: db.data.currentUser,
                doctorId: null,
                doctor: 'Self-Uploaded',
                date: new Date().toISOString().split('T')[0],
                notes: 'Personal upload',
                medicines: [],
                file: fileUrl
            };

            db.data.prescriptions.push(newPresc);
            db.save();

            statusSpan.innerText = "Uploaded!";
            statusSpan.style.color = "hsl(var(--success-hsl))";
            
            this.openMyPrescriptions();
            event.target.value = '';

        } catch (err) {
            console.error("Prescription upload error:", err);
            statusSpan.innerText = "Failed.";
            statusSpan.style.color = "hsl(var(--danger-hsl))";
        }
    }

    openInsurance() {
        this.openModal('insuranceModal');
        this.renderInsurance();
    }

    renderInsurance() {
        const container = document.getElementById('insuranceModalContent');
        const patient = db.data.patients[db.data.currentUser];
        if (!patient) {
            container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted); text-align:center;">Please log in to view insurance coverage.</p>`;
            return;
        }

        const ins = patient.settings.insurance || null;
        container.innerHTML = '';

        if (ins) {
            // Render beautiful digital insurance card
            container.innerHTML += `
                <div class="card" style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 20px; border-radius: 16px; border: none; margin-bottom: 15px; position: relative; box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3); text-align: left;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                        <div>
                            <span style="font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; color: rgba(255,255,255,0.9);">Digital Health Coverage</span>
                            <h3 style="margin: 2px 0 0 0; font-size: 1.2rem; font-weight: 700; color: white; font-family: var(--font-heading);">${ins.provider}</h3>
                        </div>
                        <i class="fa-solid fa-shield-halved" style="font-size: 1.8rem; color: rgba(255,255,255,0.95);"></i>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <span style="font-size: 0.55rem; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.7; display: block; color: rgba(255,255,255,0.8);">Policy ID</span>
                        <span style="font-family: monospace; font-size: 1.1rem; letter-spacing: 1px; font-weight: 600;">${ins.policyId}</span>
                    </div>
                    <div style="display: flex; gap: 40px; font-size: 0.75rem;">
                        <div>
                            <span style="font-size: 0.55rem; text-transform: uppercase; opacity: 0.7; display: block; color: rgba(255,255,255,0.8);">Group No</span>
                            <span style="font-weight: 600;">${ins.groupNo || 'N/A'}</span>
                        </div>
                        <div>
                            <span style="font-size: 0.55rem; text-transform: uppercase; opacity: 0.7; display: block; color: rgba(255,255,255,0.8);">Expires</span>
                            <span style="font-weight: 600;">${ins.expiry}</span>
                        </div>
                    </div>
                    ${ins.document ? `
                        <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: space-between; font-size: 0.7rem;">
                            <span><i class="fa-solid fa-file-pdf"></i> Card Copy Attached</span>
                            <a href="${ins.document}" target="_blank" style="color: white; text-decoration: underline; font-weight: 600;">View File</a>
                        </div>
                    ` : ''}
                </div>
                <button class="btn btn-secondary" onclick="app.removeInsuranceCard()" style="margin-bottom: 20px; border: 1px solid hsl(var(--danger-hsl)); color: hsl(var(--danger-hsl)); background: transparent; cursor: pointer;">
                    <i class="fa-solid fa-trash-can"></i> Remove Insurance Details
                </button>
            `;
        } else {
            // Render placeholder + Import Trigger
            container.innerHTML += `
                <div class="card" style="margin-bottom: 20px; border: 1.5px dashed var(--border-color); background: rgba(255,255,255,0.01); text-align: center; padding: 25px 15px;">
                    <i class="fa-solid fa-shield-cat" style="font-size: 2.2rem; color: var(--text-muted); margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto;"></i>
                    <h4 style="margin: 0 0 5px 0; font-size: 0.95rem; font-family: var(--font-heading);">No Active Insurance Linked</h4>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 15px; line-height: 1.4;">
                        Link your health policy card details to automatically apply copay waivers and discounts when booking doctor appointments.
                    </p>
                    <button class="btn btn-primary" onclick="document.getElementById('insuranceFormArea').style.display='block'; this.style.display='none';" style="margin:0 auto; width:auto; padding: 8px 16px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
                        <i class="fa-solid fa-plus"></i> Import Insurance Details
                    </button>
                </div>
            `;
        }

        // Render Collapsible Import Form
        container.innerHTML += `
            <div id="insuranceFormArea" style="display: none; margin-bottom: 25px; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; text-align: left;">
                <h4 style="margin-top: 0; margin-bottom: 12px; font-size: 0.9rem; font-family: var(--font-heading);">Import Policy Details</h4>
                <form id="insuranceUploadForm" onsubmit="app.handleInsuranceSubmit(event)">
                    <div class="input-group">
                        <label class="input-label" for="insProvider">Insurance Provider</label>
                        <select id="insProvider" class="input-field" required>
                            <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
                            <option value="UnitedHealthcare">UnitedHealthcare</option>
                            <option value="Aetna">Aetna</option>
                            <option value="Cigna">Cigna</option>
                            <option value="Kaiser Permanente">Kaiser Permanente</option>
                            <option value="Humana">Humana</option>
                        </select>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="input-group">
                            <label class="input-label" for="insPolicyId">Policy ID</label>
                            <input type="text" id="insPolicyId" class="input-field" placeholder="e.g. BC-99421" required>
                        </div>
                        <div class="input-group">
                            <label class="input-label" for="insGroupNo">Group Number</label>
                            <input type="text" id="insGroupNo" class="input-field" placeholder="e.g. GR-7729">
                        </div>
                    </div>
                    <div class="input-group">
                        <label class="input-label" for="insExpiry">Expiration Date</label>
                        <input type="date" id="insExpiry" class="input-field" required>
                    </div>
                    <div class="input-group" style="margin-bottom: 15px;">
                        <label class="input-label">Upload Policy / Card Copy</label>
                        <div onclick="document.getElementById('insFileInput').click()" style="border: 2px dashed var(--border-color); border-radius: 8px; padding: 15px; text-align: center; cursor: pointer; background: rgba(255,255,255,0.02); transition: background 0.2s;">
                            <i class="fa-solid fa-cloud-arrow-up" style="color: var(--text-muted); font-size: 1.4rem; margin-bottom: 6px; display:block; margin-left:auto; margin-right:auto;"></i>
                            <span id="insFileStatus" style="font-size: 0.7rem; color: var(--text-secondary); display: block;">Tap to select PDF or Image</span>
                        </div>
                        <input type="file" id="insFileInput" onchange="app.handleInsuranceFileSelect(event)" style="display: none;" accept="image/*,application/pdf">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="btn btn-primary" style="margin: 0; flex: 1; cursor: pointer;">Save Details</button>
                        <button type="button" class="btn btn-secondary" onclick="app.renderInsurance()" style="margin: 0; flex: 1; border: 1px solid var(--border-color); background:transparent; cursor: pointer;">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        // Render Partner Policy Listings (If you don't have insurance, explore these)
        container.innerHTML += `
            <div style="border-top: 1px solid var(--border-color); padding-top: 20px; margin-top: 15px; text-align: left;">
                <h4 style="margin: 0 0 4px 0; font-size: 0.95rem; font-family: var(--font-heading); color: var(--text-primary);">Looking for Coverage?</h4>
                <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 15px; line-height: 1.35;">
                    Compare partner plans and get immediate digital approval for premium copay options.
                </p>
                
                <!-- Plan 1 -->
                <div class="card" style="margin-bottom: 12px; background: rgba(255,255,255,0.02); display: flex; flex-direction: column; gap: 10px; padding: 15px; border-radius: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h5 style="margin: 0; font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">BCBS Premium Shield</h5>
                            <p style="margin: 2px 0 0 0; font-size: 0.65rem; color: var(--text-muted);">Blue Cross Blue Shield Partner</p>
                        </div>
                        <span style="font-size: 0.85rem; font-weight: 700; color: hsl(var(--accent-hsl));">$120<span style="font-size: 0.6rem; font-weight: 500; color: var(--text-muted);">/mo</span></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.04); padding-top: 8px;">
                        <span><i class="fa-solid fa-circle-check" style="color:hsl(var(--accent-hsl));"></i> $15 Copay/visit</span>
                        <span><i class="fa-solid fa-circle-check" style="color:hsl(var(--accent-hsl));"></i> 90% Diagnostics</span>
                    </div>
                    <button class="btn btn-primary" onclick="app.applyForInsurance('BCBS Premium Shield')" style="margin: 0; padding: 6px; font-size: 0.75rem; background: rgba(20, 184, 166, 0.1); color: hsl(var(--accent-hsl)); border: none; font-weight: 600; cursor: pointer; width: 100%;">
                        Get Quote & Apply
                    </button>
                </div>

                <!-- Plan 2 -->
                <div class="card" style="margin-bottom: 12px; background: rgba(255,255,255,0.02); display: flex; flex-direction: column; gap: 10px; padding: 15px; border-radius: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h5 style="margin: 0; font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">UHC Family Core</h5>
                            <p style="margin: 2px 0 0 0; font-size: 0.65rem; color: var(--text-muted);">UnitedHealthcare Partner</p>
                        </div>
                        <span style="font-size: 0.85rem; font-weight: 700; color: hsl(var(--accent-hsl));">$190<span style="font-size: 0.6rem; font-weight: 500; color: var(--text-muted);">/mo</span></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.04); padding-top: 8px;">
                        <span><i class="fa-solid fa-circle-check" style="color:hsl(var(--accent-hsl));"></i> $25 Copay/visit</span>
                        <span><i class="fa-solid fa-circle-check" style="color:hsl(var(--accent-hsl));"></i> 100% Pediatric</span>
                    </div>
                    <button class="btn btn-primary" onclick="app.applyForInsurance('UHC Family Core')" style="margin: 0; padding: 6px; font-size: 0.75rem; background: rgba(20, 184, 166, 0.1); color: hsl(var(--accent-hsl)); border: none; font-weight: 600; cursor: pointer; width: 100%;">
                        Get Quote & Apply
                    </button>
                </div>

                <!-- Plan 3 -->
                <div class="card" style="margin-bottom: 12px; background: rgba(255,255,255,0.02); display: flex; flex-direction: column; gap: 10px; padding: 15px; border-radius: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h5 style="margin: 0; font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">Aetna Prime Health</h5>
                            <p style="margin: 2px 0 0 0; font-size: 0.65rem; color: var(--text-muted);">Aetna Insurance Partner</p>
                        </div>
                        <span style="font-size: 0.85rem; font-weight: 700; color: hsl(var(--accent-hsl));">$85<span style="font-size: 0.6rem; font-weight: 500; color: var(--text-muted);">/mo</span></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.04); padding-top: 8px;">
                        <span><i class="fa-solid fa-circle-check" style="color:hsl(var(--accent-hsl));"></i> $35 Copay/visit</span>
                        <span><i class="fa-solid fa-circle-check" style="color:hsl(var(--accent-hsl));"></i> 100% Telehealth</span>
                    </div>
                    <button class="btn btn-primary" onclick="app.applyForInsurance('Aetna Prime Health')" style="margin: 0; padding: 6px; font-size: 0.75rem; background: rgba(20, 184, 166, 0.1); color: hsl(var(--accent-hsl)); border: none; font-weight: 600; cursor: pointer; width: 100%;">
                        Get Quote & Apply
                    </button>
                </div>
            </div>
        `;
    }

    handleInsuranceFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const status = document.getElementById('insFileStatus');
            status.innerText = `${file.name} (${Math.round(file.size / 1024)} KB) Selected`;
            status.style.color = 'hsl(var(--success-hsl))';
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.uploadedInsuranceDoc = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    async handleInsuranceSubmit(e) {
        e.preventDefault();
        const provider = document.getElementById('insProvider').value;
        const policyId = document.getElementById('insPolicyId').value.trim();
        const groupNo = document.getElementById('insGroupNo').value.trim();
        const expiry = document.getElementById('insExpiry').value;
        
        const patient = db.data.patients[db.data.currentUser];
        if (!patient) return;

        if (!patient.settings) {
            patient.settings = {};
        }
        
        patient.settings.insurance = {
            provider,
            policyId,
            groupNo,
            expiry,
            document: this.uploadedInsuranceDoc || ""
        };
        
        db.save();
        await db.saveProfileToSupabase(patient);
        
        alert("Insurance card details successfully imported!");
        this.uploadedInsuranceDoc = "";
        this.renderInsurance();
    }

    async removeInsuranceCard() {
        if (!confirm("Are you sure you want to delete your linked insurance card?")) return;
        
        const patient = db.data.patients[db.data.currentUser];
        if (patient && patient.settings) {
            delete patient.settings.insurance;
            db.save();
            await db.saveProfileToSupabase(patient);
        }
        this.uploadedInsuranceDoc = "";
        alert("Insurance card successfully removed.");
        this.renderInsurance();
    }

    applyForInsurance(planName) {
        const patient = db.data.patients[db.data.currentUser];
        alert(`Application for ${planName} submitted successfully! Our insurance partners will reach out to you at ${patient ? patient.email : 'your email'} within 24 hours.`);
    }

    async openFamilyProfiles() {
        this.openModal('familyModal');
        const container = document.getElementById('familyModalContent');
        container.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted); text-align: center;">Loading family profiles...</p>`;

        const userId = db.data.currentUser;
        const members = await db.fetchFamilyMembersFromSupabase(userId);
        container.innerHTML = '';

        if (members.length === 0) {
            container.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted); text-align: center; margin-bottom: 20px;">No linked family members found.</p>`;
        } else {
            members.forEach(m => {
                const age = m.dob ? new Date().getFullYear() - new Date(m.dob).getFullYear() : 'N/A';
                const statusBadgeColor = m.status === 'approved' ? 'rgba(20, 184, 166, 0.1)' : 'rgba(245, 158, 11, 0.1)';
                const statusTextColor = m.status === 'approved' ? 'hsl(var(--accent-hsl))' : 'hsl(var(--warning-hsl, 35, 92%, 47%))';
                const statusLabel = m.status === 'approved' ? `Approved (${m.permission})` : 'Pending Approval';
                
                const onClickAttr = m.status === 'approved' ? `onclick="app.openFamilyMemberDetails('${m.id}')"` : '';
                const cursorStyle = m.status === 'approved' ? 'cursor: pointer;' : '';
                
                container.innerHTML += `
                    <div class="card" style="margin-bottom: 12px; ${cursorStyle}" ${onClickAttr}>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="font-size: 0.9rem;">${m.name} (${m.relation})</h4>
                                <p style="font-size: 0.75rem; color: var(--text-secondary);">Health ID: ${m.health_id} | Age: ${age}</p>
                            </div>
                            <span class="chip" style="background-color: ${statusBadgeColor}; color: ${statusTextColor}; border: none; font-size: 0.65rem;">
                                ${statusLabel}
                            </span>
                        </div>
                    </div>
                `;
            });
        }
        
        container.innerHTML += `
            <button class="btn btn-secondary" onclick="app.closeModal('familyModal'); app.openModal('addFamilyMemberModal');">
                <i class="fa-solid fa-user-plus"></i> Add Family Member
            </button>
        `;
    }

    async handleAddFamilyMember(e) {
        e.preventDefault();
        const healthId = document.getElementById('familyHealthId').value.trim();
        const relation = document.getElementById('familyRelation').value;
        const permission = document.getElementById('familyPermission').value;

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const origText = submitBtn.innerText;
        submitBtn.innerText = "Sending Request...";
        submitBtn.disabled = true;

        try {
            const res = await db.sendFamilyRequest(healthId, relation, permission);
            if (res.error) {
                alert(`Failed to add family member: ${res.error}`);
            } else {
                alert(`Family link request sent successfully to ${res.targetName}! They must approve this addition from their Notifications.`);
                document.getElementById('addFamilyMemberForm').reset();
                this.closeModal('addFamilyMemberModal');
                this.openFamilyProfiles();
            }
        } catch (err) {
            console.error(err);
            alert(`An unexpected error occurred: ${err.message}`);
        } finally {
            submitBtn.innerText = origText;
            submitBtn.disabled = false;
        }
    }

    async checkNotifications() {
        const userId = db.data.currentUser;
        if (!userId) return;

        try {
            const pending = await db.fetchPendingRequests(userId);
            const badge = document.getElementById('notifBadge');
            if (badge) {
                if (pending.length > 0) {
                    badge.style.display = 'block';
                } else {
                    badge.style.display = 'none';
                }
            }
        } catch (e) {
            console.error("Failed to check notifications:", e);
        }
    }

    async openFamilyMemberDetails(memberId) {
        const userId = db.data.currentUser;
        const members = await db.fetchFamilyMembersFromSupabase(userId);
        const member = members.find(m => m.id === memberId);
        
        if (!member) {
            alert("Family member details not found or not approved.");
            return;
        }

        this.openModal('familyMemberDetailsModal');
        const title = document.getElementById('familyMemberDetailsTitle');
        const container = document.getElementById('familyMemberDetailsContent');
        
        title.innerText = `${member.name}'s Health Records`;
        
        const chronicStr = member.medicalHistory.chronicDiseases.join(', ') || 'None';
        const allergyStr = member.medicalHistory.allergies.join(', ') || 'None';
        
        let medicinesHtml = '';
        if (member.medicalHistory.currentMedicines && member.medicalHistory.currentMedicines.length > 0) {
            member.medicalHistory.currentMedicines.forEach(med => {
                medicinesHtml += `
                    <div style="border-left: 2px solid hsl(var(--accent-hsl)); padding-left: 10px; margin-bottom: 8px;">
                        <strong style="font-size: 0.8rem; display: block;">${med.name} (${med.dose})</strong>
                        <span style="font-size: 0.7rem; color: var(--text-secondary); display: block;">${med.foodInstructions} | ${med.duration}</span>
                    </div>
                `;
            });
        } else {
            medicinesHtml = '<p style="font-size: 0.75rem; color: var(--text-muted);">No current medications.</p>';
        }

        container.innerHTML = `
            <div class="card" style="text-align: center; margin-bottom: 15px;">
                <h4 style="font-size: 0.9rem; margin-bottom: 2px;">Health ID: ${member.health_id}</h4>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 10px;">Relation: ${member.relation} (${member.permission === 'edit' ? 'Read/Write Access' : 'Read-Only Access'})</p>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; border-top: 1px solid var(--border-color); padding-top: 10px;">
                    <div>
                        <span style="font-size: 0.65rem; color: var(--text-muted); display: block;">Height</span>
                        <strong style="font-size: 0.8rem;">${member.height} cm</strong>
                    </div>
                    <div>
                        <span style="font-size: 0.65rem; color: var(--text-muted); display: block;">Weight</span>
                        <strong style="font-size: 0.8rem;">${member.weight} kg</strong>
                    </div>
                    <div>
                        <span style="font-size: 0.65rem; color: var(--text-muted); display: block;">BMI</span>
                        <strong style="font-size: 0.8rem; color: hsl(var(--accent-hsl));">${member.bmi}</strong>
                    </div>
                </div>
            </div>
            
            <h4 class="section-title" style="margin-top: 15px;">Clinical Bio Info</h4>
            <div class="card" style="margin-bottom: 15px;">
                <div class="detail-row">
                    <span class="detail-label">Blood Group:</span>
                    <span class="detail-value">${member.bloodGroup}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Chronic Conditions:</span>
                    <span class="detail-value">${chronicStr}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Allergies:</span>
                    <span class="detail-value">${allergyStr}</span>
                </div>
            </div>

            <h4 class="section-title">Active Medications</h4>
            <div class="card" style="margin-bottom: 15px;">
                ${medicinesHtml}
            </div>

            <h4 class="section-title">Lifestyle Habits</h4>
            <div class="card" style="margin-bottom: 15px;">
                <div class="detail-row">
                    <span class="detail-label">Smoking:</span>
                    <span class="detail-value">${member.lifestyle.smoking}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Alcohol:</span>
                    <span class="detail-value">${member.lifestyle.alcohol}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Exercise:</span>
                    <span class="detail-value">${member.lifestyle.exercise}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Sleep:</span>
                    <span class="detail-value">${member.lifestyle.sleep}</span>
                </div>
            </div>
        `;
    }

    openPayments() {
        this.openModal('paymentsLogModal');
        const container = document.getElementById('paymentsLogModalContent');
        container.innerHTML = '';

        const appointments = db.getAppointments(db.data.currentUser).filter(app => app.paymentStatus === 'Paid');
        if (appointments.length === 0) {
            container.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted); text-align: center;">No payment logs or invoice receipts available.</p>`;
            return;
        }

        appointments.forEach(a => {
            const doc = db.getDoctor(a.doctorId);
            container.innerHTML += `
                <div class="card" style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="font-size: 0.85rem;">Consultation Fee - ${doc.name}</h4>
                            <p style="font-size: 0.7rem; color: var(--text-muted);">${a.date} | Trans ID: TXN-${a.id}</p>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 700; font-size: 0.85rem; color: hsl(var(--success-hsl));">$${a.paymentAmount}</div>
                            <span class="section-link" onclick="alert('Downloading clinical invoice...')">Invoice</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    openAIChat() {
        alert("AI Assist feature is coming soon!");
    }

    // Directory Search engine
    toggleFilterPanel() {
        const panel = document.getElementById('filterPanel');
        panel.classList.toggle('open');
    }

    setupFilterChips() {
        const chips = document.querySelectorAll('.filter-chips .chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const filterGroup = chip.parentElement.dataset.filter;
                const value = chip.dataset.val;

                chip.classList.toggle('selected');

                if (chip.classList.contains('selected')) {
                    this.selectedFilters[filterGroup].push(value);
                } else {
                    this.selectedFilters[filterGroup] = this.selectedFilters[filterGroup].filter(val => val !== value);
                }
                
                this.handleSearch();
            });
        });
    }

    toggleSearchTab(tab) {
        this.searchTab = tab;
        const btnDoctors = document.getElementById('tabDoctors');
        const btnHospitals = document.getElementById('tabHospitals');

        if (tab === 'doctors') {
            btnDoctors.style.backgroundColor = "hsl(var(--primary-hsl))";
            btnDoctors.style.color = "white";
            btnDoctors.style.borderColor = "transparent";
            
            btnHospitals.style.backgroundColor = "var(--bg-tertiary)";
            btnHospitals.style.color = "var(--text-primary)";
            btnHospitals.style.borderColor = "var(--border-color)";
        } else {
            btnHospitals.style.backgroundColor = "hsl(var(--primary-hsl))";
            btnHospitals.style.color = "white";
            btnHospitals.style.borderColor = "transparent";
            
            btnDoctors.style.backgroundColor = "var(--bg-tertiary)";
            btnDoctors.style.color = "var(--text-primary)";
            btnDoctors.style.borderColor = "var(--border-color)";
        }

        this.handleSearch();
    }

    handleSearch() {
        const query = document.getElementById('directorySearchInput').value.toLowerCase();
        const container = document.getElementById('searchResultList');
        container.innerHTML = '';

        if (this.searchTab === 'doctors') {
            // Filter Doctors
            let doctors = Object.values(db.data.doctors).filter(d => d.status === 'approved' || !d.status);

            // Filter keyword matching Name, Specialty, Languages, and Awards
            if (query) {
                doctors = doctors.filter(d => 
                    d.name.toLowerCase().includes(query) || 
                    d.specialty.toLowerCase().includes(query) ||
                    d.languages.some(l => l.toLowerCase().includes(query)) ||
                    d.qualification.toLowerCase().includes(query)
                );
            }

            // Apply selected Filter Chips
            if (this.selectedFilters.consultType.length > 0) {
                doctors = doctors.filter(d => 
                    d.consultationTypes.some(type => this.selectedFilters.consultType.includes(type))
                );
            }
            if (this.selectedFilters.price.length > 0) {
                doctors = doctors.filter(d => 
                    this.selectedFilters.price.some(maxPrice => d.consultingFee <= parseInt(maxPrice))
                );
            }
            if (this.selectedFilters.language.length > 0) {
                doctors = doctors.filter(d => 
                    d.languages.some(lang => this.selectedFilters.language.includes(lang))
                );
            }

            if (doctors.length === 0) {
                container.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; margin-top: 20px;">No matching doctors found.</p>`;
                return;
            }

            doctors.forEach(d => {
                const hospital = db.getHospital(d.hospitalId);
                const hospitalName = hospital ? hospital.name : "Independent Clinic / Center";
                container.innerHTML += `
                    <div class="card" onclick="bookingFlow.startBookingWithDoctor('${d.id}')">
                        <div class="entity-card">
                            <img class="entity-image" src="${d.image}" alt="${d.name}">
                            <div class="entity-info">
                                <div class="entity-name">${d.name}</div>
                                <div class="entity-sub">${d.specialty} | ${d.qualification}</div>
                                <div class="entity-sub" style="font-weight: 500;">Hospital: ${hospitalName}</div>
                                <div class="entity-rating">
                                    <i class="fa-solid fa-star"></i> <span>${d.reviews.rating} (${d.reviews.count} reviews)</span>
                                </div>
                            </div>
                            <div class="entity-fee">
                                <div>$${d.consultingFee}</div>
                                <span style="font-size: 0.65rem; color: var(--text-muted); font-weight: normal;">Consult Fee</span>
                            </div>
                        </div>
                    </div>
                `;
            });

        } else {
            // Filter Hospitals
            let hospitals = Object.values(db.data.hospitals);

            if (query) {
                hospitals = hospitals.filter(h => 
                    h.name.toLowerCase().includes(query) || 
                    h.address.toLowerCase().includes(query) || 
                    h.departments.some(d => d.toLowerCase().includes(query))
                );
            }

            if (hospitals.length === 0) {
                container.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; margin-top: 20px;">No matching hospitals found.</p>`;
                return;
            }

            hospitals.forEach(h => {
                container.innerHTML += `
                    <div class="card">
                        <div class="entity-card" style="align-items: flex-start;">
                            <img class="entity-image" src="${h.image}" alt="${h.name}">
                            <div class="entity-info">
                                <div class="entity-name">${h.name}</div>
                                <div class="entity-sub">${h.address}</div>
                                <div style="font-size: 0.7rem; color: hsl(var(--danger-hsl)); font-weight: 600; margin-bottom: 4px;">
                                    <i class="fa-solid fa-truck-medical"></i> ICU: ${h.emergencyIcuStatus}
                                </div>
                                <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;">
                                    ${h.amenities.slice(0, 3).map(a => `<span class="chip" style="padding: 2px 6px; font-size: 0.6rem; background-color: var(--bg-tertiary);">${a}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    }

    async triggerNotification() {
        const notifBadge = document.getElementById('notifBadge');
        if (notifBadge) {
            notifBadge.style.display = 'none';
        }
        
        this.openModal('notificationsModal');
        const container = document.getElementById('notificationsModalContent');
        container.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted); text-align: center;">Loading notifications...</p>`;

        const userId = db.data.currentUser;
        const pending = await db.fetchPendingRequests(userId);
        container.innerHTML = '';

        if (pending.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <i class="fa-regular fa-bell-slash" style="font-size: 1.8rem; color: var(--text-muted); margin-bottom: 10px;"></i>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">No new notifications at this time.</p>
                </div>
            `;
            return;
        }

        pending.forEach(p => {
            container.innerHTML += `
                <div class="card" style="margin-bottom: 12px; border-left: 4px solid hsl(var(--accent-hsl));">
                    <div style="margin-bottom: 10px;">
                        <h4 style="font-size: 0.85rem; margin-bottom: 4px;">Family Request</h4>
                        <p style="font-size: 0.75rem; color: var(--text-secondary); text-align: left;">
                            <strong>${p.requesterName}</strong> (${p.requesterHealthId}) wants to add you to their family list as <strong>${p.relation}</strong> (Permission: ${p.permission === 'edit' ? 'Read & Edit' : 'Read Only'}).
                        </p>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-primary" onclick="app.handleFamilyResponse('${p.id}', true)" style="padding: 6px 12px; font-size: 0.75rem; margin: 0; flex: 1;">
                            Approve
                        </button>
                        <button class="btn btn-secondary" onclick="app.handleFamilyResponse('${p.id}', false)" style="padding: 6px 12px; font-size: 0.75rem; margin: 0; flex: 1; border: 1px solid hsl(var(--danger-hsl)); color: hsl(var(--danger-hsl)); background: transparent;">
                            Decline
                        </button>
                    </div>
                </div>
            `;
        });
    }

    async handleFamilyResponse(requestId, approve) {
        const res = await db.respondToFamilyRequest(requestId, approve);
        if (res.error) {
            alert(`Failed: ${res.error}`);
        } else {
            alert(approve ? "Request approved successfully!" : "Request declined.");
            this.triggerNotification();
            this.checkNotifications();
        }
    }

    simulateRoomAlert() {
        // Mock a push notification trigger that room is ready or queue advanced
        const user = db.getCurrentUser();
        const activeApps = db.getAppointments(user.id).filter(app => app.checkInStatus === 'Checked In' && app.status !== 'Completed');
        
        if (activeApps.length === 0) {
            alert("No checked-in active appointment to queue-simulate.");
            return;
        }

        const app = activeApps[0];
        
        if (app.queue.position > 1) {
            // Decrement position
            app.queue.position -= 1;
            app.queue.estWaitTime = Math.max(0, app.queue.estWaitTime - 10);
            app.queue.currentSpeaker = `T-80${5 - app.queue.position}`;
            db.updateAppointmentStatus(app.id, 'Upcoming', 'Checked In', app.queue);
            
            // Re-render
            this.renderHomeDashboard();
            if (this.currentScreen === 'queue-screen') {
                bookingFlow.syncQueueScreen(app);
            }
            alert(`Queue advanced! Your new position is #${app.queue.position}. Estimated wait: ${app.queue.estWaitTime} mins.`);
        } else if (app.queue.position === 1) {
            // Next up
            app.queue.position = 0;
            app.queue.estWaitTime = 0;
            app.queue.delay = 0;
            app.queue.currentSpeaker = app.visitToken;
            db.updateAppointmentStatus(app.id, 'Upcoming', 'Checked In', app.queue);
            
            this.renderHomeDashboard();
            if (this.currentScreen === 'queue-screen') {
                bookingFlow.syncQueueScreen(app);
            }
            
            // Ring buzzer notification
            const notifBadge = document.getElementById('notifBadge');
            if (notifBadge) notifBadge.style.display = 'block';

            alert(`🛎️ BUZZER NOTIFICATION: Visit Token ${app.visitToken} is being called! Please proceed immediately to Doctor Room ${app.queue.room}.`);
        } else {
            alert(`You are already being called to Room ${app.queue.room}. Go ahead and launch Doctor Portal simulation below.`);
        }
    }
}

const app = new HealthcareApp();
window.app = app; // Export to global scope
