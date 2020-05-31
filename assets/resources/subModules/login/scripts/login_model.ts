/**
 * model层
 * 负责接受服务器消息
 * 负责处理服务器发来的原始数据
 * 将服务器数据保存到@Mutable修饰的变量中
 */
import AbstractModel, { Mutable } from '../../../fromework/abstract/mvvm/AbstractModel';
export default class login_model extends AbstractModel {
    /**
     * 在这里监听服务器消息
     */
    protected loaded() {

    }
    /**
     * 在这里注销一切事件通知
     */
    protected unload() {

    }
}
