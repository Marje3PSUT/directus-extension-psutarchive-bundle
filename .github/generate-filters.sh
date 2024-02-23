#!/bin/bash
dirs=($(find packages/* -maxdepth 0 -type d -exec basename {} \;))
touch filters.yaml
for dir in "${dirs[@]}"
do
    echo "${dir}: packages/${dir}/src" >> filters.yaml
done
