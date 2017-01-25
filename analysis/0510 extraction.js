"use strict";
/**
 * Run all the SPARQL Queries present in /data against the respective ontologies
 * and store the resulting data in /res
 *
 * output:
 * - one file per type and ontology in separate folders
 */

// includes
var Fs       = require( 'fs' ),
    Q        = require( 'q' ),
    Mkdir    = require( 'mkdirp' ),
    Log      = require( './util/log.js' ),
    Cfg      = require( './config/config.js' ),
    RDFStore = require( './util/RDFStore.' + Cfg.rdfstore + '.js' ),
    RDFStore_ext = require( './util/RDFStore.http-ext.js' ),
    OntoStore= require( './util/OntoStore' ),
    FileStore= require( './util/TemplStore' );

// local settings
var localCfg = {
      moduleName: 'extraction',
      moduleKey:  '0510'
    },
    log = function( msg ) {
      Log( localCfg.moduleName, msg );
    };


/**
 * extract the instances for all found ontologies
 */
function extract() {

  // get a list of ontologies
  var ontos = OntoStore.getOntologies();
  log( 'Found  ontologies (' + ontos.length + '): ' + ontos.join( ', ' ) );

  // process all queries (waterfall of ontology promises)
  return processInSequence( ontos, function( onto ){
    return processOnto( onto );
  });

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
                    return store.addTriples( getMime( filename ), content );

                  })

        })
        .then( function(){

          // logging
          log( '   query RDF-Store' );

          // get query list
          var queryFiles = listFiles( ontoSparqlPath );

          // make sure the target directory exists
          var savePath = Cfg.targetPath + onto + '/';
          Mkdir.sync( savePath );

          // process all queries (waterfall of promisses)
          return processInSequence( queryFiles, function( queryFile ){

                    // read file
                    var content = Fs.readFileSync( ontoSparqlPath + queryFile, 'utf8' );
                    log( '     running ' + queryFile );

                    // run query
                    return store.execQuery( content )
                            .then( function( result ){

                              // flatten result
                              result = flatten( result );
                              
                              // try to load after extraction event processor
                              var afterExtraction = FileStore.getEventProcessor( onto, 'sameAs', 'afterExtraction' );
                              
                              // apply event
                              if( afterExtraction ) {
                                result = result.map( afterExtraction );
                              }

                              // create file name
                              var filename = queryFile.replace( '.rq', '.json' )

                              // write to file
                              Fs.writeFileSync( savePath + filename,
                                                JSON.stringify( result, null, 2 ) );
                              
                              // relay count
                              return result.length;

                            });
                  })
                  .then( () => {
                              
                    // if this was an external extraction, 
                    // place a file in results containing the timestamp
                    if( endpoint ) {
                      Fs.writeFileSync( savePath + 'extractionMetadata.txt',
                                        JSON.stringify( {
                                          date: new Date()
                                        }, null, 2 ) );
                    }

                  });

        })
        .then(function(){         
          // log
          log( '   truncate RDF-Store' );
          return store.truncate();
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
 * flatten a result array
 *
 * @param {Object}  res
 */
function flatten( res ) {
  return res.map( function( entry ){
    var keys = Object.keys( entry ),
        res = {}
    for( var i=0; i<keys.length; i++ ) {

      // convert types, if given
      switch( entry[ keys[i] ]['datatype'] ) {

        // boolean
        case 'http://www.w3.org/2001/XMLSchema#boolean':
          res[ keys[i] ] = entry[ keys[i] ]['value'] == 'true';
          break;

        // number
        case 'http://www.w3.org/2001/XMLSchema#integer':
          res[ keys[i] ] = parseInt( entry[ keys[i] ]['value'], 10 );
          break;

        case 'http://www.w3.org/2001/XMLSchema#float':
          res[ keys[i] ] = parseFloat( entry[ keys[i] ]['value'] );
          break;

        // nothing found
        default:
          res[ keys[i] ] = entry[ keys[i] ]['value'];

      }
    }

    return res;
  })
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

    case 'xml':
    case 'owl': return 'application/rdf+xml';

    default: throw Error( 'Unknown file-extension: ' + ext );
  }
}
/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  extract().done();
} else {
  module.exports = extract;
}