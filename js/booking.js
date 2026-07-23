// js/booking.js
// Multi-step booking form, digital signature pad, and arrival check-in flow

class BookingFlow {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.selectedDoctorId = null;
        this.uploadedFiles = [];
        this.activeCheckingApptId = null;

        // Signature Canvas properties
        this.isDrawing = false;
        this.canvas = null;
        this.ctx = null;
        this.hasSignature = false;
        this.recordsTab = 'reports';
    }

    async startBooking() {
        this.currentStep = 1;
        this.uploadedFiles = [];
        this.recordsTab = 'reports';
        document.getElementById('bookingForm').reset();
        document.getElementById('selectedFilesList').innerHTML = '';
        
        // Populate doctors select options
        const docSelect = document.getElementById('bookingDoctor');
        docSelect.innerHTML = '<option value="">-- Choose Physician --</option>';
        Object.values(db.data.doctors).forEach(d => {
            if (d.status === 'approved') {
                docSelect.innerHTML += `<option value="${d.id}">${d.name} (${d.specialty})</option>`;
            }
        });

        // Set default minimum date to today
        const dateInput = document.getElementById('bookingDate');
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1;
        let dd = today.getDate();
        mm = mm < 10 ? '0' + mm : mm;
        dd = dd < 10 ? '0' + dd : dd;
        dateInput.min = `${yyyy}-${mm}-${dd}`;
        dateInput.value = `${yyyy}-${mm}-${dd}`;

        // Populate patient dropdown options dynamically
        const patientSelect = document.getElementById('bookingPatient');
        if (patientSelect) {
            patientSelect.innerHTML = '';
            
            const currentUserId = db.data.currentUser;
            const currentUser = db.getPatient(currentUserId);
            if (currentUser) {
                patientSelect.innerHTML += `<option value="${currentUser.id}">Myself (${currentUser.name})</option>`;
            } else {
                patientSelect.innerHTML += `<option value="p1">Myself (Alex Mercer)</option>`;
            }

            // Load approved family members from Supabase
            try {
                const familyMembers = await db.fetchFamilyMembersFromSupabase(currentUserId);
                if (familyMembers && familyMembers.length > 0) {
                    familyMembers.forEach(fm => {
                        if (fm.status === 'approved') {
                            patientSelect.innerHTML += `<option value="${fm.id}">${fm.name} (${fm.relation})</option>`;
                        }
                    });
                } else if (currentUserId === 'p1') {
                    // Demo fallback
                    patientSelect.innerHTML += `<option value="p2">Lily Mercer (Daughter)</option>`;
                    patientSelect.innerHTML += `<option value="p3">Sarah Mercer (Spouse)</option>`;
                }
            } catch (err) {
                console.error("Failed to populate family members in booking dropdown:", err);
                if (currentUserId === 'p1') {
                    patientSelect.innerHTML += `<option value="p2">Lily Mercer (Daughter)</option>`;
                    patientSelect.innerHTML += `<option value="p3">Sarah Mercer (Spouse)</option>`;
                }
            }
        }
        // Auto-select insurance provider if saved in profile settings
        if (currentUser && currentUser.settings && currentUser.settings.insurance) {
            const savedIns = currentUser.settings.insurance.provider;
            const insSelect = document.getElementById('bookingInsurance');
            if (insSelect) {
                if (savedIns.includes('Blue Cross')) insSelect.value = 'Blue Cross';
                else if (savedIns.includes('UnitedHealthcare')) insSelect.value = 'UnitedHealth';
                else if (savedIns.includes('Aetna')) insSelect.value = 'Aetna';
                else if (savedIns.includes('Cigna')) insSelect.value = 'Cigna';
            }
        }

        this.syncStepView();
        app.navigateTo('booking-screen');
        this.setupDropZone();
    }

    async startBookingWithDoctor(doctorId) {
        await this.startBooking();
        document.getElementById('bookingDoctor').value = doctorId;
        this.onDoctorChange();
    }

    onDoctorChange() {
        const docId = document.getElementById('bookingDoctor').value;
        const timeSelect = document.getElementById('bookingTime');
        timeSelect.innerHTML = '';

        if (!docId) {
            timeSelect.innerHTML = '<option value="">-- Select Doctor First --</option>';
            return;
        }

        const doc = db.getDoctor(docId);
        doc.availability.forEach(slot => {
            timeSelect.innerHTML += `<option value="${slot}">${slot}</option>`;
        });

        // Update fee displays
        const fee = doc.consultingFee;
        document.getElementById('bookingFeeAmt').innerText = `$${fee.toFixed(2)}`;
        this.updatePaymentDetails();
    }

    updatePaymentDetails() {
        const docId = document.getElementById('bookingDoctor').value;
        if (!docId) return;

        const doc = db.getDoctor(docId);
        const insurance = document.getElementById('bookingInsurance').value;
        
        let fee = doc.consultingFee;
        let discount = 0;

        // Copay math details
        if (insurance === 'Blue Cross') {
            discount = fee * 0.9; // 90% coverage
        } else if (insurance === 'Aetna') {
            discount = fee * 0.8; // 80% coverage
        } else if (insurance === 'Cigna') {
            discount = fee * 0.7; // 70% coverage
        } else if (insurance === 'UnitedHealth') {
            discount = fee * 0.75; // 75% coverage
        }

        const total = fee - discount;

        document.getElementById('bookingInsDiscount').innerText = `-$${discount.toFixed(2)}`;
        document.getElementById('bookingTotalPayable').innerText = `$${total.toFixed(2)}`;
        
        // Sync with payment modal label
        document.getElementById('payModalAmt').innerText = `$${total.toFixed(2)}`;
    }

    setupDropZone() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('bookingFiles');

        dropZone.onclick = () => fileInput.click();
        
        fileInput.onchange = (e) => {
            this.handleUploadedFiles(e.target.files);
        };

        dropZone.ondragover = (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'hsl(var(--primary-hsl))';
        };

        dropZone.ondragleave = () => {
            dropZone.style.borderColor = 'hsl(var(--accent-hsl))';
        };

        dropZone.ondrop = (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'hsl(var(--accent-hsl))';
            this.handleUploadedFiles(e.dataTransfer.files);
        };
    }

    handleUploadedFiles(files) {
        const list = document.getElementById('selectedFilesList');
        for (let file of files) {
            if (!this.uploadedFiles.includes(file.name)) {
                this.uploadedFiles.push(file.name);
                list.innerHTML += `
                    <div class="medicine-pill-tag" style="width: 100%; justify-content: space-between; border-radius: 8px; margin-bottom: 6px;">
                        <span><i class="fa-solid fa-file-pdf"></i> ${file.name}</span>
                        <i class="fa-solid fa-trash-can" onclick="bookingFlow.removeFile('${file.name}', this)"></i>
                    </div>
                `;
            }
        }
        if (this.currentStep === 3) {
            this.renderExistingRecordsList();
        }
    }

    removeFile(name, element) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f !== name);
        element.parentElement.remove();
        if (this.currentStep === 3) {
            this.renderExistingRecordsList();
        }
    }

    toggleRecordsTab(tab) {
        this.recordsTab = tab;
        const btnReports = document.getElementById('btnTabReports');
        const btnPresc = document.getElementById('btnTabPrescriptions');
        
        if (tab === 'reports') {
            btnReports.style.background = 'var(--bg-card)';
            btnReports.style.color = 'var(--text-primary)';
            btnPresc.style.background = 'transparent';
            btnPresc.style.color = 'var(--text-secondary)';
        } else {
            btnPresc.style.background = 'var(--bg-card)';
            btnPresc.style.color = 'var(--text-primary)';
            btnReports.style.background = 'transparent';
            btnReports.style.color = 'var(--text-secondary)';
        }
        
        this.renderExistingRecordsList();
    }

    renderExistingRecordsList() {
        const container = document.getElementById('existingRecordsList');
        if (!container) return;
        
        const patientId = document.getElementById('bookingPatient').value;
        const currentTab = this.recordsTab || 'reports';
        
        container.innerHTML = '';
        
        if (currentTab === 'reports') {
            const reports = db.getLabReports(patientId);
            if (reports.length === 0) {
                container.innerHTML = `<p style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin: 10px 0;">No lab reports found.</p>`;
                return;
            }
            
            reports.forEach(r => {
                const isAdded = this.uploadedFiles.includes(r.file || r.testName);
                const btnLabel = isAdded ? 'Added' : '+ Add';
                const btnStyle = isAdded ? 'background-color: var(--border-color); color: var(--text-secondary); pointer-events: none;' : 'background-color: hsl(var(--accent-hsl)); color: white; cursor: pointer;';
                const fileRef = r.file || r.testName;
                const displayName = r.testName;
                
                container.innerHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span style="font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 75%; text-align: left;"><i class="fa-solid fa-file-medical"></i> ${displayName}</span>
                        <button type="button" class="btn" style="padding: 4px 8px; font-size: 0.65rem; margin: 0; width: auto; min-width: 50px; ${btnStyle}" onclick="bookingFlow.addExistingRecord('${fileRef}')">${btnLabel}</button>
                    </div>
                `;
            });
        } else {
            const prescriptions = db.getPrescriptions(patientId);
            const validPrescriptions = prescriptions.filter(p => p.file);
            
            if (validPrescriptions.length === 0) {
                container.innerHTML = `<p style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin: 10px 0;">No prescription files found.</p>`;
                return;
            }
            
            validPrescriptions.forEach(p => {
                let fileName = p.file.split('/').pop().split('-').pop();
                if (fileName.startsWith('blob:')) {
                    fileName = 'Prescription_Local.pdf';
                }
                const displayName = `Rx: ${p.doctor || 'Prescription'} (${fileName})`;
                const isAdded = this.uploadedFiles.includes(p.file);
                const btnLabel = isAdded ? 'Added' : '+ Add';
                const btnStyle = isAdded ? 'background-color: var(--border-color); color: var(--text-secondary); pointer-events: none;' : 'background-color: hsl(var(--accent-hsl)); color: white; cursor: pointer;';
                
                container.innerHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span style="font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 75%; text-align: left;"><i class="fa-solid fa-prescription-bottle-medical"></i> ${displayName}</span>
                        <button type="button" class="btn" style="padding: 4px 8px; font-size: 0.65rem; margin: 0; width: auto; min-width: 50px; ${btnStyle}" onclick="bookingFlow.addExistingRecord('${p.file}')">${btnLabel}</button>
                    </div>
                `;
            });
        }
    }

    addExistingRecord(fileRef) {
        if (!fileRef) return;
        if (!this.uploadedFiles.includes(fileRef)) {
            this.uploadedFiles.push(fileRef);
            
            const list = document.getElementById('selectedFilesList');
            let cleanName = fileRef.split('/').pop().split('-').pop();
            if (cleanName.startsWith('blob:')) {
                cleanName = 'Prescription_Local.pdf';
            }
            list.innerHTML += `
                <div class="medicine-pill-tag" style="width: 100%; justify-content: space-between; border-radius: 8px; margin-bottom: 6px;">
                    <span style="font-size: 0.75rem;"><i class="fa-solid fa-file-invoice"></i> ${cleanName}</span>
                    <i class="fa-solid fa-trash-can" onclick="bookingFlow.removeFile('${fileRef}', this)"></i>
                </div>
            `;
            
            this.renderExistingRecordsList();
        }
    }

    // Step navigation controller
    syncStepView() {
        // Steps elements toggle
        for (let i = 1; i <= this.totalSteps; i++) {
            const stepEl = document.getElementById(`step${i}`);
            const nodeEl = document.getElementById(`node${i}`);
            
            if (i === this.currentStep) {
                stepEl.classList.add('active');
                nodeEl.className = 'step-node active';
            } else if (i < this.currentStep) {
                stepEl.classList.remove('active');
                nodeEl.className = 'step-node completed';
            } else {
                stepEl.classList.remove('active');
                nodeEl.className = 'step-node';
            }
        }

        // Action navigation buttons label config
        const btnPrev = document.getElementById('btnPrevStep');
        const btnNext = document.getElementById('btnNextStep');

        if (this.currentStep === 1) {
            btnPrev.style.display = 'none';
        } else {
            btnPrev.style.display = 'inline-flex';
        }

        if (this.currentStep === this.totalSteps) {
            btnNext.innerText = 'Proceed to Payment';
        } else {
            btnNext.innerText = 'Next';
        }

        // Update progress line length
        const progressLine = document.getElementById('bookingProgressLine');
        const percentage = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
        progressLine.style.width = `${percentage}%`;

        if (this.currentStep === 3) {
            this.renderExistingRecordsList();
        }
    }

    nextStep() {
        if (!this.validateCurrentStep()) return;

        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.syncStepView();
        } else {
            // Trigger Pay gateway modal
            this.updatePaymentDetails();
            app.openModal('paymentModal');
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.syncStepView();
        }
    }

    goBack() {
        if (this.currentStep > 1) {
            this.prevStep();
        } else {
            app.navigateTo('home-screen');
        }
    }

    validateCurrentStep() {
        if (this.currentStep === 1) {
            const doc = document.getElementById('bookingDoctor').value;
            const date = document.getElementById('bookingDate').value;
            const time = document.getElementById('bookingTime').value;
            if (!doc || !date || !time) {
                alert("Please complete doctor selection, preferred date, and time slot.");
                return false;
            }
        } else if (this.currentStep === 2) {
            const symptoms = document.getElementById('bookingSymptoms').value;
            if (!symptoms || symptoms.trim().length < 5) {
                alert("Please describe symptoms in details to help doctors diagnose.");
                return false;
            }
        }
        return true;
    }

    processPayment() {
        app.closeModal('paymentModal');
        alert("Processing HIPAA payment integration...");
        
        // Simulating loader
        setTimeout(() => {
            // Insert appointment into database
            const docId = document.getElementById('bookingDoctor').value;
            const date = document.getElementById('bookingDate').value;
            const time = document.getElementById('bookingTime').value;
            const patientId = document.getElementById('bookingPatient').value;
            const symptoms = document.getElementById('bookingSymptoms').value;
            const insurance = document.getElementById('bookingInsurance').value;
            
            const doc = db.getDoctor(docId);
            const tokenNum = Math.floor(100 + Math.random() * 900);
            const apptId = `a_${Date.now()}`;
            
            const newApp = {
                id: apptId,
                patientId: patientId,
                doctorId: docId,
                hospitalId: doc.hospitalId,
                date: date,
                time: time,
                symptoms: symptoms,
                reports: this.uploadedFiles,
                insurance: insurance,
                paymentStatus: "Paid",
                paymentAmount: parseFloat(document.getElementById('bookingTotalPayable').innerText.replace('$', '')),
                qrCode: `${window.location.origin}/doctor.html?appt=${apptId}`,
                visitToken: `T-${tokenNum}`,
                status: "Upcoming",
                checkInStatus: "Not Checked In",
                queue: {
                    position: 5,
                    estWaitTime: 50,
                    delay: 5,
                    room: "Room 102",
                    currentSpeaker: "T-801"
                }
            };

            db.addAppointment(newApp);

            // Sync Confirmation Details
            document.getElementById('confirmVisitToken').innerText = newApp.visitToken;
            document.getElementById('confirmDoctorName').innerText = doc.name;
            document.getElementById('confirmDateTime').innerText = `${date} at ${time}`;

            // Generate Mock QR SVG/HTML
            const qrHolder = document.getElementById('confirmQRHolder');
            const qrAPIUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(newApp.qrCode)}`;
            qrHolder.innerHTML = `<img src="${qrAPIUrl}" alt="QR" style="width: 120px; height: 120px;">`;

            app.navigateTo('booking-confirm-screen');
        }, 1500);
    }

    // Arrival Check-In Flow
    openCheckIn(apptId) {
        this.activeCheckingApptId = apptId;
        document.getElementById('checkinScannerArea').style.display = 'block';
        document.getElementById('checkinConsentArea').style.display = 'none';
        document.getElementById('checkinTokenInput').value = '';
        
        // Pre-fill token if scan bypass clicked
        const appt = db.data.appointments.find(a => a.id === apptId);
        if (appt) {
            document.getElementById('checkinTokenInput').value = appt.visitToken;
        }

        app.navigateTo('checkin-screen');
    }

    processCheckInToken() {
        const inputToken = document.getElementById('checkinTokenInput').value.trim().toUpperCase();
        let appt = null;

        if (this.activeCheckingApptId) {
            appt = db.data.appointments.find(a => a.id === this.activeCheckingApptId);
        } else {
            // Find by token ID instead
            appt = db.data.appointments.find(a => a.visitToken.toUpperCase() === inputToken && a.patientId === db.data.currentUser);
        }

        if (appt && appt.visitToken.toUpperCase() === inputToken) {
            this.activeCheckingApptId = appt.id;
            
            // Switch to Signature/Consent view
            document.getElementById('checkinScannerArea').style.display = 'none';
            document.getElementById('checkinConsentArea').style.display = 'block';
            document.getElementById('consentCheck').checked = false;
            
            // Initialize Digital Signature Pad
            setTimeout(() => this.initSignaturePad(), 200);
        } else {
            alert("Visit Token code does not match any scheduled appointment records.");
        }
    }

    // Digital Signature Pad Canvas Draw API
    initSignaturePad() {
        this.canvas = document.getElementById('sigPad');
        this.ctx = this.canvas.getContext('2d');
        this.hasSignature = false;
        
        // Handle CSS width dynamically
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = 150;

        this.ctx.strokeStyle = '#0F4C81';
        this.ctx.lineWidth = 3.0;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Mouse Drawing Event Listeners
        this.canvas.onmousedown = (e) => {
            this.isDrawing = true;
            this.hasSignature = true;
            const pos = this.getPointerCoords(e);
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
        };

        this.canvas.onmousemove = (e) => {
            if (this.isDrawing) {
                const pos = this.getPointerCoords(e);
                this.ctx.lineTo(pos.x, pos.y);
                this.ctx.stroke();
            }
        };

        window.onmouseup = () => {
            this.isDrawing = false;
        };

        // Mobile Touch Drawing Event Listeners
        this.canvas.ontouchstart = (e) => {
            e.preventDefault();
            this.isDrawing = true;
            this.hasSignature = true;
            const pos = this.getPointerCoords(e.touches[0]);
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
        };

        this.canvas.ontouchmove = (e) => {
            e.preventDefault();
            if (this.isDrawing) {
                const pos = this.getPointerCoords(e.touches[0]);
                this.ctx.lineTo(pos.x, pos.y);
                this.ctx.stroke();
            }
        };

        this.canvas.ontouchend = () => {
            this.isDrawing = false;
        };
    }

    getPointerCoords(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    clearSignature() {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.hasSignature = false;
        }
    }

    submitConsent() {
        const consent = document.getElementById('consentCheck').checked;
        if (!consent) {
            alert("You must agree to the HIPAA medical terms and clinical guidelines.");
            return;
        }
        if (!this.hasSignature) {
            alert("Please draw your signature signature on the sign-pad first.");
            return;
        }

        // Process successful registration Check-In state
        if (this.activeCheckingApptId) {
            // Update db
            const appt = db.data.appointments.find(a => a.id === this.activeCheckingApptId);
            if (appt) {
                db.updateAppointmentStatus(this.activeCheckingApptId, 'Upcoming', 'Checked In');
                
                // Show Queue Screen
                this.syncQueueScreen(appt);
                app.navigateTo('queue-screen');
                app.renderHomeDashboard(); // Update home screen tracker state
            }
        }
    }

    syncQueueScreen(appt) {
        const doc = db.getDoctor(appt.doctorId);
        const hospital = db.getHospital(appt.hospitalId);

        document.getElementById('queuePosVal').innerText = appt.queue.position;
        document.getElementById('queueDoctorName').innerText = doc.name;
        document.getElementById('queueHospitalName').innerText = hospital.name;
        document.getElementById('queueTokenVal').innerText = appt.visitToken;
        document.getElementById('queueRoomVal').innerText = appt.queue.room;
        document.getElementById('queueWaitVal').innerText = `${appt.queue.estWaitTime} mins`;
        document.getElementById('queueDelayVal').innerText = `+${appt.queue.delay} mins delay`;
        document.getElementById('queueCurrentSpeakerVal').innerText = appt.queue.currentSpeaker;
    }
}

const bookingFlow = new BookingFlow();
window.bookingFlow = bookingFlow;
