import Notify from '../fromework/cores/Notify'
export enum Languages {
	en = "en",
	zh_cn = "zh_cn",
}
export class i18n {
	private static _language: Languages = Languages.zh_cn
	public static get language() { return this._language }
	public static set language(value: Languages) {
		if (this._language === value) return
		this._language = value
		Notify.instance.emit("__i18n__", 'refresh')
	}
	public static readonly text = {
		/** 启动场景标题 */
		launch_header:"launch_header",
		/** 大厅场景标题 */
		lobby_header:"lobby_header",
		/** 登录场景标题 */
		login_header:"login_header",
	}
	public static readonly sprite = {
	}
	public static readonly audio = {
	}
}