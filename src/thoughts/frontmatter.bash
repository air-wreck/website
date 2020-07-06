#!/bin/bash

# this is a bit of a hack for (ab)using Pandoc to parse YAML frontmatter
# and make it available in Bash, based on something I saw on Reddit

export doc_title='$title$'
export doc_date='$date$'
