import { Observer } from "./Observer";
export interface Listener<T> {
    new(vm: T, ...params: any[]): void
}
export interface Type<T> {
    new(...args: any[]): T
}

export interface SceneData {
    fromModule: string
    fromScene: string
    toModule: string
    toScene: string
}

export interface IListener {
    [module: string]: {
        [main: string]: {
            [sub: string]: Array<Observer>
        }
    }
}