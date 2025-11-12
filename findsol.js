const DAYS_IN_MONTH = 31;
const TARGET_HOURS = 164;
const SHIFT_HOURS = 12;
const LEAVE_HOURS = 8;

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

class SolutionList {
    constructor() {
        this.solutions = [];
        this.count = 0;
        this.capacity = 1000;
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

function init_solution_list(list) {
    list.capacity = 1000;
    list.count = 0;
    list.solutions = new Array(list.capacity);
}

function add_solution(list, sol) {
    if (list.count >= list.capacity) {
        list.capacity *= 2;
        // In JavaScript, we can just push to array, but for compatibility with C logic:
        const newSolutions = new Array(list.capacity);
        for (let i = 0; i < list.solutions.length; i++) {
            newSolutions[i] = list.solutions[i];
        }
        list.solutions = newSolutions;
    }
    // Create a deep copy of the solution
    const newSol = new Solution();
    Object.assign(newSol, {
        worked_shifts: [...sol.worked_shifts],
        leave_days: [...sol.leave_days],
        total_hours: sol.total_hours,
        holiday_shifts: sol.holiday_shifts,
        leave_count: sol.leave_count
    });
    list.solutions[list.count++] = newSol;
}

function find_solutions(list, current, day_idx) {
    if (day_idx === DAYS_IN_MONTH) {
        if (current.total_hours === TARGET_HOURS && current.leave_count > 0) {
            add_solution(list, current);
        }
        return;
    }
    
    // Early pruning
    const remaining_days = DAYS_IN_MONTH - day_idx;
    const max_possible = current.total_hours + (remaining_days * SHIFT_HOURS);
    const min_possible = current.total_hours;
    
    if (max_possible < TARGET_HOURS || current.total_hours > TARGET_HOURS) {
        return;
    }
    
    const d = calendar[day_idx];
    
    // Option 1: Work day shift (if available)
    if (d.is_day_shift) {
        current.worked_shifts[day_idx] = 1;
        current.total_hours += SHIFT_HOURS;
        if (d.is_holiday) current.holiday_shifts++;
        
        find_solutions(list, current, day_idx + 1);
        
        current.worked_shifts[day_idx] = 0;
        current.total_hours -= SHIFT_HOURS;
        if (d.is_holiday) current.holiday_shifts--;
    }
    
    // Option 2: Work night shift (if available)
    if (d.is_night_shift) {
        current.worked_shifts[day_idx] = 2;
        current.total_hours += SHIFT_HOURS;
        if (d.is_holiday) current.holiday_shifts++;
        
        find_solutions(list, current, day_idx + 1);
        
        current.worked_shifts[day_idx] = 0;
        current.total_hours -= SHIFT_HOURS;
        if (d.is_holiday) current.holiday_shifts--;
    }
    
    // Option 3: Take leave (only counts if not holiday)
    if (!d.is_holiday) {
        current.leave_days[day_idx] = 1;
        current.total_hours += LEAVE_HOURS;
        current.leave_count++;
        
        find_solutions(list, current, day_idx + 1);
        
        current.leave_days[day_idx] = 0;
        current.total_hours -= LEAVE_HOURS;
        current.leave_count--;
    }
    
    // Option 4: Do nothing (neither work nor leave)
    find_solutions(list, current, day_idx + 1);
}

function compare_solutions(a, b) {
    // First, sort by holiday shifts (descending)
    if (b.holiday_shifts !== a.holiday_shifts) {
        return b.holiday_shifts - a.holiday_shifts;
    }
    
    // Then by leave count (descending - more leave is better)
    return b.leave_count - a.leave_count;
}

function print_solution(sol, idx) {
    console.log(`\n=== Solution ${idx} ===`);
    console.log(`Total hours: ${sol.total_hours} (Target: ${TARGET_HOURS})`);
    console.log(`Holiday shifts worked: ${sol.holiday_shifts}`);
    console.log(`Leave days taken: ${sol.leave_count}`);
    
    console.log("\nWorked shifts:");
    for (let i = 0; i < DAYS_IN_MONTH; i++) {
        if (sol.worked_shifts[i]) {
            console.log(`  Dec ${(i + 1).toString().padStart(2, ' ')} (${calendar[i].is_holiday ? "Holiday" : "Workday"}): ${sol.worked_shifts[i] === 1 ? "Day" : "Night"} shift${calendar[i].is_holiday ? " [HOLIDAY]" : ""}`);
        }
    }
    
    console.log("\nLeave days:");
    let has_leave = false;
    for (let i = 0; i < DAYS_IN_MONTH; i++) {
        if (sol.leave_days[i]) {
            console.log(`  Dec ${(i + 1).toString().padStart(2, ' ')}`);
            has_leave = true;
        }
    }
    if (!has_leave) {
        console.log("  (none)");
    }
}

function main() {
    console.log("Shift Calendar Solver for December 2025");
    console.log("========================================\n");
    
    init_calendar();
    
    console.log("Calendar setup:");
    process.stdout.write("Holidays: ");
    for (let i = 0; i < DAYS_IN_MONTH; i++) {
        if (calendar[i].is_holiday) {
            process.stdout.write((i + 1) + " ");
        }
    }
    console.log();
    
    process.stdout.write("Day shifts: ");
    for (let i = 0; i < DAYS_IN_MONTH; i++) {
        if (calendar[i].is_day_shift) {
            process.stdout.write((i + 1) + " ");
        }
    }
    console.log();
    
    process.stdout.write("Night shifts: ");
    for (let i = 0; i < DAYS_IN_MONTH; i++) {
        if (calendar[i].is_night_shift) {
            process.stdout.write((i + 1) + " ");
        }
    }
    console.log("\n");
    
    console.log("Searching for solutions...");
    
    const list = new SolutionList();
    init_solution_list(list);
    
    const current = new Solution();
    
    find_solutions(list, current, 0);
    
    console.log(`Found ${list.count} solutions!`);
    
    if (list.count > 0) {
        // Sort solutions by optimization criteria
        list.solutions.length = list.count; // Trim to actual count
        list.solutions.sort(compare_solutions);
        
        // Print all solutions
        for (let i = 0; i < list.count; i++) {
            print_solution(list.solutions[i], i + 1);
        }
        
        console.log("\n========================================");
        console.log("Best solution (most holiday shifts + leave days):");
        print_solution(list.solutions[0], 1);
    }
}

// Run the program
main();