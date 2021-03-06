'use strict';

var expect = chai.expect;

describe('Model module', function() {
  beforeEach(function() {
    this.triggerSpy = sinon.spy(champ.events, 'trigger');

    this.TestModel = champ.Model.extend('TestModel', {
      properties: {
        testProp: 'test'
      }
    });

    this.model = new this.TestModel({ id: 'testModel' });
  });

  afterEach(function() {
    this.triggerSpy.restore();
    champ.ioc.reset();
  });

  describe('new Model(id, options)', function() {
    it('Creates a new instance of a model', function() {
      expect(this.model).to.be.instanceof(champ.Module);
      expect(this.model.id).to.equal('testModel');

      this.model.property('testProp', 'new value');
      expect(this.model.property('testProp')).to.equal('new value');
    });

    it('Creates a new instance of a model and sets the properties property', function() {
      expect(this.model.properties.testProp).to.equal('test');
    });
  });

  describe('property(prop, val, silent)', function() {
    it('Returns the property when only the property name is given', function() {
      expect(this.model.property('testProp')).to.equal('test');
    });

    it('Sets the property when the property name, and a value is given', function() {
      this.model.property('testProp', 'new test value');
      expect(this.model.property('testProp')).to.equal('new test value');
    });

    it('Triggers an event when a property is set', function() {
      this.model.property('testProp', 'new test value');

      expect(this.triggerSpy).to.be.calledWithExactly('TestModel:changed', {
        property: 'testProp',
        value: 'new test value'
      });
    });

    it('Doesn\'t trigger an event when slient is set to true', function() {
      this.model.property('testProp', 'new test value', true);
      expect(this.model.property('testProp')).to.equal('new test value');
      expect(this.triggerSpy).to.not.be.called;
    });

    it('Throws an error when trying to access a property that doesn\'t exist', function() {
      var self = this;
      expect(function() {
        self.model.property('doesntExist');
      }).to.throw('Property doesn\'t exist');
    });

    it('Creates a new property when a property that doesn\'t exist is passed with a value', function() {
      this.model.property('newProp', 'new value');

      expect(this.model.property('newProp')).to.equal('new value');
      expect(this.triggerSpy).to.be.calledWithExactly('TestModel:changed', {
        property: 'newProp',
        value: 'new value'
      });
    });

    it('Creates a new property when a property that doesn\'t exist is passed with a value but doesn\'t trigger an event', function() {
      this.model.property('newProp', 'new value', true);
      expect(this.model.property('newProp')).to.equal('new value');
      expect(this.triggerSpy).to.not.be.called;
    });

    it('Sets multiple properties when the property key is an object literal', function() {
      this.model.property({ 'testProp': 'new value', 'newProp': 'also new value' });

      expect(this.model.property('testProp')).to.equal('new value');
      expect(this.model.property('newProp')).to.equal('also new value');

      expect(this.triggerSpy).to.be.calledTwice;
      expect(this.triggerSpy).to.be.calledWithExactly('TestModel:changed', {
        property: 'testProp',
        value: 'new value'
      });

      expect(this.triggerSpy).to.be.calledWithExactly('TestModel:changed', {
        property: 'newProp',
        value: 'also new value'
      });
    });

    it('Sets multiple properties when the property key is an object literal but doesn\'t trigger an event', function() {
      this.model.property({ 'newProp': 'changed again' }, true);
      expect(this.model.property('newProp')).to.equal('changed again');
      expect(this.triggerSpy).to.not.be.called;
    });
  });

  describe('reset()', function() {
    it('Set the models properties back to their original values', function() {
      this.model.property({ 'testProp': 'a', 'newProp': 'b' });
      this.model.reset();
      
      expect(this.model.property('testProp')).to.equal('test');
      expect(function() { this.model.property('newProp') }.bind(this)).to.throw('Property doesn\'t exist');
      
      this.model.property('testProp', 'z');
      this.model.reset();

      expect(this.model.property('testProp')).to.equal('test');
    });
  });
});