import AbstractModule from "../abstract/mvvm/AbstractModule"
type ModuleMap = { [name: string]: AbstractModule }
export default class Facade {
    private static modules: ModuleMap = {}
    public static getModule(name: string): AbstractModule {
        try {
            if (!Facade.modules[name]) {
                var moduleNode: cc.Node = new cc.Node(name)
                var moduleScript: any = moduleNode.addComponent(name)
                Facade.modules[name] = moduleScript
                cc.game.addPersistRootNode(moduleNode)
            }
            return Facade.modules[name]
        } catch (err) {
            cc.error(`找不到 ${name} 脚本`, err)
        }
    }
}
cc['Facade'] = Facade
