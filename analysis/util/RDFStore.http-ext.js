"use strict";
/**
 * implementing the RDFStore interface by using an HTTP connection to a remote server
 * 
 * omits purging the repository and adding tripples
 * 
 * accepts the following parameters using the create() method:
 * - url          ...   URL of the remove server
 * - formatProp   ...   property to set JSON output at the remote server; default: format
 * - queryProp    ...   property to submit the query; default: query
 */

// includes
var Q       = require( 'q' ),
    Request = require( 'request' ),
    Cfg     = require( '../config/config.js' );


function RDFStore(){}

/**
 * create or initialize the store or connection there to
 */
RDFStore.prototype.create = function( param ){

  // store copy of parameters
  this._param = JSON.parse( JSON.stringify( param || {} ) );
  
  // set default parameters, where necessary
  this._param.formatProp  = this._param.formatProp || 'format';
  this._param.queryProp   = this._param.queryProp  || 'query';
  this._param.method      = this._param.method     || 'GET';
  this._param.method      = this._param.method.toUpperCase();
  this._param.log         = param.log;
  
  // make sure there is a URL given
  if( !('url' in this._param) ) {
    return Q.reject( new Error( 'Missing URL in parameter list' ) );
  }
  
  // done
  return Q( this );
};


/**
 * empty the store - omitted
 */
RDFStore.prototype.truncate = function(){
  if( this._param.log ) {
    this._param.log( '       skipped' );
  }
  return Q( this );
};


/**
 * add triples to the store - omitted
 */
RDFStore.prototype.addTriples = function(){
  if( this._param.log ) {
    this._param.log( '       skipped' );
  }
  return Q( this );
};


/**
 * execute a sparql query against this store
 * @param   {String}  query   the query to execute
 * @returns {Array}           the result
 */
RDFStore.prototype.execQuery = function( query ) {
  
  // pre result
  const result = Q.defer();
  
  // submitted data
  const submittedData = {}
  submittedData[ this._param.queryProp ]  = query;
  submittedData[ this._param.formatProp ] = 'JSON';
  
  // assemble options
  const args = {
      'uri':    this._param.url,
      'method': this._param.method,
      'headers': {
        'Accept': 'application/json'
      }
  };
  
  // add submitted data
  if( this._param.method == 'GET' ) {
    args.qs = submittedData; 
  } else {
    args.form = submittedData;
  }
  
  // run the request
  Request( args, function( err, response, body ){
    
    // error handling
    if( err ) {
      result.reject( err );
      return;
    }
    
    // parse result object
    var resObj;
    try {
      resObj = JSON.parse( body );
    } catch( e ) {
      result.reject( new Error( 'Server did not reply with JSON, but sent: ' + body ) );
      return;
    }
    
    // relay result (and filter empty bindings)
    result.resolve( resObj['results']['bindings'].filter( function( el ){
      var keys = Object.keys( el );
      return keys.length > 0;
    }));
    
  });
  
  // return 
  return result.promise;
  
}

module.exports = RDFStore;