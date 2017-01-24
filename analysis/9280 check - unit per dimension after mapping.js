"use strict";
/**
 * Create HTML output for unit per dimension
 *
 * output:
 * - "check - unit per dimension after mapping" ... list per dimension Synset of linked units
 */

// includes
var Q           = require( 'q' ),
    Log         = require( './util/log.js' ),
    OntoStore   = require( './util/OntoStore' ),
    TemplStore  = require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'check - unit per dimension after mapping',
      moduleKey:  '9280'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


function checkUnitPerDimensionAfterMapping() {

  //create lookup for dimension synsets
  log( 'creating dimension lookup' );
  var dimSynsets = OntoStore.getResult( 'mapDimension' ),
      dimLookup = {};
  for(var synset of dimSynsets ) {

    // get all synonyms
    var syns = synset.getSynonyms();

    // add all to lookup
    for( var syn of syns ) {
      dimLookup[ syn.getURI() ] = synset;
    }

  }

  //create lookup for unit synsets
  log( 'creating unit lookup' );
  var unitSynsets = OntoStore.getResult( 'mapUnit' ),
      unitLookup = {};
  for(var synset of unitSynsets ) {

    // get all synonyms
    var syns = synset.getSynonyms();

    // add all to lookup
    for( var syn of syns ) {
      unitLookup[ syn.getURI() ] = synset;
    }

  }

  // get all dimension-unit-mappings and build a lookup
  log( 'loading dimension-unit mapping' );
  var dimUnitLookup = {},
      ontos = OntoStore.getOntologies();
  for( var onto of ontos ) {

    // get the dimension-unit-mapping
    var unitDimMap = OntoStore.getData( onto, 'dimensionUnit' );

    // add all entrys of dimension-unit-mapping to lookup
    for( var entry of unitDimMap ) {

      // if lookup contains current dimension
      if (dimUnitLookup[ entry.dimension ]){

        // add current unit to array
        dimUnitLookup[ entry.dimension ].push(entry.unit);

      } else {

        // create new array containing current unit
        dimUnitLookup[ entry.dimension ] = [ entry.unit ];
      }

    }

  }

  // get dimension mapping
  var mapping = OntoStore.getResult( 'mapDimension' );

  // extract shown data
  var dimensions = mapping.map( function( synset ){

    // get all members
    var syns = synset.getSynonyms();

    // get representative node (== first node)
    var rep = syns[0];

    return {
      'label': rep.getDisplayLabel(),
      'objs': syns.map( function( syn ){
        return {
          onto: syn.getOntology(),
          uri:  syn.getURI(),
          label:syn.getDisplayLabel()
        };
      })
    };

  });

  // sort data by label
  dimensions.sort( function( a, b ){
    if( !a.label ) {
      console.log( a );
    }
    return a.label.localeCompare( b.label );
  });

  // convert to HTML

  // open html table
  var table = [ '<table class="leftAligned"><tr><th>Dimension SynSet</th><th>Unit SynSets</th></tr>' ];

  // for all dimension syn sets
  table = table.concat(dimensions.map( function( dimSynset ) {

    // prepare empty unit syn set array
    var unitSynSets = [];

    // open first html cell
    var row = [ '<tr><td><b>', dimSynset.label, '</b><ul>' ];

    // for all involved dimension objects
    for( var dimObj of dimSynset.objs ) {

      // list dimension object
      row.push( '<li data-onto="' + dimObj.onto + '"><a href="' + dimObj.uri + '">', dimObj.label, '<br>(', dimObj.uri, ')</a>' );

      // create unit uri to syn set mapper function
      var unitUriToSnySetMapper = function(unitUri){

        // log missing unit syn set
        if (!unitLookup[unitUri]) {
          log("  missing unitSynSet for " + unitUri, Log.ERROR );
        }
        return unitLookup[unitUri]
      };

      // if dimension has assigned units
      if (dimUnitLookup[dimObj.uri]) {

        // map unit uri to unit syn sets
        var mappedUnitSynSets = dimUnitLookup[dimObj.uri].map(unitUriToSnySetMapper);

        // filter not mapped uris
        mappedUnitSynSets = mappedUnitSynSets.filter( (entry) => { return !!entry } );

        // collect unit syn sets
        unitSynSets = unitSynSets.concat(mappedUnitSynSets);

      }

    }

    // open second html cell
    row.push( '</ul></td><td><ul>' );

    // make unit syn set array unique
    var unitSynSets = [... new Set( unitSynSets )];

    // if dimension syn set has assigned unit syn sets
    if (0 < unitSynSets.length) {

      // extract shown data
      var unitSynSets = unitSynSets.map( function( unitSynSet ){

        // get all members
        var syns = unitSynSet.getSynonyms();

        // get representative node (== first node)
        var rep = syns[0];

        return {
          'label': rep.getDisplayLabel(),
          'objs': syns.map( function( syn ){
            return {
              onto: syn.getOntology(),
              uri:  syn.getURI(),
              label:syn.getDisplayLabel()
            };
          })
        };

      });

      // sort data by label
      unitSynSets.sort( function( a, b ){
        if( !a.label ) {
          console.log( a );
        }
        return a.label.toLowerCase().localeCompare( b.label.toLowerCase() );
      });

      // for all unit syn sets of this dimension
      for( var unitSynSet of unitSynSets ) {

        // list unit syn set
        row.push( '<li><b>' , unitSynSet.label , '</b><ul>')

        // list all unit objects
        for (var unitObj of unitSynSet.objs) {

          // list unit object
          row.push( '<li data-onto="' + unitObj.onto + '"><a href="' + unitObj.uri + '">', unitObj.label, '<br>(', unitObj.uri, ')</a>' );

        }

        row.push( '</ul>');

      }

    }

    // close html cell
    row.push( '</ul></td></tr>' );

    // connect all parts
    return row.join('\n');

  }));

  table.push( '</table>' );

  // write results to file
  TemplStore.writeResult( localCfg.moduleKey, localCfg.moduleName, {
    content: table.join('\n')
  });

  // done
  return Q( true );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  checkUnitPerDimensionAfterMapping().done();
} else {
  module.exports = checkUnitPerDimensionAfterMapping;
}