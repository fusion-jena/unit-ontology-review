"use strict";
/**
 * convenience functions related to the filesystem
 * - output of HTML results
 * - loading of event processors
 * 
 */

// includes
var Fs       = require( 'fs' ),
    Cfg      = require( __dirname + '/../config/config.js' ),
    Posthtml = require( 'posthtml' ),
    Beautify = require( 'posthtml-beautify' );

var FileStore = {};

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX HTML RESULTS XXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

/**
 * write the given content to a file
 * 
 * uses the default template
 */
FileStore.writeResult = function writeResult( key, name, content ){
  
  // get template
  var templ = Fs.readFileSync( Cfg.templatePath + '/theme.htm', 'utf8' );

  // insert title
  templ = templ.replace( '{title}', name );
  
  // insert output
  templ = templ.replace( '{content}', content.content );
  
  // pretty print result
  templ = Posthtml()
          .use( Beautify({rules: {indent: 2 }}) )
          .process( templ, { sync: true } )
          .html;

  // write results to file
  Fs.writeFileSync( this._getResPath( key, name ), templ );

}

/**
 * remove the referenced output file
 * 
 */
FileStore.remResult = function remResult( key, name ){
  try {
    // remove file
    Fs.unlinkSync( this._getResPath( key, name ) );
  }catch(e){}
};


/**
 * create the path for a result file
 */
FileStore._getResPath = function _getResPath( key, name ) {
  return Cfg.targetPath + '/' + key + ' ' + name + '.htm';
}


FileStore.writeFilelist = function writeFilelist( key, name, content ){

  // get template
  var templ = Fs.readFileSync( Cfg.templatePath + '/filelist.htm', 'utf8' );

  // insert title
  templ = templ.replace( '{title}', name );
  
  // insert output
  templ = templ.replace( '{content}', content.content );

  // write results to file
  Fs.writeFileSync( this._getResPath( key, name ), templ );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXX EVENT PROCESSORS XXXXXXXXXXXXXXXXXXXXXXXXXXX */

/**
 * load the specified event processor
 * returns null, if none is present
 */
FileStore.getEventProcessor = function getEventProcessor( onto, module, event ) {
  
  // build path to the respective file
  var path = __dirname + '/../../data/' + onto + '/js/' + module + '_' + event;

  // try to load the module
  try{
    return require( path );
  } catch(e){
    return null;
  }
  
}

module.exports = FileStore;