// js/supabase.js
// Initialize Supabase Client with Preview/Bypass Mock Fallback

const supabaseUrl = "https://utpiqcvwwypxqmeeqere.supabase.co";
const supabaseKey = "sb_publishable_UHh-NROwE8idyhPSR_CKKg_6tmUMCd8";

// 1. Detect Preview Mode (Bypass real credentials)
const urlParams = new URLSearchParams(window.location.search);
let isPreviewMode = false;

if (urlParams.has('preview')) {
    isPreviewMode = urlParams.get('preview') === 'true';
    localStorage.setItem('preview_mode', isPreviewMode ? 'true' : 'false');
} else {
    isPreviewMode = localStorage.getItem('preview_mode') === 'true';
}

console.log("Healthcare System Mode: " + (isPreviewMode ? "PREVIEW (Bypassing credentials)" : "PRODUCTION (Supabase Cloud DB)"));

// Helper helpers to get/set mock local storage data
const getMockData = () => {
    if (window.db && window.db.data) return window.db.data;
    const stored = localStorage.getItem('healthcare_patient_db');
    if (stored) return JSON.parse(stored);
    
    // Seed initial structure if empty
    return {
        patients: {},
        doctors: {},
        appointments: [],
        prescriptions: [],
        labReports: [],
        receptionists: {}
    };
};

const saveMockData = (data) => {
    if (window.db && window.db.data) {
        window.db.data = data;
        window.db.save();
    } else {
        localStorage.setItem('healthcare_patient_db', JSON.stringify(data));
    }
};

// 2. Query Builder Mock
class MockSupabaseQuery {
    constructor(tableName, dataGetter, dataSetter) {
        this.tableName = tableName;
        this.dataGetter = dataGetter;
        this.dataSetter = dataSetter;
        this.filters = [];
        this.orders = [];
        this.limitVal = null;
    }

    select(columns) {
        return this; // chainable
    }

    eq(column, value) {
        this.filters.push({ type: 'eq', column, value });
        return this;
    }

    in(column, values) {
        this.filters.push({ type: 'in', column, values });
        return this;
    }

    maybeSingle() {
        return this.execute().then(res => {
            return { data: res.data ? res.data[0] || null : null, error: res.error };
        });
    }

    single() {
        return this.execute().then(res => {
            return { data: res.data ? res.data[0] || null : null, error: res.error };
        });
    }

    order(column, options = {}) {
        this.orders.push({ column, ascending: options.ascending !== false });
        return this;
    }

    limit(n) {
        this.limitVal = n;
        return this;
    }

    async execute() {
        const dbData = this.dataGetter();
        let rows = [];

        if (this.tableName === 'profiles') {
            rows = Object.values(dbData.patients || {});
        } else if (this.tableName === 'doctors') {
            rows = Object.values(dbData.doctors || {});
        } else if (this.tableName === 'hospitals') {
            rows = Object.values(dbData.hospitals || {});
        } else if (this.tableName === 'appointments') {
            rows = dbData.appointments || [];
        } else if (this.tableName === 'prescriptions') {
            rows = dbData.prescriptions || [];
        } else if (this.tableName === 'lab_reports') {
            rows = dbData.labReports || [];
        } else if (this.tableName === 'receptionists') {
            rows = Object.values(dbData.receptionists || {});
        }

        // Apply filters
        for (const f of this.filters) {
            if (f.type === 'eq') {
                rows = rows.filter(r => {
                    const localKey = this.mapField(f.column);
                    const val = r[f.column] !== undefined ? r[f.column] : r[localKey];
                    return String(val) === String(f.value);
                });
            } else if (f.type === 'in') {
                rows = rows.filter(r => {
                    const localKey = this.mapField(f.column);
                    const val = r[f.column] !== undefined ? r[f.column] : r[localKey];
                    return f.values.map(String).includes(String(val));
                });
            }
        }

        // Apply sorting
        for (const o of this.orders) {
            rows.sort((a, b) => {
                const localKey = this.mapField(o.column);
                const valA = a[o.column] !== undefined ? a[o.column] : a[localKey];
                const valB = b[o.column] !== undefined ? b[o.column] : b[localKey];
                if (valA < valB) return o.ascending ? -1 : 1;
                if (valA > valB) return o.ascending ? 1 : -1;
                return 0;
            });
        }

        if (this.limitVal) {
            rows = rows.slice(0, this.limitVal);
        }

        // Map back to DB snake_case formats
        const mappedRows = rows.map(r => this.mapToDBFormat(r));

        return { data: mappedRows, error: null };
    }

    mapField(field) {
        if (field === 'patient_id') return 'patientId';
        if (field === 'doctor_id') return 'doctorId';
        if (field === 'hospital_id') return 'hospitalId';
        if (field === 'check_in_status') return 'checkInStatus';
        if (field === 'blood_group') return 'bloodGroup';
        if (field === 'payment_status') return 'paymentStatus';
        if (field === 'payment_amount') return 'paymentAmount';
        if (field === 'qr_code') return 'qrCode';
        if (field === 'visit_token') return 'visitToken';
        if (field === 'test_name') return 'testName';
        if (field === 'appointment_id') return 'appointmentId';
        return field;
    }

    mapToDBFormat(obj) {
        const copy = { ...obj };
        copy.patient_id = obj.patientId || obj.patient_id;
        copy.doctor_id = obj.doctorId || obj.doctor_id;
        copy.hospital_id = obj.hospitalId || obj.hospital_id;
        copy.check_in_status = obj.checkInStatus || obj.check_in_status;
        copy.blood_group = obj.bloodGroup || obj.blood_group;
        copy.payment_status = obj.paymentStatus || obj.payment_status;
        copy.payment_amount = obj.paymentAmount || obj.payment_amount;
        copy.qr_code = obj.qrCode || obj.qr_code;
        copy.visit_token = obj.visitToken || obj.visit_token;
        copy.test_name = obj.testName || obj.test_name;
        copy.appointment_id = obj.appointmentId || obj.appointment_id;
        return copy;
    }

    // Thenable implementation
    then(onfulfilled, onrejected) {
        return this.execute().then(onfulfilled, onrejected);
    }

    async insert(rows) {
        const dbData = this.dataGetter();
        const inputRows = Array.isArray(rows) ? rows : [rows];
        const inserted = [];

        for (const row of inputRows) {
            const localRow = { ...row };
            if (row.patient_id) localRow.patientId = row.patient_id;
            if (row.doctor_id) localRow.doctorId = row.doctor_id;
            if (row.hospital_id) localRow.hospitalId = row.hospital_id;
            if (row.check_in_status) localRow.checkInStatus = row.check_in_status;
            if (row.blood_group) localRow.bloodGroup = row.blood_group;
            if (row.payment_status) localRow.paymentStatus = row.payment_status;
            if (row.payment_amount) localRow.paymentAmount = row.payment_amount;
            if (row.qr_code) localRow.qrCode = row.qr_code;
            if (row.visit_token) localRow.visitToken = row.visit_token;
            if (row.test_name) localRow.testName = row.test_name;
            if (row.appointment_id) localRow.appointmentId = row.appointment_id;

            if (this.tableName === 'profiles') {
                if (!dbData.patients) dbData.patients = {};
                dbData.patients[row.id] = localRow;
            } else if (this.tableName === 'doctors') {
                if (!dbData.doctors) dbData.doctors = {};
                dbData.doctors[row.id] = localRow;
            } else if (this.tableName === 'hospitals') {
                if (!dbData.hospitals) dbData.hospitals = {};
                dbData.hospitals[row.id] = localRow;
            } else if (this.tableName === 'appointments') {
                if (!dbData.appointments) dbData.appointments = [];
                dbData.appointments.push(localRow);
            } else if (this.tableName === 'prescriptions') {
                if (!dbData.prescriptions) dbData.prescriptions = [];
                dbData.prescriptions.push(localRow);
            } else if (this.tableName === 'lab_reports') {
                if (!dbData.labReports) dbData.labReports = [];
                dbData.labReports.push(localRow);
            } else if (this.tableName === 'receptionists') {
                if (!dbData.receptionists) dbData.receptionists = {};
                dbData.receptionists[row.id] = localRow;
            }
            inserted.push(this.mapToDBFormat(localRow));
        }

        this.dataSetter(dbData);
        return { data: inserted, error: null };
    }

    async update(fields) {
        const dbData = this.dataGetter();
        const res = await this.execute();
        const matchedIds = res.data.map(r => r.id);

        const updateLocal = (items) => {
            if (Array.isArray(items)) {
                items.forEach(item => {
                    if (matchedIds.includes(item.id)) {
                        Object.keys(fields).forEach(k => {
                            const localKey = this.mapField(k);
                            item[localKey] = fields[k];
                        });
                    }
                });
            } else {
                Object.keys(items).forEach(id => {
                    if (matchedIds.includes(id)) {
                        Object.keys(fields).forEach(k => {
                            const localKey = this.mapField(k);
                            items[id][localKey] = fields[k];
                        });
                    }
                });
            }
        };

        if (this.tableName === 'profiles') {
            updateLocal(dbData.patients);
        } else if (this.tableName === 'doctors') {
            updateLocal(dbData.doctors);
        } else if (this.tableName === 'appointments') {
            updateLocal(dbData.appointments);
        } else if (this.tableName === 'prescriptions') {
            updateLocal(dbData.prescriptions);
        } else if (this.tableName === 'lab_reports') {
            updateLocal(dbData.labReports);
        } else if (this.tableName === 'receptionists') {
            updateLocal(dbData.receptionists);
        }

        this.dataSetter(dbData);
        return { data: res.data.map(r => ({ ...r, ...fields })), error: null };
    }
}

// 3. Auth and Storage Mock Client
class MockSupabaseClient {
    constructor() {
        this.authCallbacks = [];
        this.currentSession = null;
        
        const savedSession = localStorage.getItem('mock_supabase_session');
        if (savedSession) {
            this.currentSession = JSON.parse(savedSession);
        } else {
            // Auto-login appropriate role in preview mode for credentials bypass
            if (window.location.pathname.includes('reception.html')) {
                this.currentSession = {
                    user: {
                        id: 'r1',
                        email: 'demo.reception@oneminute.com',
                        role: 'receptionist',
                        user_metadata: { full_name: "Demo Receptionist" }
                    }
                };
            } else {
                this.currentSession = {
                    user: {
                        id: 'p1',
                        email: 'alex.mercer@email.com',
                        role: 'patient',
                        user_metadata: { full_name: "Alex Mercer" }
                    }
                };
            }
            localStorage.setItem('mock_supabase_session', JSON.stringify(this.currentSession));
        }
        
        this.auth = {
            signInWithPassword: async ({ email, password }) => {
                const dbData = getMockData();
                let userObj = Object.values(dbData.patients || {}).find(p => p.email === email);
                let role = 'patient';
                
                if (!userObj) {
                    userObj = Object.values(dbData.doctors || {}).find(d => d.email === email);
                    role = 'doctor';
                }
                
                if (!userObj) {
                    userObj = Object.values(dbData.receptionists || {}).find(r => r.email === email);
                    role = 'receptionist';
                }

                if (userObj) {
                    const session = {
                        user: {
                            id: userObj.id,
                            email: userObj.email,
                            role: role,
                            user_metadata: {
                                full_name: userObj.name
                            }
                        }
                    };
                    this.currentSession = session;
                    localStorage.setItem('mock_supabase_session', JSON.stringify(session));
                    this.triggerAuthStateChange('SIGNED_IN', session);
                    return { data: session, error: null };
                } else {
                    if (email === 'alex.mercer@email.com') {
                        const session = {
                            user: {
                                id: 'p1',
                                email: 'alex.mercer@email.com',
                                role: 'patient',
                                user_metadata: { full_name: "Alex Mercer" }
                            }
                        };
                        this.currentSession = session;
                        localStorage.setItem('mock_supabase_session', JSON.stringify(session));
                        this.triggerAuthStateChange('SIGNED_IN', session);
                        return { data: session, error: null };
                    }
                    return { data: { session: null }, error: { message: "Invalid email or password" } };
                }
            },
            
            signUp: async ({ email, password, options }) => {
                const dbData = getMockData();
                const userId = 'u_' + Date.now();
                const metadata = options?.data || {};
                
                const newUser = {
                    id: userId,
                    name: metadata.full_name || email.split('@')[0],
                    email: email,
                    phone: metadata.phone || '',
                    dob: metadata.dob || '',
                    gender: metadata.gender || 'Unspecified',
                    bloodGroup: metadata.blood_group || 'O+',
                    height: parseFloat(metadata.height || 170),
                    weight: parseFloat(metadata.weight || 70),
                    bmi: parseFloat(metadata.bmi || 24.2),
                    image: metadata.image || '',
                    address: metadata.address || '',
                    emergencyContact: metadata.emergency_contact || { name: '', relation: '', phone: '' },
                    settings: metadata.settings || { language: 'English', organDonor: false, darkMode: false, biometricsEnabled: false },
                    medicalHistory: metadata.medical_history || { allergies: [], chronicDiseases: [], surgeries: [], currentMedicines: [] },
                    lifestyle: metadata.lifestyle || { smoking: 'Never', alcohol: 'Never', exercise: 'None', sleep: '8 hours' },
                    healthScore: 80
                };

                if (!dbData.patients) dbData.patients = {};
                dbData.patients[userId] = newUser;
                saveMockData(dbData);

                const session = {
                    user: {
                        id: userId,
                        email: email,
                        role: 'patient',
                        user_metadata: {
                            full_name: newUser.name
                        }
                    }
                };
                
                this.currentSession = session;
                localStorage.setItem('mock_supabase_session', JSON.stringify(session));
                this.triggerAuthStateChange('SIGNED_IN', session);
                return { data: session, error: null };
            },
            
            signOut: async () => {
                this.currentSession = null;
                localStorage.removeItem('mock_supabase_session');
                this.triggerAuthStateChange('SIGNED_OUT', null);
                return { error: null };
            },
            
            onAuthStateChange: (callback) => {
                this.authCallbacks.push(callback);
                setTimeout(() => {
                    callback(this.currentSession ? 'SIGNED_IN' : 'SIGNED_OUT', this.currentSession);
                }, 10);
                return {
                    data: {
                        subscription: {
                            unsubscribe: () => {
                                this.authCallbacks = this.authCallbacks.filter(c => c !== callback);
                            }
                        }
                    }
                };
            },
            
            updateUser: async ({ data }) => {
                if (!this.currentSession) return { error: { message: "No active session" } };
                const dbData = getMockData();
                const userId = this.currentSession.user.id;
                
                if (dbData.patients && dbData.patients[userId]) {
                    dbData.patients[userId] = { ...dbData.patients[userId], ...data };
                    saveMockData(dbData);
                }
                
                return { data: { user: this.currentSession.user }, error: null };
            }
        };

        this.storage = {
            from: (bucket) => ({
                upload: async (path, file) => {
                    return { data: { path }, error: null };
                },
                getPublicUrl: (path) => {
                    return { data: { publicUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=300' } };
                }
            })
        };
    }

    from(tableName) {
        return new MockSupabaseQuery(tableName, getMockData, saveMockData);
    }

    triggerAuthStateChange(event, session) {
        this.authCallbacks.forEach(cb => {
            try {
                cb(event, session);
            } catch (e) {
                console.error("Auth state callback error:", e);
            }
        });
    }
}

// 4. Client Instantiation
let supabaseClient;
if (isPreviewMode) {
    supabaseClient = new MockSupabaseClient();
} else {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
}

// Attach to window for global access
window.supabaseClient = supabaseClient;
console.log("Supabase Client Initialized:", window.supabaseClient);

// Cache session globally for the app initialization to access
window.supabaseSession = null;

supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log("Supabase Auth State Change:", event, session);
    window.supabaseSession = session;
    
    if (window.app) {
        if (session && session.user) {
            window.app.handleSupabaseUserLoggedIn(session.user);
        } else {
            window.app.handleSupabaseUserLoggedOut();
        }
    }
});
