// ==========================================
// Mock Database (Doctors & Hospitals)
// ==========================================
const mockDoctors = [
    {
        id: "doc-1",
        name: "Dr. Aaron Smith",
        specialty: "Cardiology",
        qualification: "MD, FACC (Harvard Medical)",
        experience: 15,
        rating: 4.8,
        reviewsCount: 142,
        fees: 120,
        hospital: "Valley Care General Hospital",
        languages: ["English", "Spanish"],
        types: ["In-Person", "Online"],
        insurance: ["blue-cross", "united-health", "aetna"],
        availableToday: true,
        awards: "Top Cardiologist Bay Area (2024)",
        slots: ["09:00 AM", "10:30 AM", "11:15 AM", "02:00 PM", "04:30 PM"],
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200"
    },
    {
        id: "doc-2",
        name: "Dr. Beatrice Vance",
        specialty: "Pediatrics",
        qualification: "MD, FAAP (Stanford Medicine)",
        experience: 8,
        rating: 4.9,
        reviewsCount: 96,
        fees: 90,
        hospital: "Oakridge Medical Center",
        languages: ["English", "Mandarin"],
        types: ["In-Person"],
        insurance: ["blue-cross", "aetna", "cigna"],
        availableToday: true,
        awards: "Outstanding Pediatric Service Award",
        slots: ["08:30 AM", "10:00 AM", "01:30 PM", "03:45 PM"],
        image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200"
    },
    {
        id: "doc-3",
        name: "Dr. Carlos Mendez",
        specialty: "Neurology",
        qualification: "MD, PhD (Johns Hopkins)",
        experience: 22,
        rating: 4.7,
        reviewsCount: 210,
        fees: 200,
        hospital: "Valley Care General Hospital",
        languages: ["English", "Spanish", "Portuguese"],
        types: ["In-Person", "Online"],
        insurance: ["united-health", "cigna"],
        availableToday: false,
        awards: "Distinguished Neuroscientist of the Year",
        slots: ["11:00 AM", "03:00 PM"],
        image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200"
    },
    {
        id: "doc-4",
        name: "Dr. Diana Chen",
        specialty: "General Medicine",
        qualification: "MD (UCSF Medical School)",
        experience: 5,
        rating: 4.6,
        reviewsCount: 54,
        fees: 60,
        hospital: "Downtown Health Clinic",
        languages: ["English", "Hindi"],
        types: ["Online"],
        insurance: ["blue-cross", "united-health", "aetna", "cigna"],
        availableToday: true,
        awards: "UCSF Resident of Excellence",
        slots: ["09:30 AM", "11:30 AM", "02:30 PM", "04:00 PM"],
        image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=200"
    }
];

const mockHospitals = [
    {
        id: "hosp-1",
        name: "Valley Care General Hospital",
        address: "100 Medical Plaza, Suite 300, San Jose, CA",
        rating: 4.7,
        reviewsCount: 420,
        departments: ["Cardiology", "Neurology", "Emergency ER", "Orthopedics", "ICU"],
        ambulance: true,
        parking: true,
        wheelchair: true,
        insurancePartners: ["Blue Cross Blue Shield", "UnitedHealthcare", "Aetna", "Cigna"],
        image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "hosp-2",
        name: "Oakridge Medical Center",
        address: "450 Blossom Hill Road, Los Gatos, CA",
        rating: 4.6,
        reviewsCount: 180,
        departments: ["Pediatrics", "Family Medicine", "Lab Diagnostic", "Pharmacy"],
        ambulance: true,
        parking: true,
        wheelchair: true,
        insurancePartners: ["Blue Cross Blue Shield", "Aetna", "Cigna"],
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: "hosp-3",
        name: "Downtown Health Clinic",
        address: "12 S 1st St, San Jose, CA",
        rating: 4.2,
        reviewsCount: 78,
        departments: ["General Outpatient", "Pharmacy"],
        ambulance: false,
        parking: false,
        wheelchair: true,
        insurancePartners: ["Blue Cross", "UnitedHealthcare", "Aetna", "Cigna"],
        image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=300"
    }
];

// ==========================================
// Application State
// ==========================================
let currentUser = {
    name: "Sarah Jenkins",
    dob: "1992-06-12",
    gender: "Female",
    blood: "A+",
    height: 168,
    weight: 62,
    phone: "+1 (555) 432-1098",
    email: "sarah.j@medpulse.io",
    address: "425 Silicon Valley Drive, Apt 4B, San Jose, CA",
    emergency: "Mark Jenkins (Husband) - +1 (555) 765-4321",
    language: "English",
    organDonor: true,
    allergies: "Penicillin",
    chronic: "Mild Hypertension",
    surgeries: "Appendectomy (2018)",
    meds: "Atorvastatin 20mg, Amlodipine 5mg",
    smoking: "Non-Smoker",
    alcohol: "Social/Occasional",
    exercise: "Moderate (3x/week)",
    sleep: "6-8 Hours"
};

let familyMembers = [
    { name: "Martha Jenkins", relation: "Mother", age: 68, blood: "A-", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150" },
    { name: "Mark Jenkins", relation: "Spouse", age: 36, blood: "O+", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" },
    { name: "Tommy Jenkins", relation: "Child", age: 8, blood: "A+", img: "https://images.unsplash.com/photo-1517677129300-27b2ae47309a?auto=format&fit=crop&q=80&w=150" }
];

let appointmentsList = [
    {
        id: "MP-APT-4920",
        patientName: "Sarah Jenkins",
        doctor: mockDoctors[0], // Dr. Aaron Smith
        date: "2026-07-20",
        time: "04:30 PM",
        format: "In-Person",
        symptoms: "Occasional chest pressure, mild shortness of breath during light workouts",
        insurance: "Blue Cross Blue Shield",
        fee: 15.00,
        token: "MP-TK-1290",
        checkedIn: false
    }
];

let selectedDoctorForBooking = mockDoctors[0]; // default
let currentBookingStep = 1;
let bookingFormData = {};

// Queue standings state
let queueStandings = [
    { token: "MP-TK-1045", name: "David K.", status: "In Consultation", isSelf: false },
    { token: "MP-TK-1122", name: "Elena R.", status: "Waiting (Next)", isSelf: false },
    { token: "MP-TK-1205", name: "Frank L.", status: "Waiting", isSelf: false },
    { token: "MP-TK-1290", name: "Sarah Jenkins", status: "Checked In", isSelf: true } // Match token of default appt
];
let activeQueuePosition = 3; // patients ahead of user

// Signature Pad Canvas state
let isDrawing = false;
let sigCanvas, sigCtx;

// Consultation room video call simulation states
let consultTimerInterval = null;
let consultSeconds = 0;

// Daily Tips List
const healthTips = [
    "Staying hydrated supports cardiovascular efficiency. Aim to drink at least 2.5 liters of water daily.",
    "A low-sodium diet (under 2,000mg/day) drastically improves blood pressure management.",
    "Regular aerobic exercise like fast walking for 30 minutes lowers LDL cholesterol levels.",
    "Getting at least 7-8 hours of quality sleep decreases morning stress hormone surges."
];
let currentTipIndex = 0;

// ==========================================
// App Initialization
// ==========================================
window.addEventListener("DOMContentLoaded", () => {
    // Update phone time mockup
    function updatePhoneTime() {
        const timeEl = document.getElementById("phone-time");
        if (!timeEl) return;
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        minutes = minutes < 10 ? '0' + minutes : minutes;
        timeEl.innerText = `${hours}:${minutes} ${ampm}`;
    }
    setInterval(updatePhoneTime, 1000);
    updatePhoneTime();

    // 1. Splash Screen Loader Timer
    setTimeout(() => {
        const splash = document.getElementById("splash-screen");
        if (splash) splash.style.display = "none";
        
        const welcome = document.getElementById("welcome-card");
        if (welcome) welcome.style.display = "flex";
    }, 2500);

    // 2. Setup Signature Canvas
    initSignatureCanvas();

    // 3. Render initial views/components
    calculateBMI();
    renderDirectory(mockDoctors, mockHospitals);
    renderQueueStandings();
    updateDashboardWidgets();

    // 4. Daily health tip rotater
    setInterval(() => {
        currentTipIndex = (currentTipIndex + 1) % healthTips.length;
        document.getElementById("daily-tip-text").innerText = `"${healthTips[currentTipIndex]}"`;
    }, 15000);
});

// ==========================================
// Authentication Logic
// ==========================================
function showAuthCard(cardId) {
    const cards = document.querySelectorAll(".auth-card");
    cards.forEach(c => c.classList.remove("active"));
    document.getElementById(cardId).classList.add("active");
}

function handleEmailLogin(event) {
    event.preventDefault();
    completeLogin();
}

function handleSignup(event) {
    event.preventDefault();
    const nameInput = document.getElementById("signup-name").value;
    const emailInput = document.getElementById("signup-email").value;
    currentUser.name = nameInput;
    currentUser.email = emailInput;
    
    // update forms
    document.getElementById("prof-name").value = nameInput;
    document.getElementById("prof-email").value = emailInput;
    document.getElementById("sidebar-username").innerText = nameInput;
    
    completeLogin();
}

function sendOTP() {
    const phoneInput = document.getElementById("otp-phone").value;
    document.getElementById("otp-desc").innerText = `Code sent to ${phoneInput}. Enter 1-2-3-4.`;
    document.getElementById("otp-phone-input-sec").style.display = "none";
    document.getElementById("otp-code-input-sec").style.display = "block";
}

function moveOtpFocus(current, nextFieldId) {
    if (current.value.length >= 1) {
        document.getElementById(nextFieldId).focus();
    }
}

function verifyOTP() {
    const code = document.getElementById("otp1").value + 
                 document.getElementById("otp2").value + 
                 document.getElementById("otp3").value + 
                 document.getElementById("otp4").value;
    if (code === "1234") {
        completeLogin();
    } else {
        alert("Incorrect verification code. Please enter 1-2-3-4 for demo simulation.");
    }
}

function handleForgotPassword(event) {
    event.preventDefault();
    alert("Verification reset link has been dispatched to your email address!");
    showAuthCard("login-card");
}

function simulateBiometric(type) {
    alert(`Scanning ${type}... Authentication Successful!`);
    completeLogin();
}

function simulateSocialLogin(provider) {
    alert(`Connecting secure gateway to ${provider}... Authentication Successful!`);
    completeLogin();
}

function completeLogin() {
    // Fade out auth layer
    const authLayer = document.getElementById("auth-layer");
    authLayer.style.transition = "opacity 0.5s ease";
    authLayer.style.opacity = "0";
    setTimeout(() => {
        authLayer.style.display = "none";
        // initialize score gauge
        setHealthScoreGauge(84);
    }, 500);
}

function handleLogout() {
    if (confirm("Are you sure you want to log out?")) {
        // Reset auth fields
        document.getElementById("otp-code-input-sec").style.display = "none";
        document.getElementById("otp-phone-input-sec").style.display = "block";
        document.getElementById("otp1").value = "";
        document.getElementById("otp2").value = "";
        document.getElementById("otp3").value = "";
        document.getElementById("otp4").value = "";
        
        // Show Welcome card
        const authLayer = document.getElementById("auth-layer");
        authLayer.style.display = "flex";
        authLayer.style.opacity = "1";
        showAuthCard("welcome-card");
    }
}

// ==========================================
// Layout / Theme Logic
// ==========================================
function switchView(viewName) {
    // Hide all view-sections
    const sections = document.querySelectorAll(".view-section");
    sections.forEach(s => {
        s.classList.remove("active");
    });
    
    // De-activate all bottom tab bar buttons
    const tabItems = document.querySelectorAll(".tab-item");
    tabItems.forEach(t => t.classList.remove("active"));

    // Activate corresponding view
    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
        targetSection.classList.add("active");
    }
    
    // Map viewName back to bottom tabs
    const tabMapping = {
        'dashboard': 'tab-dashboard',
        'search': 'tab-search',
        'doctor-profile': 'tab-search',
        'hospital-profile': 'tab-search',
        'booking': 'tab-search',
        'check-in': 'tab-check-in',
        'queue': 'tab-queue',
        'consultation': 'tab-queue',
        'prescription': 'tab-queue',
        'profile': 'tab-profile',
        'family': 'tab-profile'
    };

    const targetTabId = tabMapping[viewName];
    if (targetTabId) {
        const tabEl = document.getElementById(targetTabId);
        if (tabEl) tabEl.classList.add("active");
    }

    // Set page title
    const titles = {
        'dashboard': 'MedPulse Home',
        'profile': 'My Medical Profile',
        'family': 'Family Profiles',
        'search': 'Find Care Provider',
        'doctor-profile': 'Doctor Details',
        'hospital-profile': 'Hospital Details',
        'booking': 'Booking Appointment',
        'check-in': 'Clinic Check-in',
        'queue': 'Live Waiting Queue',
        'consultation': 'Telehealth Consult',
        'prescription': 'Digital Rx'
    };
    document.getElementById("page-title").innerText = titles[viewName] || 'MedPulse';

    // Scroll to top
    document.querySelector(".view-container").scrollTop = 0;
}

function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById("theme-icon");
    if (html.getAttribute("data-theme") === "dark") {
        html.setAttribute("data-theme", "light");
        icon.className = "fa-solid fa-sun";
    } else {
        html.setAttribute("data-theme", "dark");
        icon.className = "fa-solid fa-moon";
    }
}

// ==========================================
// Dashboard Widgets Logic
// ==========================================
function toggleCheckItem(element) {
    element.classList.toggle("checked");
    const checkbox = element.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
}

function setHealthScoreGauge(score) {
    const dashGauge = document.getElementById("dash-health-gauge");
    if (dashGauge) {
        // Circumference is 2*pi*r = 2 * 3.14159 * 45 = 282.7
        const circ = 283;
        const offset = circ - (score / 100) * circ;
        dashGauge.style.strokeDashoffset = offset;
    }
}

function updateDashboardWidgets() {
    // Update upcoming appointment widget
    const upcoming = appointmentsList.find(a => !a.checkedIn);
    const widgetTime = document.getElementById("dash-upcoming-time");
    const widgetDoc = document.getElementById("dash-upcoming-doc");

    if (upcoming) {
        widgetTime.innerText = `${upcoming.date === "2026-07-20" ? "Today" : upcoming.date}, ${upcoming.time}`;
        widgetDoc.innerText = `${upcoming.doctor.name} (${upcoming.doctor.specialty})`;
    } else {
        widgetTime.innerText = "No Upcoming Visits";
        widgetDoc.innerText = "Search the directory to schedule one";
    }

    // Update queue widget status
    const queueWidgetVal = document.getElementById("dash-queue-pos");
    const activeAppt = appointmentsList.find(a => a.checkedIn);
    
    if (activeAppt) {
        if (activeQueuePosition === 0) {
            queueWidgetVal.innerText = "It's your turn! Go to Room";
        } else {
            queueWidgetVal.innerText = `Token #${activeAppt.token.split('-')[2]} (${activeQueuePosition} ahead)`;
        }
    } else {
        queueWidgetVal.innerText = "Not checked in at clinic";
    }
}

function simulateReportDownload(name = "Lab Report") {
    alert(`Downloading ${name}_Sarah_Jenkins.pdf (Mock Secure Vault Download)... Completed!`);
}

function simulateBillPayment() {
    const amount = prompt("Enter billing invoice amount or pay standard outstanding balance of $35.00. Click OK to settle via digital card portal.", "$35.00");
    if (amount) {
        alert(`Payment of ${amount} cleared! Transaction ID: TX-${Math.floor(Math.random()*1000000)}. Receipt dispatched to email.`);
    }
}

function showInsuranceAlert() {
    alert("Insurance Provider: Blue Cross Blue Shield\nStatus: Active\nCoverage Group: Standard Co-Pay Network\nIndividual Deductible: $1500 / $1200 met.");
}

// ==========================================
// Patient Profile Logic
// ==========================================
function calculateBMI() {
    const height = parseFloat(document.getElementById("prof-height").value) / 100; // cm to m
    const weight = parseFloat(document.getElementById("prof-weight").value);
    
    if (height > 0 && weight > 0) {
        const bmi = (weight / (height * height)).toFixed(1);
        document.getElementById("profile-bmi-val").innerText = bmi;
        
        const badge = document.getElementById("profile-bmi-status");
        if (bmi < 18.5) {
            badge.innerText = "Underweight";
            badge.style.color = "var(--warning)";
        } else if (bmi >= 18.5 && bmi < 25) {
            badge.innerText = "Healthy BMI";
            badge.style.color = "var(--success)";
        } else if (bmi >= 25 && bmi < 30) {
            badge.innerText = "Overweight";
            badge.style.color = "var(--warning)";
        } else {
            badge.innerText = "Obese Range";
            badge.style.color = "var(--danger)";
        }
    }
}

function selectLifestyleChip(element) {
    const parent = element.parentElement;
    const chips = parent.querySelectorAll(".chip-option");
    chips.forEach(c => c.classList.remove("active"));
    element.classList.add("active");
}

function savePatientProfile(event) {
    event.preventDefault();
    currentUser.name = document.getElementById("prof-name").value;
    currentUser.dob = document.getElementById("prof-dob").value;
    currentUser.gender = document.getElementById("prof-gender").value;
    currentUser.blood = document.getElementById("prof-blood").value;
    currentUser.height = parseInt(document.getElementById("prof-height").value);
    currentUser.weight = parseInt(document.getElementById("prof-weight").value);
    currentUser.phone = document.getElementById("prof-phone").value;
    currentUser.email = document.getElementById("prof-email").value;
    currentUser.address = document.getElementById("prof-address").value;
    currentUser.emergency = document.getElementById("prof-emergency").value;
    currentUser.language = document.getElementById("prof-language").value;
    currentUser.organDonor = document.getElementById("prof-organ").checked;
    currentUser.allergies = document.getElementById("prof-allergies").value;
    currentUser.chronic = document.getElementById("prof-chronic").value;
    currentUser.surgeries = document.getElementById("prof-surgeries").value;
    currentUser.meds = document.getElementById("prof-meds").value;

    currentUser.smoking = document.querySelector("#life-smoking .chip-option.active").innerText;
    currentUser.alcohol = document.querySelector("#life-alcohol .chip-option.active").innerText;
    currentUser.exercise = document.querySelector("#life-exercise .chip-option.active").innerText;
    currentUser.sleep = document.querySelector("#life-sleep .chip-option.active").innerText;

    // Update UI elements
    document.getElementById("sidebar-username").innerText = currentUser.name;
    document.getElementById("rx-pat-name").innerText = currentUser.name;
    document.getElementById("rx-pat-age").innerText = `${calculateAge(currentUser.dob)} / ${currentUser.gender}`;
    
    alert("Profile saved successfully!");
    switchView("dashboard");
}

function triggerMockPhotoUpload() {
    const urls = [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
    ];
    const randUrl = urls[Math.floor(Math.random() * urls.length)];
    document.getElementById("profile-avatar-preview").src = randUrl;
    document.getElementById("sidebar-avatar").src = randUrl;
    alert("New profile photo set successfully!");
}

function calculateAge(dobString) {
    const birthday = new Date(dobString);
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// ==========================================
// Family Profiles Logic
// ==========================================
function openAddFamilyModal() {
    document.getElementById("modal-add-family").style.display = "flex";
}

function closeAddFamilyModal() {
    document.getElementById("modal-add-family").style.display = "none";
}

function handleAddFamilySubmit(event) {
    event.preventDefault();
    const name = document.getElementById("fam-name").value;
    const relation = document.getElementById("fam-relation").value;
    const dob = document.getElementById("fam-dob").value;
    const blood = document.getElementById("fam-blood").value;
    const history = document.getElementById("fam-history").value;
    
    const age = calculateAge(dob);
    
    // Choose random avatar based on gender/relation
    let avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
    if (relation === "Child") {
        avatarUrl = "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80&w=150";
    } else if (relation === "Parent") {
        avatarUrl = "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=150";
    }

    familyMembers.push({ name, relation, age, blood, img: avatarUrl, history });
    renderFamilyMembers();
    closeAddFamilyModal();
    alert(`${name} has been added successfully to your Family Dashboard!`);
}

function renderFamilyMembers() {
    const container = document.getElementById("family-members-container");
    // clear except add new card
    container.innerHTML = "";

    familyMembers.forEach(member => {
        const card = document.createElement("div");
        card.className = "family-card";
        card.innerHTML = `
            <img src="${member.img}" alt="${member.name}" class="family-member-avatar">
            <div class="family-member-name">${member.name}</div>
            <div class="family-member-relation">${member.relation}</div>
            <div class="family-member-meta">Age: ${member.age} • ${member.blood} Blood</div>
            <div class="family-card-actions">
                <button class="btn btn-secondary" style="padding:6px 12px; font-size:0.8rem;" onclick="bookForFamilyMember('${member.name}', '${member.relation}')">Book For ${member.relation}</button>
                <button class="btn btn-secondary" style="padding:6px; width:30px; height:30px;" title="Medical Records Permission" onclick="alert('Viewing records for ${member.name}. History: ${member.history || 'No chronic history records'}')">
                    <i class="fa-solid fa-file-medical"></i>
                </button>
            </div>
        `;
        container.appendChild(card);
    });

    // append add-card back
    const addCard = document.createElement("div");
    addCard.className = "family-card add-member-card";
    addCard.onclick = openAddFamilyModal;
    addCard.innerHTML = `
        <i class="fa-solid fa-circle-plus"></i>
        <div class="family-member-name">Add New Profile</div>
        <div style="font-size:0.8rem; color:var(--text-muted)">Dependents & Elderly</div>
    `;
    container.appendChild(addCard);
}

function bookForFamilyMember(name, relation) {
    selectedDoctorForBooking = mockDoctors[0]; // default
    switchView("booking");
    
    const selectEl = document.getElementById("booking-patient-select");
    // check if option already exists, if not add it
    let exists = Array.from(selectEl.options).some(opt => opt.value === name);
    if (!exists) {
        const opt = document.createElement("option");
        opt.value = name;
        opt.text = `${relation} (${name})`;
        selectEl.add(opt);
    }
    selectEl.value = name;
}

// ==========================================
// Search Directory Logic
// ==========================================
function renderDirectory(doctors, hospitals) {
    const container = document.getElementById("directory-results-container");
    container.innerHTML = "";

    // Render Doctors
    doctors.forEach(doc => {
        const card = document.createElement("div");
        card.className = "directory-card";
        card.onclick = () => showDoctorProfile(doc.id);
        card.innerHTML = `
            <img src="${doc.image}" alt="${doc.name}" class="directory-img">
            <div class="directory-details">
                <div class="directory-title-row">
                    <div>
                        <div class="directory-name">${doc.name}</div>
                        <div class="directory-sub">${doc.specialty} • ${doc.qualification}</div>
                    </div>
                    <div class="directory-rating">
                        <i class="fa-solid fa-star"></i> ${doc.rating}
                    </div>
                </div>
                <div class="directory-meta-row">
                    <div class="directory-meta-item"><i class="fa-solid fa-building-medical"></i> ${doc.hospital}</div>
                    <div class="directory-meta-item"><i class="fa-solid fa-wallet"></i> $${doc.fees} Consultation</div>
                    <div class="directory-meta-item"><i class="fa-solid fa-user-clock"></i> ${doc.experience} Years Exp</div>
                </div>
                <div class="directory-badges">
                    <span class="badge ${doc.availableToday ? 'badge-success' : ''}">${doc.availableToday ? 'Available Today' : 'Next: Tomorrow'}</span>
                    ${doc.types.map(t => `<span class="badge">${t}</span>`).join('')}
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Render Hospitals
    hospitals.forEach(hosp => {
        const card = document.createElement("div");
        card.className = "directory-card";
        card.onclick = () => showHospitalProfile(hosp.id);
        card.innerHTML = `
            <img src="${hosp.image}" alt="${hosp.name}" class="directory-img">
            <div class="directory-details">
                <div class="directory-title-row">
                    <div>
                        <div class="directory-name">${hosp.name}</div>
                        <div class="directory-sub">${hosp.address}</div>
                    </div>
                    <div class="directory-rating" style="background:rgba(99,102,241,0.15); color:var(--secondary)">
                        <i class="fa-solid fa-hospital"></i> Medical Facility
                    </div>
                </div>
                <div class="directory-meta-row">
                    <div class="directory-meta-item"><i class="fa-solid fa-layer-group"></i> ${hosp.departments.slice(0, 3).join(', ')}...</div>
                    <div class="directory-meta-item"><i class="fa-solid fa-square-parking"></i> Parking: Yes</div>
                </div>
                <div class="directory-badges">
                    ${hosp.ambulance ? '<span class="badge badge-emergency">24/7 Ambulance</span>' : ''}
                    ${hosp.wheelchair ? '<span class="badge">Wheelchair Access</span>' : ''}
                    <span class="badge">Accepted Insurance: ${hosp.insurancePartners.length} Partners</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    if (doctors.length === 0 && hospitals.length === 0) {
        container.innerHTML = `
            <div class="card-section" style="text-align:center; padding:40px; color:var(--text-muted)">
                <i class="fa-solid fa-folder-open" style="font-size:3rem; margin-bottom:12px;"></i>
                <p>No providers or medical clinics matched your search query/filters.</p>
            </div>
        `;
    }
}

function filterDirectory() {
    const query = document.getElementById("directory-search-input").value.toLowerCase();
    
    // Rating filter from chip/select dropdown
    const ratingEl = document.getElementById("filt-rating");
    const ratingChip = document.getElementById("chip-rating");
    const ratingFilt = ratingEl && ratingChip && ratingChip.classList.contains("active") ? parseFloat(ratingEl.value) : 0;
    
    // Price filter from chip/slider
    const priceChip = document.getElementById("chip-price");
    const priceValText = document.getElementById("price-val") ? document.getElementById("price-val").innerText : "$300";
    const maxFee = priceChip && priceChip.classList.contains("active") ? parseInt(priceValText.replace('$', '')) : 300;
    
    // Today filter from chip
    const todayChip = document.getElementById("chip-today");
    const todayFilt = todayChip ? todayChip.classList.contains("active") : false;

    // Filter Doctors
    const filteredDocs = mockDoctors.filter(doc => {
        // Query match
        const matchesQuery = doc.name.toLowerCase().includes(query) || 
                             doc.specialty.toLowerCase().includes(query) || 
                             doc.hospital.toLowerCase().includes(query) ||
                             doc.qualification.toLowerCase().includes(query);
                             
        // Rating match
        const matchesRating = doc.rating >= ratingFilt;
        
        // Fees match
        const matchesFees = doc.fees <= maxFee;
        
        // Today match
        const matchesToday = !todayFilt || doc.availableToday;

        return matchesQuery && matchesRating && matchesFees && matchesToday;
    });

    // Filter Hospitals
    const filteredHosps = mockHospitals.filter(hosp => {
        const matchesQuery = hosp.name.toLowerCase().includes(query) || 
                             hosp.address.toLowerCase().includes(query) || 
                             hosp.departments.some(d => d.toLowerCase().includes(query));
        
        return matchesQuery;
    });

    renderDirectory(filteredDocs, filteredHosps);
}

// ==========================================
// Doctor Profile Detail View
// ==========================================
function showDoctorProfile(docId) {
    const doc = mockDoctors.find(d => d.id === docId);
    if (!doc) return;

    selectedDoctorForBooking = doc;
    const content = document.getElementById("doctor-profile-content");
    content.innerHTML = `
        <div class="detail-main">
            <div class="card-section" style="display:flex; gap:24px; align-items:center;">
                <img src="${doc.image}" alt="${doc.name}" style="width:120px; height:120px; border-radius:50%; object-fit:cover; border:3px solid var(--primary);">
                <div>
                    <h2 style="font-size:1.8rem;">${doc.name}</h2>
                    <p style="color:var(--primary); font-weight:700; margin-top:4px;">${doc.specialty} • ${doc.qualification}</p>
                    <p style="color:var(--text-secondary); font-size:0.9rem; margin-top:4px;"><i class="fa-solid fa-hospital"></i> Clinic: ${doc.hospital}</p>
                    <div style="display:flex; gap:16px; margin-top:10px; font-size:0.85rem;">
                        <span><i class="fa-solid fa-star" style="color:var(--warning)"></i> <strong>${doc.rating}</strong> (${doc.reviewsCount} Reviews)</span>
                        <span><i class="fa-solid fa-briefcase"></i> <strong>${doc.experience} Years</strong> Experience</span>
                    </div>
                </div>
            </div>

            <div class="card-section">
                <h3 class="section-title" style="margin-bottom:12px;">Doctor Biography</h3>
                <p style="color:var(--text-secondary); font-size:0.95rem; line-height:1.6;">
                    ${doc.name} is a leading expert in ${doc.specialty} with over ${doc.experience} years of clinical research and practice. Specializing in advanced diagnostics, personalized therapy management, and digital health consultation. Winner of the prestigious "${doc.awards}".
                </p>
            </div>

            <div class="card-section">
                <h3 class="section-title" style="margin-bottom:12px;">Reviews</h3>
                <div class="reviews-list">
                    <div class="review-card">
                        <div class="review-header">
                            <span class="reviewer-name">Jane D.</span>
                            <span style="color:var(--warning); font-size:0.8rem;">★★★★★</span>
                        </div>
                        <p class="review-content">${doc.name} was incredibly thorough during my consultation. Took the time to detail my results and outline adjustments to medications.</p>
                    </div>
                    <div class="review-card">
                        <div class="review-header">
                            <span class="reviewer-name">Robert H.</span>
                            <span style="color:var(--warning); font-size:0.8rem;">★★★★☆</span>
                        </div>
                        <p class="review-content">Excellent telehealth experience. Very professional and the prescription integration worked instantly at my pharmacy.</p>
                    </div>
                </div>
            </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:24px;">
            <div class="card-section">
                <h3 class="section-title">Schedule Appointment</h3>
                <p style="color:var(--text-secondary); font-size:0.85rem; margin-top:4px;">Consultation Fee: $${doc.fees}</p>
                
                <div class="form-group" style="margin-top:15px;">
                    <label>Select Available Slots</label>
                    <div class="slots-grid">
                        ${doc.slots.map(s => `<div class="slot-item" onclick="selectSlotAndNav('${s}')">${s}</div>`).join('')}
                    </div>
                </div>
            </div>

            <div class="card-section" style="font-size:0.85rem; display:flex; flex-direction:column; gap:10px;">
                <h3 class="section-title" style="font-size:1rem;">Provider Details</h3>
                <div><strong>Languages:</strong> ${doc.languages.join(', ')}</div>
                <div><strong>Insurances Accepted:</strong> Blue Cross, UnitedHealth, Aetna</div>
                <div><strong>Consultation Types:</strong> ${doc.types.join(', ')}</div>
            </div>
        </div>
    `;

    switchView("doctor-profile");
}

function selectSlotAndNav(slot) {
    // Navigate straight to booking wizard with slot pre-selected
    switchView("booking");
    
    // Set wizard labels
    document.getElementById("booking-doctor-meta").innerText = `Booking for: ${selectedDoctorForBooking.name} (${selectedDoctorForBooking.specialty})`;
    
    // highlight matching slot in wizard
    const slots = document.querySelectorAll("#wizard-step-1 .slot-item");
    slots.forEach(s => {
        if (s.innerText === slot) {
            s.classList.add("active");
            bookingFormData.slot = slot;
        } else {
            s.classList.remove("active");
        }
    });
}

// ==========================================
// Hospital Profile Detail View
// ==========================================
function showHospitalProfile(hospId) {
    const hosp = mockHospitals.find(h => h.id === hospId);
    if (!hosp) return;

    const content = document.getElementById("hospital-profile-content");
    content.innerHTML = `
        <div class="detail-main">
            <div class="card-section">
                <img src="${hosp.image}" alt="${hosp.name}" style="width:100%; height:250px; object-fit:cover; border-radius:12px; margin-bottom:20px;">
                <h2 style="font-size:1.8rem;">${hosp.name}</h2>
                <p style="color:var(--text-secondary); margin-top:4px;"><i class="fa-solid fa-location-dot"></i> Address: ${hosp.address}</p>
                <div style="display:flex; gap:16px; margin-top:12px;">
                    <span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> Quality Verified</span>
                    ${hosp.ambulance ? '<span class="badge badge-emergency"><i class="fa-solid fa-truck-medical"></i> 24/7 Ambulance Emergency</span>' : ''}
                </div>
            </div>

            <div class="card-section">
                <h3 class="section-title" style="margin-bottom:12px;">Departments & Services</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:0.95rem;">
                    ${hosp.departments.map(d => `<div><i class="fa-solid fa-circle-chevron-right" style="color:var(--primary)"></i> ${d}</div>`).join('')}
                </div>
            </div>

            <div class="card-section">
                <h3 class="section-title" style="margin-bottom:12px;">Facility Gallery</h3>
                <div class="hospital-gallery">
                    <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=150" class="gallery-img">
                    <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=150" class="gallery-img">
                    <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce8?auto=format&fit=crop&q=80&w=150" class="gallery-img">
                </div>
            </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:24px;">
            <div class="card-section" style="font-size:0.9rem; display:flex; flex-direction:column; gap:12px;">
                <h3 class="section-title" style="font-size:1.1rem; border-bottom:1px solid var(--border-color); padding-bottom:8px;">Amenities</h3>
                <div><i class="fa-solid fa-square-parking" style="color:var(--primary)"></i> Valet Parking Available</div>
                <div><i class="fa-solid fa-wheelchair" style="color:var(--primary)"></i> Wheelchair Accessibility (All Floors)</div>
                <div><i class="fa-solid fa-prescription-bottle" style="color:var(--primary)"></i> Pharmacy Counter (Ground Floor)</div>
                <div><i class="fa-solid fa-clipboard-check" style="color:var(--primary)"></i> Digital Sign-in Kiosks</div>
            </div>

            <div class="card-section" style="font-size:0.9rem; display:flex; flex-direction:column; gap:8px;">
                <h3 class="section-title" style="font-size:1.1rem;">Accepted Insurances</h3>
                ${hosp.insurancePartners.map(ins => `<div><i class="fa-solid fa-shield-check" style="color:var(--success)"></i> ${ins}</div>`).join('')}
            </div>
        </div>
    `;

    switchView("hospital-profile");
}

// ==========================================
// Appointment Booking Logic (Wizard)
// ==========================================
function selectBookingSlot(element) {
    if (element.classList.contains("disabled")) return;
    
    const slots = document.querySelectorAll("#wizard-step-1 .slot-item");
    slots.forEach(s => s.classList.remove("active"));
    
    element.classList.add("active");
    bookingFormData.slot = element.innerText;
}

function advanceBookingStep(direction) {
    if (direction === 1) {
        // Validate before moving
        if (currentBookingStep === 1) {
            const date = document.getElementById("booking-date").value;
            if (!date) {
                alert("Please select a date.");
                return;
            }
            if (!bookingFormData.slot) {
                alert("Please select an available slot.");
                return;
            }
            bookingFormData.date = date;
            bookingFormData.patient = document.getElementById("booking-patient-select").value;
            bookingFormData.format = document.getElementById("booking-format").value;
        }
        
        if (currentBookingStep === 2) {
            bookingFormData.symptoms = document.getElementById("booking-symptoms").value;
        }

        if (currentBookingStep === 3) {
            bookingFormData.insurance = document.getElementById("booking-insurance").value;
        }

        if (currentBookingStep === 4) {
            // Confirm Checkout
            completeAppointmentBooking();
            return; // don't execute regular advance step UI updates
        }
    }

    currentBookingStep += direction;
    updateWizardUI();
}

function updateWizardUI() {
    // update steps indicator
    const steps = [1, 2, 3, 4];
    steps.forEach(s => {
        const ind = document.getElementById(`step-ind-${s}`);
        ind.className = "step-indicator";
        if (s < currentBookingStep) {
            ind.classList.add("complete");
            ind.innerHTML = '<i class="fa-solid fa-check"></i>';
        } else if (s === currentBookingStep) {
            ind.classList.add("active");
            ind.innerText = s;
        } else {
            ind.innerText = s;
        }
    });

    // progress bar size
    const progress = document.getElementById("booking-wizard-progress");
    progress.style.width = `${((currentBookingStep - 1) / 3) * 100}%`;

    // hide/show step panes
    const panes = document.querySelectorAll(".wizard-step-pane");
    panes.forEach((p, idx) => {
        if (idx + 1 === currentBookingStep) {
            p.classList.add("active");
        } else {
            p.classList.remove("active");
        }
    });

    // prev button status
    const prevBtn = document.getElementById("btn-booking-prev");
    prevBtn.disabled = currentBookingStep === 1;

    // next button status / text
    const nextBtn = document.getElementById("btn-booking-next");
    if (currentBookingStep === 4) {
        nextBtn.innerText = "Confirm & Pay";
    } else {
        nextBtn.innerText = "Next";
    }
}

function simulateFileUpload() {
    const input = document.getElementById("booking-file-input");
    input.click();
    
    // Simulate upload finish
    setTimeout(() => {
        const text = document.getElementById("upload-status-text");
        text.innerText = "CBC_Report_Sarah_July_2026.pdf (1.2 MB) - Uploaded Successfully!";
        bookingFormData.uploadedFile = "CBC_Report_Sarah_July_2026.pdf";
    }, 1500);
}

function updateInsuranceSummary() {
    const val = document.getElementById("booking-insurance").value;
    const info = document.getElementById("insurance-coverage-info");
    const statusBox = document.getElementById("insurance-status-box");
    const duePrice = document.getElementById("booking-due-price");

    if (val === "none") {
        info.innerText = "Self-Pay Rate. Full fee of $120.00 will apply.";
        statusBox.style.borderColor = "var(--warning)";
        duePrice.innerText = "$120.00";
    } else {
        info.innerText = "Co-Pay: $15.00 (Standard fee: $120.00, Insurance pays 87.5%)";
        statusBox.style.borderColor = "rgba(16, 185, 129, 0.3)";
        duePrice.innerText = "$15.00";
    }
}

function selectPaymentMethod(element, type) {
    const cards = document.querySelectorAll(".payment-card");
    cards.forEach(c => c.classList.remove("active"));
    
    element.classList.add("active");
    
    const cardForm = document.getElementById("card-payment-form");
    const upiForm = document.getElementById("upi-payment-form");

    if (type === 'card') {
        cardForm.style.display = "block";
        upiForm.style.display = "none";
    } else {
        cardForm.style.display = "none";
        upiForm.style.display = "block";
    }
}

function completeAppointmentBooking() {
    // Generate Token ID
    const tokenNum = Math.floor(1000 + Math.random() * 9000);
    const token = `MP-TK-${tokenNum}`;
    const aptId = `MP-APT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAppt = {
        id: aptId,
        patientName: bookingFormData.patient || currentUser.name,
        doctor: selectedDoctorForBooking,
        date: bookingFormData.date,
        time: bookingFormData.slot,
        format: bookingFormData.format,
        symptoms: bookingFormData.symptoms || "Regular Check-up",
        insurance: bookingFormData.insurance,
        fee: bookingFormData.insurance === 'none' ? 120.00 : 15.00,
        token: token,
        checkedIn: false
    };

    appointmentsList.unshift(newAppt); // add to front
    updateDashboardWidgets();

    // Trigger QR Code generation API (using qrserver public api)
    const qrData = `patient:${newAppt.patientName}|doctor:${newAppt.doctor.name}|token:${newAppt.token}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    // Set checkin data for manual token checking
    document.getElementById("checkin-token-input").value = token;

    // Reset wizard
    currentBookingStep = 1;
    bookingFormData = {};
    updateWizardUI();
    document.getElementById("booking-symptoms").value = "";
    document.getElementById("upload-status-text").innerText = "Drag & drop files or click to browse";
    
    // Switch to Check-in View automatically and display booking details
    switchView("check-in");
    
    // Render confirmation within the Check-in View or show immediate check-in screen
    document.getElementById("checkin-scan-sec").style.display = "none";
    document.getElementById("checkin-consent-sec").style.display = "flex";
    document.getElementById("checkin-appointment-details").innerHTML = `
        <strong>Patient:</strong> ${newAppt.patientName}<br>
        <strong>Doctor:</strong> ${newAppt.doctor.name} (${newAppt.doctor.specialty})<br>
        <strong>Time:</strong> Today at ${newAppt.time}<br>
        <strong>Token ID:</strong> <span style="color:var(--primary); font-weight:700;">${newAppt.token}</span>
    `;

    // Clear signature canvas
    clearSignatureCanvas();

    alert(`Appointment reserved! Token: ${token}. Complete signature to check-in.`);
}

// ==========================================
// Hospital Check-in & Signature Canvas Pad
// ==========================================
function initSignatureCanvas() {
    sigCanvas = document.getElementById("signature-canvas");
    sigCtx = sigCanvas.getContext("2d");

    // Resize canvas dynamically to match its layout container size
    function resizeCanvas() {
        const rect = sigCanvas.getBoundingClientRect();
        sigCanvas.width = rect.width;
        sigCanvas.height = rect.height;
        
        // style properties
        sigCtx.strokeStyle = "#06b6d4";
        sigCtx.lineWidth = 3;
        sigCtx.lineCap = "round";
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse Events
    sigCanvas.addEventListener("mousedown", (e) => {
        isDrawing = true;
        const pos = getMousePos(sigCanvas, e);
        sigCtx.beginPath();
        sigCtx.moveTo(pos.x, pos.y);
    });

    sigCanvas.addEventListener("mousemove", (e) => {
        if (!isDrawing) return;
        const pos = getMousePos(sigCanvas, e);
        sigCtx.lineTo(pos.x, pos.y);
        sigCtx.stroke();
    });

    sigCanvas.addEventListener("mouseup", () => { isDrawing = false; });
    sigCanvas.addEventListener("mouseleave", () => { isDrawing = false; });

    // Touch Events for Mobile
    sigCanvas.addEventListener("touchstart", (e) => {
        isDrawing = true;
        const touch = e.touches[0];
        const pos = getMousePos(sigCanvas, touch);
        sigCtx.beginPath();
        sigCtx.moveTo(pos.x, pos.y);
        e.preventDefault();
    });

    sigCanvas.addEventListener("touchmove", (e) => {
        if (!isDrawing) return;
        const touch = e.touches[0];
        const pos = getMousePos(sigCanvas, touch);
        sigCtx.lineTo(pos.x, pos.y);
        sigCtx.stroke();
        e.preventDefault();
    });

    sigCanvas.addEventListener("touchend", (e) => { isDrawing = false; e.preventDefault(); });
}

function getMousePos(canvasDom, e) {
    const rect = canvasDom.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function clearSignatureCanvas() {
    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
}

function simulateQRScan() {
    const scanner = document.getElementById("scanner-box");
    const icon = document.getElementById("scanner-icon");
    const txt = document.getElementById("scanner-text");

    scanner.style.borderColor = "var(--success)";
    icon.className = "fa-solid fa-circle-check";
    icon.style.color = "var(--success)";
    txt.innerText = "QR Code Recognized!";

    setTimeout(() => {
        // find matching appointment and load check-in consent
        const appt = appointmentsList.find(a => !a.checkedIn);
        if (appt) {
            document.getElementById("checkin-scan-sec").style.display = "none";
            document.getElementById("checkin-consent-sec").style.display = "flex";
            document.getElementById("checkin-appointment-details").innerHTML = `
                <strong>Patient:</strong> ${appt.patientName}<br>
                <strong>Doctor:</strong> ${appt.doctor.name} (${appt.doctor.specialty})<br>
                <strong>Time:</strong> Today at ${appt.time}<br>
                <strong>Token ID:</strong> <span style="color:var(--primary); font-weight:700;">${appt.token}</span>
            `;
            
            // set token code
            document.getElementById("checkin-token-input").value = appt.token;
        } else {
            alert("No pending bookings found to check-in. Try booking a slot first!");
            // reset icon
            scanner.style.borderColor = "var(--primary)";
            icon.className = "fa-solid fa-expand";
            icon.style.color = "var(--text-muted)";
            txt.innerText = "Tap here to simulate QR Scan";
        }
    }, 1200);
}

function handleManualTokenCheckin() {
    const tok = document.getElementById("checkin-token-input").value;
    const match = appointmentsList.find(a => a.token === tok);

    if (match) {
        document.getElementById("checkin-scan-sec").style.display = "none";
        document.getElementById("checkin-consent-sec").style.display = "flex";
        document.getElementById("checkin-appointment-details").innerHTML = `
            <strong>Patient:</strong> ${match.patientName}<br>
            <strong>Doctor:</strong> ${match.doctor.name} (${match.doctor.specialty})<br>
            <strong>Time:</strong> Today at ${match.time}<br>
            <strong>Token ID:</strong> <span style="color:var(--primary); font-weight:700;">${match.token}</span>
        `;
    } else {
        alert("Invalid Token ID. Please enter a valid appointment token.");
    }
}

function submitCheckin() {
    const agree = document.getElementById("checkin-consent-agree").checked;
    if (!agree) {
        alert("Please accept the terms to complete check-in registration.");
        return;
    }

    // Verify signature canvas contains data (not completely blank)
    const isBlank = isCanvasBlank(sigCanvas);
    if (isBlank) {
        alert("Please sign inside the canvas box to authenticate consent form.");
        return;
    }

    // Set check-in true on matches
    const tok = document.getElementById("checkin-token-input").value;
    const match = appointmentsList.find(a => a.token === tok);
    if (match) {
        match.checkedIn = true;
        
        // update queue Token text to match booked token
        document.getElementById("queue-token-id").innerText = match.token;
        document.getElementById("queue-room-num").innerText = `Room 104 - Dr. Aaron Smith`;
        
        // Insert patient token into queue standings
        queueStandings = [
            { token: "MP-TK-1045", name: "David K.", status: "In Consultation", isSelf: false },
            { token: "MP-TK-1122", name: "Elena R.", status: "Waiting (Next)", isSelf: false },
            { token: "MP-TK-1205", name: "Frank L.", status: "Waiting", isSelf: false },
            { token: match.token, name: match.patientName, status: "Checked In", isSelf: true }
        ];
        activeQueuePosition = 3;
        renderQueueStandings();
    }

    // transition to success
    document.getElementById("checkin-consent-sec").style.display = "none";
    document.getElementById("checkin-success-sec").style.display = "flex";
    
    updateDashboardWidgets();
}

function isCanvasBlank(canvas) {
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    return canvas.toDataURL() === blank.toDataURL();
}

// ==========================================
// Live Queue waiting room simulation
// ==========================================
function renderQueueStandings() {
    const container = document.getElementById("queue-standings-container");
    if (!container) return;
    container.innerHTML = "";

    queueStandings.forEach((item, index) => {
        const itemEl = document.createElement("div");
        itemEl.className = `check-item ${item.isSelf ? 'checked' : ''}`;
        if (item.isSelf) {
            itemEl.style.borderColor = "var(--primary)";
            itemEl.style.background = "rgba(0, 122, 255, 0.05)";
        }
        itemEl.innerHTML = `
            <div style="font-weight:700; width:100px; color:${item.isSelf ? 'var(--primary)' : 'var(--text-secondary)'}">${item.token}</div>
            <div class="check-label" style="flex-grow:1; text-decoration:none !important; color:${item.isSelf ? 'var(--text-primary)' : 'var(--text-primary)'}">${item.name} ${item.isSelf ? '(You)' : ''}</div>
            <span class="badge ${item.status === 'In Consultation' ? 'badge-emergency' : (item.status === 'Waiting (Next)' ? 'badge-success' : '')}">${item.status}</span>
        `;
        container.appendChild(itemEl);
    });

    // Update Header indicators
    const posNum = document.getElementById("queue-pos-number");
    const waitTime = document.getElementById("queue-wait-time");
    const posLabel = document.getElementById("queue-pos-label");
    const ringProgress = document.getElementById("queue-ring-progress");

    if (posNum) posNum.innerText = activeQueuePosition;
    if (waitTime) {
        waitTime.innerText = activeQueuePosition === 0 ? "Now!" : `~${activeQueuePosition * 8} mins`;
    }
    if (posLabel) {
        posLabel.innerText = activeQueuePosition === 0 ? "Your Turn" : "Ahead of You";
    }
    if (ringProgress) {
        // Circumference = 440
        const circ = 440;
        // Gauge is full (0 offset) when position is 0, and empty (440 offset) when position is 4 or more
        const progressPct = Math.max(0, Math.min(1, 1 - (activeQueuePosition / 4)));
        const offset = circ - (progressPct * circ);
        ringProgress.style.strokeDashoffset = offset;
    }
}

function simulateStepQueue() {
    if (activeQueuePosition > 0) {
        activeQueuePosition--;
        
        // Update standings logic
        queueStandings.shift(); // remove person in consult
        
        // update active status
        if (queueStandings.length > 0) {
            queueStandings[0].status = "In Consultation";
        }
        if (queueStandings.length > 1) {
            queueStandings[1].status = "Waiting (Next)";
        }
        
        renderQueueStandings();
        updateDashboardWidgets();

        // trigger notification if user is next
        if (activeQueuePosition === 0) {
            // Trigger Turn Announcement
            document.getElementById("queue-announcement-box").style.display = "flex";
            document.getElementById("dash-queue-pos").innerText = "It's your turn! Go to Room";
            
            // Audio alert notification simulation
            playBeep();
        } else {
            alert("Queue advanced. 1 patient completed consultation.");
        }
    } else {
        alert("You are already at the head of the queue. Please click 'Enter Consultation Room' to start your visit!");
    }
}

function playBeep() {
    // Generate synthetic audio notification beep using Web Audio API
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = "sine";
        oscillator.frequency.value = 520;
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.45);
    } catch(e) {
        console.log("Audio simulation failed due to browser autoplay policies.");
    }
}

// ==========================================
// Consultation Room Logic
// ==========================================
function enterConsultationRoom() {
    switchView("consultation");
    document.getElementById("queue-announcement-box").style.display = "none";
    
    // Pre-fill symptoms
    const activeAppt = appointmentsList[0] || {};
    document.getElementById("consult-notes").value = `Reason for Visit: ${activeAppt.symptoms || 'General Checkup'}\n\nNotes from Patient: \n- Normal blood pressure readings this week.\n- Shortness of breath during moderate workout routines.`;

    // Start Consultation Timer
    consultSeconds = 0;
    document.getElementById("consult-timer").innerText = "00:00";
    if (consultTimerInterval) clearInterval(consultTimerInterval);
    
    consultTimerInterval = setInterval(() => {
        consultSeconds++;
        const mins = String(Math.floor(consultSeconds / 60)).padStart(2, '0');
        const secs = String(consultSeconds % 60).padStart(2, '0');
        document.getElementById("consult-timer").innerText = `${mins}:${secs}`;
    }, 1000);
}

function generateAISummary() {
    const btn = document.querySelector("#view-consultation .btn-primary");
    btn.innerHTML = '<i class="fa-solid fa-spinner spin"></i> Processing Voice & Notes...';
    btn.disabled = true;

    setTimeout(() => {
        const textEl = document.getElementById("ai-summary-text");
        textEl.innerHTML = `
            <strong>Patient Symptoms:</strong> Occasional mild exertional chest pressure during cardiac workouts. Shortness of breath noted.<br>
            <strong>Vitals Checked:</strong> BP: 135/82 mmHg, Pulse: 72 bpm.<br>
            <strong>Differential Diagnoses:</strong> Exercise-induced angina, coronary vasospasms.<br>
            <strong>Clinical Advice:</strong> Ordered stress echocardiogram. Adjusting medication schedule. Advised taking CoQ10 to manage mild muscle fatigue reports.
        `;
        
        // populate doctor notes
        document.getElementById("consult-notes").value += `\n\n[AI Scribe Summary]\nDiagnostic assessment aligns with exercise-induced angina. stress echo ordered. Lipitor dosage preserved. CoQ10 added to morning schedule.`;
        
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate AI Summary';
        btn.disabled = false;
        alert("AI Clinical Scribe has processed notes and generated diagnostic recommendations!");
    }, 1800);
}

function endConsultation() {
    if (confirm("Would you like to complete this consultation and view your digital prescription?")) {
        clearInterval(consultTimerInterval);
        
        // Fills the Rx fields based on doctor & date
        const appt = appointmentsList[0] || {};
        document.getElementById("rx-doc-name").innerText = `${appt.doctor?.name || 'Dr. Aaron Smith'} (MD, FACC)`;
        document.getElementById("rx-date").innerText = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        // Switch to Digital Rx view
        switchView("prescription");
    }
}

// ==========================================
// Digital Prescription Logic
// ==========================================
function printPrescription() {
    // Generate clean print layout window
    const printContents = document.getElementById("prescription-printable-area").innerHTML;
    const originalContents = document.body.innerHTML;

    // Use iframe or window to trigger print
    const w = window.open();
    w.document.write(`
        <html>
        <head>
            <title>Medical Prescription</title>
            <style>
                body { font-family: sans-serif; padding: 40px; color: #334155; }
                .prescription-header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
                .rx-logo { font-size: 2.2rem; font-weight: 800; color: #0284c7; }
                .rx-meta-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 30px; font-size: 0.9rem; background: #f8fafc; padding: 16px; border-radius: 8px; }
                .rx-symbol { font-size: 2.2rem; font-weight: 800; color: #0284c7; margin-bottom: 12px; }
                .rx-medicines-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                .rx-medicines-table th { background: #f1f5f9; color: #0f172a; text-align: left; padding: 12px; font-size: 0.85rem; }
                .rx-medicines-table td { padding: 14px 12px; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; }
                .rx-notes-box { background: #f8fafc; border-left: 4px solid #0284c7; padding: 16px; margin-bottom: 40px; }
                .rx-footer { display: flex; justify-content: space-between; align-items: flex-end; }
                .rx-signature { text-align: center; border-top: 1px solid #cbd5e1; padding-top: 8px; width: 180px; }
            </style>
        </head>
        <body>
            ${printContents}
            <script>
                window.onload = function() { window.print(); window.close(); }
            </script>
        </body>
        </html>
    `);
    w.document.close();
}

function sharePrescription() {
    const shareText = `Prescription ID: MP-RX-89204 for Sarah Jenkins. View securely online at: https://patient.medpulse.io/rx/MP-RX-89204`;
    navigator.clipboard.writeText(shareText);
    alert("Secure share link copied to clipboard! You can send this via WhatsApp or Email.");
}

// ==========================================
// Modals & Overlays Logic
// ==========================================
function triggerEmergency() {
    document.getElementById("modal-emergency").style.display = "flex";
}

function closeEmergency() {
    document.getElementById("modal-emergency").style.display = "none";
}

function openAIChat() {
    document.getElementById("modal-ai-chat").style.display = "flex";
}

function closeAIChat() {
    document.getElementById("modal-ai-chat").style.display = "none";
}

function checkChatEnter(event) {
    if (event.key === "Enter") {
        sendChatMessage();
    }
}

function sendChatMessage() {
    const input = document.getElementById("ai-chat-input");
    const val = input.value.trim();
    if (!val) return;

    const chatLogs = document.getElementById("ai-chat-logs");

    // append user message
    const userMsg = document.createElement("div");
    userMsg.style.alignSelf = "flex-end";
    userMsg.style.background = "var(--primary)";
    userMsg.style.color = "white";
    userMsg.style.padding = "8px 12px";
    userMsg.style.borderRadius = "8px 8px 0 8px";
    userMsg.style.maxWidth = "85%";
    userMsg.innerText = val;
    chatLogs.appendChild(userMsg);

    input.value = "";
    chatLogs.scrollTop = chatLogs.scrollHeight;

    // generate bot reply
    setTimeout(() => {
        const botMsg = document.createElement("div");
        botMsg.style.alignSelf = "flex-start";
        botMsg.style.background = "var(--bg-card)";
        botMsg.style.padding = "8px 12px";
        botMsg.style.borderRadius = "8px 8px 8px 0";
        botMsg.style.border = "1px solid var(--border-color)";
        botMsg.style.maxWidth = "85%";

        let response = "I am processing your request. For severe chest pain, please immediately click the SOS Emergency button.";
        const lower = val.toLowerCase();
        if (lower.includes("bp") || lower.includes("blood pressure")) {
            response = "Your history shows mild hypertension. Dr. Smith prescribed Amlodipine 5mg. Remember to monitor your systolic reading daily.";
        } else if (lower.includes("allergy") || lower.includes("allergies")) {
            response = "According to your health vault, you have a documented allergy to Penicillin. All consulting physicians are automatically warned.";
        } else if (lower.includes("medicines") || lower.includes("medication")) {
            response = "Your active list: Lipitor 20mg (cholesterol) and Amlodipine 5mg (blood pressure).";
        }

        botMsg.innerText = response;
        chatLogs.appendChild(botMsg);
        chatLogs.scrollTop = chatLogs.scrollHeight;
    }, 1000);
}

// Notifications toggle mock
function toggleNotifications() {
    document.getElementById("notif-badge-dot").style.display = "none";
    alert("Alerts Logs:\n1. Lab Report for Lipid Panel is ready to view.\n2. Appointment checked-in successfully.");
}

// iOS Tab Switcher for Patient Profile
function switchProfileTab(tabName) {
    // Hide all tab panels
    const panels = document.querySelectorAll(".profile-tab-panel");
    panels.forEach(p => p.classList.remove("active"));

    // Deactivate all tab buttons
    const tabs = document.querySelectorAll(".profile-tab");
    tabs.forEach(t => t.classList.remove("active"));

    // Activate selected panel and button
    const activePanel = document.getElementById(`profile-tab-${tabName}`);
    if (activePanel) activePanel.classList.add("active");

    const activeTabBtn = Array.from(document.querySelectorAll(".profile-tab"))
        .find(btn => btn.getAttribute("onclick").includes(`'${tabName}'`));
    if (activeTabBtn) activeTabBtn.classList.add("active");
}

// Horizontally scrolling filter chips logic
function toggleChipFilter(filterType) {
    const chip = document.getElementById(`chip-${filterType}`);
    if (!chip) return;

    chip.classList.toggle("active");

    const drawer = document.getElementById("filter-dropdowns-container");
    const group = document.getElementById(`group-${filterType}`);

    if (filterType !== "today") {
        if (group) {
            group.style.display = chip.classList.contains("active") ? "block" : "none";
        }

        // Show drawer if any chip that has a dropdown is active
        const distChip = document.getElementById("chip-distance");
        const priceChip = document.getElementById("chip-price");
        const ratingChip = document.getElementById("chip-rating");

        const anyDropdownActive = (distChip && distChip.classList.contains("active")) ||
                                  (priceChip && priceChip.classList.contains("active")) ||
                                  (ratingChip && ratingChip.classList.contains("active"));

        if (drawer) {
            drawer.style.display = anyDropdownActive ? "grid" : "none";
        }
    }

    // Refresh directory results
    filterDirectory();
}

// Mock Voice Search
function simulateVoiceSearch() {
    const speech = prompt("🎙️ MedPulse Voice Assist - Speak symptoms, doctors, or clinics:\n(Simulation: type your search query below)", "Cardiologist");
    if (speech) {
        const searchInput = document.getElementById("directory-search-input");
        if (searchInput) {
            searchInput.value = speech;
            filterDirectory();
        }
    }
}
