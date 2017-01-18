"use strict";
const chai = require('chai');
const _ = require('lodash');
const expect = chai.expect;
const mockit = require('../index');

const os = require('os');
const http = require('http');

describe ('Mock a service', function(){
    beforeEach(function(){
        mockit.restoreAll();
    });
    it ('Returns a list of mocks for a service', function(){
        mockit.mock('os', 'arch', () => 'x128');
        mockit.mock('os', 'freemem', () => '12345');
        expect(mockit.mocksForService('os')).to.deep.equal(['arch', 'freemem']);
        expect(mockit.mocksForService('abc')).to.equal(undefined);
        
    });
    it ('Returns a list of services registered for mocking', function(){
        mockit.mock('os', 'cpus', () => 4);
        expect(mockit.serviceList()).to.deep.equal(['os']);
    });
    it ('Remove/Restore a mocked method', function(){
        mockit.mock('os', 'arch', () => 'x128');
        expect(os.arch()).to.equal('x128');        
        expect(mockit.mocksForService('os')).to.deep.equal(['arch']);
        
        mockit.restoreMethod('os', 'arch');
        expect(mockit.mocksForService('os')).to.be.empty;
        expect(os.arch()).to.equal(process.arch);
        expect(mockit.restoreMethod('os', 'woop')).to.equal(undefined);
    });
    it ('Restores all mocked methods for a service', function(){
        mockit.mock('os', 'arch', () => 'x128');
        mockit.mock('os', 'freemem', () => '12345');
        expect(mockit.mocksForService('os')).to.deep.equal(['arch', 'freemem']);
        expect(os.arch()).to.equal('x128');

        mockit.restoreService('os');
        expect(mockit.mocksForService('os')).to.be.empty;
        expect(os.arch()).to.equal(process.arch);
    });
    it ('Returns undefined if service is not registered when trying to restore it', function(){
        expect(mockit.restoreService('os')).to.equal(undefined);
        expect(os.arch()).to.equal(process.arch);
    });
    it ('Restores all services', function(){
        mockit.mock('os', 'arch', () => 'x128');
        mockit.mock('os', 'freemem', () => '12345');
        expect(mockit.mocksForService('os')).to.deep.equal(['arch', 'freemem']);
        expect(os.arch()).to.equal('x128');

        
        mockit.restoreAll();
        expect(mockit.serviceList()).to.be.empty;
        expect(os.arch()).to.equal(process.arch);
    });
    // it('Mock out a synchronous method with no args', function(){
    //     mockit.mock('os', 'arch', () => {
    //         return "x128";
    //     });
    //     expect(os.arch()).to.equal('x128');
    //     expect(mockit.serviceList()).to.deep.equal(['os']);
    //     expect(os.type().toLowerCase()).to.equal(process.platform); // Confirm no other methods affected
    // });
    // it('Mock out a synchronous method with args', function(){
    //     mockit.mock('os', 'arch', (muliplyer) => {
    //         return `x${2 * muliplyer}`;
    //     });
    //     expect(os.arch(16)).to.equal('x32');
    //     expect(mockit.serviceList()).to.deep.equal(['os']);
    //     expect(os.type().toLowerCase()).to.equal(process.platform); // Confirm no other methods affected
    // });
    // it('Mock out an asynchronus method', function(done){
    //     mockit.mock('http','get',(params, callback) => {
    //         callback("Worked");
    //     });
    //     http.get((res)=>{
    //         console.log(res);
    //         //expect(res).to.equal("Worked");
    //         done();
    //     }, {hostname:'www.google.co.uk', port:80, path:'/', agent: false});
    // });
});