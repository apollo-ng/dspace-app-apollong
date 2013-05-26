# Development & Installation

[Online Docs](http://dspace-develop.open-resource.org/doc/)

## Setting up a local Development & Build Environment

### Basic System dependencies

  * [node.js](http://nodejs.org/) 0.8.x
  * [npm](https://npmjs.org/) 1.x

#### Ubuntu

    $ sudo add-apt-repository ppa:chris-lea/node.js
    $ sudo apt-get install nodejs-dev npm

#### Gentoo

    $ emerge -av =net-libs/nodejs-0.8.23

#### Other systems

When your distro fails to supply you with a working nodejs & npm
environment, you can try [nvm](https://github.com/creationix/nvm)

### Install DSpace-Client

#### Clone

    $ git clone git@github.com:apollo-ng/dspace-client.git
    $ cd dspace-client

#### Generate local docs (optional)

You need [naturaldocs](http://naturaldocs.org/) to build the docs:

    $ make doc

#### Install DSpace-Client Development- and Runtime Depenencies

    $ npm install

#### Initialize setup and build dependencies

    $ make init
    $ make deps

#### Build the client

    $ make build

You'll find a deployable client in the build/ direcory

#### [gitflow](https://github.com/nvie/gitflow) (optional)

    $ git flow init

## Start the local development server

    $ ./run.js

Point your browser to [http://localhost:3000/](http://localhost:3000/)

If port 3000 is already in use you can use any other port like this:

    $ ./run.js 8080

Or use any other local webserver, for example:

* adsf (ruby)
* simple-http (python)
* nginx

## Run tests

You'll need [phantomjs](http://phantomjs.org/) 1.8.x to run the tests, either compile from source or use your distros package

    $ npm test
