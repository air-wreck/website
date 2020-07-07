# use ">" instead of tabs
.RECIPEPREFIX = >

site:
> ./build.sh

clean:
> rm -rf public && mkdir -p public

serve:
> python3 -m http.server -d public
