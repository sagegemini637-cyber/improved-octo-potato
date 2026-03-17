class PrivateHospitalModule {
    constructor(clientId) {
        this.clientId = clientId;
        this.db = window.db;
    }

    async recordPatientAdmission(patientData) {
        const patient = {
            id: this.generateUUID(),
            client_id: this.clientId,
            name: patientData.name,
            age: patientData.age,
            contact: patientData.phone,
            admission_date: new Date(),
            department: patientData.department,
            doctor_id: patientData.assignedDoctor,
            bed_id: patientData.bedNumber,
            status: 'admitted',
            insurance_details: patientData.insurance,
            medical_history: patientData.medicalHistory || [],
            current_medications: patientData.medications || [],
            vitals: {
                blood_pressure: '',
                temperature: '',
                heart_rate: '',
                respiratory_rate: ''
            }
        };
        await this.db.insert('patients', patient);
        await this.db.update('beds', { id: patientData.bedNumber }, { status: 'occupied', patient_id: patient.id });
        await this.notifyDoctor(patientData.assignedDoctor, 'new_admission', patient);
        return patient;
    }

    async updatePatientVitals(patientId, vitals) {
        const record = {
            id: this.generateUUID(),
            patient_id: patientId,
            blood_pressure: vitals.bloodPressure,
            temperature: vitals.temperature,
            heart_rate: vitals.heartRate,
            respiratory_rate: vitals.respiratoryRate,
            oxygen_saturation: vitals.o2Sat,
            recorded_at: new Date(),
            recorded_by: vitals.nurseId
        };
        await this.db.insert('vital_records', record);
        const alerts = this.checkVitalAlerts(vitals);
        if (alerts.length > 0) {
            await this.notifyDoctorAlert(patientId, alerts);
        }
        return record;
    }

    async dischargePatient(patientId, notes) {
        const patient = await this.db.findOne('patients', { id: patientId });
        await this.db.update('patients', { id: patientId }, { status: 'discharged', discharge_date: new Date(), discharge_notes: notes });
        await this.db.update('beds', { id: patient.bed_id }, { status: 'vacant', patient_id: null });
        const bill = await this.generatePatientBill(patientId);
        return { patient, bill };
    }

    async updateBedOccupancy() {
        const beds = await this.db.find('beds', { client_id: this.clientId });
        const occupied = beds.filter(b => b.status === 'occupied').length;
        const total = beds.length;
        return {
            occupied,
            vacant: total - occupied,
            occupancy_rate: ((occupied / total) * 100).toFixed(2),
            beds_data: beds
        };
    }

    async getDashboardMetrics() {
        const patients = await this.db.find('patients', { client_id: this.clientId, status: 'admitted' });
        const emergencyCases = await this.db.find('emergency_admissions', { client_id: this.clientId, date: { $gte: new Date(Date.now() - 24*60*60*1000) } });
        const departments = {};
        for (const patient of patients) {
            departments[patient.department] = (departments[patient.department] || 0) + 1;
        }
        return {
            total_patients_admitted: patients.length,
            emergency_cases_24h: emergencyCases.length,
            department_load: departments,
            bed_occupancy: await this.updateBedOccupancy(),
            critical_patients: patients.filter(p => p.condition === 'critical').length,
            total_revenue_today: await this.getTodayRevenue()
        };
    }

    async trackPharmacySales(itemId, quantity, price, patientId) {
        const sale = {
            id: this.generateUUID(),
            client_id: this.clientId,
            item_id: itemId,
            quantity,
            unit_price: price,
            total_amount: quantity * price,
            patient_id: patientId,
            sale_date: new Date()
        };
        await this.db.insert('pharmacy_sales', sale);
        const item = await this.db.findOne('pharmacy_items', { id: itemId });
        const newQuantity = (item.quantity || 0) - quantity;
        await this.db.update('pharmacy_items', { id: itemId }, { quantity: newQuantity });
        if (newQuantity < item.reorder_level) {
            await this.createAutoReorderRequest(itemId, item.reorder_quantity);
        }
        return sale;
    }

    async getPharmacyReport(dateRange) {
        const sales = await this.db.find('pharmacy_sales', { client_id: this.clientId, sale_date: { $gte: dateRange.start, $lte: dateRange.end } });
        const totalSales = sales.reduce((sum, s) => sum + s.total_amount, 0);
        const topItems = this.getTopSellingItems(sales);
        return {
            total_sales: totalSales,
            transaction_count: sales.length,
            top_items: topItems,
            sales_by_day: this.aggregateByDay(sales)
        };
    }

    async trackInsuranceClaims(patientId, claimData) {
        const claim = {
            id: this.generateUUID(),
            client_id: this.clientId,
            patient_id: patientId,
            insurance_company: claimData.company,
            claim_amount: claimData.amount,
            claim_date: new Date(),
            status: 'pending',
            documents: claimData.documents || []
        };
        await this.db.insert('insurance_claims', claim);
        return claim;
    }

    async getInsuranceSummary() {
        const claims = await this.db.find('insurance_claims', { client_id: this.clientId });
        return {
            total_claims: claims.length,
            approved: claims.filter(c => c.status === 'approved').length,
            pending: claims.filter(c => c.status === 'pending').length,
            rejected: claims.filter(c => c.status === 'rejected').length,
            total_amount: claims.reduce((sum, c) => sum + (c.claim_amount || 0), 0),
            approval_rate: ((claims.filter(c => c.status === 'approved').length / claims.length) * 100).toFixed(2)
        };
    }

    async generatePatientBill(patientId) {
        const patient = await this.db.findOne('patients', { id: patientId });
        const accommodationCharges = await this.db.find('accommodation_charges', { patient_id: patientId });
        const medications = await this.db.find('pharmacy_sales', { patient_id: patientId });
        const procedures = await this.db.find('procedures', { patient_id: patientId });
        const consultationFees = await this.db.find('consultation_fees', { patient_id: patientId });
        const totalAccommodation = accommodationCharges.reduce((sum, a) => sum + a.amount, 0);
        const totalMedications = medications.reduce((sum, m) => sum + m.total_amount, 0);
        const totalProcedures = procedures.reduce((sum, p) => sum + p.cost, 0);
        const totalConsultation = consultationFees.reduce((sum, c) => sum + c.fee, 0);
        const totalBill = totalAccommodation + totalMedications + totalProcedures + totalConsultation;
        return {
            patient_name: patient.name,
            admission_date: patient.admission_date,
            discharge_date: new Date(),
            accommodation: totalAccommodation,
            medications: totalMedications,
            procedures: totalProcedures,
            consultation: totalConsultation,
            total_bill: totalBill,
            balance: totalBill - (patient.advance_payment || 0)
        };
    }

    async predictPatientFlow() {
        const historicalData = await this.db.find('patient_arrivals', { client_id: this.clientId, date: { $gte: new Date(Date.now() - 90*24*60*60*1000) } });
        const dailyArrivals = this.aggregateByDay(historicalData);
        const trend = this.calculateTrend(dailyArrivals);
        const forecast = this.forecastNextWeek(dailyArrivals, trend);
        return {
            historical: dailyArrivals,
            forecast,
            trend
        };
    }

    checkVitalAlerts(vitals) {
        const alerts = [];
        if (vitals.bloodPressure && vitals.bloodPressure > 180) alerts.push('High Blood Pressure');
        if (vitals.temperature && vitals.temperature > 39) alerts.push('High Fever');
        if (vitals.heartRate && vitals.heartRate > 120) alerts.push('Elevated Heart Rate');
        if (vitals.o2Sat && vitals.o2Sat < 90) alerts.push('Low Oxygen Saturation');
        return alerts;
    }

    async notifyDoctor(doctorId, type, data) {
        const notification = {
            id: this.generateUUID(),
            doctor_id: doctorId,
            type,
            data,
            created_at: new Date(),
            read: false
        };
        await this.db.insert('notifications', notification);
    }

    async notifyDoctorAlert(patientId, alerts) {
        const patient = await this.db.findOne('patients', { id: patientId });
        await this.notifyDoctor(patient.doctor_id, 'vital_alert', { patient_name: patient.name, alerts });
    }

    async getTodayRevenue() {
        const sales = await this.db.find('pharmacy_sales', { client_id: this.clientId, sale_date: { $gte: new Date().toDateString() } });
        return sales.reduce((sum, s) => sum + s.total_amount, 0);
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    aggregateByDay(data) {
        const grouped = {};
        data.forEach(item => {
            const day = new Date(item.date || item.sale_date).toDateString();
            grouped[day] = (grouped[day] || 0) + 1;
        });
        return grouped;
    }

    getTopSellingItems(sales) {
        const items = {};
        sales.forEach(s => {
            items[s.item_id] = (items[s.item_id] || 0) + s.quantity;
        });
        return Object.entries(items).sort((a, b) => b[1] - a[1]).slice(0, 10);
    }

    calculateTrend(data) {
        const values = Object.values(data);
        const n = values.length;
        const mean = values.reduce((a, b) => a + b, 0) / n;
        const slope = values.reduce((sum, v, i) => sum + (i - (n-1)/2) * (v - mean), 0) / values.reduce((sum, _, i) => sum + Math.pow(i - (n-1)/2, 2), 0);
        return slope > 0 ? 'increasing' : 'decreasing';
    }

    forecastNextWeek(data, trend) {
        const values = Object.values(data);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return {
            monday: Math.round(avg * 1.1),
            tuesday: Math.round(avg * 1.05),
            wednesday: Math.round(avg * 1.08),
            thursday: Math.round(avg * 0.95),
            friday: Math.round(avg * 1.02),
            saturday: Math.round(avg * 0.9),
            sunday: Math.round(avg * 0.85)
        };
    }

    createAutoReorderRequest(itemId, quantity) {
        return this.db.insert('reorder_requests', { id: this.generateUUID(), item_id: itemId, quantity, status: 'pending', created_at: new Date() });
    }
}

if (typeof window !== 'undefined') {
    window.PrivateHospitalModule = PrivateHospitalModule;
}