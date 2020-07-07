# Website

> **Remark:** If you are viewing this repository on Github, note that I
> have switched over to Gitlab Pages to host this site because they
> offer more flexibility. This repository is no longer updated.

This is just the source for my personal website. I am now officially
using a "static site generator" (okay, basically just Pandoc + a couple
of Bash scripts). Actually, most of the content is still just written in
HTML, but the `/thoughts` are written in Markdown. (This is mostly to
support nice things like code highlighting and to generally reduce the
friction of actually writing stuff.)

I don't know why you'd want to run my "static site generator", but just
in case _I_ forget how this all works, it's just

``` bash
$ make site && make serve
```

from the project root directory to run locally. To deploy to Gitlab, you
should be able to just push; Gitlab Pages will build the site itself.

For hosting, here's the funny thing: the way this is currently set up,
the canonical content is available under `https://www.ericzheng.org`,
which is served from Gitlab. Gitlab handles the redirect from
`http://www.ericzheng.org`, but _Github_ handles the redirect from
`https://ericzheng.org` and `http://ericzheng.org`. This is why I
haven't taken down this repository entire yet. You know what they say:
"if it ain't broke, don't fix it."

I don't think there's anything particularly embarrassing in the commit
history, so definitely don't bother looking.
