"use strict";
/**
 * Insert all source file of a given ontology to our RDF store
 */

// includes
var Fs       = require( 'fs' ),
    Q        = require( 'q' ),
    Mkdir    = require( 'mkdirp' ),
    Log      = require( '../util/log.js' ),
    Cfg      = require( '../config/config.js' ),
    RDFStore = require( '../util/RDFStore.' + Cfg.rdfstore + '.js' ),
    RDFStore_ext = require( '../util/RDFStore.http-ext.js' );

// local settings
var localCfg = {
      moduleName: 'addOntoToStore',
      moduleKey:  '0000',
      onto:       'SWEET3',
      repo:       'sweet3',
      store:      'http://localhost:8079/openrdf-sesame/repositories/',
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };


/**
 * insert all files of the given ontology to the given repo
 */
function insert() {

  // adjust repo path in global config
  // used within RDFStore.http
  Cfg.sparqlEndpointGet  = localCfg.store + localCfg.repo;
  Cfg.sparqlEndpointPost = Cfg.sparqlEndpointGet + '/statements',

  // log
  log( 'Processing ontology : '        + localCfg.onto );
  log( 'Target repository ontology : ' + Cfg.sparqlEndpointGet );

  // process all queries (waterfall of ontology promises)
  return processOnto( localCfg.onto );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Process XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

/**
 * process all queries for the given ontology
 *
 * @param {String}  onto
 */
function processOnto( onto ) {

  // gather paths
  var ontoBasePath    = Cfg.dataPath + onto,
      ontoSrcPath     = ontoBasePath + '/src/',
      ontoSparqlPath  = ontoBasePath + '/sparql/';
  
  // check, whether there is an endpoint file present
  let endpoint;
  try{
    endpoint = require( ontoSrcPath + 'endpoint.js' );
  } catch(e){}

  // link store
  let store;
  if( endpoint ) { 
    // pass logger along
    endpoint.log = log;
    store = new RDFStore_ext();
  } else {
    store = new RDFStore();
  }

  log( 'Processing ontology: ' + onto );

  return store.create( endpoint )
       .then(function(){
         log( '   truncate RDF-Store' );
         return store.truncate();
       })
       .then(function( resStore ){

          // logging
          log( '   populate RDF-Store' );

          // get file list
          var ontoFiles = listFiles( ontoSrcPath );

          // if empty list, log and continue
          if( ontoFiles.length < 1 ) {
            log( '      skipped' );
            return;
          }

          // get all ontology files and add to store
          return processInSequence( ontoFiles, function( filename ){

                    // logging
                    log('     add ' + filename);

                    // read file
                    var content = Fs.readFileSync( ontoSrcPath + filename, 'utf8' );

                    // add
                    return store.addTriples( getMime( filename ), content )
                                .catch( (e) => {
                                  log('     Error: ' + e, Log.ERROR );
                                });

                  })

        });

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Helper XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

/**
 * list of files in a given path
 * - removes some files like, e.g., .gitignore or .js files
 *
 * @param {String}  path
 */
function listFiles( path ) {
  return Fs.readdirSync( path )
           .filter( function( file ){
             return !file.endsWith( '.js' ) && !file.endsWith( '.gitignore' );
           });
}


/**
 * process the given values in sequence and execute cb afterwards
 *
 * @param {Array}     values
 * @param {Function}  cb
 * @returns
 */
function processInSequence( values, cb ) {
  return values.reduce( function( prevTask, val ){
    return prevTask.then(function(){
                      return cb( val );
                    });
  }, Q(true) );
}


/**
 * simple mapper from file extension to MIME type
 * @param {String}  filename
 */
function getMime( filename ) {
  var ext = filename.split('.').pop();

  switch( ext ) {
    case 'ttl': return 'text/turtle';

    case 'rdf':
    case 'xml':
    case 'owl': return 'application/rdf+xml';

    default: throw Error( 'Unknown file-extension: ' + ext );
  }
}
/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  insert().done();
} else {
  module.exports = insert;
}