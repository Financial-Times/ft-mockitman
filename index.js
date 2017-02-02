"use strict";
/**
 * Generic mocking library that is a wrapper around sinon. It can:
 * - Mock methods for a service
 * - Restore mocked methods
 * - Handle synchronous methods
 * - Asynchronous methods
 * - Mock singleton objects
 * - Mock instance objects
 */
const sinon = require('sinon');
const traverse = require('traverse');
const services = {};
    // TODO For future?? -  handle > 2 nested objects
    // TODO For future?? - handle nested singleton objects
// Public functions
/**
 * Mocks a method of a service with a replacement
 * @param {String} service - The name of the service to mock (module name)
 * @param {String} method - The name of the method to mock
 * @param {String} replace - The the mock method to replace the actual with
 */
function mock(service, method, replace){
    if(!services[service]){
        _setupService(service, method, replace)
    }else{
        _mockMethodForService(service, method, replace);
    }
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
 * @returns {Boolean} - If method restored
 * @throws {Error} - If service or method cannot be found
 */
function restoreMethod(service, method){
    if(!services[service]) throw new Error(`Service '${service}' is not mocked`);
    if(!traverse(services[service].methodMocks).has([method])) throw new Error(`Method '${method}' for service '${service}' is not mocked`);
    for(let s in services[service].methodMocks[method].stubs ){
        services[service].methodMocks[method].stubs[s].restore();
    }
    services[service].methodMocks[method].stubs = [];
    delete services[service].methodMocks[method].replacement;
    delete services[service].methodMocks[method].stub;
    delete services[service].methodMocks[method];
    return true;
}
/**
 * Unmocks all methods for a service
 * @param {String} service - The service to restore
 * @returns {Boolean} - True if the service is  registered
 * @throws {Error} - If service cannot be found
 */
function restoreService(service){
    if(!services[service]) throw new Error(`Service '${service}' is not mocked`);
    const methodMocks = services[service].methodMocks;
    for(let mocked in methodMocks){
        restoreMethod(service, mocked);
    }
    if(services[service].instance){
        services[service].stub.restore();
        services[service].instance.clients = [];
        delete services[service].instance.clients;
        delete services[service].instance.class;
        delete services[service].instance;
        delete services[service].stub;
    }
    delete services[service].methodMocks;
    delete services[service].module;
    delete services[service];
    return true;
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
 * Registers a method for mocking. If the method is already mocked, 
 * it is restored and reregistered
 * @param {String} service - The object to mock methods for (singleton or instance)
 * @param {String} method - The method to mock
 * @param {Function} replace - The replacement (mock) method
 */
function _registerMethod(service, method, replace){
    // If a method is already mocked, remove it and replace
    if(!mocksForService(service).indexOf(method)){
        restoreMethod(service, method);
    }
    services[service].methodMocks[method] = {};
    services[service].methodMocks[method].stubs = [];
    services[service].methodMocks[method].replacement = replace;
}
/**
 * Mocks a method for a service (replaces it with supplied)
 * @param {Object} client - The object to mock methods for (singleton or instance)
 * @param {String} method - The method to mock
 * @param {Function} replace - The replacement (mock) method
 * @returns {Object} - The method stub
 */
function _mockMethod(client, method, replace){
    const methodStub = sinon.stub(client, method, function() {
        // THIS FUNCTION HERE IS ONLY CALLED WHEN METHOD CALLED
        const args = Array.prototype.slice.call(arguments);
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
    return methodStub;
}
/**
 * Mocks a method for mocked services (singleton or instances)
 * @param {String} service - The service to mock the method for
 * @param {String} method - The method to mock
 * @param {Function} replace - The replacement (mock) method
 */
function _mockMethodForService(service, method, replace) {
    _registerMethod(service, method, replace);
    if(services[service].instance){
        for(let c of services[service].instance.clients){
            if(!traverse(c).has([method])){
                services[service].methodMocks[method].stubs.push(_mockMethod(c,method,replace));
            }
        }
    }else{
        services[service].methodMocks[method].stubs.push(_mockMethod(services[service].module,method,replace));
    }       
};
/**
 * Sets up a service (singleton or instance) for mocks. It mocks out instance
 * and then does method mocking for methods registered
 * @param {String} service - The service to mock the method for
 * @param {String} method - The method to mock
 * @param {Function} replace - The replacement (mock) method
 */
function _setupService(service, method, replace){
    const _servicePath = service.split('.');
    const _btmService = _servicePath[_servicePath.length -1];
    const _rootService = _servicePath.shift();
    const _module = require(_rootService);
    const _serviceType = typeof traverse(_module).get(_servicePath);
    const _moduleType = typeof _module;
    if(_serviceType !== 'function' && _serviceType !== 'object'){
        throw new TypeError(`The service '${service}' is not mockable`);
    }
    services[service] = {};
    services[service].module = _module;
    services[service].methodMocks = {};
    _registerMethod(service, method, replace);
    if(_serviceType === 'function'){
        const toStub = (_moduleType === 'function')? 'constructor' : _btmService;
        services[service].instance = {};
        services[service].instance.clients = [];
        services[service].instance.class = traverse(_module).get(_servicePath);
        services[service].stub = sinon.stub(_module, toStub, function(args){
            // THIS FUNCTION HERE IS ONLY CALLED WHEN INSTNATIATED
            const client = new services[service].instance.class(args);
            services[service].instance.clients.push(client);
            for(let m in services[service].methodMocks){
                const methodStub = _mockMethod(client, m, services[service].methodMocks[m].replacement); // Now service is mocked, mock method
                services[service].methodMocks[m].stubs.push(methodStub)
            }
            return client;
        });
    }else{
        for(let m in services[service].methodMocks){
            const methodStub = _mockMethod(_module, m, services[service].methodMocks[m].replacement); // Now mock not required, mock method
            services[service].methodMocks[m].stubs.push(methodStub);
        }
    }
}

// Exporting object as singleton
module.exports = {
    mock: mock,
    serviceList: serviceList,
    mocksForService: mocksForService,
    restoreMethod: restoreMethod,
    restoreService: restoreService,
    restoreAll: restoreAll
};