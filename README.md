# Website

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

from the project root directory to run locally. To deploy to Github, we
now need to use a separate `gh-pages` branch, since Github will not
allow us to just serve from a subdirectory:

``` bash
$ git subtree push --prefix dist origin gh-pages
```

The only annoying part about this is that we now essentially keep track
of each file twice. I guess I could just switch to Gitlab Pages or
something, which apparently supports more flexible configurations, but
oh well. This site isn't _that_ big anyway.

I don't think there's anything particularly embarrassing in the commit
history, so definitely don't bother looking.
