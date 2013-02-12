# DSpace-Client

* master: [![Build Status](https://travis-ci.org/apollo-ng/dspace-client.png?branch=master)](https://travis-ci.org/apollo-ng/dspace-client)
* develop: [![Build Status](https://travis-ci.org/apollo-ng/dspace-client.png?branch=develop)](https://travis-ci.org/apollo-ng/dspace-client)

DSpace aims to enable people to find, collect, edit, structure and share any kind of information
in a real-time, massive-collaboration, augmented-reality-environment (like wikipedia),
based on a very common ground: The map of the area, where people actually are, around their Geolocation.

### [Demo](http://dspace-develop.open-resource.org/)
automatically built from 'develop' branch. May be experimental and unstable.

### Screenshot

![Image](https://apollo.open-resource.org/_media/lab:screenshot-dspace-develop.jpg)

## Contact

* Website: [https://apollo.open-resource.org/lab:dspace](https://apollo.open-resource.org/lab:dspace)
* Github: [https://github.com/apollo-ng/dspace-client](https://github.com/apollo-ng/dspace-client)
* IRC: [#apollo@freenode](http://webchat.freenode.net?channels=apollo)
* Mumble: [voip.open-resource.org](mumble://voip.open-resource.org)
* Mailinglist: [dspace-develop@apollo.open-resource.org](mailto://dspace-develop@apollo.open-resource.org) ([subscribe](mailto://dspace-develop-subscribe@apollo.open-resource.org))
* Blog: [https://apollo.open-resource.org/tag:dspace](https://apollo.open-resource.org/tag:dspace)

## Dev

We work on **develop** branch and keep **master** stable for going live!

### [Online Docs](http://dspace-develop.open-resource.org/doc/)

### Env

* Requires [node.js](http://nodejs.org/) 0.8.x & [npm](https://npmjs.org/) 1.x

#### Ubuntu

    $ sudo add-apt-repository ppa:chris-lea/node.js
    $ sudo apt-get install nodejs-dev npm

#### Gentoo

    $ emerge -av nodejs

#### Other

When your distro fails to supply you with a working nodejs & npm
environment, you can try [nvm](https://github.com/creationix/nvm)

### Development Flow

#### Clone

    $ git clone git@github.com:apollo-ng/dspace-client.git

#### Generate docs (optional)

You need [naturaldocs](http://naturaldocs.org/) to build the docs:

    $ make doc

#### Install Development- and Runtime Depenencies

    $ npm install

#### Complete rebuild (optional)
e.g. when modifying dependencies
(see Makefile)

    $ make init
    $ make deps
    $ make build
    

####[gitflow](https://github.com/nvie/gitflow) (optional)

    $ git flow init

####Start the local development server

    $ ./run.js

Point your browser to [http://localhost:3000/](http://localhost:3000/)

If port 3000 is already in use you can use any other port like this:

    $ ./run.js 8080

Or use any other local webserver, for example:

* adsf (ruby)
* simple-http (python)
* nginx

####Run tests

You'll need [phantomjs](http://phantomjs.org/) 1.8.x to run the tests, either compile from source or use your distros package

    $ npm test

### Technologies

#### runtime
* modestmaps
  * markers
  * easey + easey.handlers
* ender
* backbone
* handlebars
* ...

#### development (build/test)
* amd
* mocha
* phantomjs
* naturaldocs
* csso
* ...
