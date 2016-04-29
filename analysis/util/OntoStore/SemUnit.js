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
function SemUnit( uri, label ){

  // type
  this._setVal( 'type', 'SemUnit' );
  
  // call super-constructor
  SemObject.call( this, uri, label );

}

// set prototype
SemUnit.prototype = new SemObject();


/**
 * get/set the prefixed state of this object
 * @param   {Boolean*} val   the state to be set
 * @return  {Boolean}
 */
SemUnit.prototype.isPrefixed = function isPrefixed( val ) {
  
  // set new value, if given and not present before
  if( val && !('_isPrefixed' in this) ) {
    this._setVal( '_isPrefixed', val );
  }
  
  return !!this._isPrefixed;
} 


/**
 * make a copy of this SemUnit object
 * @return SemUnit
 */
SemUnit.prototype.clone = function clone() {
  
  // create a copy
  var res = new SemUnit( this.getURI(), this.getDisplayLabel() );
  
  // append all base values
  res._copy.call( this, res );
  
  return res;

}


/**
 * get/set the prefixed state and heuristic flag of this object 
 * @param   {Boolean*} val   the state to be set
 * @return  {Boolean}
 */
SemUnit.prototype.isHeuristicPrefix = function isHeuristicPrefix( val ) {
  
  // set new value, if given and not present before
  if( val && !this._isPrefixed ) {
    this._setVal( '_isPrefixed', val );
    this._setVal( '_isHeuristicPrefix', val );
  }
  
  return this._isHeuristicPrefix;
} 

module.exports = SemUnit;