const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "healthbot.db");
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// ═══════════════════════════════════════════
// ─── Create Tables ────────────────────────
// ═══════════════════════════════════════════

db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    age         INTEGER,
    gender      TEXT,
    contact     TEXT    NOT NULL,
    email       TEXT,
    address     TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id    INTEGER NOT NULL,
    type          TEXT    NOT NULL,
    date          TEXT    NOT NULL,
    time          TEXT    DEFAULT 'Not specified',
    status        TEXT    DEFAULT 'Scheduled',
    notes         TEXT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
  );
`);

console.log("📦 SQLite database initialized at:", DB_PATH);

// ═══════════════════════════════════════════
// ─── Patient CRUD ─────────────────────────
// ═══════════════════════════════════════════

const patientStmts = {
  insert: db.prepare(`
    INSERT INTO patients (name, age, gender, contact, email, address)
    VALUES (@name, @age, @gender, @contact, @email, @address)
  `),
  getAll:    db.prepare("SELECT * FROM patients ORDER BY created_at DESC"),
  getById:   db.prepare("SELECT * FROM patients WHERE id = ?"),
  update:    db.prepare(`
    UPDATE patients SET name=@name, age=@age, gender=@gender,
    contact=@contact, email=@email, address=@address WHERE id=@id
  `),
  delete:    db.prepare("DELETE FROM patients WHERE id = ?"),
  search:    db.prepare("SELECT * FROM patients WHERE name LIKE ? OR contact LIKE ?"),
};

function createPatient(data) {
  const info = patientStmts.insert.run({
    name: data.name,
    age: data.age || null,
    gender: data.gender || null,
    contact: data.contact,
    email: data.email || null,
    address: data.address || null,
  });
  return { id: info.lastInsertRowid, ...data };
}

function getAllPatients() {
  return patientStmts.getAll.all();
}

function getPatientById(id) {
  return patientStmts.getById.get(id);
}

function updatePatient(id, data) {
  return patientStmts.update.run({ id, ...data });
}

function deletePatient(id) {
  return patientStmts.delete.run(id);
}

function searchPatients(query) {
  const like = `%${query}%`;
  return patientStmts.search.all(like, like);
}

// ═══════════════════════════════════════════
// ─── Appointment CRUD ─────────────────────
// ═══════════════════════════════════════════

const apptStmts = {
  insert: db.prepare(`
    INSERT INTO appointments (patient_id, type, date, time, status, notes)
    VALUES (@patient_id, @type, @date, @time, @status, @notes)
  `),
  getAll: db.prepare(`
    SELECT a.*, p.name AS patient_name, p.contact AS patient_contact
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    ORDER BY a.date DESC, a.time DESC
  `),
  getById: db.prepare(`
    SELECT a.*, p.name AS patient_name, p.contact AS patient_contact
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    WHERE a.id = ?
  `),
  getByPatient: db.prepare(`
    SELECT * FROM appointments WHERE patient_id = ? ORDER BY date DESC
  `),
  update: db.prepare(`
    UPDATE appointments SET type=@type, date=@date, time=@time,
    status=@status, notes=@notes WHERE id=@id
  `),
  delete: db.prepare("DELETE FROM appointments WHERE id = ?"),
};

function createAppointment(data) {
  const info = apptStmts.insert.run({
    patient_id: data.patient_id,
    type: data.type,
    date: data.date,
    time: data.time || "Not specified",
    status: data.status || "Scheduled",
    notes: data.notes || null,
  });
  return { id: info.lastInsertRowid, ...data };
}

function getAllAppointments() {
  return apptStmts.getAll.all();
}

function getAppointmentById(id) {
  return apptStmts.getById.get(id);
}

function getAppointmentsByPatient(patientId) {
  return apptStmts.getByPatient.all(patientId);
}

function updateAppointment(id, data) {
  return apptStmts.update.run({ id, ...data });
}

function deleteAppointment(id) {
  return apptStmts.delete.run(id);
}

module.exports = {
  db,
  createPatient, getAllPatients, getPatientById,
  updatePatient, deletePatient, searchPatients,
  createAppointment, getAllAppointments, getAppointmentById,
  getAppointmentsByPatient, updateAppointment, deleteAppointment,
};
