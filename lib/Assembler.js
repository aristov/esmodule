let undefined

const TARGET_PROPERTY_NAME = 'target'
const storage = new WeakMap
const key = Symbol()

/**
 * @summary Assembler is a simple class, which helps to assemble another JavaScript objects.
 */
export class Assembler {
    /**
     * Create and initialize target by specified initialing object
     * @param {*} [input={}]
     */
    constructor(input = {}) {
        const init = this.constructor.normalize(input)
        this.create(init)
        this.init(init)
    }

    /**
     * Create a target and associate it with an assembler instance
     * @param {{}} init
     */
    create(init) {
        const constructor = this.constructor
        const { targetPropertyName } = constructor
        if(init.hasOwnProperty(targetPropertyName)) {
            constructor.setTargetOf(this, init[targetPropertyName])
        }
        else constructor.setTargetOf(this, constructor.create(init))
    }

    /**
     * Initialize target by specified initializing object
     * @param {{}} init
     */
    init(init) {
        const { defaultPropertyName } = this.constructor
        if(defaultPropertyName !== undefined && init.hasOwnProperty(defaultPropertyName)) {
            this.setProperty(defaultPropertyName, init[defaultPropertyName])
        }
        for(const name in init) {
            if(init.hasOwnProperty(name) && this.setPropertyFilter(name)) {
                this.setProperty(name, init[name])
            }
        }
    }

    /**
     * Set a single property if it is in this and is not undefined or fallback otherwise
     * @param {string} name
     * @param {*} value
     */
    setProperty(name, value) {
        if(name in this) {
            if(value !== undefined) {
                this[name] = value
            }
        }
        else this.setPropertyFallback(name, value)
    }

    /**
     * Set a single property on target if it is in target and is not undefined or mismatch otherwise
     * @param {string} name
     * @param {*} value
     */
    setPropertyFallback(name, value) {
        const target = this[key]
        if(name in target) {
            if(value !== undefined) {
                target[name] = value
                this.defineAccessors(name)
            }
        }
        else this.setPropertyMismatch(name, value)
    }

    /**
     * @param {string} name
     */
    defineAccessors(name) {
        Object.defineProperty(this, name, {
            configurable : true,
            set(value) {
                Assembler.getTargetOf(this)[name] = value
            },
            get() {
                return Assembler.getTargetOf(this)[name]
            }
        })
    }

    /**
     * @param {string} name
     * @returns {boolean}
     */
    setPropertyFilter(name) {
        return !this.constructor.setPropertyStopList.includes(name)
    }

    /**
     * Handle a mismatched property assignment
     * @param {string} name
     * @param {string} value
     */
    setPropertyMismatch(name, value) {
        this[name] = value
    }

    /**
     * Create a target specified by interface
     * @param {{}} [init]
     * @returns {Object}
     */
    static create(init) {
        return new this.interface
    }

    /**
     * Get an instance of the target or the instance itself or new instance for this target if it has no one
     * @param {Assembler|Object|*} object
     * @returns {Assembler|*|null}
     */
    static getInstanceOf(object) {
        return object instanceof Assembler?
            object :
            storage.get(object) || new this({ [this.targetPropertyName] : object })
    }

    /**
     * Get a target of the instance or the target itself or null if it's not a target
     * @param {Assembler|Object|*} object
     * @returns {Object|*|null}
     */
    static getTargetOf(object) {
        return object instanceof Assembler?
            object[key] :
            storage.has(object)? object : null
    }

    /**
     * @param {*} input
     * @returns {{}}
     */
    static normalize(input) {
        if(input === null || input.constructor !== Object) {
            const { defaultPropertyName } = this
            input = defaultPropertyName === undefined?
                {} :
                { [defaultPropertyName] : input }
        }
        return input
    }

    /**
     * Link target and the assembler instance together
     * @param {Assembler|*} instance
     * @param {Object|*} target
     */
    static setTargetOf(instance, target) {
        instance[key] = target
        storage.set(target, instance)
    }

    /**
     * This property name is used for the `init.constructor !== Object` case
     * @returns {undefined|string}
     * @abstract
     */
    static get defaultPropertyName() {}

    /**
     * @returns {string[]}
     */
    static get setPropertyStopList() {
        return [
            this.targetPropertyName,
            this.defaultPropertyName
        ]
    }

    /**
     * This property name may be used to explicitly set target of the instance
     * @returns {string}
     */
    static get targetPropertyName() {
        return TARGET_PROPERTY_NAME
    }

    /**
     * A default interface of a target object
     * @returns {ObjectConstructor|*}
     */
    static get interface() {
        return Object
    }
}
