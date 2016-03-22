'use strict';

var test = require('tape');
var path = require('path');
var fs = require('fs');
var helpers = require('../../lib/helpers');
var router = require('./router');

var basePath = path.resolve(__dirname);

var testData = {
  foo: 'bar'
};

test('writeFileSync', function(t) {
  t.plan(1);

  helpers.writeFileSync('/test', 'test_file.json', testData);

  var filePath = path.join(basePath, '..', 'test_file.json');
  var stat = fs.lstatSync(filePath);

  t.equal(stat.isFile(), true);

  // Clean-up written file
  fs.unlinkSync(filePath);
});

test('readFileSync', function(t) {
  t.plan(2);

  var filePath = path.join(basePath, 'router.js');
  var fileSource = helpers.readFileSync(filePath);

  t.equal(typeof fileSource, 'string');
  t.notEqual(fileSource.indexOf('module.exports'), -1);
});

test('extractRoutes', function(t) {
  t.plan(9);

  var routesMap = helpers.extractRoutes(router);

  t.equal(routesMap[0].method, 'get');
  t.equal(routesMap[0].path, '/hello');
  t.equal(routesMap[0].handler.name, 'helloWorld');

  t.equal(typeof routesMap[1].method, 'string');

  t.equal(routesMap[2].method, 'post');
  t.equal(typeof routesMap[2].handler, 'function');
  t.equal(routesMap[2].handler.name, 'postHandler');

  t.equal(routesMap[3].method, 'delete');
  t.equal(routesMap[3].handler.name, 'testDelete');
});
