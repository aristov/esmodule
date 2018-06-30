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
     * @param {*} [init]
     */
    constructor(init) {
        this.create(init)
        this.init(init)
    }

    /**
     * Create target and link it with the assembler instance
     * @param {*} [init] initializing object
     */
    create(init) {
        const constructor = this.constructor
        const { targetPropertyName } = constructor
        if(init && init.constructor === Object && init.hasOwnProperty(targetPropertyName)) {
            constructor.setTargetOf(this, init[targetPropertyName])
        }
        else constructor.setTargetOf(this, constructor.create())
    }

    /**
     * Initialize target by specified initializing object
     * @param {*} [init] initializing object
     */
    init(init) {
        if(init && init.constructor === Object) {
            this.assign(init)
        }
        else if(init !== undefined) {
            const { defaultPropertyName } = this.constructor
            if(defaultPropertyName !== undefined) {
                this.setProperty(defaultPropertyName, init)
            }
        }
    }

    /**
     * Assign properties from specified initializing object
     * @param {{}} init
     */
    assign(init) {
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
            }
        }
        else this.setPropertyMismatch(name)
    }

    /**
     * @param {string} name
     * @returns {boolean}
     */
    setPropertyFilter(name) {
        const { defaultPropertyName, targetPropertyName } = this.constructor
        return name !== targetPropertyName && name !== defaultPropertyName
    }

    /**
     * Handle a mismatched property assignment
     * @param {string} name mismatched property name
     */
    setPropertyMismatch(name) {
        throw Error(`The property '${ name }' is not found on the '${ this.constructor.name }' instance.`)
    }

    /**
     * Create a target specified by interface
     * @returns {Object}
     */
    static create() {
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
     * Link target and the assembler instance together
     * @param {Assembler|*} instance
     * @param {Object|*} target
     */
    static setTargetOf(instance, target) {
        const _interface = instance.constructor.interface
        if(target instanceof _interface || target.constructor === _interface) {
            instance[key] = target
            storage.set(target, instance)
        }
        else throw TypeError(`Failed to execute 'setTargetOf' on '${ instance.constructor.name }': target is not of expected type.`)
    }

    /**
     * This property name is used for the `init.constructor !== Object` case
     * @returns {undefined|string}
     * @abstract
     */
    static get defaultPropertyName() {}

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
