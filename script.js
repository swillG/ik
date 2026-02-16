let db = JSON.parse(localStorage.getItem("eduSoftDB")) || [];
let editIdx = -1;
let genderChart;

function showPage(id) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-links a")
    .forEach((a) => a.classList.remove("active"));
  document.getElementById("page-" + id).classList.add("active");
  document.getElementById("nav-" + id).classList.add("active");
  if (id === "dashboard") updateDashboard();
  if (id === "database") renderTable();
}

function addSubjectInput(n = "", s = "") {
  const div = document.createElement("div");
  div.style = "display:flex; gap:12px; margin-bottom:12px;";
  div.innerHTML = `<input type="text" class="sub-n" value="${n}" placeholder="Subject"><input type="number" class="sub-s" value="${s}" style="width:100px;">
                         <button onclick="this.parentElement.remove()" style="color:#ff4444; background:none; border:none; cursor:pointer; font-size:1.5rem;">&times;</button>`;
  document.getElementById("subjectList").appendChild(div);
}

function saveRecord() {
  const id = document.getElementById("stuId").value,
    name = document.getElementById("stuName").value,
    gender = document.getElementById("stuGender").value;
  const subNames = document.querySelectorAll(".sub-n"),
    subScores = document.querySelectorAll(".sub-s");
  let subs = [];
  subNames.forEach((n, i) => {
    if (n.value) subs.push({ n: n.value, s: Number(subScores[i].value) });
  });

  if (!id || !name || subs.length === 0)
    return alert("Please fill all details");

  const student = { id, name, gender, subs };
  if (editIdx === -1) {
    if (db.find((x) => x.id === id)) return alert("ID exists");
    db.push(student);
  } else {
    db[editIdx] = student;
    editIdx = -1;
  }

  localStorage.setItem("eduSoftDB", JSON.stringify(db));
  resetForm();
  showPage("database");
}

function renderTable() {
  const tbody = document.getElementById("tableBody"),
    q = document.getElementById("search").value.toLowerCase();
  tbody.innerHTML = "";
  db.filter(
    (x) => x.id.toLowerCase().includes(q) || x.name.toLowerCase().includes(q),
  ).forEach((x, i) => {
    const avg = (x.subs.reduce((a, b) => a + b.s, 0) / x.subs.length).toFixed(
      1,
    );
    const isStar = avg > 69;
    tbody.innerHTML += `<tr>
                <td data-label="Student"><strong>${x.id}</strong><br><small style="color:var(--slate)">${x.name}</small></td>
                <td data-label="Gender">${x.gender}</td>
                <td data-label="Results">${x.subs.map((s) => `<span style="font-size:11px; background:#f1f5f9; padding:3px 8px; border-radius:8px; margin:2px; display:inline-block;">${s.n}:${s.s}</span>`).join("")}</td>
                <td data-label="Avg"><strong style="${isStar ? "color:#a16207" : ""}">${avg}% ${isStar ? "⭐" : ""}</strong></td>
                <td data-label="Action">
                    <span onclick="editRec(${db.indexOf(x)})" style="color:var(--primary); cursor:pointer; font-weight:700; margin-right:15px;">Edit</span>
                    <span onclick="deleteRec(${db.indexOf(x)})" style="color:#ff4444; cursor:pointer; font-weight:700;">Del</span>
                </td>
            </tr>`;
  });
}

function updateDashboard() {
  const males = db.filter((x) => x.gender === "Male").length,
    females = db.filter((x) => x.gender === "Female").length;
  document.getElementById("dash-total").innerText = db.length;
  document.getElementById("dash-male").innerText = males;
  document.getElementById("dash-female").innerText = females;

  const starList = document.getElementById("star-container");
  starList.innerHTML = "";
  db.forEach((x) => {
    const avg = x.subs.reduce((a, b) => a + b.s, 0) / x.subs.length;
    if (avg > 69)
      starList.innerHTML += `<div style="background:#fefce8; color:#854d0e; padding:10px 18px; border-radius:50px; border:1px solid #fde047; font-size:0.85rem; font-weight:700; box-shadow: var(--shadow-sm);">🌟 ${x.name}</div>`;
  });

  const ctx = document.getElementById("genderChart").getContext("2d");
  if (genderChart) genderChart.destroy();
  genderChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Male", "Female"],
      datasets: [
        {
          data: [males, females],
          backgroundColor: ["#4f46e5", "#ec4899"],
          borderWidth: 5,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      cutout: "85%",
      plugins: { legend: { display: false } },
      maintainAspectRatio: false,
    },
  });
}

function editRec(i) {
  editIdx = i;
  const x = db[i];
  showPage("add");
  document.getElementById("stuId").value = x.id;
  document.getElementById("stuName").value = x.name;
  document.getElementById("stuGender").value = x.gender;
  document.getElementById("subjectList").innerHTML = "";
  x.subs.forEach((s) => addSubjectInput(s.n, s.s));
}

function deleteRec(i) {
  if (confirm("Delete record?")) {
    db.splice(i, 1);
    localStorage.setItem("eduSoftDB", JSON.stringify(db));
    renderTable();
  }
}
function resetForm() {
  document.getElementById("stuId").value = "";
  document.getElementById("stuName").value = "";
  document.getElementById("subjectList").innerHTML =
    `<div style="display:flex; gap:12px; margin-bottom:12px;"><input type="text" class="sub-n" placeholder="Subject"><input type="number" class="sub-s" placeholder="Score" style="width:100px;"></div>`;
  editIdx = -1;
}
updateDashboard();
