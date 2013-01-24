# DSpace-Client

DSpace aims to enable people to find, collect, edit, structure and share any kind of information
in a real-time, massive-collaboration, augmented-reality-environment (like wikipedia),
based on a very common ground: The map of the area, where people actually are, around their Geolocation.

## Dev

we work on **develop** branch and keep **master** stable for going live!

* website: https://apollo.open-resource.org/lab:dspace
* github: https://github.com/geoinfo/dspace-client
* irc: #apollo@freenode
* mumble: ticonderoga.open-resource.org
* mailinglist: dspace-develop@open-resource.org
* blog: https://apollo.open-resource.org/tag:dspace

### Env

* requires node.js 0.8.x & npm 1.x

#### Ubuntu

* $ sudo add-apt-repository ppa:chris-lea/node.js
* $ sudo apt-get install nodejs-dev npm

#### Gentoo

* $ emerge -av nodejs

#### Other

When your distro fails to supply you with a working nodejs & npm
environment, you can try:

https://github.com/creationix/nvm

### Development-Flow

Clone

* $ git clone git://apollo.open-resource.org/dspace-client

Install Development- and Runtime Depenencies

* $ npm install

Start the local development server

* $ node run.js

Point your browser to http://localhost:3333/

**Optional**

[gitflow](https://github.com/nvie/gitflow)

* $ git flow init

### Technologies

* ender
* backbone
* handlebars
* modestmaps
  * markers
  * easey + easey.handlers
