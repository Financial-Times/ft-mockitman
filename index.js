"use strict";
/**
 * Generic mocking library that is a wrapper around sinon. It can:
 * - Mock methods for a service
 * - Restore mocked methods
 * - Handle synchronous methods
 * - Asynchronous methods
 */

const sinon = require('sinon');

const services = {};

// Public functions

/**
 * Mocks a method of a service with a replacement
 * @param {String} service - The name of the service to mock (module name)
 * @param {String} method - The name of the method to mock
 * @param {String} replace - The the mock method to replace the actual with
 */
function mock(service, method, replace){
    if(!services[service]){
        services[service] = {};
        services[service].actual = require(service);
        services[service].methodMocks = {};
    }
        mockMethod(service, method, replace);
}
/**
 * Gets a list of mocked services
 * @returns {Array} - Array of strings (list of services)
 */
function serviceList(){
    return Object.keys(services);
}
/**
 * Get a list of mock methods for a service
 * @param {String} service - The name of the service
 * @returns {Array} - An array of mocked method names, or undefined if service not registered 
 */
function mocksForService(service){
    if(!services[service]) return undefined;
    return Object.keys(services[service].methodMocks);
}
/**
 * Unmocks a method for a service
 * @param {String} service - The service
 * @param {String} method - The method to restore
 * @returns {undefined} - If method or service cannot be found
 */
function restoreMethod(service, method){
    if(!services[service].methodMocks[method]) return undefined;
    services[service].methodMocks[method].restore();
    delete services[service].methodMocks[method];
}
/**
 * Unmocks all methods for a service
 * @param {String} service - The service to restore
 * @returns {undefined} - If the service is not registered
 */
function restoreService(service){
    if(!services[service]) return undefined;
    const methodMocks = services[service].methodMocks;
    for(let mocked in methodMocks){
        restoreMethod(service, mocked);
    }
    delete services[service].methodMocks;
    delete services[service].actual;
    delete services[service];
}
/**
 * Unmocks everything registered/mocked
 */
function restoreAll(){
    for(let service in services){
        restoreService(service);
    }
}
// Private functions

/**
 * Mocks a method for a service (replaces it with supplied)
 * @param {String} service - The service to mock methods for
 * @param {String} method - The method to mock
 * @param {Function} replace - The replacement (mock) method
 */
function mockMethod(service, method, replace) {
    // If a method is already mocked, the old mock will removed
    if(services[service].methodMocks[method]){
        restoreMethod(service, method);
    }
    // Create mock of method. If method cannot be mocked, error is thrown
    const methodStub = sinon.stub(services[service].actual, method, function() {
        const args = Array.prototype.slice.call(arguments);
        // If there are no arguments for the mock, just call the replacement method
        if(!args.length) {
            return replace();
        }else{
            let userArgs, userCallback;   
            if(typeof(args[0]) === 'function'){
                userArgs = (args.length > 1)? args.slice(1, args.length) : undefined;
                userCallback = args[0];
                return (userArgs)? replace(userCallback, userArgs) : replace(userCallback); 
            } else if (typeof(args[args.length - 1]) === 'function') {
                userArgs = args.slice(0, -1);
                userCallback = args[(args.length) - 1];
                return replace(userArgs, userCallback); 
            } else {
                userArgs = args;
                return replace(userArgs, userCallback);
            }
        }
    });
    services[service].methodMocks[method] = methodStub;   
};

// Exporting object as singleton
module.exports = {
    mock: mock,
    serviceList: serviceList,
    mocksForService: mocksForService,
    restoreMethod: restoreMethod,
    restoreService: restoreService,
    restoreAll: restoreAll
};