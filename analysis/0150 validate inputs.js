"use strict";
/**
 * validate the presence of input files and folders
 */

// includes
var Fs       = require( 'fs' ),
    Path     = require( 'path' ),
    Q        = require( 'q' ),
    Log      = require( './util/log.js' ),
    Cfg      = require( './config/config.js' ),
    OntoStore= require( './util/OntoStore' );

// local settings
var localCfg = {
      moduleName: 'validate input',
      moduleKey:  '0150'
    },
    log = function( msg, level ) {
      Log( localCfg.moduleName, msg, level );
    };


/**
 * extract the instances for all found ontologies
 */
function validateInputs() {

  // get a list of ontologies
  const ontos = OntoStore.getOntologies();
  log( 'Found ontologies (' + ontos.length + '): ' + ontos.join( ', ' ) );

  // process each ontologie
  let foundError = false;
  for( let onto of ontos ) {

    // gather paths
    let ontoBasePath    = Cfg.dataPath + onto,
        ontoSrcPath     = Path.resolve( ontoBasePath + '/src/' ),
        ontoSparqlPath  = Path.resolve( ontoBasePath + '/sparql/' );

    // test source path
    if( !testExistance( ontoSrcPath ) ) {

      // no source folder given
      foundError = true;
      log( '   ' + onto + ': missing source folder "' + ontoSrcPath + '"' );

    } else {

      // source folder present

      // get source files
      let files = listFiles( ontoSrcPath );

      // test for actual source files
      if( files.length < 1 ) {

        // test for endpoint file
        if( !testExistance( ontoSrcPath + '/endpoint.js' ) ) {
          foundError = true;
          log( '   ' + onto + ': found neither source files nor endpoint.js in "' + ontoSrcPath + '"' );
        }
      }

    }

    // test source path
    if( !testExistance( ontoSparqlPath ) ) {

      // no source folder given
      foundError = true;
      log( '   ' + onto + ': missing SPARQL query folder "' + ontoSparqlPath + '"' );

    } else {

      // source folder present

      // get source files
      let files = listFiles( ontoSparqlPath );

      // there has to be at least one file present
      if( files.length < 1 ) {
        foundError = true;
        log( '   ' + onto + ': found no SPARQL query files in "' + ontoSparqlPath + '"' );
      }

    }

  }

  // break on errors or proceed
  if( foundError ) {
    log( '   Errors found - stopped processing.', Log.ERROR );
    process.exit();
  } else {
    log( '   No errors found.' );
    return Q.resolve(true);
  }

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Helper XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

/**
 * list of files in a given path
 * - removes some files like, e.g., .gitignore or .js files
 *
 * @param   {String}          path
 * @returns {Array[String]}   the filenames without path
 */
function listFiles( path ) {
  return Fs.readdirSync( path )
           .filter( function( file ){
             return !file.endsWith( '.js' ) && !file.endsWith( '.gitignore' );
           });
}


/**
 * test for the existance of the given path
 * @param     {String}    path
 * @returns   {Boolean}
 */
function testExistance( path ) {
  try{
    Fs.accessSync( path );
    return true;
  } catch( e ){
    return false;
  }
}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  validateInputs().done();
} else {
  module.validateInputs = extract;
}