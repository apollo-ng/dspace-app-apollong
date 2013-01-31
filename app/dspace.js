define([
  'ender', 'underscore', 'backbone',
  'reqwest', 'easey_handlers', 'markers',
  'modestmaps',
  'models/world',

  'templateMap'
], function( $, _, Backbone, Reqwest, easey_handlers, markers, MM, World, templates) {
/**
 * TODO document
 */

var DSpace = function(){


  /**
   * expects a config object
   * FIXME set defautls to override and don't crash if no options ;) -- default in User model ?
   */
  this.init = function ( config ){

    console.log("DSpace init");

    DSpace.World = World;

    /**
     * init() returns an instance of a World
     */
    return new World( config );

  };

  /**
   * returns itself
   */
  return this;

};

  return DSpace;

});
