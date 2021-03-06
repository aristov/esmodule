import test from 'ava'
import { Assembler } from '../lib/Assembler'

let undefined

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
        return Assembler.getTargetOf(this)
    }

    static get valuePropertyName() {
        return 'foo'
    }

    static get interface() {
        return Example
    }
}

ExampleAssembler.register()

test('register', t => {
    t.is(Assembler.Assembler, Assembler)
    t.is(Assembler.ExampleAssembler, ExampleAssembler)
})

test('interface', t => {
    t.is(Assembler.interface, Object)
})

test('valuePropertyName', t => {
    t.is(Assembler.valuePropertyName, 'value')
})

test('create', t => {
    t.deepEqual(Assembler.create(), {})
})

test('getTargetOf', t => {
    const obj = {}
    t.is(Assembler.getTargetOf(obj), null)
})

test('getInstanceOf', t => {
    t.true(Assembler.getInstanceOf({}) instanceof Assembler)
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
    t.is(instance.bar, '456')
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
    instance.setProperty('wiz', '789')
    instance.setProperty('bar', undefined)
    t.is(instance.wiz, '789')
    t.is(instance.bar, undefined)
})

test('Init by plain object', t => {
    const value = { a : '123' }
    const instance = new Assembler(value)
    t.is(instance.__init, value)
})

test('Assign filtered property', t => {
    const instance = new ExampleAssembler({ nom : '777' })
    t.is(instance.nom, undefined)
    t.is(instance.target.nom, undefined)
})

test('Init by defined properties', t => {
    const instance = new ExampleAssembler({
        foo : '123',
        bar : '456'
    })
    t.is(instance.foo, '123')
    t.is(instance.target.foo, '123')
    t.is(instance.bar, '456')
    t.is(instance.target.bar, '456')
})

test('Init by property defined on target', t => {
    const instance = new ExampleAssembler({ bar : '789' })
    instance.bar = '123'
    t.is(instance.bar, '123')
    t.is(instance.target.bar, '123')
})

test('Init by not defined property', t => {
    const instance = new ExampleAssembler({
        wiz : '789',
        bar : undefined
    })
    t.is(instance.wiz, '789')
    t.is(instance.bar, undefined)
})

test('Init by value property', t => {
    const instance = new Assembler('qwerty')
    const target = Assembler.getTargetOf(instance)
    t.is(instance.value, 'qwerty')
    t.is(target.value, undefined)
    t.deepEqual(Assembler.getTargetOf(instance), {})
})

test('Init by redefined value property', t => {
    const instance = new ExampleAssembler('123')
    t.is(instance.foo, '123')
    t.is(instance.target.foo, '123')
})

test('Init by explicit target setting', t => {
    const target = new Example
    const instance = new ExampleAssembler({ target })
    t.is(instance.target, target)
    t.throws(() => new ExampleAssembler({ target : 'wrong' }))
})
