"use strict";
/**
 * computes the transitive closure for conversions
 * done for each ontology separately
 *
 * output:
 * - "conversion" ... list of all conversions (extracted and computed)
 * - "conversion_perOnto" ... list per ontology of conversions (extracted and computed)
 */

// includes
var Q         = require( 'q' ),
    Log       = require( './util/log.js' ),
    OntoStore = require( './util/OntoStore' ),
    clone     = require( './util/clone' ),
    math      = require( 'mathjs' );

//local settings
var localCfg = {
    moduleName: 'conversion',
    moduleKey: '2200'
  },
  log = function( msg, type ) {
    Log( localCfg.moduleName, msg, type );
  };

/**
 * compute transitive closure for the conversions
 */
function calculationConversionTransitiveClosure() {

  // log
  log( 'computing transitive closures units' );

  // get list of ontologies
  var ontos = OntoStore.getOntologies();

  // prepare results
  var resultsAll = [],
      resultsPerOntology = {};

  // do for each ontologies
  for( var onto of ontos ) {

    // log
    log( '   processing ' + onto );

    // load conversions
    var conversions = OntoStore.getData( onto, 'conversion' );

    // log
    log( '      conversions: ' + conversions.length );

    // skip, if no conversions are found
    if( conversions.length < 1 ) {
      continue;
    }

    // prepare per ontology result
    resultsPerOntology[ onto ] = [];

    // initialize graph
    var graph = {};

    // build the graph of conversions
    for( var srcConv of conversions ) {

      // we use a clone to be able to attach new properties
      var conv = clone( srcConv );

      // link to ontology
      conv.onto = onto;

      // insert forward edge
      graph[ conv.unit1 ] = graph[ conv.unit1 ] || {};
      graph[ conv.unit1 ][ conv.unit2 ] = conv;

      // insert backward edge
      graph[ conv.unit2 ] = graph[ conv.unit2 ] || {};
      graph[ conv.unit2 ][ conv.unit1 ] = conv;

    }

    // get a list of involved units
    var units = Object.keys( graph );

    // extract connected subgraphs
    var components = [],
        visitedNodes = new Set();
    for( var unit of units ) {

      // if we already visited that node, skip it
      if( visitedNodes.has( unit ) ) {
        continue;
      }

      // we got a new component
      var comp = new Set(),
          stack = [ unit ];

      // get all nodes connected
      while( stack.length > 0 ) {

        // shortcut
        var node = stack.pop();

        // skip if already processed; prevents cycles
        if( comp.has( node ) ) {
          continue;
        }

        // add to component and remember we visited it
        comp.add( node );
        visitedNodes.add( node );

        // get connected nodes
        var connected = Object.keys( graph[ node ] );

        // add all its connections to the stack
        Array.prototype.push.apply( stack, connected );

      }

      // add component
      components.push( [ ... comp ] );

    }
    log( '      found connected subgraphs: ' + components.length );

    // keep link to solo conversions (not part of a bigger subgraph)
    var soloConversions = components.filter( (c) => c.length <= 2 )
                                    .map( (nodes) => {
                                      return graph[ nodes[0] ][ nodes[1] ];
                                    });

    // filter for components with more than two nodes
    // for smaller components, we don't need to compute a transitive closure
    components = components.filter( (c) => c.length > 2 );
    log( '      found connected subgraphs (length > 2): ' + components.length );


    // build transitive closure for all remaining components
    log( '      building transitive closures for each component' );
    for( var comp of components ) {

      // build adjacency matrix for this ontology
      var matrix = [],
          hasEntries = false;
      for( var i=0; i<comp.length; i++ ) {
        matrix[i] = [];
        for( var j=0; j<comp.length; j++ ) {
          if( graph[ comp[i] ] && graph[ comp[i] ][ comp[j] ] ) {

            // add to matrix
            matrix[i][j] = graph[ comp[i] ][ comp[j] ];

          }

        }

        // insert dummy entry for conversion from a unit to itself
        matrix[i][i] = true;

      }

      // building the closure
      // adapted Floyd Warshall Algorithm
      for( var k=0; k<matrix.length; k++ ) {
        for( var i=0; i<matrix.length; i++ ) {

          if( matrix[ i ] && matrix[ i ][ k ] ) {

            for( var j=0; j<matrix.length; j++ ) {

              if( matrix[ k ] && matrix[ k ][ j ] ) {

                // we just add, where no entry existed before
                if( !matrix[i][j]){

                  // shortcuts
                  var conv1 = matrix[i][k],
                      conv2 = matrix[k][j];

                  // get unit URIs
                  var uri1, uri2;
                  if( conv1.unit1 == conv2.unit1 ) {
                    uri1 = conv1.unit2;
                    uri2 = conv2.unit2;
                  } else if( conv1.unit2 == conv2.unit2 ) {
                    uri1 = conv1.unit1;
                    uri2 = conv2.unit1;
                  } else if( conv1.unit1 == conv2.unit2 ) {
                    uri1 = conv1.unit2;
                    uri2 = conv2.unit1;
                  } else {
                    uri1 = conv1.unit1;
                    uri2 = conv2.unit2;
                  }

                  // compute the new conversion
                  /*
                   * aU1 * f1 + o1 = bU2
                   * bU2 * f2 + o2 = cU3
                   * =>
                   * cU3 = (aU1 * f1 + o1) * f2 + o2
                   *     =  aU1 * f1 * f2  + o1 + f2 + o2
                   */
                  var convFactor = math.bignumber( 1 ),
                      convOffset = math.bignumber( 0 ),
                      factor = math.bignumber( conv1.convFactor || 1 ),
                      offset = math.bignumber( conv1.convOffset || 0 );
                  if( conv1.unit1 == uri1 ) {
                    convFactor = factor;
                    convOffset = offset;
                  } else {
                    convFactor = math.chain( 1 ).divide( factor ).done();
                    convOffset = math.chain( -1 ).multiply( offset ).divide( factor ).done();
                  }
                  factor = math.bignumber( conv2.convFactor || 1 );
                  offset = math.bignumber( conv2.convOffset || 0 );
                  if( conv2.unit2 == uri2 ) {
                    convFactor = math.chain( convFactor ).multiply( factor ).done();
                    convOffset = math.chain( convOffset ).multiply( factor ).add( offset ).done();
                  } else {
                    /*
                     * aU1 * f1 + o1      = bU2 * f2 + o2
                     * aU1 * f1 + o1 - o2 = bU2 * f2
                     *                bU2 = aU1 * f1 / f2 + (o1 - o2) / f2
                     */
                    convFactor = math.chain( convFactor ).divide( factor ).done();
                    convOffset = math.chain( convOffset ).subtract( offset ).divide( factor );
                  }

                  // create list of all involved (non-computed) conversions
                  var involved = [];
                  if( matrix[i][k].involved ) {
                    Array.prototype.push.apply( involved, matrix[i][k].involved );
                  } else {
                    involved.push( conv1 );
                  }
                  if( matrix[k][j].involved ) {
                    Array.prototype.push.apply( involved, matrix[k][j].involved );
                  } else {
                    involved.push( conv2 );
                  }

                  // new conversion entry
                  // per definitionem we always convert from the "smaller" to the "larger" SynSet
                  var entry = {
                        unit1: uri1,
                        unit2: uri2,
                        convFactor: '' + convFactor,
                        convOffset: '' + convOffset,
                        computed: true,
                        involved: involved,
                        onto: onto
                      };

                  // mark this conversion as set
                  matrix[i][j] = entry;
                  matrix[j][i] = entry;

                }

              }

            }

          }

        }
      } // fi Floyd Warshall


      // collect all conversions (both computed and not) for this component
      var allConversions = new Set();
      for( var i=0; i<matrix.length; i++ ) {
        for( var j=0; j<matrix[i].length; j++ ) {
          if( matrix[ i ][ j ] !== true ) {
            allConversions.add( matrix[ i ][ j ] );
          }
        }
      }

      // convert to array
      var allConversionsArr = [ ... allConversions ];

      // add to results
      Array.prototype.push.apply( resultsAll, allConversionsArr );
      Array.prototype.push.apply( resultsPerOntology[ onto ], allConversionsArr );

    }

    // also add the solo conversions to results
    Array.prototype.push.apply( resultsAll, soloConversions );
    Array.prototype.push.apply( resultsPerOntology[ onto ], soloConversions );

    // log
    log( '      computed conversions: ' + (resultsPerOntology[ onto ].length - conversions.length ) );

  }

  // save the results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName + '_perOnto', resultsPerOntology );
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, resultsAll );

  // log
  log( '   total conversions after compoutation:' + resultsAll.length );

  // done
  return Q( true );
}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  calculationConversionTransitiveClosure().done();
} else {
 module.exports = calculationConversionTransitiveClosure;
}