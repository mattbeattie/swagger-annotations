# swagger-annotations

This module assumes an [Express Router](http://expressjs.com/en/api.html#router) has been used and the routes have been commented via @swaggerPath comment blocks. Additional comments, such as @swaggerTags, @swaggerDefintions, @swaggerResponses, etc., can be declared at the bottom of the JS file.

# Install

```
npm install https://github.com/outbrain/swagger-annotations.git --save-dev
```

# Usage

Specifying a 'dest' config option (will write a file to disk)
```javascript
var swaggerAnnotations = require('swagger-annotations');

swaggerAnnotations({
  metadata: {
    info: {
      version: "1.0.0"
    },
    host: "mycoolapi.example.com",
    basePath: "/api"
  },
  src: '/path/to/router/module',     
  dest: '/path/to/output/directory'
});
```

**NOT** specifying a 'dest' config option (most likely done when just the resulting JSON is cared about, i.e. to be returned via an API endpoint)
```javascript
var swaggerAnnotations = require('swagger-annotations');

var swaggerData = swaggerAnnotations({
  metadata: {
    info: {
      version: "1.0.0"
    },
    host: "mycoolapi.example.com",
    basePath: "/api"
  },
  src: '/path/to/router/module'
});

console.dir(typeof swaggerData); // "object"
```

## Options

* metadata - {object} Any data that you wish to specify on your generated Swagger document
    - metadata.swagger - {string} Specifies the Swagger Specification version being used. It can be used by the Swagger UI and other clients to interpret the API listing. **Default:** "2.0"
    - metadata.info - [{Info Object}](http://swagger.io/specification/#infoObject) Provides metadata about the API. The metadata can be used by the clients if needed.
        - metadata.info.title - {string} The title of the application. **Default:** value of "name" from the consumer's package.json
        - metadata.info.description - {string} A short description of the application. **Default:** value of "description" from the consumer's package.json
        - metadata.info.termsOfService - {string} The Terms of Service for the API.
        - metadata.info.contact - {object} The contact information for the exposed API. **Default:** value of "author" from the consumer's package.json
        - metadata.info.license - {object} The license information for the exposed API.
        - metadata.info.version - {string} Provides the version of the application API (not to be confused with the specification version).
    - metadata.host - {string} The host (name or ip) serving the API. This MUST be the host only and does not include the scheme nor sub-paths. It MAY include a port.
    - metadata.basePath - {string} The base path on which the API is served, which is relative to the host. If it is not included, the API is served directly under the host. The value MUST start with a leading slash (/).
    - metadata.schemes - {[string]} The transfer protocol of the API. Values MUST be from the list: "http", "https", "ws", "wss". If the schemes is not included, the default scheme to be used is the one used to access the Swagger definition itself. `Defaults to ["http"]`
    - metadata.consumes - {[string]} A list of MIME types the APIs can consume. This is global to all APIs but can be overridden on specific API calls. `Defaults to ["application/json"]`
    - metadata.produces - {[string]} A list of MIME types the APIs can produce. This is global to all APIs but can be overridden on specific API calls. `Defaults to ["application/json"]`
    - metadata.securityDefinitions - [{Security Definitions Object}](http://swagger.io/specification/#securityDefinitionsObject) Security scheme definitions that can be used across the specification.
    - metadata.security - [[{Security Requirement Object}](http://swagger.io/specification/#securityRequirementObject)] A declaration of which security schemes are applied for the API as a whole. The list of values describes alternative security schemes that can be used (that is, there is a logical OR between the security requirements). Individual operations can override this definition.
    - metadata.externalDocs - [{External Documentation Object}](http://swagger.io/specification/#externalDocumentationObject) Additional external documentation.

* src - {string} Absolute path to the module (Express Router) that is intended to be used for creating Swagger documentation. (REQUIRED)

* dest - {string} Absolute path to the directory to use for the Swagger document ouput. (OPTIONAL) If not specified, no file be written to disk.

* filename - {string} The filename to use for the output Swagger document. (OPTIONAL) **Default:** "swagger.json"


# Supported Annotations

All of the annotations below support the default Swagger specifications (and can be read further via the provided links). In addition, swagger-annotation specific properties will be listed and defined where applicable.

## @swaggerTag

The "name" of this tag will be the first argument passed to @swaggerTag. The second argument is an object of additional metadata to be used.

[Further Documentation](http://swagger.io/specification/#tagObject)

Example:

```javascript
/**
 * @swaggerTag("hello", {
 *   description: "Endpoints that deal with some form of saying `hello`"
 * })
 */
```

## @swaggerParameter

The "name" of this tag will be the first argument passed to @swaggerParameter. The second argument is an object of additional metadata to be used.

[Further Documentation](http://swagger.io/specification/#parameterObject)

Example:

```javascript
/**
 * @swaggerParameter("foo", {
 *   in: "query",
 *   description: "A test query parameter",
 *   type: "string"
 * })
 */
```

## @swaggerPath

[Further Documentation](http://swagger.io/specification/#pathItemObject)

The operation type (i.e. GET, POST, etc.) is automatically obtained from the Express router definition, so it doesn't need to be explicity declared. This also goes for the request parameters; swagger-annotations will look for a corresponding @swaggerParameter definition for each param in the request path (i.e. "id", as seen below). However, "queryParams", "bodyParams", and "formParams" should be defined as an array of param names (these would also need to correspond to defined @swaggerParameters).

Example:

```javascript
/**
 * @swaggerPath({
 *   description: "Say `hello world`",
 *   tags: [ "hello" ],
 *   queryParams: [ "foo" ],
 *   bodyParams: [ "baz" ],
 *   formParams: [ "myFile" ],
 *   responses: {
 *     200: "Success"
 *   }
 * })
 */
router.get('/hello/:id', function helloWorld(req, res, next) {
  res.send('hello ' + req.params.id);
});
```

## @swaggerDefinition

[Further Documentation](http://swagger.io/specification/#definitionsObject)

When it comes to defining properties there are currently three ways to go about doing so (all of which are shown below). The first one is straight forward and doesn't need any explanation. However, the second ("message") and third ("results") are custom to swagger-annotations. The "message" property leverages Swagger's ability to use a "schema" property. The only difference here is that the underlying $ref declaration isn't necessary and is handled by swagger-annotations. You would just specify the name of the @swaggerDefinition you'd like to use as the schema, in this case it's "SuccessMessage". The third example takes an array with a single @swaggerDefinition. This will trigger "swagger-annotations" to create an underling schema that is of type "array" and will handled the defining of its "items". Think of these last two ways as syntactic sugar.

```javascript
/**
 * @swaggerDefinition("SuccessDefinition", {
 *   type: "object",
 *   properties: {
 *     foo: {
 *        type: "string",
 *        description: "Some dummy property"
 *     }
 *     message: {
 *       schema: "SuccessMessage"
 *     },
 *     results: {
 *       schema: [ "SuccessResult" ]
 *     }
 *   }
 * })
 */
```

## @swaggerResponse

[Further Documentation](http://swagger.io/specification/#responsesDefinitionsObject)

As mentioned in the above documentation for @swaggerDefinition, there are three ways of going about defining a @swaggerResponse's schema. In order to not be redundant please reference the above explanation.

```javascript
/**
 * @swaggerResponse("Success", {
 *   description: "Success",
 *   schema: "SuccessDefinition"
 * })
 */
```

# License

MIT
