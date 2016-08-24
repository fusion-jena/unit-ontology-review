"use strict";
/**
 * base wrapper object for semantic objects
 * 
 * is uniquely defined by its URI 
 */

/**
 * @constructor
 */
function SemObject( uri, displayLabel ) {
  
  // type
  if( !('type' in this) ) {
    this._setVal( 'type',     'SemObject' );
  }
  
  // URI
  this._setVal( 'uri',      uri );
  
  // list of labels
  this._setVal( 'labels',   {} );
  
  // list of synonyms
  this._setVal( 'synonyms', new Set() )
  
  // display label
  this._setVal( 'dispLabel', displayLabel, false, true );

}


/**
 * set a particular key/value pair for this object
 * - not modifiable
 */
SemObject.prototype._setVal = function( name, val, enumerable, writable ) {
  Object.defineProperty( this, name, {
    'value': val,
    'enumerable': !!enumerable,
    'writable': !!writable
  });
};


/**
 * get a label of this object for display
 */
SemObject.prototype.getDisplayLabel = function getDisplayLabel() {
  
  if( this.dispLabel ) {
    
    // return the set display label
    return this.dispLabel;
    
  } else {
    
    // grab the first label from the list of all labels, that is English, unspecified 
    // or generated from URI (in that order)
    var labelSet = this.labels[ 'en' ] || this.labels[ ''] || this.labels[ '_uri' ];
    if( labelSet.size > 0 ) {
      var label = labelSet.entries().next().value[0];
      return label;
    }
    
  }
}

/**
 * set the label of this object for display, if it has not been set
 */
SemObject.prototype.setDisplayLabel = function setDisplayLabel( label ) {
  
  // we just add a display label, if the object has not been frozen yet
  if( !Object.isFrozen( this ) ) {
    this.dispLabel = label;
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
 * @param   {String*}         lang    just get labels of this language
 * @returns {Array[String]}
 */
SemObject.prototype.getLabels = function getLabels( lang ){
  
  var labels;
  
  if( typeof lang == 'undefined' ) {
    
    // if no language is set, return all from English, unknown and URI-generated
    var labelList = [];
    if( 'en'    in this.labels ) { labelList = labelList.concat( ... this.labels['en'] );   }
    if( ''      in this.labels ) { labelList = labelList.concat( ... this.labels[''] );     }
    if( '_uri'  in this.labels ) { labelList = labelList.concat( ... this.labels['_uri'] ); }
    labels = new Set( labelList );
  
  } else {
    
    // select the respective set or an empty set otherwise
    labels = this.labels[ lang ] || new Set();
    
  }
  
  return [ ... labels ];
  
}


/**
 * get the detailed label object
 * 
 * @returns {Object}
 */
SemObject.prototype.getLabelDetails = function getLabelDetails( lang ){
  
  return this.labels;
  
}


/**
 * set the detailed label object; used in deserializing
 * 
 * @returns {Object}
 */
SemObject.prototype.setLabelDetails = function setLabelDetails( labels ){
  
  Object.keys( labels ) 
        .forEach( (lang) => {
          this.labels[ lang ] = labels[ lang ];
        });
  
}


/**
 * add a label to the list of associated labels
 * 
 * @param   {String}    label
 * @returns {SemObject}
 */
SemObject.prototype.addLabel = function addLabel( label ) {

  // take care of arrays here
  if( label instanceof Array ) {
    for( var i=0; i<label.length; i++ ) {
      this.addLabel( label[i] );
    }
    return;
  }

  // don't add empty labels
  if( !label || !label.label ) {
    return this;
  }

  // get the entry for the respective language
  if( !(label.lang in this.labels) ) {
    this.labels[ label.lang ] = new Set();
  }
  var labelSet = this.labels[ label.lang ];
  
  // add label itself
  labelSet.add( '' + label.label );
  
  // add label version without spaces
  label.label = label.label.replace( /\s/g, '' ),
  labelSet.add( '' + label.label );
  
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
  
  // clone labels
  Object.keys( this.labels )
        .forEach( (lang) => {
          
          this.labels[ lang ]
              .forEach( (label) => {
                clone.addLabel({
                  lang: lang,
                  label: label
                });
              });
          
        });
  
  // copy other values
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