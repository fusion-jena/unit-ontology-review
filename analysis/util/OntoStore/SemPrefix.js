"use strict";
/**
 * 
 * extend the SemObject type with unit specific methods
 * 
 */

// includes
var SemObject = require( './SemObject' );

/**
 * @constructor
 * @param {String}  uri
 * @param {String}  label   the preferred label for this object
 */
function SemPrefix( uri, label ){

  // type
  this._setVal( 'type', 'SemPrefix' );
  
  // call super-constructor
  SemObject.call( this, uri, label );

}

// set prototype
SemPrefix.prototype = new SemObject();


/**
 * set the prefix factor
 * @param   {Number}  val
 */
SemPrefix.prototype.setFactor = function setFactor( val ) {
  if( !('factor' in this) ) {
    this._setVal( '_factor', parseFloat( val ) );
  }
}


/**
 * get the prefix factor
 * @returns   {Number}
 */
SemPrefix.prototype.getFactor = function getFactor() {
  return ('_factor' in this) ? this._factor : null;
}

module.exports = SemPrefix;