"use strict";
/**
 * define a set of synonyms and provide access to some properties
 */

/**
 * @constructor
 */
function SynSet( el ){
  
  // set type
  this._setVal( 'type',   'SynSet' );

  // init lists
  this._setVal( 'syns',   new Set() );
  this._setVal( 'labels', new Set() );

  // if constructed with initial element, use it
  if( el ) {
    this.addSynonym( el );
  }  
  
}


/**
 * set a particular key/value pair for this object
 * - not modifiable
 */
SynSet.prototype._setVal = function( name, val, enumerable ) {
  Object.defineProperty( this, name, {
    'value': val,
    'enumerable': !!enumerable
  });
};


/**
 * add a new element to this syn set
 * @param {SemObject}
 */
SynSet.prototype.addSynonym = function addSynonym( syn ){
  
  this.syns.add( syn );
  syn.getLabels()
      .forEach( (label) => {
        this.addLabel( label );
      });

}

/**
 * get all associated synonyms
 * @returns {Array[SemObject]}
 */
SynSet.prototype.getSynonyms = function getSynonyms() {
  return [ ... this.syns ];
}

/**
 * add an additional label for this synset
 * @param     {String} label
 * @returns
 */
SynSet.prototype.addLabel = function addLabel( label ) {

  // take care of arrays here
  if( label instanceof Array ) {
    for( var i=0; i<label.length; i++ ) {
      this.addLabel( label[i] );
    }
  }
  
  // per defintion all labels of a synset are lower case
  label = label.toLowerCase();
  
  this.labels.add( label );
  
}

/**
 * checks, if the given label is part of this synset's label list
 * @param   {String}  label
 * @returns {Boolean}
 */
SynSet.prototype.hasLabel = function hasLabel( label ) {
  
  // per defintion all labels of a synset are lower case
  label = label.toLowerCase();
  
  return this.labels.has( label );
  
}

/**
 * get a complete list of labels for this synset
 * @returns {Array[String]}
 */
SynSet.prototype.getLabels = function getLabels() {
  return [ ... this.labels ];
}

/**
 * get a representative label for this synset
 * @returns {String}
 */
SynSet.prototype.getDisplayLabel = function getDisplayLabel(){
  return this.getSynonyms()[0].getDisplayLabel();
}


/* XXXXXXXXXXXXXXXXXXXXXXXX unit specific functions XXXXXXXXXXXXXXXXXXXXXXXX */

/**
 * we declare a synset to hold a prefixed unit, 
 * if at least one of the included synonyms has been declared a prefixed unit
 * @returns {Boolean} 
 */
SynSet.prototype.isPrefixed = function isPrefixed(){
  for( var syn of this.syns ) {
    if( syn.isPrefixed() ) {
      return true;
    }
  }
  return false;
}

module.exports = SynSet;