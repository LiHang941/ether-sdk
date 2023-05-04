#!/usr/bin/env bash

cd src/abi/;
for dir in `ls -d *.sol`; do
    cd $dir
    for file in `ls`; do
      echo "$file"
      cat $file | jq -c .abi > "$file.bak"
      mv "$file.bak" ../$file
      rm -rf "$file.bak"
    done
    cd ..
    rm -rf $dir
done
