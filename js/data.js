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
                    languages: ["English", "Hindi"],
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
                    languages: ["English"],
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
                    languages: ["Hindi"],
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
                    languages: ["English", "Hindi"],
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
        const patient = this.data.patients[this.data.currentUser];
        if (patient) {
            patient.healthScore = this.calculateHealthScore(patient);
        }
        return patient;
    }

    getPatient(id) {
        const patient = this.data.patients[id];
        if (patient) {
            patient.healthScore = this.calculateHealthScore(patient);
        }
        return patient;
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
        this.saveProfileToSupabase(patient);
    }

    addAppointment(app) {
        this.data.appointments.push(app);
        this.save();
        this.uploadAppointment(app);
    }

    addPrescription(prescription) {
        this.data.prescriptions.push(prescription);
        const patient = this.data.patients[prescription.patientId];
        if (patient) {
            prescription.medicines.forEach(med => {
                const exists = patient.medicalHistory.currentMedicines.find(m => m.name.toLowerCase() === med.name.toLowerCase());
                if (!exists) {
                    patient.medicalHistory.currentMedicines.push(med);
                }
            });
        }
        this.save();
        this.uploadPrescription(prescription);
        if (patient) this.saveProfileToSupabase(patient);
    }

    addLabReport(lr) {
        this.data.labReports.push(lr);
        this.save();
        this.uploadLabReport(lr);
    }

    updateAppointmentStatus(id, status, checkInStatus = null, queueData = null) {
        const idx = this.data.appointments.findIndex(app => app.id === id);
        if (idx !== -1) {
            this.data.appointments[idx].status = status;
            if (checkInStatus) this.data.appointments[idx].checkInStatus = checkInStatus;
            if (queueData) this.data.appointments[idx].queue = { ...this.data.appointments[idx].queue, ...queueData };
            this.save();
            this.updateAppointmentStatusInSupabase(id, status, checkInStatus, this.data.appointments[idx].queue);
        }
    }

    calculateBMI(weight, height) {
        const heightM = height / 100;
        return parseFloat((weight / (heightM * heightM)).toFixed(1));
    }

    calculateHealthScore(patient) {
        if (!patient) return 80;
        
        let score = 85; // Starting base score

        // 1. BMI Calculation
        const height = patient.height || 170;
        const weight = patient.weight || 70;
        const bmi = patient.bmi || this.calculateBMI(weight, height);

        if (bmi >= 18.5 && bmi <= 24.9) {
            score += 5; // Healthy range
        } else if (bmi < 18.5) {
            score -= 5; // Underweight
        } else if (bmi >= 25 && bmi < 30) {
            score -= 5; // Overweight
        } else if (bmi >= 30) {
            score -= 10; // Obese
        }

        // 2. Lifestyle factors
        if (patient.lifestyle) {
            const ls = patient.lifestyle;
            // Smoking
            if (ls.smoking === "Never") score += 5;
            else if (ls.smoking === "Active") score -= 10;

            // Alcohol
            if (ls.alcohol === "Never" || ls.alcohol === "Socially") score += 3;
            else if (ls.alcohol === "Frequently") score -= 5;

            // Exercise
            if (ls.exercise && ls.exercise.toLowerCase() !== "none") {
                score += 5;
            } else {
                score -= 5;
            }

            // Sleep
            if (ls.sleep && (ls.sleep.includes("7-8") || ls.sleep.includes("8") || ls.sleep.includes("9"))) {
                score += 5;
            } else {
                score -= 5;
            }
        }

        // 3. Medical History
        if (patient.medicalHistory) {
            const mh = patient.medicalHistory;
            const allergyCount = mh.allergies ? mh.allergies.length : 0;
            score -= (allergyCount * 2);

            const chronicCount = mh.chronicDiseases ? mh.chronicDiseases.length : 0;
            score -= (chronicCount * 8);
        }

        // Bound between 50 and 100
        return Math.max(50, Math.min(100, score));
    }

    async syncProfileWithSupabase(userId) {
        if (!userId) return null;
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error("Error fetching profile from Supabase:", error);
                return null;
            }

            if (data) {
                const patient = {
                    id: data.id,
                    health_id: data.health_id,
                    name: data.name,
                    dob: data.dob || "",
                    gender: data.gender || "Unspecified",
                    bloodGroup: data.blood_group || "O+",
                    height: parseFloat(data.height || 170),
                    weight: parseFloat(data.weight || 70),
                    bmi: parseFloat(data.bmi || 24.2),
                    email: data.email || "",
                    phone: data.phone || "",
                    emergencyContact: data.emergency_contact || { name: "", relation: "", phone: "" },
                    settings: data.settings || { language: "English", organDonor: false, darkMode: false, biometricsEnabled: false },
                    medicalHistory: data.medical_history || { allergies: [], chronicDiseases: [], surgeries: [], currentMedicines: [] },
                    lifestyle: data.lifestyle || { smoking: "Never", alcohol: "Never", exercise: "None", sleep: "8 hours" },
                    healthScore: data.health_score || 80
                };
                this.data.patients[userId] = patient;
                this.save();
                return patient;
            } else {
                // Profile does not exist in Supabase yet. Let's create it.
                let localPat = this.data.patients[userId];
                if (!localPat) {
                    localPat = {
                        id: userId,
                        health_id: 'MED-' + Math.floor(100000 + Math.random() * 900000),
                        name: "New User",
                        dob: "",
                        gender: "Unspecified",
                        bloodGroup: "O+",
                        height: 170,
                        weight: 70,
                        bmi: 24.2,
                        email: "",
                        phone: "",
                        emergencyContact: { name: "", relation: "", phone: "" },
                        settings: { language: "English", organDonor: false, darkMode: false, biometricsEnabled: false },
                        medicalHistory: { allergies: [], chronicDiseases: [], surgeries: [], currentMedicines: [] },
                        lifestyle: { smoking: "Never", alcohol: "Never", exercise: "None", sleep: "8 hours" },
                        healthScore: 80
                    };
                }
                const { data: newProfile, error: insertError } = await supabaseClient
                    .from('profiles')
                    .insert({
                        id: userId,
                        health_id: localPat.health_id || 'MED-' + Math.floor(100000 + Math.random() * 900000),
                        name: localPat.name,
                        email: localPat.email || "",
                        phone: localPat.phone || "",
                        dob: localPat.dob || null,
                        gender: localPat.gender || 'Unspecified',
                        blood_group: localPat.bloodGroup || 'O+',
                        height: localPat.height || 170,
                        weight: localPat.weight || 70,
                        bmi: localPat.bmi || 24.2,
                        emergency_contact: localPat.emergencyContact,
                        settings: localPat.settings,
                        medical_history: localPat.medicalHistory,
                        lifestyle: localPat.lifestyle,
                        health_score: localPat.healthScore
                    })
                    .select()
                    .maybeSingle();

                if (insertError) {
                    console.error("Error inserting missing profile to Supabase:", insertError);
                    return null;
                }
                if (newProfile) {
                    localPat.health_id = newProfile.health_id;
                    this.data.patients[userId] = localPat;
                    this.save();
                    return localPat;
                }
            }
        } catch (e) {
            console.error("Exception in syncProfileWithSupabase:", e);
        }
        return null;
    }

    async saveProfileToSupabase(patient) {
        if (!patient || !patient.id) return;
        try {
            const { error } = await supabaseClient
                .from('profiles')
                .update({
                    name: patient.name,
                    email: patient.email,
                    phone: patient.phone,
                    dob: patient.dob || null,
                    gender: patient.gender || 'Unspecified',
                    blood_group: patient.bloodGroup || 'O+',
                    height: patient.height || 170,
                    weight: patient.weight || 70,
                    bmi: patient.bmi || 24.2,
                    emergency_contact: patient.emergencyContact || {},
                    settings: patient.settings || {},
                    medical_history: patient.medicalHistory || {},
                    lifestyle: patient.lifestyle || {},
                    health_score: patient.healthScore || 80
                })
                .eq('id', patient.id);
            if (error) console.error("Error saving profile to Supabase:", error);
        } catch (err) {
            console.error("Failed to save profile to Supabase:", err);
        }
    }

    async sendFamilyRequest(healthId, relation, permission) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return { error: "You are not logged in." };

        const { data: targetProfile, error: searchError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('health_id', healthId)
            .maybeSingle();

        if (searchError) return { error: searchError.message };
        if (!targetProfile) return { error: "No user found with this Health ID." };

        if (targetProfile.id === currentUser.id) {
            return { error: "You cannot add yourself as a family member." };
        }

        const { data: existingRelation, error: checkError } = await supabaseClient
            .from('family_members')
            .select('*')
            .eq('primary_user_id', currentUser.id)
            .eq('member_user_id', targetProfile.id)
            .maybeSingle();

        if (checkError) return { error: checkError.message };
        if (existingRelation) {
            return { error: `Relationship or request already exists. Status: ${existingRelation.status}` };
        }

        const { error: insertError } = await supabaseClient
            .from('family_members')
            .insert({
                primary_user_id: currentUser.id,
                member_user_id: targetProfile.id,
                relation: relation,
                permission: permission,
                status: 'pending'
            });

        if (insertError) return { error: insertError.message };
        return { success: true, targetName: targetProfile.name };
    }

    async fetchFamilyMembersFromSupabase(userId) {
        if (!userId) return [];
        try {
            const { data: relations, error: relError } = await supabaseClient
                .from('family_members')
                .select('*')
                .eq('primary_user_id', userId);

            if (relError) {
                console.error("Error fetching family relationships:", relError);
                return [];
            }

            if (!relations || relations.length === 0) return [];

            const memberIds = relations.map(r => r.member_user_id);
            const { data: profiles, error: profError } = await supabaseClient
                .from('profiles')
                .select('*')
                .in('id', memberIds);

            if (profError) {
                console.error("Error fetching family profiles:", profError);
                return [];
            }

            return relations.map(r => {
                const profile = profiles.find(p => p.id === r.member_user_id);
                if (!profile) return null;
                return {
                    id: profile.id,
                    health_id: profile.health_id,
                    name: profile.name,
                    dob: profile.dob || "",
                    gender: profile.gender || "Unspecified",
                    bloodGroup: profile.blood_group || "O+",
                    height: parseFloat(profile.height || 170),
                    weight: parseFloat(profile.weight || 70),
                    bmi: parseFloat(profile.bmi || 24.2),
                    email: profile.email || "",
                    phone: profile.phone || "",
                    emergencyContact: profile.emergency_contact || { name: "", relation: "", phone: "" },
                    settings: profile.settings || { language: "English", organDonor: false, darkMode: false, biometricsEnabled: false },
                    medicalHistory: profile.medical_history || { allergies: [], chronicDiseases: [], surgeries: [], currentMedicines: [] },
                    lifestyle: profile.lifestyle || { smoking: "Never", alcohol: "Never", exercise: "None", sleep: "8 hours" },
                    healthScore: profile.health_score || 80,
                    relation: r.relation,
                    permission: r.permission,
                    status: r.status,
                    relationshipId: r.id
                };
            }).filter(Boolean);
        } catch (e) {
            console.error("Exception in fetchFamilyMembersFromSupabase:", e);
        }
        return [];
    }

    async fetchPendingRequests(userId) {
        if (!userId) return [];
        try {
            const { data: relations, error: relError } = await supabaseClient
                .from('family_members')
                .select('*')
                .eq('member_user_id', userId)
                .eq('status', 'pending');

            if (relError) {
                console.error("Error fetching pending requests:", relError);
                return [];
            }

            if (!relations || relations.length === 0) return [];

            const requesterIds = relations.map(r => r.primary_user_id);
            const { data: profiles, error: profError } = await supabaseClient
                .from('profiles')
                .select('id, name, health_id, email')
                .in('id', requesterIds);

            if (profError) {
                console.error("Error fetching requester profiles:", profError);
                return [];
            }

            return relations.map(r => {
                const requester = profiles.find(p => p.id === r.primary_user_id);
                return {
                    id: r.id,
                    relation: r.relation,
                    permission: r.permission,
                    requesterName: requester ? requester.name : "Unknown User",
                    requesterHealthId: requester ? requester.health_id : "",
                    requesterEmail: requester ? requester.email : ""
                };
            });
        } catch (e) {
            console.error("Exception in fetchPendingRequests:", e);
        }
        return [];
    }

    async respondToFamilyRequest(requestId, approve) {
        try {
            if (approve) {
                const { error } = await supabaseClient
                    .from('family_members')
                    .update({ status: 'approved' })
                    .eq('id', requestId);
                if (error) return { error: error.message };
                return { success: true };
            } else {
                const { error } = await supabaseClient
                    .from('family_members')
                    .delete()
                    .eq('id', requestId);
                if (error) return { error: error.message };
                return { success: true };
            }
        } catch (e) {
            return { error: e.message };
        }
    }

    async syncUserData(userId) {
        if (!userId) return;
        await this.syncProfileWithSupabase(userId);
        await this.syncAppointmentsFromSupabase(userId);
        await this.syncPrescriptionsFromSupabase(userId);
        await this.syncLabReportsFromSupabase(userId);
        await this.loadHospitalsAndDoctorsFromSupabase();
    }

    async uploadAppointment(app) {
        try {
            const { error } = await supabaseClient
                .from('appointments')
                .insert({
                    id: app.id,
                    patient_id: app.patientId,
                    doctor_id: app.doctorId,
                    hospital_id: app.hospitalId,
                    date: app.date,
                    time: app.time,
                    symptoms: app.symptoms,
                    reports: app.reports || [],
                    insurance: app.insurance,
                    payment_status: app.paymentStatus,
                    payment_amount: app.paymentAmount,
                    qr_code: app.qrCode,
                    visit_token: app.visitToken,
                    status: app.status,
                    check_in_status: app.checkInStatus,
                    queue: app.queue
                });
            if (error) console.error("Error uploading appointment to Supabase:", error);
        } catch (err) {
            console.error("Failed to upload appointment:", err);
        }
    }

    async uploadPrescription(p) {
        try {
            const { error } = await supabaseClient
                .from('prescriptions')
                .insert({
                    id: p.id,
                    appointment_id: p.appointmentId || null,
                    patient_id: p.patientId,
                    doctor_id: p.doctorId || null,
                    doctor: p.doctor || "Self-Uploaded",
                    date: p.date,
                    notes: p.notes,
                    medicines: p.medicines || [],
                    file: p.file || null
                });
            if (error) console.error("Error uploading prescription to Supabase:", error);
        } catch (err) {
            console.error("Failed to upload prescription:", err);
        }
    }

    async uploadLabReport(lr) {
        try {
            const { error } = await supabaseClient
                .from('lab_reports')
                .insert({
                    id: lr.id,
                    patient_id: lr.patientId,
                    test_name: lr.testName,
                    date: lr.date,
                    status: lr.status,
                    doctor: lr.doctor,
                    file: lr.file
                });
            if (error) console.error("Error uploading lab report to Supabase:", error);
        } catch (err) {
            console.error("Failed to upload lab report:", err);
        }
    }

    async updateAppointmentStatusInSupabase(id, status, checkInStatus, queue) {
        try {
            const updates = {};
            if (status) updates.status = status;
            if (checkInStatus) updates.check_in_status = checkInStatus;
            if (queue) updates.queue = queue;

            const { error } = await supabaseClient
                .from('appointments')
                .update(updates)
                .eq('id', id);
            if (error) console.error("Error updating appointment in Supabase:", error);
        } catch (err) {
            console.error("Failed to update appointment in Supabase:", err);
        }
    }

    async syncAppointmentsFromSupabase(userId) {
        try {
            const { data, error } = await supabaseClient
                .from('appointments')
                .select('*')
                .eq('patient_id', userId);
            if (!error && data) {
                data.forEach(a => {
                    const localIdx = this.data.appointments.findIndex(la => la.id === a.id);
                    const mappedAppt = {
                        id: a.id,
                        patientId: a.patient_id,
                        doctorId: a.doctor_id,
                        hospitalId: a.hospital_id,
                        date: a.date,
                        time: a.time,
                        symptoms: a.symptoms,
                        reports: a.reports || [],
                        insurance: a.insurance,
                        paymentStatus: a.payment_status,
                        paymentAmount: parseFloat(a.payment_amount || 0),
                        qrCode: a.qr_code,
                        visitToken: a.visit_token,
                        status: a.status,
                        checkInStatus: a.check_in_status,
                        queue: a.queue || {}
                    };
                    if (localIdx !== -1) {
                        this.data.appointments[localIdx] = mappedAppt;
                    } else {
                        this.data.appointments.push(mappedAppt);
                    }
                });
                this.save();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async syncPrescriptionsFromSupabase(userId) {
        try {
            const { data, error } = await supabaseClient
                .from('prescriptions')
                .select('*')
                .eq('patient_id', userId);
            if (!error && data) {
                data.forEach(p => {
                    const localIdx = this.data.prescriptions.findIndex(lp => lp.id === p.id);
                    const mappedPresc = {
                        id: p.id,
                        appointmentId: p.appointment_id,
                        patientId: p.patient_id,
                        doctorId: p.doctor_id,
                        doctor: p.doctor,
                        date: p.date,
                        notes: p.notes,
                        medicines: p.medicines || [],
                        file: p.file
                    };
                    if (localIdx !== -1) {
                        this.data.prescriptions[localIdx] = mappedPresc;
                    } else {
                        this.data.prescriptions.push(mappedPresc);
                    }
                });
                this.save();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async syncLabReportsFromSupabase(userId) {
        try {
            const { data, error } = await supabaseClient
                .from('lab_reports')
                .select('*')
                .eq('patient_id', userId);
            if (!error && data) {
                data.forEach(lr => {
                    const localIdx = this.data.labReports.findIndex(llr => llr.id === lr.id);
                    const mappedReport = {
                        id: lr.id,
                        patientId: lr.patient_id,
                        testName: lr.test_name,
                        date: lr.date,
                        status: lr.status,
                        doctor: lr.doctor,
                        file: lr.file
                    };
                    if (localIdx !== -1) {
                        this.data.labReports[localIdx] = mappedReport;
                    } else {
                        this.data.labReports.push(mappedReport);
                    }
                });
                this.save();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async loadHospitalsAndDoctorsFromSupabase() {
        try {
            const { data: hospitals, error: hError } = await supabaseClient
                .from('hospitals')
                .select('*');
            if (!hError && hospitals && hospitals.length > 0) {
                hospitals.forEach(h => {
                    this.data.hospitals[h.id] = h;
                });
            }
            
            const { data: doctors, error: dError } = await supabaseClient
                .from('doctors')
                .select('*');
            if (!dError && doctors && doctors.length > 0) {
                doctors.forEach(d => {
                    this.data.doctors[d.id] = {
                        id: d.id,
                        name: d.name,
                        qualification: d.qualification,
                        specialty: d.specialty,
                        experience: parseInt(d.experience || 0),
                        hospitalId: d.hospital_id,
                        reviews: d.reviews || { rating: 4.8, count: 100 },
                        consultingFee: parseFloat(d.consulting_fee || 0),
                        consultationTypes: d.consultation_types || [],
                        languages: d.languages || [],
                        acceptedInsurance: d.accepted_insurance || [],
                        availability: d.availability || [],
                        awards: d.awards || [],
                        image: d.image
                    };
                });
            }
            this.save();
        } catch (e) {
            console.error("Failed to load hospitals/doctors from database:", e);
        }
    }
}

const db = new HealthcareDB();
window.db = db; // Export to global scope
