const exercises = [
      'Bench Press',
      'Squat',
      'Deadlift',
      'Overhead Press',
      'Barbell Row',
      'Pull-up',
      'Bicep Curl',
      'Tricep Extension'
    ];

const backend = "http://127.0.0.1:5000"

const buttonsEl = document.getElementById('buttons');
const overlay = document.getElementById('overlay');
const modalTitle = document.getElementById('modal-title');
const logForm = document.getElementById('logWorkoutForm');
const dateInput = document.getElementById('date');
const setsInput = document.getElementById('sets');
const repsInput = document.getElementById('reps');
const weightInput = document.getElementById('weight');
const toast = document.getElementById('toast');

const entriesCard = document.getElementById('entries');
const entriesTitle = document.getElementById('entries-title');
const entriesTable = document.getElementById('entries-table');
const clearBtn = document.getElementById('clearBtn');

let currentExercise = null;

// render buttons
exercises.forEach(name => {
    const b = document.createElement('button');
    b.className = 'exercise';
    b.textContent = name;
    b.onclick = () => openWorkoutModal(name);
    buttonsEl.appendChild(b);
});

function openWorkoutModal(name){
    currentExercise = name;
    modalTitle.textContent = `Log — ${name}`;
    // default date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth()+1).padStart(2,'0');
    const dd = String(today.getDate()).padStart(2,'0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
    // keep previous values for sets/reps/weight if present in localStorage quick-settings
    const settings = JSON.parse(localStorage.getItem('quick_settings')||'{}');
    setsInput.value = settings.sets || 3;
    repsInput.value = settings.reps || 8;
    weightInput.value = settings.weight || 0;
    overlay.classList.add('open');
    entriesCard.style.display = 'block';
    entriesTitle.textContent = `${name} — Recent entries`;
    renderEntries();
}

function closeModal(){
    overlay.classList.remove('open');
}

// save entry
// logForm.addEventListener('submit', e => {
//         e.preventDefault();
//         const entry = {
//         date: dateInput.value,
//         sets: parseInt(setsInput.value,10),
//         reps: parseInt(repsInput.value,10),
//         weight: parseFloat(weightInput.value),
//         loggedAt: new Date().toISOString()
//         };
//         // fetch('"http://127.0.0.1:5000/save_entry"', {
//         fetch(`${backend}/save_entry`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(entry)
//     })
//     .then(res => res.json())
//     .then(data => console.log("Flask responded:", data))
//     .catch(err => console.error("Error:", err));
//         if(!currentExercise){return}
//         const key = `workout_${currentExercise}`;
//         const arr = JSON.parse(localStorage.getItem(key) || '[]');
//         arr.unshift(entry); // newest first
//         localStorage.setItem(key, JSON.stringify(arr));
//         // quick settings
//         localStorage.setItem('quick_settings', JSON.stringify({sets:entry.sets,reps:entry.reps,weight:entry.weight}));
//         showToast('Saved');
//         closeModal();
//         renderEntries();
//     }
// );

document.getElementById('cancelBtn').addEventListener('click', ()=> closeModal());

// close on backdrop click or ESC
overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

function renderEntries(){
    if(!currentExercise) return;
    const key = `workout_${currentExercise}`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    entriesTable.innerHTML = '';
    if(arr.length===0){
        entriesTable.innerHTML = '<tr><td colspan="5" class="small">No entries yet — click the exercise button to log your first set.</td></tr>';
        clearBtn.style.display = 'none';
        return;
    }
    clearBtn.style.display = 'inline-block';
    // show up to 20 entries
    arr.slice(0,20).forEach(it=>{
    const tr = document.createElement('tr');
    const d = new Date(it.date).toISOString().slice(0,10);
    tr.innerHTML = `<td>${d}</td><td>${it.sets}</td><td>${it.reps}</td><td>${it.weight}</td><td class="small">${new Date(it.loggedAt).toLocaleString()}</td>`;
    entriesTable.appendChild(tr);
    });
}

clearBtn.addEventListener('click', ()=>{
    if(!currentExercise) return;
    if(!confirm(`Clear all saved entries for ${currentExercise}? This cannot be undone.`)) return;
    localStorage.removeItem(`workout_${currentExercise}`);
    renderEntries();
    showToast('Cleared');
});

function showToast(text){
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(()=> toast.classList.remove('show'),1600);
}

function add_new_exer(){
    
}   

function get_display_groups(name){
    
}

function get_display_last_5(){

}

function add_new_workout(){
    const entry = {
        date: dateInput.value,
        sets: parseInt(setsInput.value,10),
        reps: parseInt(repsInput.value,10),
        weight: parseFloat(weightInput.value),
        loggedAt: new Date().toISOString()
    };
    fetch(`${backend}/save_entry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
    }); 
}

// initial: hide entries
entriesCard.style.display = 'none';

document.getElementById("addExerciseBtn").addEventListener("click", add_new_exer); 
document.getElementById('logWorkoutForm').addEventListener("submit", add_new_workout); 
window.addEventListener("DOMContentLoaded", get_display_last_5); 