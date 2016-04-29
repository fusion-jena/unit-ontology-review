"use strict";
/**
 * create a list of all files and their descriptions
 */

// includes
var Q           = require( 'q' ),
    Fs          = require( 'fs' ),    
    Log         = require( './util/log.js' ),
    TemplStore  = require( './util/TemplStore' ),
    OntoStore   = require( './util/OntoStore' );

//local settings
var localCfg = {
      moduleName: 'listFiles',
      moduleKey:  '0100'
    },
    log = function( msg, type ) {
      Log( localCfg.moduleName, msg, type );
    };
    
// RegExp for data extraction
var regexp = {
  desc: /\/\*\*(.|[\r\n])*?\*\//,
  key:  /moduleKey:\s*'(\d{4})'/,
  name: /moduleName:\s*'([a-zA-Z0-9 _]*)'/,
  loadedResults:    /OntoStore\.getResult\(\s*\'(.*?)\'\s*\)/gi,
  loadedPredefined: /OntoStore\.loadPredefinedData\(\s*\'(.*?)\'\s*\)/gi,
  loadedData:       /OntoStore\.getData\(\s*onto\s*\,\s*['"](.*?)['"]\s*\)/gi,
  exportResult:     /OntoStore\.storeResult\(\s*(.*)\s*\,\s*(.*)\s*\,.*\)/gi,
  exportHTML:       /TemplStore\.writeResult\(\s*(.*)\s*\,\s*(.*)\s*\,\s*{/gi
};

function listFiles(){

  // get all files
  var files = listFilesOfDir( __dirname ).sort();

  // collect results
  var results = [];

  // process all files
  log( 'scanning files' );
  for( var file of files ) {
    
    // load file content
    var content = Fs.readFileSync( __dirname + '/' + file, 'utf8' );

    // reset variables
    var desc = null,
        key = null,
        name = null;
    
    // get description
    try {
      desc = content.match( regexp.desc )[0];

      // remove not needed characters from description
      desc = desc.replace( /\s\*\s/gi, '' )
                 .replace( /(^\/\*\*)|(\*\/$)/gi, '' )
                 .trim();

    } catch( e ) {
      log( '   could not extract description from ' + file, Log.ERROR );
    }
    
    // get key
    try {
      key = content.match( regexp.key )[1];
    } catch( e ) {
      log( '   could not extract key from ' + file, Log.ERROR );
    }
    
    // get name
    try {
      name = content.match( regexp.name )[1];
    } catch( e ) {
      log( '   could not extract name from ' + file, Log.ERROR );
    }
    
    // add to result
    if( desc && name && key ) {
      
      // start building desc object
      var entry = {
        desc: desc,
        key:  key,
        name: name,
        file: file
      };
      
      // get loaded results
      try{
        entry.loadedResults = getAllMatches( regexp.loadedResults, content, 1 );
      } catch( e ) {
        log( '   could not extract loaded result files', Log.ERROR );
        entry.loadedResults = [];
      }
      
      // get used predefined files
      try{
        entry.loadedPredefined = getAllMatches( regexp.loadedPredefined, content, 1 );
      } catch( e ) {
        log( '   could not extract used predefined files', Log.ERROR );
        entry.loadedResults = [];
      }
      
      // get loaded sparql result files
      try{
        entry.loadedData = getAllMatches( regexp.loadedData, content, 1 );
      } catch( e ) {
        log( '   could not extract loaded sparql result files', Log.ERROR );
        entry.loadedResults = [];
      }
      
      // get exported result files
      try{
        
        // result files
        entry.exportResult = getAllMatches( regexp.exportResult, content, 2 );
        entry.exportResult = entry.exportResult
                                  .map( (name) => {
                                    return name.replace( 'localCfg.moduleName', entry.name )
                                               .replace( /\s*\+\s*\'\_(.*)\'/, '_$1' )
                                               .replace( 's[ type ]', '' )
                                               .replace( '+ map', '+ mapType' )
                                               .trim();
                                  });
        
      } catch( e ) {
        log( '   could not extract exported result files', Log.ERROR );
        entry.loadedResults = [];
      }
      
      // get exported html files
      try{
        
        // result files
        entry.exportHTML = getAllMatches( regexp.exportHTML, content, 2 );
        entry.exportHTML = entry.exportHTML
                                .map( (name) => {
                                  return name.replace( 'localCfg.moduleName', entry.name )
                                             .replace( /\s*\+\s*\'\_(.*)\'/, '_$1' )
                                             .replace( 's[ type ]', '' )
                                             .replace( '+ map', '+ mapType' )
                                             .trim();
                                });

        
      } catch( e ) {
        log( '   could not extract exported html files', Log.ERROR );
        entry.loadedResults = [];
      }
      
      // add to result
      results.push( entry );
    }
    
  }

  // create output
  var out = [];
  for( var entry of results ) {
    
    // head
    out.push( '<h2>', entry.file, '</h2><dl>' );
    
    // content
    out.push( '<dt>key</dt><dd>', entry.key, '</dd>' );
    out.push( '<dt>name</dt><dd>', entry.name, '</dd>' );
    out.push( '<dt>description</dt><dd>', entry.desc.replace( /\n/gi, '<br>' ), '</dd>' );
    if( entry.loadedData.length > 0 ) {
      out.push( '<dt>loaded SPARQL datasets</dt><dd>', 
                  entry.loadedData.join( '<br>' ), '</dd>' );
    }
    if( entry.loadedPredefined.length > 0 ) {
      out.push( '<dt>loaded predefined datasets</dt><dd>', 
                  entry.loadedPredefined.join( '<br>' ), '</dd>' );
    }
    if( entry.loadedResults.length > 0 ) {
      out.push( '<dt>loaded (intermediate) result datasets</dt><dd>', 
                  entry.loadedResults.join( '<br>' ), '</dd>' );
    }
    if( entry.exportResult.length > 0 ) {
      out.push( '<dt>exported datasets</dt><dd>', 
                  entry.exportResult.join( '<br>' ), '</dd>' );
    }
    if( entry.exportHTML.length > 0 ) {
      out.push( '<dt>exported HTML file</dt><dd>', 
                  entry.exportHTML.join( '<br>' ), '</dd>' );
    }
    
    // end
    out.push( '</dl>' );
    
  }
  
  // store results
  OntoStore.storeResult( localCfg.moduleKey, localCfg.moduleName, results );

  // write to file
  TemplStore.writeFilelist( localCfg.moduleKey, localCfg.moduleName, {
    content: out.join('')
  });
  log( 'written file list' );


  // check the documentation
  log( 'checking documentation consistency' );
  var lookup = {};
  for( var entry of results ) {
    
    // description should be unique
    lookup[ entry.desc ] = lookup[ entry.desc ] || [];
    lookup[ entry.desc ].push( entry.file );
    
    // key should be at the start of the file name
    if( !(entry.file.indexOf( entry.key ) == 0) ) {
      log( '   filename-key-mismatch in ' + entry.file, Log.ERROR );
    }
    
  }

  // output the duplicate descriptions
  Object.keys( lookup )
        .forEach( (key) => {
          
          // just do something, if there is more than one file with the same description
          if( lookup[ key ].length > 1 ) {
            log( '   duplicate description for: ', Log.ERROR );
            lookup[ key ].forEach( (file) => { 
              log( '      ' + file, Log.ERROR );
            });
          }

        });
  
  // done
  return Q( true );    
  
}


/**
* list of files in a given path
* - removes some files like, e.g., .gitignore
*/
function listFilesOfDir( path ) {
 
 // RegExp to check for analysis script files
 var analysisRegexp = /^\d{4}.*\.js$/i;

 // list all files and filter
 return Fs.readdirSync( path )
          .filter( function( file ){
            return analysisRegexp.test( file );
          });
}


/**
 * return all submatches from the given string and regexp
 * @param regexp
 * @param str
 * @returns
 */
function getAllMatches( regexp, str, index ) {
  
  var res = [];
  regexp.lastIndex = 0;
  var matches;
  while( matches = regexp.exec( str ) ) {
    res.push( matches[index] );
  }
  return res;
}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// if called directly, execute, else export
if(require.main === module) {
  listFiles().done(); 
} else { 
  module.exports = listFiles; 
}