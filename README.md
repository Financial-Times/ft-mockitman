# Mockit Man
A generic mocking library for nodejs that is a wrapper of sinon
--
## Features
 * Mock methods for a service
 * Restore mocked methods
 * Handle synchronous methods
 * Handle asynchronous methods
 * Mock instance objects
 * Mock singleton objects
 * Remocking a function replaces the mock
 * Restoring a function restores the function for all instance objects of a service

## Requirements
* Node.js 4.3 or higher

## Usage
Include the package `ft-mockitman` in your dev-dependencies

General Usage in your test case
```javascript
const mockitman = require('mockitman'); // This is a singleton object
```

Mock a synchronous function ( singleton object/service )
```javascript
// service, function, replacement function 
mockitman.mock('os', 'arch', function(){return 'x128'});
console.log(os.arch()); // => x128

// Restore original function
mockitman.restoreMethod('os', 'arch');
console.log(os.arch()); // => x64
```

Mock a synchronous function ( instance object/service )
```javascript
// service, function, replacement function 
mockitman.mock('buffer.Buffer','toString', () => {return 'js6'});
const buff = new Buffer('abc');
console.log(buff.toString()); // => js6

// Restore original function
mockitman.restoreMethod('buffer.Buffer', 'toString');
console.log(buff.toString()); // => abc
```

Mock an asynchronous function
```javascript
// service, function, replacement function 
mockitman.mock('http', 'get', function(params, callback){
    callback({body:"A mocked response"});
});
const params = {hostname:'www.google.co.uk', port:80, path:'/', agent: false};
http.get(params, function(res){
    console.log(res.body); // => A mocked response
});

// Restore original function
mockitman.restoreMethod('http', 'get');
```

## Function listing
### mock ( service, function, replace )
* Mocks a function of a service with a replacement
* @param {String} service - The name of the service to mock (module name)
* @param {String} function - The name of the function to mock
* @param {String} replace - The the mock function to replace the actual with

### serviceList ()
* Gets a list of mocked services
* @returns {Array} - Array of strings (list of services)

### mocksForService ( service )
* Get a list of mock functions for a service
* @param {String} service - The name of the service
* @returns {Array} - An array of mocked function names, or undefined if service not registered 

### restoreMethod ( service, function )
* Unmocks a function for a service
* @param {String} service - The service
* @param {String} function - The function to restore
* @returns {Boolean} - If function restored
* @throws {Error} - If service or function cannot be found

### restoreService ( service )
* Unmocks all functions for a service
* @returns {Boolean} - True if the service is  registered
* @throws {Error} - If service cannot be found

### restoreAll ()
 * Unmocks everything registered/mocked

## Testing
You can run tests by runnning `npm run test`