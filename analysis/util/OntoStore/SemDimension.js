"use strict";
/**
 * 
 * extend the SemObject type with dimension specific methods
 * 
 */

// includes
var SemObject = require( './SemObject' );

/**
 * @constructor
 * @param {String}  uri
 * @param {String}  label   the preferred label for this object
 */
function SemDimension( uri, label ){

  // type
  this._setVal( 'type', 'SemDimension' );
  
  // call super-constructor
  SemObject.call( this, uri, label );

  // dimension vector
  this._setVal( 'dimVector',  [] )
  
}

// set prototype
SemDimension.prototype = new SemObject();


/**
 * return the dimension vector
 * 
 * @returns {Array[Number]}
 */
SemDimension.prototype.getVector = function getVector(){
  return this.dimVector.slice( 0 );
}


/**
 * set the dimension vector for this object
 * 
 * @param   {Array[Number]}   dimVec
 * @returns {SemDimension}
 */
SemDimension.prototype.setVector = function setVector( dimVector ) {
  this.dimVector.length = 0;
  for( var i=0; i<dimVector.length; i++ ) {
    this.dimVector.push( dimVector[i] );
  }
  return this;
}


/**
 * 
 * overwrite super function
 * 
 * after addSynonym we can maybe add more dimension vectors
 */
SemDimension.prototype.addSynonym = function addSynonym( syn ) {
  
  // call super function
  SemObject.prototype.addSynonym.call( this, syn );
  
  // this object had no dimVector, but other have, copy theirs
  if( (this.dimVector.length < 1) && (syn.dimVector.length > 0) ) {
    this.setVector( syn.getVector() );
  }
  
  // vica versa
  if( (this.dimVector.length > 0) && (syn.dimVector.length < 1) ) {
    var syns = this.getSynonyms();
    for( var i=0; i<syns.length; i++ ) {
      syns[i].setVector( this.getVector() );
    }
  }  
}

module.exports = SemDimension;