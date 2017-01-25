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
  this._setVal( 'labels', {} );

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
  
  // add synonym
  this.syns.add( syn );
  
  // add labels per language
  const languages = syn.getLabelLanguages();
  languages.forEach( (lang) => {

    syn.getLabels( lang )
      .forEach( (label) => {
        this.addLabel( label, lang );
      });
    
  });

};

/**
 * get all associated synonyms
 * @returns {Array[SemObject]}
 */
SynSet.prototype.getSynonyms = function getSynonyms() {
  return [ ... this.syns ];
};

/**
 * add an additional label for this synset
 * @param     {String} label
 * @param     {String} lang
 * @returns
 */
SynSet.prototype.addLabel = function addLabel( label, lang ) {

  // take care of arrays here
  if( label instanceof Array ) {
    for( var i=0; i<label.length; i++ ) {
      this.addLabel( label[i], lang );
    }
  }
  
  // per defintion all labels of a synset are lower case
  label = label.toLowerCase();
  
  // make sure we have a matching field
  this.labels[ lang ] = this.labels[ lang ] || new Set();
  
  // add label
  this.labels[ lang ].add( label );
  
};

/**
 * checks, if the given label is part of this synset's label list
 * @param   {String}  label
 * @param   {String}  lang
 * @param   {Boolean} useNeutral
 * @returns {Boolean}
 */
SynSet.prototype.hasLabel = function hasLabel( label, lang, useNeutral ) {
  
  // per defintion all labels of a synset are lower case
  label = label.toLowerCase();
  
  // get list of languages to search in
  let languages = [];
  if( lang ) {
    
    // add language
    languages.push( lang );
    
    // neutrals included?
    if( useNeutral ) {
      languages.push( '', '_uri' );
    }

  } else {
    
    // no specific language given, so add all
    return Object.keys( this.labels )
                 
  }
  
  // search
  return languages.some( (lang) => {
                    return (lang in this.labels) && (this.labels[ lang ].has( label ));
                  });
};

/**
 * get a complete list of labels for this synset
 * @param   {String}    lang
 * @param   {Boolean}   useNeutral    include labels without language and retrieved from URI
 * @returns {Array[String]}
 */
SynSet.prototype.getLabels = function getLabels( lang, useNeutral ) {
  
  // get neutral labels
  let neutral = [];
  if( useNeutral ) {
    if( '_uri' in this.labels ) { neutral.push( ... this.labels[ '_uri' ] ); }
    if( '' in this.labels )     { neutral.push( ... this.labels[ '' ] ); }
  }

  if( lang ) {

    // just a single language
    return (lang in this.labels) 
              ? [ ... this.labels[ lang ], ... neutral ]
              : neutral;
    
  } else {
    // all languages
    let all = Object.keys( this.labels )
                    .reduce( (all, lang) => {
                      all.push( ... this.labels[ lang ] );
                      return all;
                    }, neutral );
    return [ ... new Set( all ) ];

  }
  
};

/**
 * get a representative label for this synset
 * @returns {String}
 */
SynSet.prototype.getDisplayLabel = function getDisplayLabel(){
  return this.getSynonyms()[0].getDisplayLabel();
}


/**
 * get a list of languages of labels for this synset
 * @returns {Array[String]}
 */
SynSet.prototype.getLabelLanguages = function getLabelLanguages() {
  return Object.keys( this.labels );
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