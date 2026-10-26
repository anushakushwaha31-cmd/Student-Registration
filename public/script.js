const form = document.getElementById("registrationForm");
const message = document.getElementById("message");
const submitButton = document.getElementById("submitButton");
const refreshButton = document.getElementById("refreshButton");
const studentsTable = document.getElementById("studentsTable");
const listMessage = document.getElementById("listMessage");

// GET request: fetch the latest list from our Express API.
async function loadStudents() {
  listMessage.textContent = "Fetching student records...";
  listMessage.className = "list-message";

  try {
    const response = await fetch("/api/students");
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Could not load students.");

    studentsTable.replaceChildren();

    if (data.students.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 6;
      cell.className = "empty";
      cell.textContent = "No registrations yet. Add the first student using the form.";
      row.appendChild(cell);
      studentsTable.appendChild(row);
    } else {
      data.students.forEach(student => {
        const row = document.createElement("tr");
        [student.id, student.fullName, student.rollNumber, student.course, student.email]
          .forEach(value => {
            const cell = document.createElement("td");
            // textContent prevents HTML from user-submitted fields being interpreted as markup.
            cell.textContent = value;
            row.appendChild(cell);
          });

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteStudent(student.id));
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        studentsTable.appendChild(row);
      });
    }

    listMessage.textContent = `Fetched ${data.count} student record(s) from the API.`;
  } catch (error) {
    listMessage.textContent = error.message || "Could not connect to the API. Is the server running?";
    listMessage.className = "list-message error";
  }
}

// POST request: send the form data to the backend API.
form.addEventListener("submit", async event => {
  event.preventDefault();

  const formData = new FormData(form);
  const student = {
    fullName: formData.get("fullName").trim(),
    email: formData.get("email").trim(),
    rollNumber: formData.get("rollNumber").trim(),
    course: formData.get("course"),
    gender: formData.get("gender")
  };

  message.textContent = "";
  message.className = "message";
  submitButton.disabled = true;
  submitButton.textContent = "Registering...";

  try {
    const response = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Registration failed.");

    message.textContent = `${result.message} Student ID: ${result.student.id}.`;
    message.classList.add("success");
    form.reset();
    await loadStudents();
  } catch (error) {
    message.textContent = error.message || "Could not connect to the API.";
    message.classList.add("error");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Register student <span aria-hidden="true">→</span>';
  }
});

// DELETE request: remove a record and refresh the list.
async function deleteStudent(id) {
  if (!window.confirm(`Delete student record #${id}?`)) return;

  try {
    const response = await fetch(`/api/students/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Could not delete student.");
    listMessage.textContent = result.message;
    listMessage.className = "list-message success";
    await loadStudents();
  } catch (error) {
    listMessage.textContent = error.message || "Could not connect to the API.";
    listMessage.className = "list-message error";
  }
}

refreshButton.addEventListener("click", loadStudents);

// Load saved registrations as soon as the page opens.
loadStudents();
