#!/bin/bash

INDIVIDUAL_FILES="false"

for arg in "$@"; do
    case "$arg" in
        -h|--help)
            cat << EOF
Stats Help:

Usage:

    ./stats.sh [options]

Options:

    -i, --individiual-files
        Show line count for all files seperately

EOF
        exit
            ;;
        -i|--individual-files)
            INDIVIDUAL_FILES="true"
            ;;
    esac
done

RESULT="$(find . \( -name '*.html' -o -name '*.ts' -o -name '*.sh' -o -name '*.py' -o -name '*.css' -o -name '*.js' \) -print0 | xargs -0 wc -l | sort -n)"

if [[ "$INDIVIDUAL_FILES" == "true" ]]; then
    echo "$RESULT"
else
    echo -n "Total line count: "
    echo "$RESULT" | head -n -1 | awk '{ total += $1 } END { print total }'
fi