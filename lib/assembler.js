let undefined

const instances = new WeakMap
const key = Symbol()

/**
 * @summary Assembler is a simple class, which helps to assemble another JavaScript objects.
 */
export class Assembler {
    /**
     * Create the assembler instance and assemble the specified object
     * Initializes the object by all passed init arguments
     * @param {*} [init]
     */
    constructor(init) {
        this.assemble(init)
    }

    /**
     * Instantiate and initialize the specified object
     * @param {*} [init] initializing dictionary
     * @returns {Object|*}
     */
    assemble(init) {
        this.create(init)
        this.init(init)
        return this[key]
    }

    /**
     * Create the defined object
     * @param {*} [init] initializing dictionary
     */
    create(init) {
        this.setInstanceOf(init && init.constructor === Object?
            this.constructor.create(init) :
            this.constructor.create())
    }

    /**
     * This is a handshake between the Assembler instance and a target
     * @param {Object|*} target
     */
    setInstanceOf(target) {
        this[key] = target
        instances.set(target, this)
    }

    /**
     * Initialize target with the specified properties
     * @param {*} [init] initializing dictionary
     */
    init(init) {
        if(init && init.constructor === Object) {
            this.assign(init)
        }
        else {
            const name = this.constructor.defaultPropertyName
            if(init !== undefined && name !== undefined) {
                this.assign({ [name] : init })
            }
            else this.assign({})
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
