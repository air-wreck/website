#!/bin/bash

# run this from the project root directory to build the overall site
dir=src
dest=dist

mkdir -p $dest

cp -R $dir/* $dest
rm -rf $dest/thoughts
rm -rf $dest/parts

# build thoughts
$dir/thoughts/build.sh

# replace <!-- NAV --> with src/parts/nav.html
nav=$dir/parts/nav.html
cat $nav | tr '"' "'" | tr -d '\n' > $nav.tmp
sed -i 's/\//\\\//g' $nav.tmp
for file in $(find $dest -name "*.html"); do
  sed -i "s/<!-- NAV -->/$(cat $nav.tmp)/g" $file
done
rm $nav.tmp

# some Github pages, Keybase, etc. stuff
cp -R .well-known dist
cp _config.yml dist
