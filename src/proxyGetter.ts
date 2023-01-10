const metakey = Symbol.for("proxyGetter.cache")

export function proxyGetter(
    proto: any,
    key: string,
    resolve: () => any,
    doCache: boolean
) {
    function getter(this: any) {
        if (doCache && !Reflect.hasMetadata(metakey, this, key)) {
            Reflect.defineMetadata(metakey, resolve.call(this), this, key)
        }
        if (Reflect.hasMetadata(metakey, this, key)) {
            return Reflect.getMetadata(metakey, this, key)
        } else {
            return resolve.call(this)
        }
    }

    function setter(this: any, newVal: any) {
        Reflect.defineMetadata(metakey, newVal, this, key)
    }

    Object.defineProperty(proto, key, {
        configurable: true,
        enumerable: true,
        get: getter,
        set: setter,
    })
}
