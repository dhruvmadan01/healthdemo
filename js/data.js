// js/data.js
// Relational Database and State Management with LocalStorage persistence

class HealthcareDB {
    constructor() {
        this.storageKey = 'healthcare_patient_db';
        this.initDatabase();
    }

    initDatabase() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.data = JSON.parse(stored);
            return;
        }

        // Initialize with rich seed data
        this.data = {
            currentUser: "p1", // ID of the logged in user
            patients: {
                "p1": {
                    id: "p1",
                    name: "Alex Mercer",
                    dob: "1990-08-15",
                    gender: "Male",
                    bloodGroup: "O+",
                    height: 178, // cm
                    weight: 76,  // kg
                    bmi: 24.0,   // calculated weight_kg / (height_m^2)
                    email: "alex.mercer@email.com",
                    phone: "+1 (555) 019-2834",
                    emergencyContact: {
                        name: "Sarah Mercer",
                        relation: "Spouse",
                        phone: "+1 (555) 019-5829"
                    },
                    settings: {
                        language: "English",
                        organDonor: true,
                        darkMode: false,
                        biometricsEnabled: true
                    },
                    medicalHistory: {
                        allergies: ["Penicillin", "Peanuts"],
                        chronicDiseases: ["Mild Asthma"],
                        surgeries: ["Appendectomy (2018)"],
                        currentMedicines: [
                            { name: "Albuterol Inhaler", dose: "1-2 puffs", duration: "As needed", foodInstructions: "Anytime", warnings: "May cause rapid heartbeat" }
                        ]
                    },
                    lifestyle: {
                        smoking: "Never",
                        alcohol: "Socially",
                        exercise: "3-4 times a week",
                        sleep: "7-8 hours"
                    },
                    healthScore: 84
                },
                "p2": {
                    id: "p2",
                    name: "Lily Mercer",
                    dob: "2018-05-10",
                    gender: "Female",
                    bloodGroup: "O+",
                    height: 110,
                    weight: 18,
                    bmi: 14.9,
                    email: "parent.alex@email.com",
                    phone: "+1 (555) 019-2834",
                    emergencyContact: {
                        name: "Alex Mercer",
                        relation: "Father",
                        phone: "+1 (555) 019-2834"
                    },
                    settings: {
                        language: "English",
                        organDonor: false,
                        darkMode: false,
                        biometricsEnabled: false
                    },
                    medicalHistory: {
                        allergies: ["Dust Mites"],
                        chronicDiseases: ["Eczema"],
                        surgeries: [],
                        currentMedicines: []
                    },
                    lifestyle: {
                        smoking: "Never",
                        alcohol: "Never",
                        exercise: "Active play daily",
                        sleep: "9-10 hours"
                    },
                    healthScore: 92
                },
                "p3": {
                    id: "p3",
                    name: "Sarah Mercer",
                    dob: "1992-02-24",
                    gender: "Female",
                    bloodGroup: "A-",
                    height: 165,
                    weight: 62,
                    bmi: 22.8,
                    email: "sarah.mercer@email.com",
                    phone: "+1 (555) 019-5829",
                    emergencyContact: {
                        name: "Alex Mercer",
                        relation: "Spouse",
                        phone: "+1 (555) 019-2834"
                    },
                    settings: {
                        language: "English",
                        organDonor: true,
                        darkMode: false,
                        biometricsEnabled: true
                    },
                    medicalHistory: {
                        allergies: [],
                        chronicDiseases: [],
                        surgeries: [],
                        currentMedicines: []
                    },
                    lifestyle: {
                        smoking: "Never",
                        alcohol: "Socially",
                        exercise: "Yoga twice a week",
                        sleep: "8 hours"
                    },
                    healthScore: 89
                }
            },
            familyProfiles: {
                "p1": {
                    ownerId: "p1",
                    members: [
                        { patientId: "p2", permission: "edit", relation: "Daughter" },
                        { patientId: "p3", permission: "view", relation: "Spouse" }
                    ]
                }
            },
            hospitals: {
                "h1": {
                    id: "h1",
                    name: "St. Elizabeth Medical Center",
                    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=400",
                    address: "736 Medical Parkway, Metro City",
                    coordinates: { lat: 40.7128, lng: -74.0060 },
                    departments: ["Cardiology", "Pediatrics", "Emergency Medicine", "Neurology", "Orthopedics"],
                    emergencyIcuStatus: "Available (4 ICU beds free)",
                    amenities: ["24/7 Ambulance", "Valet Parking", "Wheelchair Accessible", "Cafeteria", "Pharmacy"],
                    rating: 4.8,
                    reviewsCount: 1420
                },
                "h2": {
                    id: "h2",
                    name: "Metro Pediatric & General Hospital",
                    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400",
                    address: "120 Oakwood Lane, West End",
                    coordinates: { lat: 40.7250, lng: -74.0150 },
                    departments: ["Pediatrics", "General Medicine", "Dermatology", "ENT"],
                    emergencyIcuStatus: "Busy (ICU Full)",
                    amenities: ["Ambulance Service", "Parking", "Wheelchair Accessible", "On-site Pharmacy"],
                    rating: 4.5,
                    reviewsCount: 680
                },
                "h3": {
                    id: "h3",
                    name: "Apex Cardiology & Rehabilitation Clinic",
                    image: "https://images.unsplash.com/photo-1586773860418-d3b3de97e663?auto=format&fit=crop&q=80&w=400",
                    address: "95 Cardiovascular Blvd, Heights District",
                    coordinates: { lat: 40.7010, lng: -73.9980 },
                    departments: ["Cardiology", "Physical Rehab", "Sports Medicine"],
                    emergencyIcuStatus: "No ICU (Specialty Clinic)",
                    amenities: ["Valet Parking", "Wheelchair Accessible", "Rehab Gym"],
                    rating: 4.9,
                    reviewsCount: 310
                }
            },
            doctors: {
                "d1": {
                    id: "d1",
                    name: "Dr. Elizabeth Vance",
                    qualification: "MD, FACC - Harvard Medical School",
                    specialty: "Cardiology",
                    experience: 14,
                    hospitalId: "h1",
                    reviews: { rating: 4.9, count: 245 },
                    consultingFee: 150,
                    consultationTypes: ["In-person", "Online"],
                    languages: ["English", "Spanish"],
                    acceptedInsurance: ["Aetna", "Blue Cross", "Cigna", "UnitedHealth"],
                    availability: ["09:00 - 12:00", "14:00 - 17:00"],
                    awards: ["Top Cardiologist Metro Area 2024", "AMA Research Award"],
                    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
                },
                "d2": {
                    id: "d2",
                    name: "Dr. Marcus Vance",
                    qualification: "MD, FAAP - Johns Hopkins University",
                    specialty: "Pediatrics",
                    experience: 10,
                    hospitalId: "h2",
                    reviews: { rating: 4.7, count: 189 },
                    consultingFee: 100,
                    consultationTypes: ["In-person", "Online"],
                    languages: ["English", "French"],
                    acceptedInsurance: ["Blue Cross", "Cigna", "Medicaid"],
                    availability: ["08:30 - 11:30", "13:00 - 16:30"],
                    awards: ["Compassionate Care Award 2025"],
                    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300"
                },
                "d3": {
                    id: "d3",
                    name: "Dr. Sarah Lin",
                    qualification: "MD, D.D.V - Stanford School of Medicine",
                    specialty: "Dermatology",
                    experience: 8,
                    hospitalId: "h2",
                    reviews: { rating: 4.8, count: 312 },
                    consultingFee: 120,
                    consultationTypes: ["In-person", "Online"],
                    languages: ["English", "Mandarin"],
                    acceptedInsurance: ["Aetna", "UnitedHealth", "Humana"],
                    availability: ["10:00 - 13:00", "15:00 - 18:00"],
                    awards: ["Young Investigator Fellowship 2023"],
                    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300"
                },
                "d4": {
                    id: "d4",
                    name: "Dr. Jonathan Reyes",
                    qualification: "MD, PhD - Yale School of Medicine",
                    specialty: "Neurology",
                    experience: 18,
                    hospitalId: "h1",
                    reviews: { rating: 4.9, count: 420 },
                    consultingFee: 200,
                    consultationTypes: ["In-person"],
                    languages: ["English", "Tagalog"],
                    acceptedInsurance: ["Aetna", "Blue Cross", "Medicare"],
                    availability: ["09:00 - 13:00"],
                    awards: ["National Neurological Society Lifetime Fellow"],
                    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300"
                }
            },
            appointments: [
                {
                    id: "a_init_1",
                    patientId: "p1",
                    doctorId: "d1",
                    hospitalId: "h1",
                    date: "2026-07-21",
                    time: "10:30",
                    symptoms: "Mild chest tightness during light cardio exercises.",
                    reports: [],
                    insurance: "Blue Cross",
                    paymentStatus: "Paid",
                    paymentAmount: 150,
                    qrCode: "MOCK_QR_a_init_1",
                    visitToken: "T-804",
                    status: "Upcoming",
                    checkInStatus: "Not Checked In",
                    queue: {
                        position: 4,
                        estWaitTime: 45, // mins
                        delay: 10,       // mins
                        room: "Suite 302",
                        currentSpeaker: "T-801"
                    }
                }
            ],
            prescriptions: [
                {
                    id: "pr_init_1",
                    appointmentId: "a_prev_1",
                    patientId: "p1",
                    doctorId: "d1",
                    date: "2026-05-12",
                    notes: "Patient reported occasional wheezing under heavy pollen. Prescribed rescue inhaler. Keep tracking daily triggers.",
                    medicines: [
                        { name: "Albuterol Inhaler", dose: "1-2 puffs", duration: "90 days", foodInstructions: "As needed for wheezing", warnings: "Do not exceed 6 puffs daily" }
                    ]
                }
            ],
            labReports: [
                { id: "lr_1", patientId: "p1", testName: "Complete Blood Count (CBC)", date: "2026-07-15", status: "Ready", doctor: "Dr. Vance", file: "cbc_report.pdf" },
                { id: "lr_2", patientId: "p1", testName: "Lipid Profile & Glucose", date: "2026-07-15", status: "Ready", doctor: "Dr. Vance", file: "lipid_glucose.pdf" }
            ],
            insuranceAlerts: [
                { id: "ia_1", patientId: "p1", title: "Deductible 90% Met", description: "You are $120 away from 100% copay coverage.", expiry: "2026-12-31" }
            ],
            healthTips: [
                "Stay hydrated! Drinking 2-3 liters of water daily keeps joints lubricated and supports cardiovascular health.",
                "Take a 5-minute walk for every hour of sitting to improve circulation and blood flow.",
                "Adults require at least 7-9 hours of sleep. Try to switch off all screens 30 minutes before bedtime.",
                "Stretching for 10 minutes in the morning improves flexibility and boosts daily energy levels.",
                "Limit sodium intake to under 2,300mg per day to maintain healthy blood pressure levels."
            ]
        };

        this.save();
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    getCurrentUser() {
        return this.data.patients[this.data.currentUser];
    }

    getPatient(id) {
        return this.data.patients[id];
    }

    getFamilyMembers() {
        const primaryId = this.data.currentUser;
        const familyInfo = this.data.familyProfiles[primaryId];
        if (!familyInfo) return [];
        return familyInfo.members.map(member => ({
            ...this.data.patients[member.patientId],
            relation: member.relation,
            permission: member.permission
        }));
    }

    getDoctor(id) {
        return this.data.doctors[id];
    }

    getHospital(id) {
        return this.data.hospitals[id];
    }

    getAppointments(patientId = null) {
        let list = this.data.appointments;
        if (patientId) {
            list = list.filter(app => app.patientId === patientId);
        }
        return list;
    }

    getPrescriptions(patientId = null) {
        let list = this.data.prescriptions;
        if (patientId) {
            list = list.filter(pr => pr.patientId === patientId);
        }
        return list;
    }

    getLabReports(patientId) {
        return this.data.labReports.filter(r => r.patientId === patientId);
    }

    getInsuranceAlerts(patientId) {
        return this.data.insuranceAlerts.filter(a => a.patientId === patientId);
    }

    addPatient(patient) {
        this.data.patients[patient.id] = patient;
        this.save();
    }

    addAppointment(app) {
        this.data.appointments.push(app);
        this.save();
    }

    addPrescription(prescription) {
        this.data.prescriptions.push(prescription);
        // Also add the newly prescribed medicine to current medicines list of patient
        const patient = this.data.patients[prescription.patientId];
        if (patient) {
            prescription.medicines.forEach(med => {
                // check if already exists
                const exists = patient.medicalHistory.currentMedicines.find(m => m.name.toLowerCase() === med.name.toLowerCase());
                if (!exists) {
                    patient.medicalHistory.currentMedicines.push(med);
                }
            });
        }
        this.save();
    }

    updateAppointmentStatus(id, status, checkInStatus = null, queueData = null) {
        const idx = this.data.appointments.findIndex(app => app.id === id);
        if (idx !== -1) {
            this.data.appointments[idx].status = status;
            if (checkInStatus) this.data.appointments[idx].checkInStatus = checkInStatus;
            if (queueData) this.data.appointments[idx].queue = { ...this.data.appointments[idx].queue, ...queueData };
            this.save();
        }
    }

    calculateBMI(weight, height) {
        const heightM = height / 100;
        return parseFloat((weight / (heightM * heightM)).toFixed(1));
    }
}

const db = new HealthcareDB();
window.db = db; // Export to global scope
