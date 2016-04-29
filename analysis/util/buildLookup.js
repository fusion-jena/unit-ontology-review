"use strict";
/**
 * build a lookup by URI out of the given list of objects
 * 
 * @param   {Array}   arr
 * @returns {Object}
 */
function buildLookup( arr, key ) {
  
  // empty input => empty output
  if( arr.length < 1 ) {
    return {};
  }
  
  // are we dealing with SynSets or SemObjects ?
  if( arr[0].type == 'SynSet' ) {
    return buildLookupSynSet( arr );
  } else if( [ 'SemDimension', 'SemUnit' ].indexOf( arr[0].type ) > -1 ) {
    return buildLookupSemObject( arr );
  } else {
    return buildLookupObject( arr, key );
  }
  
}

/**
 * build a lookup by URI out of the given list of SemObjects
 * 
 * @param   {Array}   arr
 * @returns {Object}
 */
function buildLookupSemObject( arr ) {
  
  // object to hold the lookup
  var lookup = {};
  
  // process all entries
  for( var entry of arr ) {
    lookup[ entry.getURI() ] = entry;
  }
  
  return lookup;
}


/**
 * build a lookup by URI out of the given list of SynSets
 * 
 * @param   {Array}   arr
 * @returns {Object}
 */
function buildLookupSynSet( arr ) {
  
  // object to hold the lookup
  var lookup = {};
  
  // process all entries
  for( var synset of arr ) {
    for( var entry of synset.getSynonyms() ) {
      lookup[ entry.getURI() ] = synset;
    }
  }
  
  return lookup;
}


/**
 * build a lookup by URI out of the given list of flat objects
 * uses the property given by "key"
 * 
 * @param   {Array}   arr
 * @param   {String}  key
 * @returns {Object}
 */
function buildLookupObject( arr, key ) {
  
  // object to hold the lookup
  var lookup = {};
  
  // process all entries
  for( var entry of arr ) {
    lookup[ entry[ key ] ] = entry;
  }
  
  return lookup;
  
}


module.exports = buildLookup;