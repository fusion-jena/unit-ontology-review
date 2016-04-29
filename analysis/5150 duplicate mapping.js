"use strict";
/**
 * check the mapped lists for entries, 
 * that include more than one object of the same ontology
 */

// includes
var Q   = require( 'q' ),
    Log = require( './util/log.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
    moduleKey: '5150',
    moduleName: 'checkMappedDuplicates'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  },
  mappings = [ 'mapAppArea', 'mapDimension', 'mapPrefix', 'mapQuantKind', 'mapSystem', 'mapUnit' ];

  
function checkMappedDuplicates() {

  // log
  log( 'checking for mapped duplicates' );

  // build a lookup for all sameAs relations we got
  log( '  building sameAs lookup' );
  var lookup = {},
      ontos = OntoStore.getOntologies();
  for( var onto of ontos ) {
    
    // get sameAs relation
    var sameAs = OntoStore.getData( onto, 'sameAs' );
    
    for( var entry of sameAs ) {
      lookup[ entry.object ] = lookup[ entry.object ] || new Set();
      lookup[ entry.object ].add( entry.sameAs );
      lookup[ entry.sameAs ] = lookup[ entry.sameAs ] || new Set();
      lookup[ entry.sameAs ].add( entry.object );
    }

  }
  
  // check each mapping
  for( var map of mappings ) {
    
    // log
    log( '   checking ' + map );
    
    // get mapping
    var mapping = OntoStore.getResult( map );
    
    // collect results
    var results = [];

    // check each synset
    for( var synset of mapping ) {
      
      // get list of synonyms
      var syns = synset.getSynonyms();
      
      // skip single object sets
      if( syns.length < 2 ) {
        continue;
      }
      
      // get involved ontologies
      var ontos = new Set( syns.map( (syn) => syn.getOntology() ) );
      
      // if both have the same size, no duplicate of one ontology
      if( syns.length == ontos.size ) {
        continue;
      }
      
      // sort synonyms by ontology
      var byOnto = {};
      for( var syn of syns ) {
        byOnto[ syn.getOntology() ] = byOnto[ syn.getOntology() ] || [];
        byOnto[ syn.getOntology() ].push( syn );
      }
      
      // look for those with duplicates
      Object.keys( byOnto )
            .filter( (onto) => {
              if( byOnto[ onto ].length > 1 ) {
                
                // account for sameAs relations
                for( var obj1 of byOnto[ onto ] ) {
                  for( var obj2 of byOnto[ onto ] ) {
                    if( (obj1 != obj2) ){
                      if( !lookup[ obj1.getURI() ] || !lookup[ obj2.getURI() ] 
                          || !lookup[ obj1.getURI() ].has( obj2.getURI() ) ) {
                        return true; 
                      }
                    }
                  }
                }
                
                // no mismatches found, so all are connected via sameAs
                return false;

              } else {
                // no duplicate
                return false;
              }
            })
            .forEach( (onto) => {
              results.push({
                onto: onto,
                label: synset.getDisplayLabel(),
                objs: byOnto[ onto ].map( (syn) => syn.getURI() )
              })            
            });
    }
    
    // log
    if( results.length > 0 ) {
      log( '      found possible duplicates: ' + results.length, Log.WARNING );
    } else {
      log( '      ok' );
    }

    // store results
    OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName + '_' + map, results );
    
  }
  
  // done
  return Q( true );
}
 
/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

//if called directly, execute, else export
if(require.main === module) {
  checkMappedDuplicates().done(); 
} else { 
  module.exports = checkMappedDuplicates; 
}
