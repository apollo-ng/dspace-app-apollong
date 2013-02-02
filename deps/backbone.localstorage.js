// This file copied from litewrite: https://github.com/litewrite/litewrite

define(['underscore', 'backbone'], function(_, Backbone) {

  // A simple module to replace `Backbone.sync` with *localStorage*-based
  // persistence. Models are given GUIDS, and saved into a JSON object. Simple
  // as that.

  // Generate four random hex digits.
  function S4() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  }

  // Generate a pseudo-GUID by concatenating random hexadecimal.
  function guid() {
     return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  }

  // Our Store is represented by a single JS object in *localStorage*. Create it
  // with a meaningful name, like the name you'd give a table.
  var Store = function(name) {
    console.log('new store', name);
    this.name = name;
    var store = localStorage.getItem(this.name);
    this.data = (store && JSON.parse(store)) || {};
  };

  _.extend(Store.prototype, {

    // Save the current state of the **Store** to *localStorage*.
    save: function() {
      console.log('save', this.name);
      localStorage.setItem(this.name, JSON.stringify(this.data));
    },

    // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
    // have an id of it's own.
    create: function(model) {
      if (!model.id) model.set(model.idAttribute, guid());
      this.data[model.id] = model;
      this.save();
      return model;
    },

    // Update a model by replacing its copy in `this.data`.
    update: function(model) {
      this.data[model.id] = model;
      this.save();
      return model;
    },

    // Retrieve a model from `this.data` by id.
    find: function(model) {
      return this.data[model.id];
    },

    // Return the array of all models currently in storage.
    findAll: function() {
      return _.values(this.data);
    },

    // Delete a model from `this.data`, returning it.
    destroy: function(model) {
      delete this.data[model.id];
      this.save();
      return model;
    }

  });

  var stores = {};

  Store.setup = function(model, prefix) {
    var store = Store.get(prefix);
    model.sync = function(method, _model, promise) {
      var attrs = _model ? _model.toJSON() : {};
      switch (method) {
      case "read":
        resp = attrs.id !== undefined ? store.find(attrs) : store.findAll();
        break;
      case "create":
        resp = store.create(attrs);
        break;
      case "update":
        resp = store.update(attrs);
        break;
      case "delete":
        resp = store.destroy(attrs);
        break;
      }

      if (resp) {
        promise.success(_model, resp, promise);
      } else {
        promise.error("Record not found");
      }
    };
  };

  Store.get = function(prefix) {
    return stores[prefix] || new Store(prefix);
  };

  return Store;
});
