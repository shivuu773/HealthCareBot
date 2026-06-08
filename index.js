/* ═══ Utilities ═══ */
const API_BASE = window.location.origin;
let allDiseases = [];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

/* ═══ Tabs (Login/Register) ═══ */
function switchTab(tab) {
  document.getElementById("loginForm").style.display = tab==="login"?"flex":"none";
  document.getElementById("registerForm").style.display = tab==="register"?"flex":"none";
  document.getElementById("loginTab").classList.toggle("active",tab==="login");
  document.getElementById("registerTab").classList.toggle("active",tab==="register");
}
window.switchTab = switchTab;

/* ═══ Register & Login ═══ */
document.getElementById("registerForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const user = { username:document.getElementById("regUsername").value.trim(), password:document.getElementById("regPassword").value };
  if(!user.username||!user.password){alert("⚠ Please fill all fields.");return;}
  localStorage.setItem("user",JSON.stringify(user));
  alert("✅ Registered! Please login.");
  switchTab("login");
});

document.getElementById("loginForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const stored = JSON.parse(localStorage.getItem("user")||"null");
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  if(stored && stored.username===username && stored.password===password){
    document.getElementById("authPage").style.display="none";
    showSection("home");
  } else { alert("❌ Invalid credentials or not registered."); }
});

/* ═══ Section Switching ═══ */
const sections = document.querySelectorAll(".section");
function showSection(id) {
  sections.forEach(s=>s.classList.remove("active"));
  const s = document.getElementById(id);
  if(s) s.classList.add("active");
  document.querySelectorAll(".nav-link").forEach(l=>{
    l.classList.toggle("active",l.dataset.section===id);
  });
  if(id==="diseases" && allDiseases.length===0) fetchDiseases();
  if(id==="appointments") loadAppointments();
}
window.showSection = showSection;

/* ═══ Disease Fetching & Rendering ═══ */
const diseaseIcons = {"Diabetes":"🩸","Hypertension":"❤️","Asthma":"🫁","COVID-19":"🦠","Influenza":"🤧","Malaria":"🦟","Chickenpox":"🔴","Common Cold":"🤒","Typhoid":"🌡️","Dengue":"🦟","Tuberculosis":"🫁","Migraine":"🧠"};

async function fetchDiseases() {
  try {
    const res = await fetch(`${API_BASE}/api/diseases`);
    const data = await res.json();
    allDiseases = data.diseases || [];
    renderDiseaseCards(allDiseases);
  } catch(err) {
    console.error("Failed to fetch diseases:",err);
    const loader = document.getElementById("diseaseLoader");
    if(loader) loader.innerHTML = `<p style="color:#ef4444">❌ Failed to load. Is the backend running?</p>`;
  }
}

function renderDiseaseCards(list) {
  const grid = document.getElementById("diseaseGrid");
  grid.innerHTML = "";
  if(list.length===0){ grid.innerHTML='<p style="color:rgba(255,255,255,0.5)">No diseases found.</p>'; return; }
  list.forEach(d=>{
    const card = document.createElement("div");
    card.className = "disease-card";
    card.onclick = ()=>openDiseaseModal(d);
    card.innerHTML = `
      <div class="disease-card-icon">${diseaseIcons[d.name]||"🏥"}</div>
      <h3>${d.name}</h3>
      <p>${d.description.substring(0,90)}${d.description.length>90?"...":""}</p>
      <span class="card-arrow">→</span>`;
    grid.appendChild(card);
  });
}

function searchGlobal() {
  const query = document.getElementById("globalSearch").value.trim();
  showSection("diseases");
  setTimeout(() => {
    const diseaseInput = document.getElementById("diseaseSearch");
    if (diseaseInput) {
      diseaseInput.value = query;
      diseaseInput.focus();
      filterDiseases(query);
    }
  }, 200);
}
window.searchGlobal = searchGlobal;

function filterDiseases(query) {
  const q = query.toLowerCase().trim();
  if(!q){ renderDiseaseCards(allDiseases); return; }
  renderDiseaseCards(allDiseases.filter(d=> d.name.toLowerCase().includes(q)||d.description.toLowerCase().includes(q)));
}
window.filterDiseases = filterDiseases;

function formatDiseaseReply(disease) {
  return `🩺 ${disease.name}\n\n${disease.description}\n\n⚠️ Precautions:\n- ${disease.precautions.join("\n- ")}\n\n💊 Recommended medicines:\n- ${disease.medicines.join("\n- ")}`;
}

function findDiseaseResponse(query) {
  if (!query || !allDiseases.length) return null;
  const normalized = query.toLowerCase().trim();
  const exactMatch = allDiseases.find(d => d.name.toLowerCase() === normalized);
  if (exactMatch) return formatDiseaseReply(exactMatch);

  const matches = allDiseases.filter(d =>
    d.name.toLowerCase().includes(normalized) ||
    d.description.toLowerCase().includes(normalized) ||
    d.precautions.some(p => p.toLowerCase().includes(normalized)) ||
    d.medicines.some(m => m.toLowerCase().includes(normalized))
  );
  if (matches.length === 1) return formatDiseaseReply(matches[0]);
  if (matches.length > 1) {
    return `I found ${matches.length} possible matches for your query. Try one of these disease names:\n- ${matches.map(d => d.name).slice(0, 5).join("\n- ")}`;
  }

  const diseaseKeywords = ["disease", "symptom", "precaution", "medicine", "treatment", "what is", "info", "about"];
  if (diseaseKeywords.some(keyword => normalized.includes(keyword))) {
    return `I couldn't find a disease match in the local database. Please ask about one of these diseases: ${allDiseases.map(d => d.name).slice(0, 5).join(", ")}.`;
  }
  return null;
}

function openDiseaseModal(disease) {
  document.getElementById("modalDiseaseName").textContent = `${diseaseIcons[disease.name]||"🏥"} ${disease.name}`;
  document.getElementById("modalDiseaseDesc").textContent = disease.description;
  document.getElementById("modalPrecautions").innerHTML = disease.precautions.map(p=>`<li>${p}</li>`).join("");
  document.getElementById("modalMedicines").innerHTML = disease.medicines.map(m=>`<li>💊 ${m}</li>`).join("");
  document.getElementById("diseaseModalOverlay").classList.add("active");
}
function closeDiseaseModal() { document.getElementById("diseaseModalOverlay").classList.remove("active"); }
window.closeDiseaseModal = closeDiseaseModal;

/* ═══ Chatbot ═══ */
const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const GEMINI_API_KEY = "AIzaSyAYBdU8EhCeRGPXlYrznGrO04IrjQXLuvo";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function botReply(userText) {
  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`,{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ contents:[{parts:[{text:userText}]}] })
    });
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "❌ No response.";
  } catch(err) { return "⚠ Error connecting to Gemini API."; }
}

function appendMessage(text,who="bot") {
  const bubble = document.createElement("div");
  bubble.className = "bubble "+(who==="me"?"from-me":"from-bot");
  bubble.textContent = text;
  chat.appendChild(bubble);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage(userText) {
  const trimmedText = userText.trim();
  if(!trimmedText) return;
  appendMessage(trimmedText,"me");
  input.value = "";
  appendMessage("⏳ Typing...","bot");

  if (!allDiseases.length) await fetchDiseases();
  const localReply = findDiseaseResponse(trimmedText);
  if (localReply) {
    chat.removeChild(chat.lastChild);
    appendMessage(localReply,"bot");
    return;
  }

  const reply = await botReply(trimmedText);
  chat.removeChild(chat.lastChild);
  appendMessage(reply,"bot");
}

sendBtn.addEventListener("click",()=>sendMessage(input.value));
input.addEventListener("keydown",(e)=>{if(e.key==="Enter")sendMessage(input.value)});

/* ═══ Voice Recognition ═══ */
const voiceBtn = document.getElementById("voiceBtn");
if("webkitSpeechRecognition" in window || "SpeechRecognition" in window){
  const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
  const recognition = new SR();
  recognition.lang="en-IN"; recognition.interimResults=false;
  voiceBtn.addEventListener("click",()=>{recognition.start();appendMessage("🎤 Listening...","bot");});
  recognition.onresult = async(event)=>{
    const t = event.results[0][0].transcript;
    appendMessage("You (voice): "+t,"me");
    appendMessage(await botReply(t),"bot");
  };
  recognition.onerror=(event)=>{appendMessage("⚠ Voice error: "+event.error,"bot");};
} else { voiceBtn.disabled=true; }

/* ═══ Appointments (SQL-backed) ═══ */
const bookBtn = document.getElementById("bookAppointment");
const apptDialog = document.getElementById("apptDialog");
const dateInput = document.getElementById("appointmentDate");
const timeInput = document.getElementById("appointmentTime");
const confirmAppt = document.getElementById("confirmAppt");
const cancelAppt = document.getElementById("cancelAppt");
const appointmentsList = document.getElementById("appointmentsList");

if(dateInput) dateInput.min = todayISO();

async function loadAppointments(){
  if(!appointmentsList) return;
  const summary = document.getElementById("appointmentSummary");
  try {
    const res = await fetch(`${API_BASE}/api/appointments`);
    const data = await res.json();
    const appts = data.appointments || [];
    appointmentsList.innerHTML="";
    if (summary) summary.textContent = `${appts.length} booking${appts.length === 1 ? '' : 's'} found.`;
    if(appts.length===0){
      appointmentsList.innerHTML="<li>No appointments booked yet.</li>";
      return;
    }
    appts.forEach(a=>{
      const li = document.createElement("li");
      const statusBadge = a.status==="Scheduled"
        ? '<span style="color:#4ade80;">● Scheduled</span>'
        : `<span style="color:#facc15;">● ${a.status}</span>`;
      li.innerHTML=`<b>${a.patient_name||a.name}</b> (${a.patient_contact||a.contact}) – ${a.type} on ${a.date} at ${a.time} ${statusBadge}`;
      const del = document.createElement("button");
      del.textContent="❌"; del.style.cssText="margin-left:10px;background:none;border:none;cursor:pointer;font-size:14px;";
      del.onclick=async()=>{
        if(!confirm("Delete this appointment?")) return;
        await fetch(`${API_BASE}/api/appointments/${a.id}`,{method:"DELETE"});
        loadAppointments();
      };
      li.appendChild(del);
      appointmentsList.appendChild(li);
    });
  } catch(err) {
    if (summary) summary.textContent = "Failed to load bookings.";
    appointmentsList.innerHTML="<li>❌ Failed to load appointments.</li>";
  }
}

function viewDatabase() {
  showSection('appointments');
  loadAppointments();
}
window.viewDatabase = viewDatabase;

if(bookBtn) bookBtn.addEventListener("click",()=>{
  dateInput.value=todayISO(); timeInput.value="";
  if(apptDialog.showModal) apptDialog.showModal(); else apptDialog.setAttribute("open","");
});

if(confirmAppt) confirmAppt.addEventListener("click", async()=>{
  const name=document.getElementById("appointmentName").value.trim();
  const contact=document.getElementById("appointmentContact").value.trim();
  const type=document.getElementById("appointmentType").value;
  const date=dateInput.value;
  const time=timeInput.value||"Not specified";
  if(!name||!contact||!type||!date){alert("⚠ Fill all required fields.");return;}

  try {
    // Step 1: Create or find patient
    const patientRes = await fetch(`${API_BASE}/api/patients`,{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ name, contact })
    });
    const patientData = await patientRes.json();
    const patientId = patientData.patient?.id;
    if(!patientId) throw new Error("Could not create patient");

    // Step 2: Create appointment linked to patient
    const apptRes = await fetch(`${API_BASE}/api/appointments`,{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ patient_id:patientId, type, date, time })
    });
    const apptData = await apptRes.json();

    alert(`✅ Appointment Confirmed!\nPatient: ${name}\nType: ${type}\nDate: ${date}\nTime: ${time}`);
    try{apptDialog.close();}catch{apptDialog.removeAttribute("open");}
    loadAppointments();
  } catch(err) {
    alert("❌ Error booking appointment: "+err.message);
  }
});

if(cancelAppt) cancelAppt.addEventListener("click",()=>{try{apptDialog.close();}catch{apptDialog.removeAttribute("open");}});

window.addEventListener("load",()=>{
  appendMessage("👋 Welcome! Please login or register first.","bot");
  loadAppointments();
});
