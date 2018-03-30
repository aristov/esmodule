let undefined
const INIT_PROPERTY_NAME = 'init'
const INSTANCE_PROPERTY_NAME = '__instance__'
const TARGET_PROPERTY_NAME = '__target__'
const TYPE_UNDEFINED = 'undefined'

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
        return this[TARGET_PROPERTY_NAME]
    }

    /**
     * Create the specified object
     * @param {*} [init] initializing dictionary
     */
    create(init) {
        this.setInstanceOf(init && init.constructor === Object?
            this.constructor.create(init) :
            this.constructor.create())
    }

    /**
     * @param {Object|*} target
     */
    setInstanceOf(target) {
        this[TARGET_PROPERTY_NAME] = target
        target[INSTANCE_PROPERTY_NAME] = this
    }

    /**
     * Initialize the object with the defined properties
     * @param {*} [init] initializing dictionary
     * @returns {Boolean}
     */
    init(init) {
        if(init && init.constructor === Object) {
            this.assign(init)
        }
        else if(typeof init !== TYPE_UNDEFINED) {
            this.assign({ [this.constructor.initPropertyName] : init })
        }
        else this.assign({})
    }

    /**
     * @param {{}} init
     */
    assign(init) {
        const { constructor } = this
        for(let prop in init) {
            if(init.hasOwnProperty(prop) && !(prop in constructor)) {
                this.setProperty(prop, init[prop])
            }
        }
    }

    /**
     * @param {String} name
     * @param {String} value
     */
    setProperty(name, value) {
        if(value !== undefined) {
            if(name in this) this[name] = value
            else this.setPropertyFallback(name, value)
        }
    }

    /**
     * @param name
     * @param value
     */
    setPropertyFallback(name, value) {
        const target = this[TARGET_PROPERTY_NAME]
        if(name in target) target[name] = value
        else this.setPropertyMismatch(name)
    }

    /**
     * The init property mismatch handler
     * @param {String} prop mismatched property name
     */
    setPropertyMismatch(prop) {
        const name = this.constructor.name
        if(typeof console !== TYPE_UNDEFINED) {
            console.warn(`The property "${ prop }" is not found on the ${ name } instance`)
        }
    }

    /**
     * @param {{}} [init]
     * @returns {Object}
     */
    static create({ properties } = this) {
        return Object.create(this.interface.prototype, properties)
    }

    /**
     * @param {Assembler|Object|*} target
     * @returns {Assembler|*|null}
     */
    static getInstanceOf(target) {
        return target instanceof Assembler? target : target[INSTANCE_PROPERTY_NAME]
    }

    /**
     * @returns {String}
     */
    static get initPropertyName() {
        return INIT_PROPERTY_NAME
    }

    /**
     * @returns {ObjectConstructor|*}
     */
    static get interface() {
        return Object
    }

    /**
     * @returns {undefined|*}
     */
    static get properties() {
        return undefined
    }
}

Object.defineProperty(Assembler.prototype, TARGET_PROPERTY_NAME, { writable : true, value : null })
