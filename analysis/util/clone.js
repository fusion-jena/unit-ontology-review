"use strict";
/**
 * (shallow) clone the given object
 * just works on flat objects
 * @param {Object}  obj
 */
function clone( obj ) {
  
  var res = {};
  
  Object.keys( obj )
        .forEach( (key) => {
          res[ key ] = obj[ key ];
        });
  
  return res;
  
}

module.exports = clone;