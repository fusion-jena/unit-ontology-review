"use strict";
/**
 * perform the mapping operation for the given set of values
 * results in a list of extracted SynSets
 * 
 * param:
 * - values       ... list of SemObject types to be mapped
 * ? manual       ... (complete) file name of the additional manual mappings
 */

//includes
var Fs  = require( 'fs' ),
    OntoStore= require( './OntoStore' ),
    SynSet = require( './OntoStore/SynSet' ),
    Log = require( './Log' );


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Prep: Read sameAs XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

var sameAs = [],
    ontos = OntoStore.getOntologies();
for( var onto of ontos ) {
  
  // get sameAs list
  var list = OntoStore.getData( onto, 'sameAs' )
                      .map( (entry)  => [ entry.object, entry.sameAs ] );
  
  // add all entries
  Array.prototype.push.apply( sameAs, list );
  
}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Mapping XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

/**
 * maps the given set of SemObjects into SynSets
 * 
 * @param   {Object}          param
 * @returns {Array[SynSet]} 
 */
function mapObjects( param, log ) {

  // prepare result
  var result = [];
  
  // maintain a lookup
  var lookup = {};
  
  // process all items
  for( var entry of param.values ) {
    
    // try to find matches
    var matches = [];
    for( var possMatch of result  ) {
      
      // check for equality
      if( belongsToSet( entry, possMatch ) ) {
        
        // add as a match
        matches.push( possMatch );
        
      }
      
    }
    
    // check matches
    if( matches.length < 1 ) {

      // no match found ...

      // .. so this is a new SynSet
      var newSet = new SynSet( entry );

      // add to lookup
      lookup[ entry.getURI() ] = newSet;

      // add to list of SynSets
      result.push( newSet );

    } else if (matches.length == 1) {
      
      // single match, so add
      matches[0].addSynonym( entry );
      
      // add to lookup
      lookup[ entry.getURI() ] = matches[0];
      
    } else {
      
      // multiple matches, so combine them
      
      // the first set will be the dominant one
      var domSet = matches.shift();
      
      // combine all synsets in the dominant one
      matches.forEach( (synset) => {
                  
        // transfer synonyms
        synset.getSynonyms()
              .forEach( (syn) => {
                domSet.addSynonym( syn );
                lookup[ syn.getURI() ] = domSet;
              });
        
        // remove from dimension mapping list
        result.splice( result.indexOf( synset ), 1 );
        
      });
      
      // add to dominant set
      domSet.addSynonym( entry );
      
      // add to lookup
      lookup[ entry.getURI() ] = domSet;
      
    } // fi matches.length
    
  }
  
  
  // use the manual mappings, if present
  if( 'manual' in param ) {
    
    // load the manual mappings
    var manualMappings;
    if( param.manual instanceof Array) {
      manualMappings = [];
      param.manual
           .forEach( (file) => {
             var content = OntoStore.loadPredefinedData( file );
             Array.prototype.push.apply( manualMappings, content );
           })
    } else {
      manualMappings = OntoStore.loadPredefinedData( param.manual );
    }

    // apply all rules
    for( var mapping of manualMappings ) {

      // get both syn sets
      var syn1 = lookup[ mapping[0] ],
          syn2 = lookup[ mapping[1] ];
      
      // just make sure, there is no invalid object referenced here
      if( !syn1 || !syn2 ) {
        if( log ) {

          if( !syn1 ) {
            log( '   unknown URL in sameAs: ' + mapping[0], Log.ERROR );
          } else {
            log( '   unknown URL in sameAs: ' + mapping[1], Log.ERROR );
          }
        }
        continue;
      }
      
      if( syn1 !== syn2 ) {
        
        // add all entries from second to first
        syn2.getSynonyms()
            .forEach( (syn) => {
              syn1.addSynonym( syn );
              lookup[ syn.getURI() ] = syn1;
            });
            
        // remove syn2 from list
        result.splice( result.indexOf( syn2 ), 1 );
        
      }

    }
    
  }
  
  // use the sameAs mappings
  for( var mapping of sameAs ) {
    
    // get both syn sets
    var syn1 = lookup[ mapping[0] ],
        syn2 = lookup[ mapping[1] ];
    
    // make sure we just use URIs of the involved ontologies
    if( !syn1 || !syn2 ) {
      continue;
    }
    
    if( syn1 !== syn2 ) {
      
      // add all entries from second to first
      syn2.getSynonyms()
          .forEach( (syn) => {
            syn1.addSynonym( syn );
            lookup[ syn.getURI() ] = syn1;
          });
          
      // remove syn2 from list
      result.splice( result.indexOf( syn2 ), 1 );
      
    }

  }
  
  // return the result
  return result;
  
}



/**
 * check, whether the given SemObject should belong in the given SynSet
 * 
 * currently checks for a match between the respective label sets
 * 
 * @param   {SemObject}   value
 * @param   {SynSet}      synset
 * @returns {Boolean}
 */
function belongsToSet( value, synset ) {
  
  // check all labels
  var labels = value.getLabels();
  for( var label of labels ) {

    // compare labels directly
    if( synset.hasLabel( label ) ) {
      return true;
    }
    
    // compare labels with spaces removed
    if( synset.hasLabel( label.replace( /\s/g, '' ) ) ) {
      return true;
    } 
  }
  
  // no hit, so the value does not belong to the synset
  return false;
}



// export
module.exports = mapObjects;