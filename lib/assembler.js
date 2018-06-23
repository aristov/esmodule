let undefined

const instances = new WeakMap
const key = Symbol()

/**
 * @summary Assembler is a simple class, which helps to assemble another JavaScript objects.
 */
export class Assembler {
    /**
     * Create and initialize target by the specified initialing object
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
        this.constructor.setTargetOf(this, init && init.constructor === Object?
            this.constructor.create(init) :
            this.constructor.create())
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
            const defaultPropertyName = this.constructor.defaultPropertyName
            if(defaultPropertyName !== undefined) {
                this.setProperty(defaultPropertyName, init)
            }
        }
    }

    /**
     * Assign properties of the specified initializing object
     * @param {{}} init
     */
    assign(init) {
        const defaultPropertyName = this.constructor.defaultPropertyName
        if(defaultPropertyName !== undefined && init.hasOwnProperty(defaultPropertyName)) {
            this.setProperty(defaultPropertyName, init[defaultPropertyName])
        }
        for(const name in init) {
            if(name !== defaultPropertyName && init.hasOwnProperty(name)) {
                this.setProperty(name, init[name])
            }
        }
    }

    /**
     * Set a single property if it is in this and not undefined or fallback otherwise
     * @param {String} name
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
     * Set a single property on target if it is in target or mismatch otherwise
     * @param {String} name
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
     * Handle a mismatched property assignment
     * @param {String} name mismatched property name
     */
    setPropertyMismatch(name) {
        throw Error(`The property "${ name }" is not found on the ${ this.constructor.name } instance`)
    }

    /**
     * Create the interface prototype object and define it's properties if they are specified
     * @param {{}} [init]
     * @returns {Object}
     */
    static create(init) {
        return new this.interface
    }

    /**
     * Get an instance of the target or an instance itself
     * @param {Assembler|Object|*} object
     * @returns {Assembler|*|null}
     */
    static getInstanceOf(object) {
        return object instanceof Assembler?
            object :
            instances.get(object) || null
    }

    /**
     * Get a target of the instance
     * @param {Assembler|*} object
     * @returns {*}
     */
    static getTargetOf(object) {
        return key in object? object[key] : object
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
            instances.set(target, instance)
        }
        else throw TypeError(`Failed to execute 'setTargetOf' on '${ instance.constructor.name }': parameter is not of expected type.`)
    }

    /**
     * This property name is used for the `init.constructor !== Object` case
     * @returns {undefined|String}
     * @abstract
     */
    static get defaultPropertyName() {}

    /**
     * A default interface of a target object
     * @returns {ObjectConstructor|*}
     */
    static get interface() {
        return Object
    }
}
