"use strict";
const sinon = require('sinon');
const traverse = require('traverse');

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
 * @returns {Array} Array of strings (list of services)
 */
function serviceList(){
    return Object.keys(services);
}
function mocksForService(service){
    if(!services[service]) return undefined;
    return Object.keys(services[service].methodMocks);
}
function restoreMethod(service, method){
    if(!services[service].methodMocks[method]) return undefined;
    services[service].methodMocks[method].restore();
    delete services[service].methodMocks[method];
}
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
function restoreAll(){
    for(let service in services){
        restoreService(service);
    }
}
// Private functions
// TODO finish this for callbacks
/**
 * 
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
            if (typeof(args[args.length - 1]) === 'function') {
                userArgs = args.slice(0, -1);
                userCallback = args[(args.length) - 1];
            } else {
                userArgs = args;
            }
            //console.log('userArgs', userArgs);
            //console.log('userCallback', userCallback);
            return replace(userArgs, userCallback);
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