#include <stdio.h>
#include <stdlib.h>

int hpd[31];

void init(void) {
	for (int i = 0; i < 31; i++)
		hpd[i] = -1;
}

