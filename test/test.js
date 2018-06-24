import test from 'ava'
import { Assembler } from '../lib/assembler'

let undefined

const { getTargetOf } = Assembler

class Example extends Object {}

Example.prototype.foo = null
Example.prototype.bar = null

class ExampleAssembler extends Assembler {
    setPropertyFilter(name) {
        return super.setPropertyFilter(name) && name !== 'nom'
    }

    set foo(foo) {
        this.target.foo = foo
    }

    get foo() {
        return this.target.foo
    }

    get target() {
        return getTargetOf(this)
    }

    static get defaultPropertyName() {
        return 'foo'
    }

    static get targetPropertyName() {
        return 'target'
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
    t.is(Assembler.getTargetOf(obj), null)
})

test('getInstanceOf', t => {
    t.is(Assembler.getInstanceOf({}), null)
})

test('new Assembler + getTargetOf + getInstanceOf', t => {
    const instance = new Assembler
    const target = Assembler.getTargetOf(instance)
    t.deepEqual(target, {})
    t.true(target instanceof Assembler.interface)
    t.is(Assembler.getTargetOf(target), target)
    t.is(Assembler.getInstanceOf(target), instance)
    t.is(Assembler.getInstanceOf(instance), instance)
})

test('setProperty(name, new String)', t => {
    const instance = new ExampleAssembler
    instance.setProperty('foo', '123')
    t.is(instance.foo, '123')
    t.is(instance.target.foo, '123')
})

test('setProperty(name, undefined)', t => {
    const instance = new ExampleAssembler
    instance.setProperty('foo', undefined)
    t.is(instance.foo, null)
    t.is(instance.target.foo, null)
})

test('setProperty(name, new String) -> setPropertyFallback', t => {
    const instance = new ExampleAssembler
    instance.setProperty('bar', '456')
    t.is(instance.bar, undefined)
    t.is(instance.target.bar, '456')
})

test('setProperty(name, undefined) -> setPropertyFallback', t => {
    const instance = new ExampleAssembler
    instance.setProperty('bar', undefined)
    t.is(instance.bar, undefined)
    t.is(instance.target.bar, null)
})

test('setProperty -> setPropertyFallback -> setPropertyMismatch', t => {
    const instance = new ExampleAssembler
    t.throws(() => instance.setProperty('wiz', '789'))
    t.throws(() => instance.setProperty('wiz', undefined))
})

test('Assign filtered property', t => {
    const instance = new ExampleAssembler
    instance.assign({ nom : '777' })
    t.is(instance.nom, undefined)
    t.is(instance.target.nom, undefined)
})

test('Init by defined properties', t => {
    const instance = new ExampleAssembler
    instance.init({
        foo : '123',
        bar : '456'
    })
    t.is(instance.foo, '123')
    t.is(instance.target.foo, '123')
    t.is(instance.bar, undefined)
    t.is(instance.target.bar, '456')
})

test('Init by not defined property', t => {
    t.throws(() => new ExampleAssembler({ wiz : '789' }))
    t.throws(() => new ExampleAssembler({ wiz : undefined }))
})

test('Init by the default property', t => {
    const instance = new ExampleAssembler
    instance.init('123')
    t.is(instance.foo, '123')
    t.is(instance.target.foo, '123')
    t.deepEqual(getTargetOf(new Assembler('will be ignored')), {})
})

test('Init by explicit target setting', t => {
    const target = new Example
    const instance = new ExampleAssembler({ target })
    t.is(instance.target, target)
    t.throws(() => new ExampleAssembler({ target : 'wrong' }))
})
