'use strict';

var test = require('tape');
var path = require('path');
var parse = require('../lib/parser');
var helpers = require('../lib/helpers');

test('parser', function(t) {
  t.plan(10);

  var filePath = path.join(path.resolve(__dirname), 'helpers', 'router.js');
  var fileSource = helpers.readFileSync(filePath);

  var parsed = parse(fileSource);

  t.equal(typeof parsed[0].type, 'string');
  t.equal(parsed[0].type, 'swaggerPath');

  t.equal(typeof parsed[1].data[0].tags, 'object');
  t.equal(parsed[1].data[0].tags[0], 'hello');

  t.equal(typeof parsed[4].type, 'string');
  t.equal(parsed[4].type, 'swaggerTag');

  t.equal(typeof parsed[5].type, 'string');
  t.equal(parsed[5].type, 'swaggerParameter');

  t.equal(typeof parsed[6].type, 'string');
  t.equal(parsed[6].type, 'swaggerResponse');
});
