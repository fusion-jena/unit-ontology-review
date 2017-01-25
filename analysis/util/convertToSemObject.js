"use strict";
/**
 * convert all objects of the given array to the respective SemObject variants
 * 
 * param:
 * - values       ... array of the values to be converted
 * - onto         ... the ontology these terms comes from
 * - type         ... the type of the terms (respective constants from OntoStore)
 * - uriProp      ... name of the property to hold the objects URI
 * - labelProp    ... name of the property to hold the objects label
 * ? stopwords      ... a list of strings/regexp to be removed from the labels
 * ? replacements   ... an array of pairs, where occurences of the first string/regexp are replaced by the second
 * ? entryCreated   ... callback after a single entry has been created
 *    - data    ... the raw data entry
 *    - entry   ... the parsed object
 * ? beforeAddLabel ... callback before a label is added to the object
 *    - data    ... the raw entry
 *    - label   ... the label to be added
 *    returns:  modified label to be added
 */

// includes
var OntoStore = require( './OntoStore' ),
    XRegExp = require( 'xregexp' );

// regexp to eliminate non alphanumeric characters from labels
// as this is not easily extendable to all Unicode symbols, 
// we just restrict the ASCII part and leave the rest be
var regexp_Alphanum =  XRegExp( '[^\\pL0-9-\u00FF-\uFFFF]', 'gu' );

/**
 * convert given list of objects to SemObject instances
 * 
 * @param     {Object}    param   ... parameter list
 * @returns   {Array}
 */
function convertToSemObject( param ){
  
  // empty input => empty output
  if( !param.values ) {
    return [];
  }
  
  // add default settings
  param.stopwords     = param.stopwords || [];
  param.replacements  = param.replacements || [];
    
  // prepare result list
  var result = new Set();
  
  // process all entries
  for( var entry of param.values ) {

    // get wrapper
    var wrapper = OntoStore.getEntity( entry[ param.uriProp ],
                                       param.type,
                                       param.onto );
  
    // add labels from label property
    var label = entry[ param.labelProp ],
        lang  = entry[ param.langProp ],
        labels = [];
    if( label ) {

      // harmonize
      label = prepareLabel( param, label );
      
      // collect
      if( label instanceof Array ) {
        Array.prototype.push.apply( labels, label.map( (l) => { return { label: l, lang: lang }; } ) );
      } else {
        labels.push( { label: label, lang: lang } );
      }

    }
    
    // label from URI
    label = getLabelFromUri( param, entry[ param.uriProp ] );
    if( label ) {

      // harmonize
      label = prepareLabel( param, label );

      // collect
      if( label instanceof Array ) {
        Array.prototype.push.apply( labels, label.map( (l) => { return { label: l, lang: '_uri' }; } ) );
      } else {
        labels.push( { label: label, lang: '_uri' } );
      }

    }
  
    // apply event
    if( ('beforeAddLabel' in param) && (param.beforeAddLabel instanceof Function)) {
      labels = labels.map( (label) => {
                        return {
                          label: param.beforeAddLabel( entry, label.label ),
                          lang:  label.lang
                        };
                      });
    }

    // add labels
    wrapper.addLabel( labels );

    // set display label, if we have an English or unknown one
    if( [ 'en', '' ].indexOf( entry[ param.langProp ] ) > -1 ) {

      var label = entry[ param.labelProp ];
      if( ('beforeAddLabel' in param) && (param.beforeAddLabel instanceof Function)) {
        label = param.beforeAddLabel( entry, label );
      }
      wrapper.setDisplayLabel( label );

    }
    
    // add raw
    if( param.addRaw ) {
      wrapper.setRaw( entry );
    }
    
    // fire entryCreated, if present
    if( ('entryCreated' in param) && (param.entryCreated instanceof Function)) {
      param.entryCreated( entry, wrapper );
    }
    
    // add to result list
    result.add( wrapper );
    
  }
  
  // transform back to array and return
  return [ ... result ];
  
}

/**
 * extract the name part of a given URI
 * @param   {Object}    param
 * @param   {String}    uri
 * @returns {String}
 */
function getLabelFromUri( param, uri ) {
  
  // get last occurrence of # and /
  var indSharp = uri.lastIndexOf( '#' ),
      indSlash = uri.lastIndexOf( '/' );
  
  // neither nor => no return value
  if( (indSharp < 0) && (indSlash < 0) ){
    return;
  }
  
  // get the maximum
  var maxInd = Math.max( indSharp, indSlash );
  
  // extract name
  var name = uri.substr( maxInd + 1 );

  // replace camelCase with space
  name = name.replace( /([a-z])([A-Z])/g, '$1 $2' );
  
  // return result
  return name;
}


/**
 * prepares a label
 * - split at comma or "or"
 * - camel case to space
 * - special characters to space
 * - remove stopwords etc
 * - apply replacements
 * 
 * if the label is just a stopword, it passes (ex: http://purl.oclc.org/NET/muo/ucum/unit/catalytic-activity/Unit)
 * if the label is an array, remove all array entries, that are stopwords (ex: BE @ http://www.wikidata.org/entity/Q11579)
 * 
 * @param     {Object}          param   parameter object
 * @param     {String}          label   label to process
 * @returns   {Array[String]|String}
 */
function prepareLabel( param, label ) {

  // check for comma or "or" separated values
  var sepRegexp = /,|(?:^|\\s|$)or(?:^|\\s|$)/gui;
  if( sepRegexp.test( label ) ) {
                // split entries
    return label.split( sepRegexp )
                // use only no empty, valid entries
                .filter( (entry) => {
                  return (!sepRegexp.test( entry )) && (entry.trim() != '') ; 
                })
                // run through preparation again
                .map( (el) => prepareLabel( param, el ) )
                // remove all those, that are only stopwords
                .filter( (label) => {
                  return !param.stopwords
                               .some( (stopword) =>{     
                                 return label.replace( stopword, '' ).trim() == '';
                               });
                });
  }
  
  // replace camelCase with space
  label = label.replace( /([a-z])([A-Z])/g, '$1 $2' );
  
  // to lower case
  label = label.toLowerCase();

  // replace some characters
  label = label.replace( regexp_Alphanum, ' ' );

  // apply replacements
  for( var repl of param.replacements ) {
    label = label.replace( repl[0], repl[1] );
  }
  
  // remove stop words (if they are not the only word)
  for( var stopword of param.stopwords ) {
    var newLabel = label.replace( stopword, '' ).trim();
    if( newLabel != '' ) {
      label = newLabel;
    }
  }
  
  // replace multiple whitespaces with a single one
  label = label.replace(/\s\s+/g, ' ');
  
  // remove leading/trailing whitespace
  label = label.trim();
  
  return label;
}

module.exports = convertToSemObject;