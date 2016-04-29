"use strict";
/**
 * map the conversions according to the unit SynSets
 */

// includes
var Q   = require( 'q' ),
    Log = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    buildLookup = require( './util/buildLookup' ),
    clone       = require( './util/clone' );

//local settings
var localCfg = {
    moduleKey: '4200',
    moduleName: 'mapConversion'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };

  
function mapConversions() {

  // log
  log( 'mapping conversions' );
  
  // get unit synonym sets
  var units = OntoStore.getResult( 'mapUnit' );

  // build a lookup for unit uris
  log( 'building unit lookup' );
  var unitLookup = buildLookup( units );

  // get transitive closure of conversions
  var conversions = OntoStore.getResult( 'conversion' );
  
  // map conversions and build a graph out of it
  log( 'mapping conversions to SynSets' );
  var graph = [],
      convGroups = new Set();
  for( var srcConv of conversions ) {
    
    // skip conversion entries with no factor or offset
    if( !( 'convFactor' in srcConv) && !('convOffset' in srcConv ) ) {
      continue;
    }
    
    // we work with a copy here to be able to attach new fields
    var conv = clone( srcConv );

    // identify both SynSets for the converted units
    var syn1 = unitLookup[ conv.unit1 ],
        syn2 = unitLookup[ conv.unit2 ];
    
    // get the respective indexes
    var ind1 = units.indexOf( syn1 ),
        ind2 = units.indexOf( syn2 );

    // determine directions of conversion
    // direction is per definitionem from smaller index in units to bigger
    conv.reverse = ind1 > ind2;
    
    // original direction
    graph[ ind1 ] = graph[ ind1 ] || [];
    graph[ ind1 ][ ind2 ] = graph[ ind1 ][ ind2 ] || [];
    var convList = graph[ ind1 ][ ind2 ];
    convList.push( conv );
    
    // reversed direction
    graph[ ind2 ] = graph[ ind2 ] || [];
    graph[ ind2 ][ ind1 ] = graph[ ind2][ ind1 ] || convList;
    
    // collect conversion group
    convGroups.add( convList );

  }
  
  // extract overlap for direct conversions
  var overlap = [ ... convGroups ].filter( (convArr) => (convArr.length > 1) );
  log( '   found common conversions: ' + overlap.length );
  
  // remove SynSets with just computed conversions of the same path
  overlap = overlap.filter( (convArr) => {
    
    // check for a non-computed conversion
    var nonComp = convArr.some( (conv) => !conv.computed );
    if( nonComp ) {
      return true;
    }
    
    // build representing set from the first element
    var repSet = new Set();
    for( var i=0; i<convArr[0].involved.length; i++ ) {
      
      // identify involved unit synsets
      var syn1 = unitLookup[ convArr[0].involved[i].unit1 ],
          syn2 = unitLookup[ convArr[0].involved[i].unit2 ],
          ind1 = units.indexOf( syn1 ),
          ind2 = units.indexOf( syn2 );
      
      // add representing string to representing set
      if( ind1 < ind2 ) {
        repSet.add( ind1 + '#' + ind2 );
      } else {
        repSet.add( ind2 + '#' + ind1 );
      }
      
    }
    
    // now check all others for conformance
    for( var j=1; j<convArr.length; j++ ) {
      for( var i=0; i<convArr[j].involved.length; i++ ) {
        
        // identify involved unit SynSets
        var syn1 = unitLookup[ convArr[j].involved[i].unit1 ],
            syn2 = unitLookup[ convArr[j].involved[i].unit2 ],
            ind1 = units.indexOf( syn1 ),
            ind2 = units.indexOf( syn2 );

        // build a representing string
        var rep;
        if( ind1 < ind2 ) {
          rep = ind1 + '#' + ind2;
        } else {
          rep = ind2 + '#' + ind1;
        }
        
        // representing string should be in the representing set
        // if it is not, this uses a different path and we keep the whole conversion set
        if( !repSet.has( rep ) ) {
          return true;
        }
      }
      
    }
    
    // we have no reason to keep this entry
    return false;
    
  });
  log( 'removed SynSets consisting of just computed conversions with the same path' );
  log( '   remaining conversions: ' + overlap.length );
  
  
  // save conversion overlap result
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, overlap );
  
  // done
  return Q( true );
}

 
/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

//if called directly, execute, else export
if(require.main === module) {
  mapConversions().done(); 
} else { 
 module.exports = mapConversions; 
}
