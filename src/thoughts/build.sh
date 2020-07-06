#!/bin/bash

# run this from the project root directory to build thoughts/
dir=src/thoughts
dest=dist/thoughts

mkdir -p $dest

# temporary file stores the titles and dates
touch $dir/titles_dates.tmp

for file in $(find $dir/*.md -not -name index.md); do
  # load frontmatter
  pandoc -s $file -o $file.tmp --template=$dir/frontmatter.bash
  source $file.tmp
  echo "$doc_date;$doc_title;$file" >> $dir/titles_dates.tmp

  # compile file
  pretty_date=$(echo $doc_date | xargs date +'%B %d, %Y' -d)
  output=$(basename ${file%.md}.html)
  pandoc -s $file -o $dest/$output --template=$dir/article-template.html
  sed -i "s/<!-- TIME -->/$pretty_date/" $dest/$output
done

# sort the thoughts by date
sort -r $dir/titles_dates.tmp > $dir/sorted.tmp

# generate index page
pandoc -s $dir/index.md -o $dest/index.html \
       --template=$dir/index-template.html
while IFS= read line; do
  doc_title=$(echo $line | cut -d ';' -f2)
  doc_date=$(echo $line | cut -d ';' -f1 | xargs date +'%B %d, %Y' -d)
  doc_file=$(echo $line | cut -d ';' -f3)
  doc_link=${doc_file%.md}.html

  href="<a href='$(basename $doc_link)'>$doc_title<\\/a>"
  pattern="<!-- CONTENT -->"
  replace="<li>$href <time>$doc_date<\\/time><\\/li>$pattern"
  sed -i "s/$pattern/$replace/g" $dest/index.html
done < $dir/sorted.tmp

# clear all tempmorary files
rm $dir/*.tmp
