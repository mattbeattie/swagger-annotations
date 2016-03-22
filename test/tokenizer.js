'use strict';

var test = require('tape');
var tokenizer = require('../lib/tokenizer');
var testAnnotation = '{\
 *   description: "Say `hello world`",\
 *   tags: [ "hello" ],\
 *   queryParams: [ "foo" ],\
 *   responses: {\
 *     200: "Success"\
 *   }\
 * }';

test('tokenizer', function(t) {
  t.plan(4);

  var tokens = tokenizer(testAnnotation);

  t.equal(Array.isArray(tokens), true);
  t.equal(tokens.length, 51);
  t.equal(tokens[0], '{');
  t.equal(tokens[50], '}');
});
