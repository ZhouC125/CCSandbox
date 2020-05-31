/**
 * model层
 * 负责接受服务器消息
 * 负责处理服务器发来的原始数据
 * 将服务器数据保存到@Mutable修饰的变量中
 */
import AbstractModel, { Mutable } from '../../../framework/abstract/mvvm/AbstractModel';
export default class common_model extends AbstractModel {
    /**
     * 在这里监听服务器消息
     */
    protected loaded() {
        setInterval(() => {
            this.__common_refresh++
        },1000)
    }
    /**
     * 在这里注销一切事件通知
     */
    protected unload() {

    }
    @Mutable __common_refresh: number = 0
}
