HANDLEBARS = node_modules/.bin/handlebars
WRAP_DEFINE = node help/wrap-define.js
## ender default build supplies $ function to backbone 
ENDER_BUILD = node node_modules/.bin/ender build bonzo bean domready qwery morpheus -o

SIMPLE_DEPS = qwery bean bonzo morpheus reqwest

TEMPLATE_IN = design/templates/
TEMPLATE_OUT = assets/templates/

default: build

build: deps
	node node_modules/.bin/r.js -o build.js

deps: clean-deps ender
# requirejs:
	cp node_modules/requirejs/require.js deps/
# require handlebars plugin:
	#cp -r pkgs/js/require-handlebars-plugin/hbs deps/
	#cp pkgs/js/require-handlebars-plugin/hbs.js deps/
	cp -r pkgs/hbs/* deps/



# AMD aware deps:
	for dep in $(SIMPLE_DEPS) ; do \
    	  cp node_modules/$$dep/$$dep.js deps/$$dep.js ; \
  	done

	cp node_modules/domready/ready.js deps/domready.js

# wrapped deps:
	$(WRAP_DEFINE) node_modules/underscore/underscore.js deps/underscore.js _
	#$(WRAP_DEFINE) node_modules/morpheus/morpheus.js deps/morpheus.js morpheus
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
	$(WRAP_DEFINE) ender.js ender.js ender
	$(WRAP_DEFINE) ender.min.js ender.min.js ender
	#sed -i "s/require/require_one/g" ender.js ender.min.js
	mv ender.js ender.min.js deps

clean-deps:
	rm -rf deps/*
	mkdir -p deps/


.PHONY: deps build ender
