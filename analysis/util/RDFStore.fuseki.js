"use strict";
/**
 * implementing the RDFStore interface by using an HTTP connection ro a remote server
 */

// includes
var Q       = require( 'q' ),
    Request = require( 'request' ),
    Cfg     = require( '../config/config.js' );

function RDFStore(){}

/**
 * create or initialize the store or connection there to
 */
RDFStore.prototype.create = function(){
  return Q( this );
};

/**
 * empty the store
 */
RDFStore.prototype.truncate = function(){
  // pre result
  var result = Q.defer();
  
  // assemble options
  var args = {
      'uri':    Cfg.sparqlEndpoint+ "/" + Cfg.sparqlDataset + "/update",
      'method': 'POST',
      'headers': {
        'Accept': 'application/json'
	  },
	  'form': {
	    'update': 'DROP ALL',
	    'output': 'json'
      }
  };
  
  // run the request
  Request( args, function( err, response, body ){
    
    // error handling
    if( err ) {
      result.reject( err );
      return;
    }
    
    if( response.statusCode != 200 ) {
        result.reject(new Error(": " + response.statusMessage + " (" + response.statusCode + ")"));
        return;
    }
    
    // relay result
    result.resolve( true );
  });
  
  // return 
  return result.promise;
};

/**
 * add triples to the store
 * @param   {String}  mime      MIME type of the submitted content
 * @param   {String}  content   the triples
 * @returns {Number}            the amount of added triples
 */
RDFStore.prototype.addTriples = function( mime, content ){
  
  // pre result
  var result = Q.defer();
  
  // assemble options
  var args = {
      'uri':    Cfg.sparqlEndpoint+ "/" + Cfg.sparqlDataset + "/data",
      'method': 'POST',
      'headers': {
        'Content-Type': mime + ';charset=UTF-8'
      },
      'body': content
  };
  
  // run the request
  Request( args, function( err, response, body ){
    
    // error handling
    if( err ) {
      result.reject( err );
      return;
    }
    
    if( response.statusCode != 200 ) {
        result.reject(new Error(": " + response.statusMessage + " (" + response.statusCode + ")"));
        return;
    }
    
    // relay result
    result.resolve( true );
    
  });
  
  // return 
  return result.promise;
  
};

/**
 * execute a sparql query against this store
 * @param   {String}  query   the query to execute
 * @returns {Array}           the result
 */
RDFStore.prototype.execQuery = function( query ) {
  
  // pre result
  var result = Q.defer();
  
  // assemble options
  var args = { 
      'uri':    Cfg.sparqlEndpoint+ "/" + Cfg.sparqlDataset + "/query",
      'method': 'POST',
      'headers': {
        'Accept': 'application/json'
      },
      'form': {
        'query':  query,
        'output': 'json'
      }
  };
  
  // run the request
  Request( args, function( err, response, body ){
    
    // error handling
    if( err ) {
      result.reject( err );
      return;
    }
    
    if( response.statusCode != 200 ) {
        result.reject(new Error(": " + response.statusMessage + " (" + response.statusCode + ")"));
        return;
    }
    
    // parse result object
    var resObj;
    try {
      resObj = JSON.parse( body );
    } catch( e ) {
      result.reject( e );
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