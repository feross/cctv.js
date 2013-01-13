.PHONY : deploy
deploy:
	rsync -r -a -v -e "ssh -l feross -p 44444" --delete . future:/home/feross/www/cctv.js/
	ssh feross@future cd /home/feross/www/cctv.js; npm rebuild