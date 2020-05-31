import { ViewModel, Binding } from '../../../../../framework/abstract/mvvm/AbstractView';
import launch_view_model from '../../../scripts/launch_view_model';
import AbstractView from '../../../../../framework/abstract/mvvm/AbstractView';
import { HotUpdateProgressEvent } from '../../../../../framework/cores/Update';
import Utils from '../../../../../framework/tools/Utils';
import { i18n, Languages } from '../../../../../languages/i18n';
/**
 * view层 
 * 负责处理显示相关的逻辑
 */
const { ccclass, property } = cc._decorator;
@ccclass
/**
 * @ViewModel
 * @param moduleName 指定当前模块名
 * @param viewModel 指定一个viewModel
 * @param autoInjectCommands 默认为false 如果为true 会自动注入viewModel @Command 的方法到本对象中
 */
@ViewModel('launch', launch_view_model)
export default class launch_main extends AbstractView<launch_view_model> {
    @property(cc.Label) tipsLabel: cc.Label = null
    @property(cc.Label) bytesLabel: cc.Label = null
    @property(cc.ProgressBar) progressBar: cc.ProgressBar = null
    onLoad() {
        this.viewModel.initLaunch()
    }
    /**
     * 更新进度
     */
    @Binding __percentByByte(value: number) {
        if (isNaN(value)) {
            return this.progressBar.progress = 0
        }
        this.progressBar.progress = value
        var str = Math.floor(value * 100)
        this.tipsLabel.string = `${str > 100 ? 100 : str}%`
    }
    @Binding __progressEventData(event: HotUpdateProgressEvent) {
        if (!event) {
            return this.bytesLabel.string = ""
        }
        this.bytesLabel.string = `${Utils.formatBytes(event.downloadedBytes)}/${Utils.formatBytes(event.totalBytes)}`
    }
}

// 这是一个测试 用来编辑多语言json 复制它 然后打开多语言配置面板，找到Text点击➕ 然后粘贴一下内容即可生成多语言配置
[
    {
        "launch_header": {
            "note": "启动场景标题", "zh_cn": "启动场景", "en": "Launch Scene"
        }

    },
    {
        "login_header": {
            "note": "登录场景标题", "zh_cn": "登录场景", "en": "Login Scene"
        }

    },
    {
        "lobby_header": {
            "note": "大厅场景标题", "zh_cn": "大厅场景", "en": "Lobby Scene"
        }
    }
]