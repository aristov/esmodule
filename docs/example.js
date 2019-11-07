import '../lib/debug'
import { Assembler } from '../lib'

class HTMLAssembler extends Assembler {
    set children(children) {
        this.node.append(...children.map(child => child.node || child))
    }

    get children() {
        return Array.prototype.map.call(this.node.children, child => {
            return Assembler.getInstanceOf(child)
        })
    }

    get node() {
        return HTMLAssembler.getTargetOf(this)
    }

    static create(init) {
        return document.createElement(this.name.toLowerCase())
    }

    static get valuePropertyName() {
        return 'children'
    }

    static get targetPropertyName() {
        return 'node'
    }
}

class Body extends HTMLAssembler {}
class H1 extends HTMLAssembler {}
class P extends HTMLAssembler {}
class Form extends HTMLAssembler {}
class Label extends HTMLAssembler {}
class Input extends HTMLAssembler {}
class Button extends HTMLAssembler {}

new Body({
    node : document.body,
    children : [
        new H1(['Hello world!']),
        new P(['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.']),
        new Form([
            new Label([
                'Name ',
                new Input({
                    name : 'name',
                    value : (new URL(location)).searchParams.get('name')
                })
            ]),
            ' ',
            new Button(['Confirm!'])
        ])
    ]
})
