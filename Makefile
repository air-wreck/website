# use ">" instead of tabs
.RECIPEPREFIX = >

site:
> ./build.sh

clean:
> rm -rf dist && mkdir -p dist

serve:
> python3 -m http.server -d dist
