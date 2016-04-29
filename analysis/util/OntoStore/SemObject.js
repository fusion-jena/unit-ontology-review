"use strict";
/**
 * base wrapper object for semantic objects
 * 
 * is uniquely defined by its URI 
 */

/**
 * @constructor
 */
function SemObject( uri, label ) {
  
  // type
  if( !('type' in this) ) {
    this._setVal( 'type',     'SemObject' );
  }
  
  // URI
  this._setVal( 'uri',      uri );
  
  // list of labels
  this._setVal( 'labels',   new Set() );
  
  // list of synonyms
  this._setVal( 'synonyms', new Set() )
  
  // set displayed label
  if( label ) {
    this._setVal( 'dispLabel', label );
  }

}


/**
 * set a particular key/value pair for this object
 * - not modifiable
 */
SemObject.prototype._setVal = function( name, val, enumerable ) {
  Object.defineProperty( this, name, {
    'value': val,
    'enumerable': !!enumerable
  });
};


/**
 * get a label of this object for display
 */
SemObject.prototype.getDisplayLabel = function getDisplayLabel() {
  if( this.dispLabel ) {
    return this.dispLabel;
  } else {
    return this.labels.values().next().value;
  }
}

/**
 * get the URI for this wrapper
 * 
 * @returns {String}
 */
SemObject.prototype.getURI = function getURI(){
  return this.uri;
}


/**
 * get the list of associated labels
 * 
 * @returns {Array[String]}
 */
SemObject.prototype.getLabels = function getLabels(){
  return [ ... this.labels];
}


/**
 * add a label to the list of associated labels
 * 
 * @param   {String}    label
 * @returns {SemObject}
 */
SemObject.prototype.addLabel = function addLabel( label ) {

  // don't add empty labels
  if( !label ) {
    return this;
  }
  
  // take care of arrays here
  if( label instanceof Array ) {
    for( var i=0; i<label.length; i++ ) {
      this.addLabel( label[i] );
    }
    return;
  }

  // add label itself
  this.labels.add( '' + label );
  
  // add label version without spaces
  this.labels.add( label.replace( /\s/g, '' ) );
  
  return this;
}


/**
 * set the source ontology for this entity
 * can not be changed afterwards
 * @param   {String}      onto
 * @returns {SemObject}
 */
SemObject.prototype.setOntology = function setOntology( onto ) {
  this._setVal( 'onto', onto );
  return this;
}


/**
 * get the source ontology of this entity
 * returns null, if none has been set
 * @returns {String}
 */
SemObject.prototype.getOntology = function getOntology() {
  return this.onto || null;
}


/**
 * attach the raw (source) to this object
 * @param {Object}    raw
 */
SemObject.prototype.setRaw = function setRaw( raw ) {
  if( !('raw' in this) ) {
    this._setVal( 'raw', raw );
  }
}

/**
 * return the raw (source) of this object
 * returns {Object}
 */
SemObject.prototype.getRaw = function getRaw( raw ) {
  return this.raw || null;
}


/**
 * append all base data to the cloned object
 * @returns {SemObject}
 */
SemObject.prototype._copy = function _copy( clone ) {
  
  clone.addLabel( this.getLabels() );
  clone.setOntology( this.getOntology() );
  var raw = this.getRaw();
  if( raw ){
    clone.setRaw( raw );
  }
  
}

SemObject.prototype.toString  = function toString() {
  return '[' + this.type + ' ' + this.getURI() + ']';
}
SemObject.prototype.inspect   = SemObject.prototype.toString;

module.exports = SemObject;