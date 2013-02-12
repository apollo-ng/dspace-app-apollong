HANDLEBARS = node_modules/.bin/handlebars
WRAP_DEFINE = node help/wrap-define.js
## ender default build supplies $ function to backbone
ENDER_BUILD = node node_modules/.bin/ender build bonzo bean domready qwery morpheus -o

SIMPLE_DEPS = qwery bean bonzo morpheus reqwest

TEMPLATE_IN = assets/templates/
#FIXME: Where is template_out used? 
TEMPLATE_OUT = assets/templates/

DOC_BIN=naturaldocs
DOC_DIR=./doc/app
DOC_CONFIG_DIR=./doc/config
DOC_INPUTS=-i ./app

default: build

build: deps
	@echo -n "Building dspace-client.js... "
	@node node_modules/.bin/r.js -o build.js > /dev/null
	@echo "[OK]"
	@echo -n "Moving Assets... "
	@mv build/dspace.js build/assets/dspace-client.js
	@cp -r assets/icons build/assets/icons
	@cp -r assets/images build/assets/images
	@echo "[OK]"
	@echo -n "Merging and compressing dspace-client.css... "
	@cat assets/css/main.css > .tmp.css
	@cat assets/css/ui.css >> .tmp.css
	@node_modules/.bin/csso -i .tmp.css -o build/assets/dspace-client.css	
	@rm .tmp.css
	@echo "[OK]"
	@echo ">>> Client build complete"
     

deps: clean-deps ender local-deps

init:
	@echo -n "Rebuilding GIT submodules... "
	@git submodule init
	@git submodule update
	@echo "[OK]"
	@make local-deps

local-deps:
	@echo -n "Building local deps... "
	@cp node_modules/requirejs/require.js deps/
	@cp -r pkgs/js/hbs/ deps/
	@cp pkgs/js/hbs.js deps/
	@echo "[OK]"

	@echo -n "Building AMD Deps... "
	@for dep in $(SIMPLE_DEPS) ; do \
		cp node_modules/$$dep/$$dep.js deps/$$dep.js; \
	done
	@echo "[OK]"

	@echo -n "Assembling JS components... "
	@cp node_modules/domready/ready.js deps/domready.js

# wrapped deps:
	@$(WRAP_DEFINE) node_modules/underscore/underscore.js deps/underscore.js _ > /dev/null
# backbone-amd fork
	@cp pkgs/js/backbone-amd/backbone.js deps/backbone.js

	@cp pkgs/js/backbone.localstorage.js deps/backbone.localstorage.js

	@cp pkgs/js/Math.uuid.js deps/Math.uuid.js

	@cp pkgs/js/remoteStorage.amd.js deps/remoteStorage.js

	@$(WRAP_DEFINE) node_modules/handlebars/dist/handlebars.js deps/handlebars.js \
	  this.Handlebars > /dev/null

	@$(WRAP_DEFINE) pkgs/js/modestmaps.js deps/modestmaps.js MM > /dev/null

	@$(WRAP_DEFINE) pkgs/js/easey.js deps/easey.js easey \
	  modestmaps:MM > /dev/null

	@$(WRAP_DEFINE) pkgs/js/easey.handlers.js deps/easey_handlers.js easey_handlers \
	  modestmaps:MM \
	  easey:easey > /dev/null

	@$(WRAP_DEFINE) pkgs/js/markers.js deps/markers.js mapbox.markers \
	  modestmaps:MM > /dev/null
	@echo "[OK]"

ender:
	@echo -n "Building Ender... "
	@$(ENDER_BUILD) ender.js > /dev/null
	@sed -i 's/typeof define/typeof defineDoesntExist/g' ender.js
	@sed -i 's/define(/defineDoesntExist(/g' ender.js
	@echo 'var enderRequire;' > ender.js.tmp
	@echo '' >> ender.js.tmp
	@cat ender.js >> ender.js.tmp
	@mv ender.js.tmp ender.js
	@sed -i 's/require(/enderRequire(/g' ender.js
	@sed -i 's/function provide/enderRequire = require;\n\nfunction provide/' ender.js
	@$(WRAP_DEFINE) ender.js ender.js 'ender.noConflict(function() {})' > /dev/null
	@rm ender.min.js
	@mv ender.js deps
	@echo "[OK]"

clean-deps:
	@rm -rf deps/*
	@mkdir -p deps/


.PHONY: deps build ender doc

doc:
	mkdir -p $(DOC_DIR) $(DOC_CONFIG_DIR)
	$(DOC_BIN) $(DOC_INPUTS) -o html $(DOC_DIR) -p $(DOC_CONFIG_DIR) -s Default custom-1

