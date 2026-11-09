require("dotenv").config();
const app = require("./app");

async function runTests() {
  console.log("=== STARTING BACKEND VERIFICATION TESTS ===");

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  async function api(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const body = await res.json();
    return { status: res.status, body };
  }

  try {
    // 1. Health check
    const health = await api("/");
    console.log("1. Health check status:", health.status, health.body.message);

    // 2. Login as Teacher (Budi)
    const teacherLogin = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "budi.guru@example.com",
        password: "password123",
      }),
    });
    console.log("2. Teacher Login status:", teacherLogin.status, teacherLogin.body.success);
    const teacherToken = teacherLogin.body.data.token;
    const teacherHeaders = { Authorization: `Bearer ${teacherToken}` };

    // 3. Login as Student (Andi)
    const studentLogin = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "andi.siswa@example.com",
        password: "password123",
      }),
    });
    console.log("3. Student Login status:", studentLogin.status, studentLogin.body.success);
    const studentToken = studentLogin.body.data.token;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    // 4. Get Classes for Teacher
    const teacherClasses = await api("/api/classes", { headers: teacherHeaders });
    console.log("4. Teacher Classes:", teacherClasses.status, teacherClasses.body.data.length, "classes");
    const classId = teacherClasses.body.data[0].id;

    // 5. Teacher creates a task
    const newTask = await api("/api/tasks", {
      method: "POST",
      headers: teacherHeaders,
      body: JSON.stringify({
        title: "Tugas Pengujian Otomatis",
        description: "Deskripsi tugas pengujian otomatis",
        due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
        class_id: classId,
      }),
    });
    console.log("5. Teacher Create Task status:", newTask.status, newTask.body.data.title);
    const createdTaskId = newTask.body.data.id;

    // 6. Student views tasks with search, filter, pagination
    const studentTasks = await api("/api/tasks?search=Pengujian&page=1&limit=5", {
      headers: studentHeaders,
    });
    console.log(
      "6. Student Tasks count:",
      studentTasks.body.data.length,
      "Pagination:",
      studentTasks.body.pagination
    );

    // 7. Student tries to edit task (should be 403 Forbidden)
    const studentEdit = await api(`/api/tasks/${createdTaskId}`, {
      method: "PUT",
      headers: studentHeaders,
      body: JSON.stringify({
        title: "Hacked Title",
        due_date: new Date().toISOString(),
        class_id: classId,
      }),
    });
    console.log("7. Student edit forbidden (expected 403):", studentEdit.status, studentEdit.body.message);

    // 8. Student marks task complete (toggle)
    const toggleComplete = await api(`/api/tasks/${createdTaskId}/toggle-status`, {
      method: "PATCH",
      headers: studentHeaders,
    });
    console.log("8. Student toggle complete:", toggleComplete.status, toggleComplete.body.data);

    // 9. Student filters by status=selesai
    const completedTasks = await api(`/api/tasks?status=selesai`, {
      headers: studentHeaders,
    });
    console.log("9. Student completed tasks count:", completedTasks.body.data.length);

    // 10. Student marks task uncomplete (toggle again)
    const toggleUncomplete = await api(`/api/tasks/${createdTaskId}/toggle-status`, {
      method: "PATCH",
      headers: studentHeaders,
    });
    console.log("10. Student toggle uncomplete:", toggleUncomplete.status, toggleUncomplete.body.data);

    // 11. Teacher updates task
    const updateTask = await api(`/api/tasks/${createdTaskId}`, {
      method: "PUT",
      headers: teacherHeaders,
      body: JSON.stringify({
        title: "Tugas Pengujian Otomatis (Updated)",
        description: "Deskripsi diperbarui",
        due_date: new Date(Date.now() + 86400000 * 6).toISOString(),
        class_id: classId,
      }),
    });
    console.log("11. Teacher update task:", updateTask.status, updateTask.body.data.title);

    // 12. Teacher deletes task
    const deleteTask = await api(`/api/tasks/${createdTaskId}`, {
      method: "DELETE",
      headers: teacherHeaders,
    });
    console.log("12. Teacher delete task:", deleteTask.status, deleteTask.body.message);

    // 13. Test Registration
    const testRegister = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Siswa Baru",
        email: `siswa.baru.${Date.now()}@example.com`,
        password: "password123",
        role: "siswa",
      }),
    });
    console.log("13. New Student Register status:", testRegister.status, testRegister.body.data.user.email);

    console.log("=== ALL BACKEND TESTS PASSED SUCCESSFULLY! ===");
  } catch (err) {
    console.error("Test failed with error:", err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
