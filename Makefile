HANDLEBARS = node_modules/.bin/handlebars
WRAP_DEFINE = node help/wrap-define.js

SIMPLE_DEPS = qwery bean bonzo morpheus reqwest

TEMPLATE_IN = design/templates/
TEMPLATE_OUT = assets/templates/

default: build

build: deps
	node node_modules/.bin/r.js -o build.js

deps: clean-deps
# requirejs:
	cp node_modules/requirejs/require.js deps/
# require handlebars plugin:
	cp -r pkgs/js/require-handlebars-plugin/hbs deps/
	cp pkgs/js/require-handlebars-plugin/hbs.js deps/

# AMD aware deps:
	for dep in $(SIMPLE_DEPS) ; do \
    cp node_modules/$$dep/$$dep.js deps/$$dep.js ; \
  done

	cp node_modules/domready/ready.js deps/domready.js

# deps that require AMD wrapper:
#	$(WRAP_DEFINE) node_modules/qwery/qwery.js deps/qwery.js \
	  qwery

	$(WRAP_DEFINE) node_modules/underscore/underscore.js\
    deps/underscore.js \
    _

	$(WRAP_DEFINE) node_modules/backbone/backbone.js deps/backbone.js \
    Backbone \
	  app/js/dollar:$$ \
    underscore:_

	$(WRAP_DEFINE) node_modules/handlebars/dist/handlebars.js deps/handlebars.js \
	  this.Handlebars

	$(WRAP_DEFINE) pkgs/js/modestmaps.js deps/modestmaps.js MM

	$(WRAP_DEFINE) pkgs/js/easey.js deps/easey.js easey \
	  modestmaps:MM

	$(WRAP_DEFINE) pkgs/js/easey.handlers.js deps/easey_handlers.js easey_handlers \
	  modestmaps:MM

	$(WRAP_DEFINE) pkgs/js/markers.js deps/markers.js mapbox.markers \
	  modestmaps:MM

clean-deps:
	rm -rf deps/*
	mkdir -p deps/


.PHONY: deps build
