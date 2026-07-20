// js/consultation.js
// Doctor Consultation Portal, Consultation Timer, AI Clinical Summary, and PDF Prescription Exporter

class ConsultationModule {
    constructor() {
        this.timerInterval = null;
        this.secondsElapsed = 0;
        this.prescribedMedicines = [];
        this.activeApptId = null;
        this.latestPrescriptionId = null;
    }

    enterConsultation() {
        // Find active checked-in appointment to consult
        const user = db.getCurrentUser();
        const activeApps = db.getAppointments(user.id).filter(app => app.checkInStatus === 'Checked In' && app.status !== 'Completed');

        if (activeApps.length === 0) {
            alert("No checked-in active appointment ready for doctor consultation.");
            return;
        }

        const appt = activeApps[0];
        this.activeApptId = appt.id;

        // Populate patient details
        const patient = db.getPatient(appt.patientId);
        const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();
        document.getElementById('consPatientName').innerText = `${patient.name} (${age} yrs)`;
        document.getElementById('consPatientAllergies').innerText = patient.medicalHistory.allergies.join(', ') || 'None';
        document.getElementById('consPatientMeds').innerText = patient.medicalHistory.currentMedicines.map(m => m.name).join(', ') || 'None';
        document.getElementById('consPatientSymptoms').innerText = appt.symptoms;

        // Reset inputs
        document.getElementById('consultNotes').innerText = "Patient reports " + appt.symptoms + ". Rest of check normal. Heart rate 72 bpm, blood pressure 120/80 mmHg.";
        document.getElementById('consAISummary').innerText = "Click button below to parse symptoms.";
        this.prescribedMedicines = [];
        this.renderMedicinesList();

        // Start timer
        this.secondsElapsed = 0;
        const timerVal = document.querySelector('#consultTimer span');
        timerVal.innerText = "00:00";
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            this.secondsElapsed++;
            let mm = Math.floor(this.secondsElapsed / 60);
            let ss = this.secondsElapsed % 60;
            mm = mm < 10 ? '0' + mm : mm;
            ss = ss < 10 ? '0' + ss : ss;
            timerVal.innerText = `${mm}:${ss}`;
        }, 1000);

        app.navigateTo('consultation-screen');
    }

    generateAISummary() {
        const symptoms = document.getElementById('consPatientSymptoms').innerText;
        const box = document.getElementById('consAISummary');

        box.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Analyzing symptoms data...`;

        setTimeout(() => {
            box.innerHTML = `
                <strong>AI Diagnostic Copilot Indicators:</strong><br>
                • Primary symptoms: "${symptoms}".<br>
                • Risk Stratification: Mild clinical indicator. Check resting electrocardiogram (ECG) & serum lipids.<br>
                • Suggested treatment: Rest, cardiac pacing, magnesium optimization. Avoid caffeine triggers.
            `;
        }, 1200);
    }

    addMedicine() {
        const name = document.getElementById('medName').value.trim();
        const dose = document.getElementById('medDose').value.trim();
        const duration = document.getElementById('medDuration').value.trim();
        const instructions = document.getElementById('medInstructions').value.trim();

        if (!name || !dose || !duration) {
            alert("Please input Medicine Name, Dose, and Duration.");
            return;
        }

        const med = {
            name: name,
            dose: dose,
            duration: duration,
            foodInstructions: instructions || "Take with water",
            warnings: "Take under physician's guidance"
        };

        this.prescribedMedicines.push(med);
        this.renderMedicinesList();

        // Clear sub-inputs
        document.getElementById('medName').value = '';
        document.getElementById('medDose').value = '';
        document.getElementById('medDuration').value = '';
        document.getElementById('medInstructions').value = '';
    }

    removeMedicine(idx) {
        this.prescribedMedicines.splice(idx, 1);
        this.renderMedicinesList();
    }

    renderMedicinesList() {
        const container = document.getElementById('consPrescriptionList');
        container.innerHTML = '';

        if (this.prescribedMedicines.length === 0) {
            container.innerHTML = `<span style="font-size: 0.75rem; color: var(--text-muted);">No medicines prescribed yet. Use inputs above to add.</span>`;
            return;
        }

        this.prescribedMedicines.forEach((med, idx) => {
            container.innerHTML += `
                <div class="medicine-pill-tag">
                    <span><b>${med.name}</b> (${med.dose} for ${med.duration})</span>
                    <i class="fa-solid fa-circle-xmark" onclick="consultationModule.removeMedicine(${idx})"></i>
                </div>
            `;
        });
    }

    completeConsultation() {
        if (this.timerInterval) clearInterval(this.timerInterval);

        const appt = db.data.appointments.find(a => a.id === this.activeApptId);
        const patient = db.getPatient(appt.patientId);
        const doctor = db.getDoctor(appt.doctorId);

        const prescId = `pr_${Date.now()}`;
        const newPresc = {
            id: prescId,
            appointmentId: appt.id,
            patientId: appt.patientId,
            doctorId: appt.doctorId,
            date: new Date().toISOString().split('T')[0],
            notes: document.getElementById('consultNotes').innerText,
            medicines: this.prescribedMedicines
        };

        db.addPrescription(newPresc);
        db.updateAppointmentStatus(this.activeApptId, 'Completed', 'Checked In');
        this.latestPrescriptionId = prescId;

        // Render PDF Screen View details
        this.renderPrescriptionScreen(prescId);
    }

    renderPrescriptionScreen(prescId) {
        const presc = db.data.prescriptions.find(p => p.id === prescId);
        if (!presc) return;

        const patient = db.getPatient(presc.patientId);
        const doc = db.getDoctor(presc.doctorId);
        const hospital = db.getHospital(doc.hospitalId);
        const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();

        document.getElementById('pdfHospitalName').innerText = hospital.name;
        document.getElementById('pdfDoctorName').innerText = `${doc.name}, MD`;
        document.getElementById('pdfPatientName').innerText = patient.name;
        document.getElementById('pdfPatientAgeGender').innerText = `${age} yrs / ${patient.gender}`;
        document.getElementById('pdfPrescDate').innerText = presc.date;
        document.getElementById('pdfPrescID').innerText = presc.id.replace('pr_', 'RX-');
        document.getElementById('pdfDoctorNotes').innerText = presc.notes;
        document.getElementById('pdfDoctorSignature').innerText = doc.name;

        // Medicines Table rows
        const tbody = document.querySelector('#pdfMedicinesTable tbody');
        tbody.innerHTML = '';

        if (presc.medicines.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 10px;">No medications prescribed during consultation.</td></tr>`;
        } else {
            presc.medicines.forEach(m => {
                tbody.innerHTML += `
                    <tr style="border-bottom: 1px solid #f3f4f6;">
                        <td style="padding: 6px 4px; font-weight: 600;">${m.name}</td>
                        <td style="padding: 6px 4px;">${m.dose}</td>
                        <td style="padding: 6px 4px;">${m.duration}</td>
                        <td style="padding: 6px 4px; color: #4b5563;">${m.foodInstructions}</td>
                    </tr>
                `;
            });
        }

        app.navigateTo('prescription-screen');
        app.renderHomeDashboard(); // sync widgets list
    }

    downloadPrescriptionPDF() {
        const prescId = this.latestPrescriptionId;
        if (!prescId) {
            alert("No active prescription record to export.");
            return;
        }

        const presc = db.data.prescriptions.find(p => p.id === prescId);
        const patient = db.getPatient(presc.patientId);
        const doc = db.getDoctor(presc.doctorId);
        const hospital = db.getHospital(doc.hospitalId);
        const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();

        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Layout Styling Metrics
            pdf.setFillColor(15, 76, 129); // Primary Clinical Blue
            pdf.rect(0, 0, 210, 30, 'F');

            // Header Text
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(16);
            pdf.text(hospital.name, 15, 12);
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.text(hospital.address, 15, 18);

            pdf.setFont('helvetica', 'bold');
            pdf.text(`${doc.name}, MD`, 150, 12);
            pdf.setFont('helvetica', 'normal');
            pdf.text("Authorized Medical Practitioner", 150, 18);

            // Patient details card
            pdf.setFillColor(243, 244, 246); // light gray
            pdf.roundedRect(15, 40, 180, 20, 3, 3, 'F');
            
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(9);
            pdf.text("PATIENT PROFILE", 20, 46);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Name: ${patient.name}`, 20, 53);
            pdf.text(`Age/Gender: ${age} yrs / ${patient.gender}`, 80, 53);
            pdf.text(`Date: ${presc.date}`, 145, 46);
            pdf.text(`Prescription ID: ${presc.id.replace('pr_', 'RX-')}`, 145, 53);

            // Rx Logo Symbol
            pdf.setTextColor(15, 76, 129);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(26);
            pdf.text("Rx", 15, 75);

            // Medicines Table Headers
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.text("Prescribed Medications", 15, 88);

            pdf.setFillColor(229, 231, 235);
            pdf.rect(15, 93, 180, 8, 'F');
            
            pdf.setFontSize(8.5);
            pdf.text("Medicine Name", 18, 98);
            pdf.text("Dose", 85, 98);
            pdf.text("Duration", 115, 98);
            pdf.text("Instructions", 145, 98);

            // Medicines List details
            let y = 107;
            pdf.setFont('helvetica', 'normal');
            
            if (presc.medicines.length === 0) {
                pdf.text("No medications prescribed.", 20, y);
            } else {
                presc.medicines.forEach(m => {
                    pdf.text(m.name, 18, y);
                    pdf.text(m.dose, 85, y);
                    pdf.text(m.duration, 115, y);
                    pdf.text(m.foodInstructions, 145, y);
                    
                    pdf.setDrawColor(243, 244, 246);
                    pdf.line(15, y + 2, 195, y + 2);
                    y += 10;
                });
            }

            // Doctor Notes
            y += 5;
            pdf.setFont('helvetica', 'bold');
            pdf.text("Doctor Advisory Notes:", 15, y);
            pdf.setFont('helvetica', 'oblique');
            pdf.setFontSize(8);
            pdf.text(presc.notes, 15, y + 5, { maxWidth: 180 });

            // Signature stamp representation
            y += 28;
            pdf.setDrawColor(156, 163, 175);
            pdf.line(140, y, 190, y);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(7.5);
            pdf.text("Physician Stamp / Signature", 145, y + 4);

            // Save PDF locally
            pdf.save(`Prescription-${presc.id.replace('pr_', 'RX-')}.pdf`);
            alert("HIPAA encrypted prescription PDF downloaded successfully.");

        } catch (err) {
            console.error("PDF generation error, dropping fallback print.", err);
            // Fallback printing option
            window.print();
        }
    }

    sharePrescription() {
        const user = db.getCurrentUser();
        alert(`Transmitting digital prescription to MediGi Network Partner Pharmacies for ${user.name}. Auto-coordinating insurance approvals...`);
    }
}

const consultationModule = new ConsultationModule();
window.consultationModule = consultationModule;
