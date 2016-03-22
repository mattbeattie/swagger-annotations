'use strict';

var test = require('tape');
var swaggerAnnotations = require('../');

test('swaggerAnnotations', function(t) {
  t.plan(8);

  var swaggerData = swaggerAnnotations({
    metadata: {
      host: 'mycoolexample.com',
      basePath: '/foo'
    },
    src: '/test/helpers/router'
  });

  t.equal(swaggerData.info.title, 'swagger-annotations');
  t.equal(swaggerData.host, 'mycoolexample.com');

  t.equal(Array.isArray(swaggerData.tags), true);

  t.equal(typeof swaggerData.parameters, 'object');
  t.equal(swaggerData.parameters.foo.default, 'bar');

  t.equal(typeof swaggerData.paths, 'object');
  t.equal(typeof swaggerData.paths['/hello'].get, 'object');

  t.equal(typeof swaggerData.responses['Success'], 'object');
});
