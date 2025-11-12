const DAYS_IN_MONTH = 31;
const TARGET_HOURS = 164;
const SHIFT_HOURS = 12;
const LEAVE_HOURS = 8;

function notify(string) {
	console.log(string);
}

class Day {
    constructor(day) {
        this.day = day;
        this.is_holiday = false;
        this.is_day_shift = false;
        this.is_night_shift = false;
    }
}

class Solution {
    constructor() {
        this.worked_shifts = new Array(DAYS_IN_MONTH).fill(0);
        this.leave_days = new Array(DAYS_IN_MONTH).fill(0);
        this.total_hours = 0;
        this.holiday_shifts = 0;
        this.leave_count = 0;
    }
}

let calendar = new Array(DAYS_IN_MONTH);

function init_calendar() {
    const day_shifts = [4, 8, 12, 16, 20, 24, 28];
    const night_shifts = [1, 5, 9, 13, 17, 21, 25, 29];
    const holidays = [1, 25, 26]; // Dec 1, 25, 26
    
    // December 2025 starts on Monday (Dec 1 is Monday)
    // Saturdays: 6, 13, 20, 27
    // Sundays: 7, 14, 21, 28
    const saturdays = [6, 13, 20, 27];
    const sundays = [7, 14, 21, 28];
    
    for (let i = 0; i < DAYS_IN_MONTH; i++) {
        calendar[i] = new Day(i + 1);
    }
    
    // Mark holidays
    for (let i = 0; i < 3; i++) {
        calendar[holidays[i] - 1].is_holiday = true;
    }
    for (let i = 0; i < 4; i++) {
        calendar[saturdays[i] - 1].is_holiday = true;
        calendar[sundays[i] - 1].is_holiday = true;
    }
    
    // Mark day shifts
    for (let i = 0; i < 7; i++) {
        calendar[day_shifts[i] - 1].is_day_shift = true;
    }
    
    // Mark night shifts
    for (let i = 0; i < 8; i++) {
        calendar[night_shifts[i] - 1].is_night_shift = true;
    }
}

function add_solution(list, sol) {
    if (list.count < list.capacity) {
        // Create a deep copy of the solution to avoid reference issues
        const newSol = new Solution();
        newSol.worked_shifts = [...sol.worked_shifts];
        newSol.leave_days = [...sol.leave_days];
        newSol.total_hours = sol.total_hours;
        newSol.holiday_shifts = sol.holiday_shifts;
        newSol.leave_count = sol.leave_count;
        
        list.solutions[list.count] = newSol;
        list.count++;
    }
}

class SolutionList {
    constructor() {
        this.solutions = [];
        this.count = 0;
        this.capacity = 1000;
    }
}

function init_solution_list(list) {
    list.capacity = 1000;
    list.count = 0;
    list.solutions = new Array(list.capacity);
}

function find_solutions(list, current, day_idx) {
    // Base case: reached end of month
    if (day_idx >= DAYS_IN_MONTH) {
        // Check if solution meets target hours
        if (current.total_hours >= TARGET_HOURS) {
            add_solution(list, current);
        }
        return;
    }

    // If we already have enough solutions, stop searching
    if (list.count >= list.capacity) {
        return;
    }

    const currentDay = calendar[day_idx];
    
    // Option 1: Take leave on this day
    if (current.leave_count < Math.floor(DAYS_IN_MONTH / 7)) { // Limit leave days
        const newCurrentLeave = new Solution();
        newCurrentLeave.worked_shifts = [...current.worked_shifts];
        newCurrentLeave.leave_days = [...current.leave_days];
        newCurrentLeave.total_hours = current.total_hours;
        newCurrentLeave.holiday_shifts = current.holiday_shifts;
        newCurrentLeave.leave_count = current.leave_count + 1;
        
        newCurrentLeave.leave_days[day_idx] = 1;
        
        find_solutions(list, newCurrentLeave, day_idx + 1);
    }

    // Option 2: Work day shift if available
    if (currentDay.is_day_shift) {
        const newCurrentDay = new Solution();
        newCurrentDay.worked_shifts = [...current.worked_shifts];
        newCurrentDay.leave_days = [...current.leave_days];
        newCurrentDay.total_hours = current.total_hours + SHIFT_HOURS;
        newCurrentDay.holiday_shifts = current.holiday_shifts + (currentDay.is_holiday ? 1 : 0);
        newCurrentDay.leave_count = current.leave_count;
        
        newCurrentDay.worked_shifts[day_idx] = 1; // 1 for day shift
        
        find_solutions(list, newCurrentDay, day_idx + 1);
    }

    // Option 3: Work night shift if available
    if (currentDay.is_night_shift) {
        const newCurrentNight = new Solution();
        newCurrentNight.worked_shifts = [...current.worked_shifts];
        newCurrentNight.leave_days = [...current.leave_days];
        newCurrentNight.total_hours = current.total_hours + SHIFT_HOURS;
        newCurrentNight.holiday_shifts = current.holiday_shifts + (currentDay.is_holiday ? 1 : 0);
        newCurrentNight.leave_count = current.leave_count;
        
        newCurrentNight.worked_shifts[day_idx] = 2; // 2 for night shift
        
        find_solutions(list, newCurrentNight, day_idx + 1);
    }

    // Option 4: Do nothing (regular day off)
    find_solutions(list, current, day_idx + 1);
}

function print_solution(sol, idx) {
    notify(`\n=== Solution ${idx} ===`);
    notify(`Total hours: ${sol.total_hours} (Target: ${TARGET_HOURS})`);
    notify(`Holiday shifts worked: ${sol.holiday_shifts}`);
    notify(`Leave days taken: ${sol.leave_count}`);
    
    notify("\nWorked shifts:");
    for (let i = 0; i < DAYS_IN_MONTH; i++) {
        if (sol.worked_shifts[i]) {
            notify(`  Dec ${(i + 1).toString().padStart(2, ' ')} (${calendar[i].is_holiday ? "Holiday" : "Workday"}): ${sol.worked_shifts[i] === 1 ? "Day" : "Night"} shift${calendar[i].is_holiday ? " [HOLIDAY]" : ""}`);
        }
    }
    
    notify("\nLeave days:");
    let has_leave = false;
    for (let i = 0; i < DAYS_IN_MONTH; i++) {
        if (sol.leave_days[i]) {
            notify(`  Dec ${(i + 1).toString().padStart(2, ' ')}`);
            has_leave = true;
        }
    }
    if (!has_leave) {
        notify("  (none)");
    }
}

function main() {
    notify("Shift Calendar Solver for December 2025");
    notify("========================================\n");
    
    init_calendar();
    
    notify("Calendar setup:");
    notify("Holidays: ");
    for (let i = 0; i < DAYS_IN_MONTH; i++) {
        if (calendar[i].is_holiday) {
            notify((i + 1) + " ");
        }
    }
    notify();
    
    notify("Day shifts: ");
    for (let i = 0; i < DAYS_IN_MONTH; i++) {
        if (calendar[i].is_day_shift) {
            notify((i + 1) + " ");
        }
    }
    notify();
    
    notify("Night shifts: ");
    for (let i = 0; i < DAYS_IN_MONTH; i++) {
        if (calendar[i].is_night_shift) {
            notify((i + 1) + " ");
        }
    }
    notify("\n");
    
    notify("Searching for solutions...");
    
    const list = new SolutionList();
    init_solution_list(list);
    
    const current = new Solution();
    
    find_solutions(list, current, 0);
    
    notify(`Found ${list.count} solutions!`);
    
    if (list.count > 0) {
        // Sort solutions by optimization criteria
        list.solutions.length = list.count; // Trim to actual count
        list.solutions.sort(compare_solutions);
        
        // Print all solutions
        for (let i = 0; i < list.count; i++) {
            print_solution(list.solutions[i], i + 1);
        }
        
        notify("\n========================================");
        notify("Best solution (most holiday shifts + leave days):");
        print_solution(list.solutions[0], 1);
    }
}

// Run the program
main();
