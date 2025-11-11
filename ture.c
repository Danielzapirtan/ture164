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
    if (!list->solutions) {
        fprintf(stderr, "Memory allocation failed!\n");
        exit(1);
    }
}

void add_solution(SolutionList *list, const Solution *sol) {
    if (list->count >= list->capacity) {
        list->capacity *= 2;
        Solution *new_solutions = realloc(list->solutions, list->capacity * sizeof(Solution));
        if (!new_solutions) {
            fprintf(stderr, "Memory allocation failed!\n");
            exit(1);
        }
        list->solutions = new_solutions;
    }
    list->solutions[list->count] = *sol;
    list->count++;
}

void find_solutions(SolutionList *list, Solution *current, int day_idx) {
    // Early termination if we've exceeded target hours
    if (current->total_hours > TARGET_HOURS) {
        return;
    }
    
    if (day_idx == DAYS_IN_MONTH) {
        if (current->total_hours == TARGET_HOURS && current->leave_count > 0) {
            add_solution(list, current);
        }
        return;
    }
    
    // Calculate remaining potential hours more accurately
    int remaining_days = DAYS_IN_MONTH - day_idx;
    int max_remaining_hours = 0;
    int min_remaining_hours = 0;
    
    for (int i = day_idx; i < DAYS_IN_MONTH; i++) {
        Day *d = &calendar[i];
        if (d->is_day_shift || d->is_night_shift) {
            max_remaining_hours += SHIFT_HOURS;
        }
        if (!d->is_holiday) {
            max_remaining_hours += LEAVE_HOURS;
        }
    }
    
    if (current->total_hours + max_remaining_hours < TARGET_HOURS) {
        return; // Can't reach target even with maximum hours
    }
    
    Day *d = &calendar[day_idx];
    
    // Create copies for recursive calls to avoid corruption
    Solution current_copy;
    
    // Option 1: Work day shift (if available)
    if (d->is_day_shift) {
        current_copy = *current;
        current_copy.worked_shifts[day_idx] = 1;
        current_copy.total_hours += SHIFT_HOURS;
        if (d->is_holiday) current_copy.holiday_shifts++;
        
        find_solutions(list, &current_copy, day_idx + 1);
    }
    
    // Option 2: Work night shift (if available)
    if (d->is_night_shift) {
        current_copy = *current;
        current_copy.worked_shifts[day_idx] = 2;
        current_copy.total_hours += SHIFT_HOURS;
        if (d->is_holiday) current_copy.holiday_shifts++;
        
        find_solutions(list, &current_copy, day_idx + 1);
    }
    
    // Option 3: Take leave (only counts if not holiday)
    if (!d->is_holiday) {
        current_copy = *current;
        current_copy.leave_days[day_idx] = 1;
        current_copy.total_hours += LEAVE_HOURS;
        current_copy.leave_count++;
        
        find_solutions(list, &current_copy, day_idx + 1);
    }
    
    // Option 4: Do nothing (neither work nor leave)
    find_solutions(list, current, day_idx + 1);
}

int compare_solutions(const void *a, const void *b) {
    const Solution *sol_a = (const Solution *)a;
    const Solution *sol_b = (const Solution *)b;
    
    // First, sort by holiday shifts (descending)
    if (sol_b->holiday_shifts != sol_a->holiday_shifts) {
        return sol_b->holiday_shifts - sol_a->holiday_shifts;
    }
    
    // Then by leave count (descending - more leave is better)
    return sol_b->leave_count - sol_a->leave_count;
}

void print_solution(const Solution *sol, int idx) {
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
    
    // Show overlaps
    printf("Days with both shift types available:\n");
    int has_overlap = 0;
    for (int i = 0; i < DAYS_IN_MONTH; i++) {
        if (calendar[i].is_day_shift && calendar[i].is_night_shift) {
            printf("  Dec %d%s\n", i + 1, calendar[i].is_holiday ? " (holiday)" : "");
            has_overlap = 1;
        }
    }
    if (!has_overlap) printf("  (none)\n");
    printf("\n");
    
    printf("Searching for solutions (this may take a moment)...\n");
    fflush(stdout);
    
    SolutionList list;
    init_solution_list(&list);
    
    Solution current;
    memset(&current, 0, sizeof(Solution));
    
    find_solutions(&list, &current, 0);
    
    printf("Found %d solutions!\n", list.count);
    
    if (list.count > 0) {
        // Sort solutions by optimization criteria
        qsort(list.solutions, list.count, sizeof(Solution), compare_solutions);
        
        // Print first 10 solutions or all if less
        int print_count = list.count < 10 ? list.count : 10;
        for (int i = 0; i < print_count; i++) {
            print_solution(&list.solutions[i], i + 1);
        }
        
        if (list.count > 10) {
            printf("\n... and %d more solutions (showing top 10)\n", list.count - 10);
        }
        
        printf("\n========================================\n");
        printf("Best solution (most holiday shifts + leave days):\n");
        print_solution(&list.solutions[0], 1);
    } else {
        printf("No solutions found. Consider adjusting constraints.\n");
    }
    
    free(list.solutions);
    
    return 0;
}