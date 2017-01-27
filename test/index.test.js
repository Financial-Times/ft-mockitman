"use strict";
const chai = require('chai');
const _ = require('lodash');
const expect = chai.expect;
const mockitman = require('../index');

const os = require('os');
const http = require('http');

describe ('Mock a service', function(){
    beforeEach(function(){
        mockitman.restoreAll();
    });
    it ('Returns a list of mocks for a service', function(){
        mockitman.mock('os', 'arch', () => 'x128');
        mockitman.mock('os', 'freemem', () => '12345');
        expect(mockitman.mocksForService('os')).to.deep.equal(['arch', 'freemem']);
        expect(mockitman.mocksForService('abc')).to.equal(undefined);
        
    });
    it ('Returns a list of services registered for mocking', function(){
        mockitman.mock('os', 'cpus', () => 4);
        expect(mockitman.serviceList()).to.deep.equal(['os']);
    });
    it ('Remove/Restore a mocked method', function(){
        mockitman.mock('os', 'arch', () => 'x128');
        expect(os.arch()).to.equal('x128');        
        expect(mockitman.mocksForService('os')).to.deep.equal(['arch']);
        
        mockitman.restoreMethod('os', 'arch');
        expect(mockitman.mocksForService('os')).to.be.empty;
        expect(os.arch()).to.equal(process.arch);
        expect(mockitman.restoreMethod('os', 'woop')).to.equal(undefined);
    });
    it ('Restores all mocked methods for a service', function(){
        mockitman.mock('os', 'arch', () => 'x128');
        mockitman.mock('os', 'freemem', () => '12345');
        expect(mockitman.mocksForService('os')).to.deep.equal(['arch', 'freemem']);
        expect(os.arch()).to.equal('x128');

        mockitman.restoreService('os');
        expect(mockitman.mocksForService('os')).to.be.empty;
        expect(os.arch()).to.equal(process.arch);
    });
    it ('Returns undefined if service is not registered when trying to restore it', function(){
        expect(mockitman.restoreService('os')).to.equal(undefined);
        expect(os.arch()).to.equal(process.arch);
    });
    it ('Restores all services', function(){
        mockitman.mock('os', 'arch', () => 'x128');
        mockitman.mock('os', 'freemem', () => '12345');
        expect(mockitman.mocksForService('os')).to.deep.equal(['arch', 'freemem']);
        expect(os.arch()).to.equal('x128');
        
        mockitman.restoreAll();
        expect(mockitman.serviceList()).to.be.empty;
        expect(os.arch()).to.equal(process.arch);
    });
    it ('Mock the same method twice', function(){
        mockitman.mock('os', 'arch', () => "x128");
        mockitman.mock('os', 'arch', () => "x256");
        expect(os.arch()).to.equal('x256');
    });
    it ('Returns undefined if method cannot be mocked (not real method)', function(){
        try{
            mockitman.mock('os','badMethod', () => 'value');
        } catch (exp){
            expect(exp instanceof TypeError).to.be.true;
        }
    });
    it('Mock out a synchronous method with no args', function(){
        mockitman.mock('os', 'arch', () => "x128");
        expect(os.arch()).to.equal('x128');
        expect(mockitman.serviceList()).to.deep.equal(['os']);
    });
    it('Mock out a synchronous method with args', function(){
        mockitman.mock('os', 'arch', (muliplyer) => `x${2 * muliplyer}`);
        expect(os.arch(16)).to.equal('x32');
        expect(mockitman.serviceList()).to.deep.equal(['os']);
    });
    it('Mock out an asynchronus method - args, callback', function(done){
        mockitman.mock('http','get',(params, callback) => {
            if(callback) callback(params);
        });
        http.get({hostname:'www.google.co.uk', port:80, path:'/', agent: false},(res)=>{
            expect(res).to.deep.equal([{ hostname: 'www.google.co.uk', port: 80, path: '/', agent: false } ]);
            done();
        });
    });
    it('Mock out an asynchronus method - callback, args', function(done){
        mockitman.mock('http','get',(callback, params) => {
            if(callback) callback(params);
        });
        http.get((res)=>{
            expect(res).to.deep.equal([{ hostname: 'www.google.co.uk', port: 80, path: '/', agent: false } ]);
            done();
        },{hostname:'www.google.co.uk', port:80, path:'/', agent: false});
    });
    it('Mock out an asynchronus method - callback', function(done){
        mockitman.mock('http','get',(callback) => {
            if(callback) callback(typeof callback);
        });
        http.get((res)=>{
            expect(res).to.equal("function");
            done();
        });
    });
});