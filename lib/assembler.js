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
        this.setInstanceOf(init && init.constructor === Object?
            this.constructor.create(init) :
            this.constructor.create())
    }

    /**
     * Link target and the assembler instance together
     * @param {Object|*} target
     */
    setInstanceOf(target) {
        const _interface = this.constructor.interface
        if(target instanceof _interface || target.constructor === _interface) {
            this[key] = target
            instances.set(target, this)
        }
        else throw TypeError(`Failed to execute 'setInstanceOf' on '${ this.constructor.name }': parameter is not of expected type.`)
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
            const name = this.constructor.defaultPropertyName
            if(name !== undefined) {
                this[name] = init
            }
        }
    }

    /**
     * Assign specified properties on the instance if they are not static
     * @param {{}} init
     */
    assign(init) {
        for(let prop in init) {
            if(init.hasOwnProperty(prop)) {
                this.setProperty(prop, init[prop])
            }
        }
    }

    /**
     * Set a single property if it is in this and not undefined or fallback otherwise
     * @param {String} name
     * @param {String} value
     */
    setProperty(name, value) {
        if(value !== undefined) {
            if(name in this) {
                this[name] = value
            }
            else this.setPropertyFallback(name, value)
        }
    }

    /**
     * Set a signle property on target if it is in target or mismatch otherwise
     * @param name
     * @param value
     */
    setPropertyFallback(name, value) {
        const target = this[key]
        if(name in target) {
            target[name] = value
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
     * @param {Assembler|*} instance
     * @returns {*}
     */
    static getTargetOf(instance) {
        return instance[key]
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
