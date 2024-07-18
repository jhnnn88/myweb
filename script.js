document.addEventListener("DOMContentLoaded", function () {
  const ADMIN_PASSWORD = "bijeon_admin2013!";
  let isAdmin = false;
  const savedList = JSON.parse(localStorage.getItem("attendanceList")) || [];
  const attendanceList = document.getElementById("attendance-list");
  const downloadBtn = document.getElementById("download-btn");

  const numberSelect = document.getElementById("number");
  for (let i = 1; i <= 34; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i + "번";
    numberSelect.appendChild(option);
  }

  savedList.forEach(function (entry) {
    addListItem(entry.age, entry.class, entry.number, entry.name, entry.time);
  });

  document
    .getElementById("attendance-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const age = document.getElementById("age").value + "학년";
      const className = document.getElementById("class").value + "반";
      const number = document.getElementById("number").value + "번";
      const nameOrPassword = document.getElementById("name").value;
      const currentTime = new Date().toLocaleTimeString();

      if (
        age === "1학년" &&
        className === "1반" &&
        number === "1번" &&
        nameOrPassword === ADMIN_PASSWORD
      ) {
        isAdmin = true;
        alert("관리자 모드 활성화");
        document
          .querySelectorAll(".delete-btn")
          .forEach((btn) => (btn.style.display = "inline"));
        downloadBtn.style.display = "inline";
        return;
      }

      addListItem(age, className, number, nameOrPassword, currentTime);

      savedList.push({
        age: age,
        class: className,
        number: number,
        name: nameOrPassword,
        time: currentTime,
      });
      localStorage.setItem("attendanceList", JSON.stringify(savedList));

      document.getElementById("age").value = "";
      document.getElementById("class").value = "";
      document.getElementById("number").value = "";
      document.getElementById("name").value = "";
    });

  function addListItem(age, className, number, name, time) {
    const listItem = document.createElement("li");
    listItem.textContent = `${age} ${className} ${number} ${name} - ${time}`;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "삭제";
    deleteBtn.className = "delete-btn";

    if (isAdmin) {
      deleteBtn.style.display = "inline";
    }

    deleteBtn.addEventListener("click", function () {
      if (!isAdmin) return;
      const index = Array.from(attendanceList.children).indexOf(listItem);
      savedList.splice(index, 1);
      localStorage.setItem("attendanceList", JSON.stringify(savedList));
      attendanceList.removeChild(listItem);
    });

    listItem.appendChild(deleteBtn);
    attendanceList.appendChild(listItem);
  }

  downloadBtn.addEventListener("click", function () {
    const ws = XLSX.utils.json_to_sheet(
      savedList.map((item) => ({
        시간: item.time,
        학년: item.age,
        반: item.class,
        번호: item.number,
        이름: item.name,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "출석 명단");

    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `출석_명단_${date}.xlsx`);
  });
});
