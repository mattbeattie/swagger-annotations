'use strict';

var express = require('express');
var router = express.Router();
var handlers = {
  postHandler: function postHandler(res, req, next) {
    // do some post stuff
    res.send('OK');
  }
};

// Dummy middleware
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
}, function otherMiddleware(req, res, next) {
  // do some other middleware stuff
  next();
});

/**
 * @swaggerPath({
 *   description: "Say `hello world`",
 *   tags: [ "hello" ],
 *   queryParams: [ "foo" ],
 *   responses: {
 *     200: "Success"
 *   }
 * })
 */
router.get('/hello', function helloWorld(req, res, next) {
  res.send('hello world');
});

/**
 * @swaggerPath({
 *   description: "Say hello to someone specific",
 *   tags: [ "hello" ],
 *   responses: {
 *     200: "Success"
 *   }
 * })
 */
router.get('/hello/:name', function helloByName(req, res, next) {
  res.send('hello ' + req.params.name);
});

/**
 * @swaggerPath({
 *   description: "Test POST endpoint",
 *   responses: {
 *     200: "Success"
 *   }
 * })
 */
router.post('/somePostRoute', handlers.postHandler);

/**
 * @swaggerPath({
 *   description: "Test DELETE endpoint",
 *   responses: {
 *     200: "Success"
 *   }
 * })
 */
router.delete('/someDeleteRoute/:deleteId',
  function testDelete(req, res, next) {
    // do some delete stuff
    res.send('OK');
  }
);

module.exports = router;

/**
 * @swaggerTag("hello", {
 *   description: "Endpoints that deal with some form of saying `hello`"
 * })
 */

/**
 * @swaggerParameter("foo", {
 *   in: "query",
 *   description: "A test query parameter",
 *   type: "string",
 *   required: false,
 *   default: "bar"
 * })
 */

/**
 * @swaggerResponse('Success', {
 *   description: "Success",
 *   schema: {
 *     type: "object"
 *   }
 * })
 */
