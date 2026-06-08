const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ─── Serve frontend static files from project root ───
app.use(express.static(path.join(__dirname, "..")));

// ─── WHO API Example 1: Life Expectancy ───
app.get("/api/who/life-expectancy", async (req, res) => {
  try {
    const response = await axios.get("https://ghoapi.azureedge.net/api/WHOSIS_000001");
    const data = response.data.value;
    res.json({
      message: "Life Expectancy Data (sample 5):",
      records: data.slice(0, 5)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch WHO data" });
  }
});

// ─── WHO API Example 2: Anaemia Data ───
app.get("/api/who/anaemia", async (req, res) => {
  try {
    const response = await axios.get("https://ghoapi.azureedge.net/api/SDGSH_ANAEMIA");
    const data = response.data.value;
    res.json({
      message: "Anaemia Data (sample 5):",
      records: data.slice(0, 5)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch WHO data" });
  }
});

// ═══════════════════════════════════════════════════════════════
// ─── 12 Diseases with Precautions & Medicines ─────────────────
// ═══════════════════════════════════════════════════════════════
const diseases = [
  {
    name: "Diabetes",
    description: "A chronic condition where the body cannot properly use insulin, leading to high blood sugar levels.",
    precautions: [
      "Maintain a balanced diet with low sugar and refined carbs.",
      "Monitor blood glucose levels regularly.",
      "Exercise at least 30 minutes most days.",
      "Stay hydrated and manage stress."
    ],
    medicines: ["Metformin", "Insulin (if prescribed)", "Glipizide", "Dulaglutide"]
  },
  {
    name: "Hypertension",
    description: "High blood pressure that increases risk of heart disease and stroke.",
    precautions: [
      "Limit salt and processed foods.",
      "Maintain a healthy weight.",
      "Exercise regularly and avoid tobacco.",
      "Monitor blood pressure at home."
    ],
    medicines: ["Amlodipine", "Lisinopril", "Losartan", "Hydrochlorothiazide"]
  },
  {
    name: "Asthma",
    description: "A respiratory condition that causes airway inflammation, wheezing, and shortness of breath.",
    precautions: [
      "Avoid smoke, pollen, and strong odors.",
      "Use inhalers as prescribed.",
      "Keep indoor air clean and dust-free.",
      "Follow an asthma action plan."
    ],
    medicines: ["Salbutamol (Ventolin)", "Budesonide inhaler", "Montelukast", "Formoterol"]
  },
  {
    name: "COVID-19",
    description: "A viral infection caused by SARS-CoV-2 that primarily affects the respiratory system.",
    precautions: [
      "Wash hands often and use sanitizer.",
      "Wear a mask in crowded or indoor spaces.",
      "Keep physical distance and avoid close contact when sick.",
      "Stay up to date with vaccinations."
    ],
    medicines: ["Paracetamol for fever", "Ibuprofen for pain", "Antiviral therapy if prescribed", "Rest and fluids"]
  },
  {
    name: "Influenza",
    description: "A contagious viral infection causing fever, cough, body aches, and fatigue.",
    precautions: [
      "Get an annual flu vaccine.",
      "Wash hands frequently.",
      "Avoid touching your face.",
      "Stay home when sick to prevent spread."
    ],
    medicines: ["Oseltamivir (Tamiflu)", "Zanamivir", "Paracetamol", "Rest and fluids"]
  },
  {
    name: "Malaria",
    description: "A mosquito-borne parasitic infection causing fever, chills, and fatigue.",
    precautions: [
      "Use insect repellent and mosquito nets.",
      "Remove standing water near living areas.",
      "Wear long sleeves and pants in endemic areas.",
      "Take prophylaxis when traveling to high-risk regions."
    ],
    medicines: ["Artemether-lumefantrine", "Chloroquine", "Mefloquine", "Atovaquone-proguanil"]
  },
  {
    name: "Chickenpox",
    description: "A highly contagious viral illness causing an itchy rash and fever.",
    precautions: [
      "Avoid scratching to prevent secondary infection.",
      "Keep skin clean and trim nails.",
      "Isolate from unvaccinated people and infants.",
      "Stay hydrated and rest."
    ],
    medicines: ["Calamine lotion", "Antihistamines for itch", "Acetaminophen for fever", "Acyclovir for severe cases"]
  },
  {
    name: "Common Cold",
    description: "A mild viral infection of the nose and throat causing sneezing, congestion, and sore throat.",
    precautions: [
      "Wash hands regularly.",
      "Avoid close contact with sick individuals.",
      "Use tissues and dispose of them immediately.",
      "Stay rested and drink plenty of fluids."
    ],
    medicines: ["Decongestants", "Cough syrup", "Vitamin C", "Acetaminophen or Ibuprofen"]
  },
  {
    name: "Typhoid",
    description: "A bacterial infection caused by Salmonella typhi, spread through contaminated food and water.",
    precautions: [
      "Drink only boiled or purified water.",
      "Avoid street food and raw vegetables in endemic areas.",
      "Wash hands thoroughly before eating.",
      "Get vaccinated if traveling to high-risk areas."
    ],
    medicines: ["Azithromycin", "Ciprofloxacin", "Ceftriaxone", "Paracetamol for fever"]
  },
  {
    name: "Dengue",
    description: "A mosquito-borne viral disease causing high fever, severe headache, and joint pain.",
    precautions: [
      "Eliminate mosquito breeding sites (stagnant water).",
      "Use mosquito repellent and wear protective clothing.",
      "Install window screens and use bed nets.",
      "Seek immediate medical care if symptoms appear."
    ],
    medicines: ["Paracetamol (avoid aspirin/ibuprofen)", "Oral rehydration salts (ORS)", "IV fluids for severe cases", "Platelet monitoring and supportive care"]
  },
  {
    name: "Tuberculosis",
    description: "A serious bacterial infection that primarily affects the lungs, caused by Mycobacterium tuberculosis.",
    precautions: [
      "Complete the full course of prescribed antibiotics.",
      "Cover mouth when coughing or sneezing.",
      "Ensure good ventilation in living spaces.",
      "Get tested if exposed to a TB patient."
    ],
    medicines: ["Isoniazid", "Rifampicin", "Ethambutol", "Pyrazinamide"]
  },
  {
    name: "Migraine",
    description: "A neurological condition causing intense, throbbing headaches often accompanied by nausea and light sensitivity.",
    precautions: [
      "Identify and avoid personal triggers (stress, certain foods, bright lights).",
      "Maintain a regular sleep schedule.",
      "Stay hydrated and eat meals on time.",
      "Practice relaxation techniques like yoga or meditation."
    ],
    medicines: ["Sumatriptan", "Ibuprofen", "Naproxen", "Propranolol (preventive)"]
  }
];

// ─── GET all diseases ───
app.get("/api/diseases", (req, res) => {
  res.json({
    message: "List of diseases with precautions and common medicines.",
    total: diseases.length,
    diseases
  });
});

// ─── GET single disease by name ───
app.get("/api/diseases/:name", (req, res) => {
  const name = req.params.name.toLowerCase().replace(/-/g, " ");
  const disease = diseases.find((item) => item.name.toLowerCase() === name);
  if (!disease) {
    return res.status(404).json({ error: "Disease not found. Check /api/diseases for all available diseases." });
  }
  res.json(disease);
});

// ─── Search diseases (partial match) ───
app.get("/api/search", (req, res) => {
  const query = (req.query.q || "").toLowerCase().trim();
  if (!query) {
    return res.json({ results: diseases });
  }
  const results = diseases.filter(
    (d) =>
      d.name.toLowerCase().includes(query) ||
      d.description.toLowerCase().includes(query)
  );
  res.json({ query, total: results.length, results });
});

// ═══════════════════════════════════════════════════════════════
// ─── Patient CRUD API ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

// GET all patients
app.get("/api/patients", (req, res) => {
  const q = req.query.q;
  const patients = q ? db.searchPatients(q) : db.getAllPatients();
  res.json({ total: patients.length, patients });
});

// GET patient by ID
app.get("/api/patients/:id", (req, res) => {
  const patient = db.getPatientById(Number(req.params.id));
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json(patient);
});

// CREATE patient
app.post("/api/patients", (req, res) => {
  const { name, contact } = req.body;
  if (!name || !contact) return res.status(400).json({ error: "Name and contact are required" });
  try {
    const patient = db.createPatient(req.body);
    res.status(201).json({ message: "Patient created", patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE patient
app.put("/api/patients/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = db.getPatientById(id);
  if (!existing) return res.status(404).json({ error: "Patient not found" });
  try {
    db.updatePatient(id, { ...existing, ...req.body });
    res.json({ message: "Patient updated", patient: db.getPatientById(id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE patient
app.delete("/api/patients/:id", (req, res) => {
  const result = db.deletePatient(Number(req.params.id));
  if (result.changes === 0) return res.status(404).json({ error: "Patient not found" });
  res.json({ message: "Patient deleted" });
});

// ═══════════════════════════════════════════════════════════════
// ─── Appointment CRUD API ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

// GET all appointments
app.get("/api/appointments", (req, res) => {
  const patientId = req.query.patient_id;
  const appointments = patientId
    ? db.getAppointmentsByPatient(Number(patientId))
    : db.getAllAppointments();
  res.json({ total: appointments.length, appointments });
});

// GET appointment by ID
app.get("/api/appointments/:id", (req, res) => {
  const appt = db.getAppointmentById(Number(req.params.id));
  if (!appt) return res.status(404).json({ error: "Appointment not found" });
  res.json(appt);
});

// CREATE appointment
app.post("/api/appointments", (req, res) => {
  const { patient_id, type, date } = req.body;
  if (!patient_id || !type || !date) {
    return res.status(400).json({ error: "patient_id, type, and date are required" });
  }
  const patient = db.getPatientById(Number(patient_id));
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  try {
    const appt = db.createAppointment(req.body);
    res.status(201).json({ message: "Appointment booked", appointment: appt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE appointment
app.put("/api/appointments/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = db.getAppointmentById(id);
  if (!existing) return res.status(404).json({ error: "Appointment not found" });
  try {
    db.updateAppointment(id, { ...existing, ...req.body });
    res.json({ message: "Appointment updated", appointment: db.getAppointmentById(id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE appointment
app.delete("/api/appointments/:id", (req, res) => {
  const result = db.deleteAppointment(Number(req.params.id));
  if (result.changes === 0) return res.status(404).json({ error: "Appointment not found" });
  res.json({ message: "Appointment deleted" });
});

// ─── Fallback: serve index.html for any non-API route ───
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// ─── Start Server ───
const server = app.listen(PORT);
server.on("listening", () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log(`📁 Frontend served from: ${path.join(__dirname, "..")}`);
  console.log(`🩺 Disease API: http://localhost:${PORT}/api/diseases`);
});
server.on("error", (err) => {
  console.error("❌ Server error:", err.message);
});

