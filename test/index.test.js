"use strict";
const chai = require('chai');
const _ = require('lodash');
const expect = chai.expect;
const mockitman = require('../index');

const os = require('os');
const http = require('http');
const buffer = require('buffer');

describe ('Mock a service', function(){
    beforeEach(function(){
        mockitman.restoreAll();
    });
    it( 'Mocks an instantiated object and single method', function(){
        mockitman.mock('buffer.Buffer','toJSON', () => {return {type: 'Buffer', data: [ 50, 51, 52 ] }});
        const buff = new buffer.Buffer('abc');
        expect(buff.toJSON()).to.deep.equal({ type: 'Buffer', data: [ 50, 51, 52 ] });
    });
    it( 'Mocks an instantiated object and multiple methods', function(){
        mockitman.mock('buffer.Buffer','toJSON', () => {return {type: 'Buffer', data: [ 20, 21, 22 ] }});
        mockitman.mock('buffer.Buffer','toString', () => {return 'xyz'});
        const buff = new buffer.Buffer('abc');
        expect(buff.toJSON()).to.deep.equal({ type: 'Buffer', data: [  20, 21, 22 ] });
        expect(buff.toString()).to.equal('xyz');
    });
    it( 'Mocks multiple instantiated objects and multiple methods', function(){
        mockitman.mock('buffer.Buffer','toJSON', () => {return {type: 'Buffer', data: [ 0, 1, 2 ] }});
        mockitman.mock('buffer.Buffer','toString', () => {return 'js6'});
        const buff = new buffer.Buffer('k2c');
        const buff_2 = new buffer.Buffer("0nq");
        expect(buff.toJSON()).to.deep.equal({ type: 'Buffer', data: [  0, 1, 2 ] });
        expect(buff.toString()).to.equal('js6');
        expect(buff_2.toJSON()).to.deep.equal({ type: 'Buffer', data: [  0, 1, 2 ] });
        expect(buff_2.toString()).to.equal('js6');
    });
    it( 'Mocks an instantiated object that changes', function(){
        mockitman.mock('buffer.Buffer','toJSON', () => {return {type: 'Buffer', data: [ 5, 5, 9 ] }});
        let buff = new buffer.Buffer('lbo');
        expect(buff.toJSON()).to.deep.equal({ type: 'Buffer', data: [  5, 5, 9 ] });
       
        buff = new buffer.Buffer('apn');
        expect(buff.toJSON()).to.deep.equal({ type: 'Buffer', data: [  5, 5, 9 ] });
    });
    it( 'Mocks an instantiated object and adds extra mock later', function(){
        mockitman.mock('buffer.Buffer','toJSON', () => {return {type: 'Buffer', data: [ 14, 51, 99 ] }});
        let buff = new buffer.Buffer('uwm');
        expect(buff.toJSON()).to.deep.equal({ type: 'Buffer', data: [  14, 51, 99 ] });
        expect(buff.toString()).to.equal('uwm');
        
        mockitman.mock('buffer.Buffer','toString', () => {return 'the'});
        expect(buff.toJSON()).to.deep.equal({ type: 'Buffer', data: [  14, 51, 99 ] });
        expect(buff.toString()).to.equal('the');
    });
    it( 'Mocks an instantiated object and tests method restoration', function(){
        mockitman.mock('buffer.Buffer','toJSON', () => {return {type: 'Buffer', data: [ 89, 12, 105 ] }});
        const buff = new buffer.Buffer('pdb');
        const buff_2 = new buffer.Buffer('bsx');
        const buff_3 = new buffer.Buffer('sje');
        expect(buff.toJSON()).to.deep.equal({ type: 'Buffer', data: [  89, 12, 105  ] });
        expect(buff_2.toJSON()).to.deep.equal({ type: 'Buffer', data: [  89, 12, 105  ] });
        expect(buff_3.toJSON()).to.deep.equal({ type: 'Buffer', data: [  89, 12, 105  ] });
        
        mockitman.restoreMethod('buffer.Buffer','toJSON');
        expect(buff.toJSON()).to.deep.equal({ type: 'Buffer', data: [  112, 100, 98  ] });
        expect(buff_2.toJSON()).to.deep.equal({ type: 'Buffer', data: [  98, 115, 120  ] });
        expect(buff_3.toJSON()).to.deep.equal({ type: 'Buffer', data: [  115, 106, 101  ] })
    });
    it( 'Mocks an instantiated object and tests service restoration', function(){
        mockitman.mock('buffer.Buffer','toJSON', () => {return {type: 'Buffer', data: [ 89, 12, 105 ] }});
        const buff = new buffer.Buffer('dnf');
        const buff_2 = new buffer.Buffer('wva');
        const buff_3 = new buffer.Buffer('yfv');
        expect(buff.toJSON()).to.deep.equal({ type: 'Buffer', data: [  89, 12, 105  ] });
        expect(buff_2.toJSON()).to.deep.equal({ type: 'Buffer', data: [  89, 12, 105  ] });
        expect(buff_3.toJSON()).to.deep.equal({ type: 'Buffer', data: [  89, 12, 105  ] });
        
        mockitman.restoreService('buffer.Buffer');
        expect(buff.toJSON()).to.deep.equal({ type: 'Buffer', data: [  100, 110, 102  ] });
        expect(buff_2.toJSON()).to.deep.equal({ type: 'Buffer', data: [  119, 118, 97  ] });
        expect(buff_3.toJSON()).to.deep.equal({ type: 'Buffer', data: [  121, 102, 118  ] })
    });
    it( 'Mocks an instantiated object and tests mocking of an already mocked method', function(){
        mockitman.mock('buffer.Buffer','toJSON', () => {return {type: 'Buffer', data: [ 89, 12, 105 ] }});
        const buff = new buffer.Buffer('dnf');
        expect(buff.toJSON()).to.deep.equal({ type: 'Buffer', data: [  89, 12, 105  ] });
        
        mockitman.mock('buffer.Buffer','toJSON', () => {return {type: 'Buffer', data: [ 1, 10, 100 ] }});
        expect(buff.toJSON()).to.deep.equal({ type: 'Buffer', data: [  1, 10, 100  ] });
    });
    it( 'Tries to restore a non-mocked method', function(){
        mockitman.mock('buffer.Buffer','toJSON', () => {return {type: 'Buffer', data: [ 89, 12, 105 ] }});
        const buff = new buffer.Buffer('dnf');
        expect(buff.toJSON()).to.deep.equal({ type: 'Buffer', data: [  89, 12, 105  ] });
        try{
            mockitman.restoreMethod('buffer.Buffer','toString');
        }catch(err){
            expect(err.message).to.equal(`Method 'toString' for service 'buffer.Buffer' is not mocked`);
        }        
    });
    it( 'Tries to restore a method of a non-mocked service', function(){
        try{
            mockitman.restoreMethod('buffer.Buffer','toString');
        }catch(err){
            expect(err.message).to.equal(`Service 'buffer.Buffer' is not mocked`);
        }        
    });
    it( 'Tries to restore a non-mocked service', function(){
        try {
            mockitman.restoreService('buffer.Buffer');
        }catch (err){
            expect(err.message).to.equal(`Service 'buffer.Buffer' is not mocked`);
        }
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
        try{
            mockitman.restoreMethod('os', 'woop');
        }catch(err){
            expect(err.message).to.equal(`Method 'woop' for service 'os' is not mocked`);
        }
    });
    it ('Restores all mocked methods for a service', function(){
        mockitman.mock('os', 'arch', () => 'x128');
        mockitman.mock('os', 'freemem', () => '12345');
        expect(mockitman.mocksForService('os')).to.deep.equal(['arch', 'freemem']);
        expect(os.arch()).to.equal('x128');

        mockitman.restoreService('os');
        expect(mockitman.mocksForService('os')).to.be.undefined;
        expect(os.arch()).to.equal(process.arch);
    });
    it ('Tries to restore a non-registered service ', function(){
        try{
            mockitman.restoreService('os')
        }catch(err){
             expect(err.message).to.equal(`Service 'os' is not mocked`);
        }finally{
            expect(os.arch()).to.equal(process.arch);
        }       
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
        // Fix this double mock
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
    it('Tries to mock a property instead of an object (service))', function(){
        try{
            mockitman.mock('buffer.INSPECT_MAX_BYTES','abc', () => 123);
        }catch(err){
            expect(err instanceof TypeError).to.be.true;
            expect(err.message).to.equal(`The service 'buffer.INSPECT_MAX_BYTES' is not mockable`);
        }
    });
    it('Tries to mock a property instead of an method', function(){
        try{
            mockitman.mock('buffer.Buffer','length', () => 123);
            const buff = new buffer.Buffer('dnf');
        } catch (exp){
            expect(exp instanceof TypeError).to.be.true;
        }
    });
});