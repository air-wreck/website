# Website

> **Remark:** If you are viewing this repository on Github, note that I
> have switched over to Gitlab Pages to host this site because they
> more flexibility. This repository is no longer updated.

This is just the source for my personal website. I am now officially
using a "static site generator" (okay, basically just Pandoc + a couple
of Bash scripts). Actually, most of the content is still just written in
HTML, but the `/thoughts` are written in Markdown. (This is mostly to
support nice things like code highlighting.)

I don't know why you'd want to run my "static site generator", but just
in case _I_ forget how this all works, it's just

``` bash
$ make site && make serve
```

from the project root directory to run locally. To deploy to Gitlab, you
should be able to just push; Gitlab pages will build the site itself.

I don't think there's anything particularly embarrassing in the commit
history, so definitely don't bother looking.
