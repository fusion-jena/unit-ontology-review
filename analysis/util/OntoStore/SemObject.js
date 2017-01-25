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
    
    // get language preferences for the respective ontology
    const OntoStore = require( __dirname + '/../OntoStore' ),
          pref      = OntoStore.getLanguagePref( this.getOntology() );

    // return a label in the first language that's present
    for( let i=0; i<pref.length; i++ ) {
      if( pref[i] in this.labels ) {
        let labelSet = this.labels[ pref[i] ];
        if( labelSet.size > 0 ) {
          var label = labelSet.entries().next().value[0];
          return label;
        }        
      }
    }
    
    // if nothing was found until yet: return uri label
    return this.labels[ '_uri' ].entries().next().value[0];
    
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
 * @param   {String*}         lang          just get labels of this language
 * @param   {Boolean*}        useNeutral    also include values without language and extracted from URI
 * @returns {Array[String]}
 */
SemObject.prototype.getLabels = function getLabels( lang, useNeutral ){
  
  var labels;
  
  if( typeof lang == 'undefined' ) {
    
    // if no language is set, return all
    let labelList = Object.keys( this.labels )
                      .reduce( (all, lang) => all.concat( ... this.labels[ lang ] ), [] );
    labels = new Set( labelList );
  
  } else {
    
    // select the respective set or an empty set otherwise
    labels = this.labels[ lang ] || new Set();

    // maybe add labels with unknown languages
    if( useNeutral ) {
      if( ''      in this.labels ) { this.labels[''].forEach( (l) => labels.add( l ) );     }
      if( '_uri'  in this.labels ) { this.labels['_uri'].forEach( (l) => labels.add( l ) ); }
    }
  }

  return [ ... labels ];
  
}


/**
 * get the list of languages used in labels for this object
 * @returns {Array[String]}
 */
SemObject.prototype.getLabelLanguages = function getLabelLanguages(){
  return Object.keys( this.labels );
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
    
    // object should not be frozen at this stage, but make sure
    if( Object.isFrozen( this.labels ) ) {
      throw new Error( 'Object already frozen for ' + this.getURI() + ' - present in multiple types?' );
    } else {
      this.labels[ label.lang ] = new Set();
    }
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