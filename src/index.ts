import { Container, inject, injectable } from "inversify";
import "reflect-metadata"

import { proxyGetter } from "./proxyGetter";


const upperCased = () => {
    /**
     * This decorator sits on a class field.
     * 
     * It does the following:
     *   - Creates a private field with the same name as the original field prefixed with `__`
     *   - Marks the private field to be injected by the container
     *   - The injection token is calculated from the class name and the field name (like a transition string)
     *   - A property getter is installed over the original field allowing us to customize access to the injected value
     * 
     *   In this case it uppercases the string.
     */
    const decorator = (target: any, key: string) => {

        // calculate the token        
        const token = `${target.constructor.name}.${key}`

        // create the private field
        Object.defineProperty(target, `__${key}`, {
            value: undefined,
            writable: true,
        })

        // mark the private field to be injected        
        inject(token)(target, `__${key}`)

        // the property getter        
        const resolver = function(this: any) {
            const privateFieldValue = this[`__${key}`]
            return privateFieldValue.toUpperCase()
        }

        // install the property getter        
        proxyGetter(target, key, resolver, true)
    }

    return decorator
}



@injectable()
class Foo {

    @upperCased()
    public bar!: string;

}

const C = new Container()

C.bind(Foo).toSelf()
C.bind("Foo.bar").toConstantValue("hello")

const foo = C.get(Foo)

console.log(foo.bar)