#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define DAYS_IN_MONTH 31
#define TARGET_HOURS 164
#define SHIFT_HOURS 12
#define LEAVE_HOURS 8

typedef struct {
    int day;
    int is_holiday;
    int is_day_shift;
    int is_night_shift;
} Day;

typedef struct {
    int worked_shifts[DAYS_IN_MONTH];
    int leave_days[DAYS_IN_MONTH];
    int total_hours;
    int holiday_shifts;
    int leave_count;
} Solution;

typedef struct {
    Solution *solutions;
    int count;
    int capacity;
} SolutionList;

Day calendar[DAYS_IN_MONTH];

void init_calendar() {
    int day_shifts[] = {4, 8, 12, 16, 20, 24, 28};
    int night_shifts[] = {1, 5, 9, 13, 17, 21, 25, 29};
    int holidays[] = {1, 25, 26}; // Dec 1, 25, 26
    
    // December 2025 starts on Monday (Dec 1 is Monday)
    // Saturdays: 6, 13, 20, 27
    // Sundays: 7, 14, 21, 28
    int saturdays[] = {6, 13, 20, 27};
    int sundays[] = {7, 14, 21, 28};
    
    for (int i = 0; i < DAYS_IN_MONTH; i++) {
        calendar[i].day = i + 1;
        calendar[i].is_holiday = 0;
        calendar[i].is_day_shift = 0;
        calendar[i].is_night_shift = 0;
    }
    
    // Mark holidays
    for (int i = 0; i < 3; i++) {
        calendar[holidays[i] - 1].is_holiday = 1;
    }
    for (int i = 0; i < 4; i++) {
        calendar[saturdays[i] - 1].is_holiday = 1;
        calendar[sundays[i] - 1].is_holiday = 1;
    }
    
    // Mark day shifts
    for (int i = 0; i < 7; i++) {
        calendar[day_shifts[i] - 1].is_day_shift = 1;
    }
    
    // Mark night shifts
    for (int i = 0; i < 8; i++) {
        calendar[night_shifts[i] - 1].is_night_shift = 1;
    }
}

void init_solution_list(SolutionList *list) {
    list->capacity = 1000;
    list->count = 0;
    list->solutions = malloc(list->capacity * sizeof(Solution));
}

void add_solution(SolutionList *list, Solution *sol) {
    if (list->count >= list->capacity) {
        list->capacity *= 2;
        list->solutions = realloc(list->solutions, list->capacity * sizeof(Solution));
    }
    list->solutions[list->count++] = *sol;
}

void find_solutions(SolutionList *list, Solution *current, int day_idx) {
    if (day_idx == DAYS_IN_MONTH) {
        if (current->total_hours == TARGET_HOURS && current->leave_count > 0) {
            add_solution(list, current);
        }
        return;
    }
    
    // Early pruning
    int remaining_days = DAYS_IN_MONTH - day_idx;
    int max_possible = current->total_hours + (remaining_days * SHIFT_HOURS);
    int min_possible = current->total_hours;
    
    // Calculate minimum possible from remaining days
    for (int i = day_idx; i < DAYS_IN_MONTH; i++) {
        if (!calendar[i].is_holiday) {
            // Could take leave on all non-holidays
        }
    }
    
    if (max_possible < TARGET_HOURS || current->total_hours > TARGET_HOURS) {
        return;
    }
    
    Day *d = &calendar[day_idx];
    
    // Option 1: Work day shift (if available)
    if (d->is_day_shift) {
        current->worked_shifts[day_idx] = 1;
        current->total_hours += SHIFT_HOURS;
        if (d->is_holiday) current->holiday_shifts++;
        
        find_solutions(list, current, day_idx + 1);
        
        current->worked_shifts[day_idx] = 0;
        current->total_hours -= SHIFT_HOURS;
        if (d->is_holiday) current->holiday_shifts--;
    }
    
    // Option 2: Work night shift (if available)
    if (d->is_night_shift) {
        current->worked_shifts[day_idx] = 2;
        current->total_hours += SHIFT_HOURS;
        if (d->is_holiday) current->holiday_shifts++;
        
        find_solutions(list, current, day_idx + 1);
        
        current->worked_shifts[day_idx] = 0;
        current->total_hours -= SHIFT_HOURS;
        if (d->is_holiday) current->holiday_shifts--;
    }
    
    // Option 3: Take leave (only counts if not holiday)
    if (!d->is_holiday) {
        current->leave_days[day_idx] = 1;
        current->total_hours += LEAVE_HOURS;
        current->leave_count++;
        
        find_solutions(list, current, day_idx + 1);
        
        current->leave_days[day_idx] = 0;
        current->total_hours -= LEAVE_HOURS;
        current->leave_count--;
    }
    
    // Option 4: Do nothing (neither work nor leave)
    find_solutions(list, current, day_idx + 1);
}

int compare_solutions(const void *a, const void *b) {
    Solution *sol_a = (Solution *)a;
    Solution *sol_b = (Solution *)b;
    
    // First, sort by holiday shifts (descending)
    if (sol_b->holiday_shifts != sol_a->holiday_shifts) {
        return sol_b->holiday_shifts - sol_a->holiday_shifts;
    }
    
    // Then by leave count (descending - more leave is better)
    return sol_b->leave_count - sol_a->leave_count;
}

void print_solution(Solution *sol, int idx) {
    printf("\n=== Solution %d ===\n", idx);
    printf("Total hours: %d (Target: %d)\n", sol->total_hours, TARGET_HOURS);
    printf("Holiday shifts worked: %d\n", sol->holiday_shifts);
    printf("Leave days taken: %d\n", sol->leave_count);
    
    printf("\nWorked shifts:\n");
    for (int i = 0; i < DAYS_IN_MONTH; i++) {
        if (sol->worked_shifts[i]) {
            printf("  Dec %2d (%s): %s shift%s\n", 
                   i + 1,
                   calendar[i].is_holiday ? "Holiday" : "Workday",
                   sol->worked_shifts[i] == 1 ? "Day" : "Night",
                   calendar[i].is_holiday ? " [HOLIDAY]" : "");
        }
    }
    
    printf("\nLeave days:\n");
    int has_leave = 0;
    for (int i = 0; i < DAYS_IN_MONTH; i++) {
        if (sol->leave_days[i]) {
            printf("  Dec %2d\n", i + 1);
            has_leave = 1;
        }
    }
    if (!has_leave) {
        printf("  (none)\n");
    }
}

int main() {
    printf("Shift Calendar Solver for December 2025\n");
    printf("========================================\n\n");
    
    init_calendar();
    
    printf("Calendar setup:\n");
    printf("Holidays: ");
    for (int i = 0; i < DAYS_IN_MONTH; i++) {
        if (calendar[i].is_holiday) {
            printf("%d ", i + 1);
        }
    }
    printf("\n");
    
    printf("Day shifts: ");
    for (int i = 0; i < DAYS_IN_MONTH; i++) {
        if (calendar[i].is_day_shift) {
            printf("%d ", i + 1);
        }
    }
    printf("\n");
    
    printf("Night shifts: ");
    for (int i = 0; i < DAYS_IN_MONTH; i++) {
        if (calendar[i].is_night_shift) {
            printf("%d ", i + 1);
        }
    }
    printf("\n\n");
    
    printf("Searching for solutions...\n");
    
    SolutionList list;
    init_solution_list(&list);
    
    Solution current;
    memset(&current, 0, sizeof(Solution));
    
    find_solutions(&list, &current, 0);
    
    printf("Found %d solutions!\n", list.count);
    
    if (list.count > 0) {
        // Sort solutions by optimization criteria
        qsort(list.solutions, list.count, sizeof(Solution), compare_solutions);
        
        // Print all solutions
        for (int i = 0; i < list.count; i++) {
            print_solution(&list.solutions[i], i + 1);
        }
        
        printf("\n========================================\n");
        printf("Best solution (most holiday shifts + leave days):\n");
        print_solution(&list.solutions[0], 1);
    }
    
    free(list.solutions);
    
    return 0;
}