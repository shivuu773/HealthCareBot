const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'healthbot.db');
const db = new Database(DB_PATH, { readonly: true });

console.log('Database:', DB_PATH);
console.log('--- Patients ---');
const patients = db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all();
console.log(patients.length ? patients : 'No patients found');

console.log('\n--- Appointments ---');
const appointments = db.prepare(`
  SELECT a.id, a.patient_id, a.type, a.date, a.time, a.status, a.notes, a.created_at,
         p.name AS patient_name, p.contact AS patient_contact
  FROM appointments a
  JOIN patients p ON a.patient_id = p.id
  ORDER BY a.date DESC, a.time DESC
`).all();
console.log(appointments.length ? appointments : 'No appointments found');
