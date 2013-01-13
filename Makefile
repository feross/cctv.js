# Watch stylus file for changes and recompile 
all:
	mkdir -p css
	./node_modules/stylus/bin/stylus stylus/main.styl --use ./node_modules/nib/lib/nib --watch --out css