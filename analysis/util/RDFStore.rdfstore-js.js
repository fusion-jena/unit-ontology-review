"use strict";
/**
 * implementing the RDFStore interface by using the rdfstore-js library
 * 
 * https://github.com/antoniogarrote/rdfstore-js
 */

// includes
var Rdfstore  = require( 'rdfstore' ),
    Q         = require( 'q' );

/**
 * constructor
 */
function RDFStore(){
  this._store = null;
}

/**
 * create or initialize the store or connection there to
 */
RDFStore.prototype.create = function(){
  
  // prepare result
  var res = Q.defer();
  
  // create the store
  Rdfstore.create( function( err, store ){
    
    // error handling
    if( err ) {
      res.reject( err );
      return;
    }
    
    // save the store and return
    this._store = store;
    res.resolve( this );
    
  }.bind( this ));
  
  // return
  return res.promise;
  
};

/**
 * empty the store
 */
RDFStore.prototype.truncate = function(){
  
  return this.execQuery( 'DELETE { ?o ?p ?s }' );

};

/**
 * add triples to the store
 * @param mime      MIME type of the submitted content
 * @param content   the triples
 */
RDFStore.prototype.addTriples = function( mime, content ){
  
  // prep result
  var res = Q.defer();
  
  // add to store
  this._store.load( mime, content, function( err, result ){
    
    // error handling
    if( err ) {
      res.reject( err );
      return;
    }
    
    // relay result
    res.resolve( result );
    
  });
  
  // return promise
  return res.promise;
  
};

/**
 * execute a sparql query against this store
 * @param query   the query to execute
 */
RDFStore.prototype.execQuery = function( query ) {
  
  // prep result
  var result = Q.defer();

  this._store.execute( query, function( err, res ){
    
    // error handling
    if( err ) {
      result.reject( err );
      return;
    }
    
    // relay result
    result.resolve( res );

  });
  
  // return promise
  return result.promise;
  
}

module.exports = RDFStore;