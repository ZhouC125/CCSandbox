/**
 * 模块入口
 * 每个模块都会有一个入口文件，并在整个游戏生命周期中长期存在
 */
import AbstractModule, { Module } from '../../../fromework/abstract/mvvm/AbstractModule';
import SceneManager from '../../../fromework/singles/SceneManager';
const { ccclass, property } = cc._decorator;
/**
 * @Module 
 * @param moduleName: string 模块名称
 * @param isDontDestroy?: boolean 如果为true 则当前模块的viewModel 和 model 在离开模块场景时不会被清除 默认为false
 */
@Module('login')
@ccclass
export default class login extends AbstractModule {
    protected clear(): void {
    }

    onLoad() {
        this.notify.on('scene', 'enter', this.enter, this)
    }
    enter() {
        SceneManager.instance.loadScene(this.name, this.name)
    }
}
