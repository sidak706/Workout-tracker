
// Mock sample data: multiple weights/sets per date
const sampleProgressData = {
  "Bench Press": [
    {
      date: "2025-10-10",
      sets: [
        { reps: 8, weight: 50 },
        { reps: 8, weight: 55 },
        { reps: 6, weight: 60 }
      ]
    },
    {
      date: "2025-10-17",
      sets: [
        { reps: 10, weight: 55 },
        { reps: 8, weight: 60 },
        { reps: 6, weight: 65 }
      ]
    }
  ],
  "Squat": [
    {
      date: "2025-10-09",
      sets: [
        { reps: 10, weight: 70 },
        { reps: 8, weight: 75 }
      ]
    },
    {
      date: "2025-10-14",
      sets: [
        { reps: 6, weight: 80 },
        { reps: 6, weight: 82.5 },
        { reps: 5, weight: 85 }
      ]
    }
  ]
};

// Helper to format date like "October 23, 2025"
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}


// Display exercise progress
async function display_progress(name) {
    const container = document.getElementById("exerciseProgressContainer");
    let data = {};

    try {
        const res = await fetch(`${backend}/get_progress_w_name?name=${encodeURIComponent(name)}`);
        data = await res.json();

        if (!data || Object.keys(data).length === 0) return;

    } catch (err) {
        showToast("Unable to load progress!", "#b91010ff");
        return;
    }

    container.innerHTML = "";

    Object.keys(data).forEach(date => {
        console.log("Date: " + date); 
        const setsArray = data[date]; // like [[3,8,0], [3,8,0]]

        const card = document.createElement("div");
        card.classList.add("progress-card");

        const dateHeading = document.createElement("div");
        dateHeading.classList.add("progress-date");
        dateHeading.textContent = formatDate(date);

        const table = document.createElement("table");
        table.classList.add("progress-table");

        const rows = setsArray.map((arr, i) => {
            const [sets, reps, weight] = arr;
            return `
            <tr>
                <td>${sets}</td>
                <td>${reps}</td>
                <td>${weight}</td>
            </tr>
            `;
        }).join("");

        table.innerHTML = `
        <thead>
            <tr><th>Set</th><th>Reps</th><th>Weight (kg)</th></tr>
        </thead>
        <tbody>${rows}</tbody>
        `;

        card.appendChild(dateHeading);
        card.appendChild(table);
        container.appendChild(card);
    });
}


// // Show progress page
document.getElementById("progressBtn").addEventListener("click", () => {
  renderProgressPage();
});

// // You can do the same for Add Exercise, Home, etc.
// document.getElementById("homeBtn").addEventListener("click", () => {
//   mainContent.innerHTML = `<h2>Welcome!</h2><p>Select an option from above.</p>`;
// });


function populateExercises() {
  const select = document.getElementById('exerciseSelect');
  select.innerHTML = ''; 

  all_exercises.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });

  select.addEventListener('change', () => {
    const selected = select.value;
    if (selected) display_progress(selected);
  });
}

function renderProgressPage() {
  const container = document.getElementById("progressPage");
  if (!container) {
    console.log("Returned"); 
    return;
  }

  // Clear previous content (optional)
  container.innerHTML = `
    <h2>Progress</h2>
    <div class="field">
      <label for="exerciseSelect">Select Exercise</label>
      <select id="exerciseSelect"></select>
    </div>
    <div id="exerciseProgressContainer" class="progress-container">
      <p>Select an exercise to view your progress.</p>
    </div>
  `;

  console.log("Render"); 

  populateExercises(); // now attaches dropdown and event listeners
}
