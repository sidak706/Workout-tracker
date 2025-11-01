// const exercises = [
//       'Bench Press',
//       'Squat',
//       'Deadlift',
//       'Overhead Press',
//       'Barbell Row',
//       'Pull-up',
//       'Bicep Curl',
//       'Tricep Extension'
//     ];

const basic_exercises = ["Leg Extensions", "Hip thrusts", "Hip abductor machine", "Leg press"]; 

var all_exercises = []

const overlay = document.getElementById('overlay');
const toast = document.getElementById('toast');

let currentExercise = null;

// Get names of all exercises and render them on the page
async function get_display_exercises(){
    try {
        const res = await fetch(`${backend}/get_all_exer`);
        const exercises = await res.json();

        const buttonsContainer = document.getElementById('buttons');
        // Clear existing buttons first
        buttonsContainer.replaceChildren();

        if (exercises.length === 0) {
            return;
        }
        console.log(exercises); 

        all_exercises = []

        // render buttons
        exercises.forEach(ex => {
            const b = document.createElement('button');
            b.className = 'exercise';
            b.textContent = ex.name;
            b.onclick = () => openWorkoutModal(ex.name);
            document.getElementById('buttons').appendChild(b);
            all_exercises.push(ex.name); 
        });

    } catch (err) {
        showToast("Unable to load exercises!", "#b91010ff");
        return ; 
    }
}


function openWorkoutModal(name){
    document.getElementById('modal-title').textContent = `Log — ${name}`;
    // default date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth()+1).padStart(2,'0');
    const dd = String(today.getDate()).padStart(2,'0');
    document.getElementById('date').value = `${yyyy}-${mm}-${dd}`;
    // keep previous values for sets/reps/weight if present in localStorage quick-settings
    const settings = JSON.parse(localStorage.getItem('quick_settings')||'{}');
    document.getElementById('sets').value = settings.sets || 3;
    document.getElementById('reps').value = settings.reps || 8;
    document.getElementById('weight').value = settings.weight || 0;
    overlay.classList.add('open');

    currentExercise = name; 
}

function closeModal(){
    overlay.classList.remove('open');
}


document.getElementById('cancelBtn').addEventListener('click', ()=> closeModal());

// close on backdrop click or ESC
overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });


function showToast(text, color = "#10b981"){
    toast.textContent = text;
    toast.style.backgroundColor = color; 
    toast.classList.add('show');
    setTimeout(()=> toast.classList.remove('show'),1600);
}

const addExerciseOverlay = document.getElementById("addExerciseOverlay");
const addExerciseForm = document.getElementById("addExerciseForm");
const cancelAddBtn = document.getElementById("cancelAddBtn");

// Open the modal (call this when "Add Exercise" button is clicked)
function openAddExerciseModal() {
    get_display_groups()
    addExerciseForm.reset(); // clear previous inputs
    addExerciseOverlay.classList.add("open");
}

// Close modal
function closeAddExerciseModal() {
    addExerciseOverlay.classList.remove("open");
}

// // Submit handler
async function add_new_exer(e) {
    e.preventDefault();

    const name = document.getElementById("exerciseName").value.trim();
    const groupSelect = document.getElementById("group");
    const muscle_group = groupSelect.value && groupSelect.value !== "Select group" ? groupSelect.value : null;

    if (!name) {
        showToast("Please enter a name!", "#b91010ff");
        return;
    }

    const payload = { name };
    if (muscle_group) payload.muscle_group = muscle_group;

    try {
        const res = await fetch(`${backend}/new_exer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.status === "success") {
            showToast(`Exercise "${name}" added successfully!`);
            closeAddExerciseModal();
            get_display_exercises(); 
            // Optionally refresh the exercise list or dropdown
        } else {
            // alert("Failed to add exercise.");
            showToast(data.message, "#b91010ff");
        }
    } catch (err) {
        // console.error("Error adding exercise:", err);
        showToast(data.message | "Error adding exercise", "#b91010ff");
    }
}



addExerciseForm.addEventListener("submit", add_new_exer);
cancelAddBtn.addEventListener("click", closeAddExerciseModal);


async function get_display_groups(){
    const select = document.getElementById("group");

    // Clear existing options
    while (select.firstChild) select.removeChild(select.firstChild);

    // Add default placeholder option
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select group";
    select.appendChild(placeholder);

    try {
        const res = await fetch(`${backend}/get_groups`);
        const groups = await res.json();

        if (groups.length === 0) {
            return;
        }
        console.log(groups); 

        // Add each group as an option
        groups.forEach(group => {
            const opt = document.createElement("option");
            opt.value = group;
            opt.textContent = group;
            select.appendChild(opt);
        });

    } catch (err) {
        console.error("Error fetching groups:", err);
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "Error loading groups";
        select.appendChild(opt);
    }
}


function add_new_workout(e) {
    e.preventDefault(); // prevent form submission
    const entry = {
        name: currentExercise, 
        date: document.getElementById('date').value,
        sets: parseInt(document.getElementById('sets').value, 10),
        reps: parseInt(document.getElementById('reps').value, 10),
        weight: parseFloat( document.getElementById('weight').value),
        loggedAt: new Date().toISOString()
    };

    const selectedGroup = document.getElementById("group").value;
    if (selectedGroup && selectedGroup !== "Select group") {
        entry.muscle_group = selectedGroup;
    }

    console.log("Entry: " + entry["name"]); 

    fetch(`${backend}/add_workout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
    })
    .then(res => res.json())
    .then(() => {
        showToast("Workout saved!"); // show a toast instead of alert
        document.getElementById('logWorkoutForm').reset(); // clear form inputs
        closeModal();     // close the modal
        get_display_last_5(); // refresh the last 5 workouts table
    })
    // .then(alert("Saved")) 
    .catch(err => showToast("Could not save workout!", "#b91010ff"));
}


// Show last 5 workouts added
async function get_display_last_5(){
    const res = await fetch(`${backend}/get_last5_workouts`);
    const last5 = await res.json();
    const tableBody = document.getElementById("entries-table");
    if(last5.length === 0){
        tableBody.replaceChildren();
        return ; 
    }
    
    // const workouts = [
    //     { name: "Bench Press", date: "2025-10-23", sets: 4, reps: 10, weight: 50, loggedAt: "2025-10-23T10:30" },
    //     { name: "Squat", date: "2025-10-22", sets: 3, reps: 8, weight: 60, loggedAt: "2025-10-22T09:10" }
    // ];

    // Clear old rows
    tableBody.replaceChildren();

    // For each workout, build a <tr> manually
    for (const w of last5) {
        const row = document.createElement("tr");

        const dateCell = document.createElement("td");
        dateCell.textContent = w.date;

        const setsCell = document.createElement("td");
        setsCell.textContent = w.sets;

        const repsCell = document.createElement("td");
        repsCell.textContent = w.reps;

        const weightCell = document.createElement("td");
        weightCell.textContent = `${w.weight} kg`;

        const loggedCell = document.createElement("td");
        loggedCell.textContent = new Date(w.loggedAt).toLocaleString();
        loggedCell.classList.add("small");

        // Optional: include exercise name column at the start
        const nameCell = document.createElement("td");
        nameCell.textContent = w.name;

        // Append cells to row
        row.appendChild(nameCell);
        row.appendChild(dateCell);
        row.appendChild(setsCell);
        row.appendChild(repsCell);
        row.appendChild(weightCell);

        // row.appendChild(loggedCell);

        // Append row to table body
        tableBody.appendChild(row);
    }
    document.getElementById("entries-body").style.display = "block";

}


// Delete an exercise and all its corresponding workouts
async function delete_exer(){
    const overlay = document.getElementById('deleteExerciseOverlay');
    const checkboxes = document.querySelectorAll('#exerciseListContainer input[type="checkbox"]:checked');
    
    const selected = Array.from(checkboxes).map(cb => cb.value);
    if (selected.length === 0) {
        showToast("No exercises selected!", "#b91010ff");
        return;
    }

    try {
        const res = await fetch(`${backend}/delete_exercises`, {
        method: "DELETE", // or "DELETE" if you prefer RESTful style
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: selected })
        });


        const data = await res.json();
        if (data.status === "success") {
            showToast(`Deleted ${selected.length} exercise(s)`, "#3bb273");
            overlay.classList.remove('open');
            await get_display_exercises(); // refresh list
            console.log("Now calling last 5"); 
            await get_display_last_5();
        } else {
            showToast(data.message || "Failed to delete exercises", "#b91010ff");
        }
    } catch (err) {
        showToast("Server error while deleting exercises", "#b91010ff");
    }
}



function openDeleteExerciseModal() {
    const overlay = document.getElementById('deleteExerciseOverlay');
    const container = document.getElementById('exerciseListContainer');

    // Clear previous entries
    container.innerHTML = "";

    if (!all_exercises || all_exercises.length === 0) {
    container.innerHTML = "<p>No exercises found.</p>";
    } else {
    all_exercises.forEach(name => {
        const div = document.createElement("div");
        div.classList.add("checkbox-item");
        div.innerHTML = `
        <label>
            <input type="checkbox" value="${name}">
            ${name}
        </label>
        `;
        container.appendChild(div);
    });
    }

    overlay.classList.add('open');
}

document.getElementById('deleteExerciseBtn').addEventListener('click', openDeleteExerciseModal);

document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
  document.getElementById('deleteExerciseOverlay').classList.remove('open');
});

// initial: hide entries
// entriesCard.style.display = 'none';

document.getElementById("addExerciseBtn").addEventListener("click", openAddExerciseModal);
document.getElementById('logWorkoutForm').addEventListener("submit", add_new_workout); 
document.getElementById('confirmDeleteBtn').addEventListener('click', delete_exer); 
window.addEventListener("DOMContentLoaded", get_display_last_5); 
window.addEventListener("DOMContentLoaded", get_display_exercises); 