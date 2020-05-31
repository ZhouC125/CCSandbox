
type Instantiable<Type> = { new(...params: any[]): Type }
export function PropertyDecorator<Type>(name: string, type: Instantiable<Type>, property: string) {
    if (!type.constructor.hasOwnProperty(name)) {
        type.constructor[name] = [].concat(Object.getPrototypeOf(type).constructor[name] || [])
    }
    if (-1 === type.constructor[name].indexOf(property)) {
        type.constructor[name].push(property)
    }
}
