#! /usr/bin/bash

gcc -o ture \
    ture.c \
    -lm \
    -O4 \
    -march=native \
    -w
