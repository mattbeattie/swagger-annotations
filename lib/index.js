'use strict';

var path = require('path');
var _ = require('lodash');
var helpers = require('./helpers');

var _swaggerData = {
  swagger: '2.0',
  info: {},
  host: '',
  basePath: '',
  schemes: ['http'],
  produces: ['application/json'],
  consumes: ['application/json'],
  tags: [],
  paths: {},
  responses: {},
  parameters: {},
  definitions: {}
};
var _router;

function addInfo(pkg) {
  // Add service info from our package.json
  _swaggerData.info.title = pkg.name;
  _swaggerData.info.description = pkg.description || '';
  if (_.isPlainObject(pkg.author)) {
    // Use values of author as is (name, email, url)
    _swaggerData.info.contact = pkg.author;
  } else if (_.isString(pkg.author)) {
    var authorParts = pkg.author.match(/\s*(.*)\s+<(.*)>\s+\((.*)\)/);

    // If author didn't match our RegEx
    if (!authorParts) {
      _swaggerData.info.contact = {
        name: pkg.author

      };
    } else {
      _swaggerData.info.contact = {
        name: authorParts[1]
      };
      // Check if the auther specified an 'email'
      if (authorParts[2]) {
        _swaggerData.info.contact.email = authorParts[2];
      }
      // Check if the auther specified an 'url'
      if (authorParts[3]) {
        _swaggerData.info.contact.url = authorParts[3];
      }
    }
  }
}

function addTag(annotation) {
  var tagName = annotation.data[0];
  var tagData = annotation.data[1];
  // Add the name
  tagData.name = tagName;

  // Check if we have a tag definition already
  if (_.findIndex(_swaggerData.tags, function(tag) {
    return tag.name === tagName;
  }) < 0) {
    _swaggerData.tags.push(tagData);
  }
}

function addParameter(annotation) {
  var paramName = annotation.data[0];
  var paramData = annotation.data[1];

  // Add the name (if one isn't already proviced)
  if (!paramData.name) {
    paramData.name = paramName;
  }

  // Check if we have a param definition already
  if (!_swaggerData.parameters[paramName]) {
    _swaggerData.parameters[paramName] = paramData;
  }
}

function addPath(annotation) {
  var operationId = annotation.operationId;
  var paramData = annotation.data[0];
  var routeMethod = _router[operationId].method.toLowerCase();
  var routePath = _router[operationId].path;
  var requestParams = [];
  var queryParams = paramData.queryParams || [];
  var bodyParams = paramData.bodyParams || [];
  var formParams = paramData.formParams || [];
  // Convert our path from Express params to curly braced
  routePath = routePath.split('/').map(function(pathPart) {
    if (pathPart[0] === ':') {
      requestParams.push(pathPart.substr(1));
      return '{' + pathPart.substr(1) + '}';
    } else {
      return pathPart;
    }
  }).join('/');

  // Add our path (if it doesn't already exist)
  if (!_swaggerData.paths[routePath]) {
    _swaggerData.paths[routePath] = {};
  }
  var pathRef = _swaggerData.paths[routePath][routeMethod] = {};
  pathRef.operationId = operationId;
  pathRef.parameters = [];
  // Check if we have any tags
  if (paramData.tags) {
    pathRef.tags = paramData.tags;
  }
  // Check if we have a description
  if (paramData.description) {
    pathRef.description = paramData.description;
  }
  // Check if we have a summary
  if (paramData.summary) {
    pathRef.summary = paramData.summary;
  }
  // Add our request params
  requestParams.forEach(function(requestParam) {
    pathRef.parameters.push({
      $ref: '#/parameters/' + requestParam
    });
  });
  // Add query params (if they exist)
  queryParams.forEach(function(queryParam) {
    if (typeof queryParam === 'string') {
      queryParam = {
        $ref: '#/parameters/' + queryParam
      };
    }
    pathRef.parameters.push(queryParam);
  });
  // Add body params (if they exist)
  bodyParams.forEach(function(bodyParam) {
    if (typeof bodyParam === 'string') {
      bodyParam = {
        $ref: '#/parameters/' + bodyParam
      };
    }
    pathRef.parameters.push(bodyParam);
  });
  // Add form params (if they exist)
  formParams.forEach(function(formParam) {
    if (typeof formParam === 'string') {
      formParam = {
        $ref: '#/parameters/' + formParam
      };
    }
    pathRef.parameters.push(formParam);
  });
  // Add our response(s)
  _.forOwn(paramData.responses, function(val, key) {
    paramData.responses[key] = {
      $ref: '#/responses/' + val
    };
  });
  // Add our formatted response(s)
  pathRef.responses = paramData.responses;

  // Mark this variable ready for garbage collection
  pathRef = null;
}

function addResponse(annotation) {
  var responseName = annotation.data[0];
  var responseData = annotation.data[1];

  // Check if we have response already
  if (!_swaggerData.responses[responseName]) {
    // Check if we have a 'custom' schema definition (String or Array)
    if (!_.isPlainObject(responseData.schema)) {
      if (_.isString(responseData.schema)) {
        responseData.schema = {
          $ref: '#/definitions/' + responseData.schema
        };
      } else if (_.isArray(responseData.schema)) {
        responseData.schema = {
          items: {
            $ref: '#/definitions/' + responseData.schema[0]
          },
          type: 'array'
        };
      }
    }

    // Add our response
    _swaggerData.responses[responseName] = responseData;
  }
}

function addDefinition(annotation) {
  var definitionName = annotation.data[0];
  var definitionData = annotation.data[1];

  // Check if we have a definition already
  if (!_swaggerData.definitions[definitionName]) {
    // Check if we have any properties
    if (definitionData.properties) {
      // Iterate over properties and check if we have any schema definitions
      _.forOwn(definitionData.properties, function(val, key) {
        // Check if we have a 'custom' schema definition (String or Array)
        if (val.schema && !_.isPlainObject(val.schema)) {
          if (_.isString(val.schema)) {
            definitionData.properties[key] = {
              $ref: '#/definitions/' + val.schema
            };
          } else if (_.isArray(val.schema)) {
            definitionData.properties[key] = {
              items: {
                $ref: '#/definitions/' + val.schema[0]
              },
              type: 'array'
            };
          }
        }
      });
    }

    // Add our definition
    _swaggerData.definitions[definitionName] = definitionData;
  }
}

module.exports = function(annotations, router) {
  // Set the reference to our incoming Express router
  _router = _.indexBy(helpers.extractRoutes(router), function(route) {
    return route.handler.name;
  });

  // Add info
  var cwd = process.cwd();
  var pkg = require(path.join(cwd, 'package.json'));
  addInfo(pkg);

  // Iterate over our annotations and convert them
  annotations.forEach(function(annotation) {
    switch (annotation.type) {
      case 'swaggerTag':
        addTag(annotation);
        break;
      case 'swaggerParameter':
        addParameter(annotation);
        break;
      case 'swaggerPath':
        addPath(annotation);
        break;
      case 'swaggerResponse':
        addResponse(annotation);
        break;
      case 'swaggerDefinition':
        addDefinition(annotation);
        break;
    }
  });

  return _swaggerData;
};
