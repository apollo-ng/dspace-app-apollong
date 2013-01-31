HANDLEBARS = node_modules/.bin/handlebars
WRAP_DEFINE = node help/wrap-define.js
## ender default build supplies $ function to backbone 
ENDER_BUILD = node node_modules/.bin/ender build bonzo bean domready qwery morpheus -o

SIMPLE_DEPS = qwery bean bonzo morpheus reqwest

TEMPLATE_IN = design/templates/
TEMPLATE_OUT = assets/templates/

DOC_BIN=naturaldocs
DOC_DIR=./doc/app
DOC_IMG=./doc/images
DOC_CONFIG_DIR=./doc/config
DOC_INPUTS=-i ./app

default: build

build: deps
	node node_modules/.bin/r.js -o build.js

deps: clean-deps ender
# requirejs:
	cp node_modules/requirejs/require.js deps/
# require handlebars plugin:
	cp -r pkgs/js/require-handlebars-plugin/hbs deps/
	cp pkgs/js/require-handlebars-plugin/hbs.js deps/
#	cp -r pkgs/hbs/* deps/



# AMD aware deps:
	for dep in $(SIMPLE_DEPS) ; do \
		  cp node_modules/$$dep/$$dep.js deps/$$dep.js ; \
		done

	cp node_modules/domready/ready.js deps/domready.js

# wrapped deps:
	$(WRAP_DEFINE) node_modules/underscore/underscore.js deps/underscore.js _
# backbone-amd fork  
	cp pkgs/js/backbone-amd/backbone.js deps/backbone.js


	$(WRAP_DEFINE) node_modules/handlebars/dist/handlebars.js deps/handlebars.js \
	  this.Handlebars

	$(WRAP_DEFINE) pkgs/js/modestmaps.js deps/modestmaps.js MM

	$(WRAP_DEFINE) pkgs/js/easey.js deps/easey.js easey \
	  modestmaps:MM

	$(WRAP_DEFINE) pkgs/js/easey.handlers.js deps/easey_handlers.js easey_handlers \
	  modestmaps:MM \
	  easey:easey

	$(WRAP_DEFINE) pkgs/js/markers.js deps/markers.js mapbox.markers \
	  modestmaps:MM
ender: 
	$(ENDER_BUILD) ender.js
	sed -i 's/typeof define/typeof defineDoesntExist/g' ender.js
	sed -i 's/define(/defineDoesntExist(/g' ender.js
	echo "var enderRequire;\n" > ender.js.tmp
	cat ender.js >> ender.js.tmp
	mv ender.js.tmp ender.js
	sed -i 's/require(/enderRequire(/g' ender.js
	sed -i 's/function provide/enderRequire = require;\n\nfunction provide/' ender.js
	$(WRAP_DEFINE) ender.js ender.js 'ender.noConflict(function() {})'
	rm ender.min.js
	mv ender.js deps

clean-deps:
	rm -rf deps/*
	mkdir -p deps/


.PHONY: deps build ender doc

doc:
	mkdir -p $(DOC_DIR) $(DOC_CONFIG_DIR)
	$(DOC_BIN) $(DOC_INPUTS) -o html $(DOC_DIR) -img $(DOC_IMG) -p $(DOC_CONFIG_DIR) -s Default custom-1
