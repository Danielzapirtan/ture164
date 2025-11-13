const daysInDecember = 31;
const holidays = [1, 25, 26];
const saturdays = [6, 13, 20, 27];
const sundays = [7, 14, 21, 28];
const normalDayshifts = [4, 8, 12, 16, 20, 24, 28];
const normalNightshifts = [1, 5, 9, 13, 17, 21, 25, 29];
const hoursPerWorkedDay = 12;
const hoursPerLeaveDay = 8;
const goalHours = 164;
let totalHours = 0;
let leaveDays = 0;
const calendar = document.querySelector(".calendar");
const totalHoursDisplay = document.getElementById("total-hours");
const leaveDaysDisplay = document.getElementById("leave-days");
let tura = 3;
function updateStats() {
  totalHoursDisplay.textContent = totalHours;
  leaveDaysDisplay.textContent = leaveDays;
  document.getElementById("shift").innerHTML = `${tura}`;
}

document.getElementById("switch-shift").addEventListener("click" => {
  tura++;
  if (tura == 5)
    tura = 1;/
  updateStats();
});

for (let day = 1; day <= daysInDecember; day++) {
  const dayElement = document.createElement("div");
  dayElement.classList.add("day");
  dayElement.textContent = day;
  if (
    holidays.includes(day) ||
    saturdays.includes(day) ||
    sundays.includes(day)
  ) {
    dayElement.classList.add("holiday");
  }
  if ((day + shift + 1) % 4 < 2) {
    dayElement.classList.add("workday");
    totalHours += hoursPerWorkedDay;
  }
  dayElement.addEventListener("click", () => toggleDayStatus(dayElement, day));
  calendar.appendChild(dayElement);
}
updateStats();

function toggleDayStatus(dayElement, day) {
  if ((day + shift + 1) % 4 < 2) {
    if (dayElement.classList.contains("holiday")) {
      if (dayElement.classList.contains("workday")) {
        dayElement.classList.remove("workday");
        dayElement.classList.add("leave");
        totalHours -= hoursPerWorkedDay;
        leaveDays += 1;
      } else if (dayElement.classList.contains("leave")) {
        dayElement.classList.remove("leave");
        dayElement.classList.add("workday");
        totalHours += hoursPerWorkedDay;
        leaveDays -= 1;
      }
    } else {
      if (dayElement.classList.contains("workday")) {
        dayElement.classList.remove("workday");
        dayElement.classList.add("leave");
        totalHours -= 4;
        leaveDays += 1;
      } else if (dayElement.classList.contains("leave")) {
        dayElement.classList.remove("leave");
        dayElement.classList.add("workday");
        totalHours += 4;
        leaveDays -= 1;
      }
    }
  } else {
    if (dayElement.classList.contains("holiday")) {
      if (dayElement.classList.contains("leave")) {
        dayElement.classList.remove("leave");
        leaveDays -= 1;
      } else {
        dayElement.classList.add("leave");
        leaveDays += 1;
      }
    } else {
      if (dayElement.classList.contains("leave")) {
        dayElement.classList.remove("leave");
        totalHours -= 8;
        leaveDays -= 1;
      } else {
        dayElement.classList.add("leave");
        totalHours += 8;
        leaveDays += 1;
      }
    }
  }
  updateStats();
}
