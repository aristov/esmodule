import test from 'ava'
import { Assembler } from '../lib/assembler'

let undefined

const { getTargetOf } = Assembler

class Example extends Object {}

Example.prototype.foo = null
Example.prototype.bar = null

class ExampleAssembler extends Assembler {
    create(init) {
        if(init && init.constructor === Object && init.hasOwnProperty('target')) {
            this.setInstanceOf(init.target)
        }
        else super.create(init)
    }

    assign(init) {
        if(!init.hasOwnProperty('target')) {
            super.assign(init)
        }
    }

    set foo(foo) {
        getTargetOf(this).foo = foo
    }

    get foo() {
        return getTargetOf(this).foo
    }

    static get defaultPropertyName() {
        return 'foo'
    }

    static get interface() {
        return Example
    }
}

test('interface', t => {
    t.is(Assembler.interface, Object)
})

test('defaultPropertyName', t => {
    t.is(Assembler.defaultPropertyName, undefined)
})

test('create', t => {
    t.deepEqual(Assembler.create(), {})
})

test('getTargetOf', t => {
    const obj = {}
    t.is(Assembler.getTargetOf(obj), obj)
})

test('getInstanceOf', t => {
    t.is(Assembler.getInstanceOf({}), null)
})

test('new Assembler + getTargetOf + getInstanceOf', t => {
    const instance = new Assembler
    const target = Assembler.getTargetOf(instance)
    t.deepEqual(target, {})
    t.true(target instanceof Assembler.interface)
    t.is(Assembler.getInstanceOf(target), instance)
    t.is(Assembler.getInstanceOf(instance), instance)
})

test('setProperty(name, new String)', t => {
    const instance = new ExampleAssembler
    instance.setProperty('foo', '123')
    t.is(instance.foo, '123')
    t.is(getTargetOf(instance).foo, '123')
})

test('setProperty(name, undefined)', t => {
    const instance = new ExampleAssembler
    instance.setProperty('foo', undefined)
    t.is(instance.foo, null)
    t.is(getTargetOf(instance).foo, null)
})

test('setProperty(name, new String) -> setPropertyFallback', t => {
    const instance = new ExampleAssembler
    instance.setProperty('bar', '456')
    t.is(instance.bar, undefined)
    t.is(getTargetOf(instance).bar, '456')
})

test('setProperty(name, undefined) -> setPropertyFallback', t => {
    const instance = new ExampleAssembler
    instance.setProperty('bar', undefined)
    t.is(instance.bar, undefined)
    t.is(getTargetOf(instance).bar, null)
})

test('setProperty -> setPropertyFallback -> setPropertyMismatch', t => {
    const instance = new ExampleAssembler
    t.throws(() => instance.setProperty('wiz', '789'))
    t.throws(() => instance.setProperty('wiz', undefined))
})

test('Init by defined properties', t => {
    const instance = new ExampleAssembler
    const target = getTargetOf(instance)
    instance.init({
        foo : '123',
        bar : '456'
    })
    t.is(instance.foo, '123')
    t.is(target.foo, '123')
    t.is(instance.bar, undefined)
    t.is(target.bar, '456')
})

test('Init by not defined property', t => {
    t.throws(() => new ExampleAssembler({ wiz : '789' }))
    t.throws(() => new ExampleAssembler({ wiz : undefined }))
})

test('Init by the default property', t => {
    const instance = new ExampleAssembler
    instance.init('123')
    t.is(instance.foo, '123')
    t.is(getTargetOf(instance).foo, '123')
    t.deepEqual(getTargetOf(new Assembler('will be ignored')), {})
})

test('Init by explicit target setting', t => {
    const target = new Example
    const instance = new ExampleAssembler({ target })
    t.is(getTargetOf(instance), target)
    t.throws(() => new ExampleAssembler({ target : 'wrong' }))
})
