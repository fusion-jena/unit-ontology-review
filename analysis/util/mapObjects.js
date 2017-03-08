"use strict";
/**
 * perform the mapping operation for the given set of values
 * results in a list of extracted SynSets
 * 
 * param:
 * - values       ... list of SemObject types to be mapped
 * ? manual       ... (complete) file name of the additional manual mappings
 */

// includes
var Fs            = require( 'fs' ),
    Cfg           = require( '../config/config' ),
    OntoStore     = require( './OntoStore' ),
    SynSet        = require( './OntoStore/SynSet' ),
    Log           = require( './Log' ),
    belongsToSet  = Cfg.restrictMappingLanguage 
                      ? require( './mapObjects/belongsToSet.en' )
                      : require( './mapObjects/belongsToSet.all' );


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Prep: Read sameAs XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

var sameAs = [],
    ontos = OntoStore.getOntologies();
ontos.forEach( (onto) => {

  // get sameAs list
  var list = OntoStore.getData( onto, 'sameAs' )
                      .map( (entry)  => [ entry.object, entry.sameAs ] );
  
  // add all entries
  Array.prototype.push.apply( sameAs, list );

});


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
  let entry;
  for( let i=0; i<param.values.length; i++ ) {
    
    // shortcut
    entry = param.values[i];

    // log progress
    if( i % 500 == 0 ) {
      log( '   processed ' + (100 * i / param.values.length).toFixed(2) + '%' );
    }
    
    // try to find matches
    let matches = [],
        possMatch;
    for( let i=0; i<result.length; i++ ) {
      
      // shortcut
      possMatch = result[i];
      
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
    let mapping;
    for( let i=0; i<manualMappings.length; i++ ) {
      
      // shortcut
      mapping = manualMappings[i];

      // get both syn sets
      var syn1 = lookup[ mapping[0] ],
          syn2 = lookup[ mapping[1] ];

      // just make sure, there is no invalid object referenced here
      if( !syn1 || !syn2 ) {
        if( log ) {

          if( !syn1 ) {
            log( '   manual mapping - unknown URL in sameAs: ' + mapping[0], Log.ERROR );
          } else {
            log( '   manual mapping - unknown URL in sameAs: ' + mapping[1], Log.ERROR );
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
  let mapping;
  for( let i=0; i<sameAs.length; i++ ) {
    
    // shortcut
    mapping = sameAs[i];
    
    // get both syn sets
    var syn1 = lookup[ mapping[0] ],
        syn2 = lookup[ mapping[1] ];
    
    // make sure we just use URIs of the involved ontologies
    if( !syn1 || !syn2 ) {
      if( log ) {

        // make sure we know at least one URL
        // removes errors caused by sameAs from another type
        if( !syn1 && syn2 ) {
          log( '   sameAs - unknown URL in sameAs (0): ' + JSON.stringify( mapping ), Log.ERROR );
        } else if( syn1 && !syn2 ){
          log( '   sameAs - unknown URL in sameAs (1): ' + JSON.stringify( mapping ), Log.ERROR );
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
  
  // return the result
  return result;
  
}

// export
module.exports = mapObjects;