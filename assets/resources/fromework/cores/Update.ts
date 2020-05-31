const urlJoin = require("url-join")
import Utils from '../tools/Utils';
import { relative } from "path"
import Runtime from '../singles/Runtime'
import Company from '../singles/Company'
export default class Update {
    private readonly projectManifest = "project.manifest"
    private readonly versionManifest = "version.manifest"
    private readonly remote_assets = "remote-assets"
    private retryCount: number = 3
    private name: string
    private assetsManager: any
    private storagePath: string
    private localSavePath: string

    constructor(name: string) {
        this.name = name
        if (!Utils.isHotUpdate) return
        this.storagePath = cc.path.join(jsb.fileUtils.getWritablePath(), this.remote_assets)
        var localManifestPath = cc.path.join(this.storagePath, this.projectManifest)
        this.localSavePath = this.storagePath
        if (this.name) {
            localManifestPath = cc.path.join(this.storagePath, 'subpackages', this.name, this.projectManifest)
            this.localSavePath = cc.path.join(this.storagePath, 'subpackages', this.name)
        }
        this.assetsManager = new jsb.AssetsManager(localManifestPath, this.localSavePath, this.versionCompareHandle.bind(this))
        this.assetsManager.setVerifyCallback(this.verifyCallback.bind(this))
        cc.log(`${this.name || 'fromework'} 模块`, `manifest 路径:${localManifestPath}`, `储存路径:${this.localSavePath}`)
    }

    public checkUpdate(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!this.isHotUpdate()) {
                // 不需要更新
                return resolve(false)
            }
            if (!this.initManifest()) {
                return reject(`${this.name || 'fromework'} 检查时 初始化manifest失败`)
            }
            this.assetsManager.setEventCallback((event: any) => {
                switch (event.getEventCode()) {
                    case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                        return reject(`ERROR_NO_LOCAL_MANIFEST ${this.name || 'fromework'} 检查更新失败: 没有找到本地manifest文件`)
                    case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                        return reject(`ERROR_DOWNLOAD_MANIFEST ${this.name || 'fromework'} 下载 manifest 失败`)
                    case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                        return reject(`ERROR_PARSE_MANIFEST ${this.name || 'fromework'} 下载 manifest 失败`)
                    case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                        return resolve(false)
                    case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                        return resolve(true)
                }
            })
            cc.log(`${this.name || 'fromework'} 检查中...`)
            this.assetsManager.checkUpdate()
        })
    }
    public install(progressEvent?: (event: HotUpdateProgressEvent) => void): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!this.isHotUpdate()) {
                return resolve(false)
            }
            var packageUrl = urlJoin(Company.instance.hotUpdateUrl, Runtime.instance.template, "/subpackages/", this.name)
            var zipKey = `${this.name}.zip`
            var manifest = {
                packageUrl: packageUrl,
                version: "0.0.0",
                searchPaths: [],
                assets: {
                    [zipKey]: {
                        md5: "0",
                        compressed: true
                    }
                },
            }
            var localObj = new jsb.Manifest(JSON.stringify(manifest), this.localSavePath)
            this.assetsManager.loadLocalManifest(localObj, this.localSavePath)

            manifest.version = "1.0.0"
            manifest.assets[zipKey].md5 = "1"

            var remoteObj = new jsb.Manifest(JSON.stringify(manifest), this.localSavePath)
            this.assetsManager.loadRemoteManifest(remoteObj)

            this.startUpdate(progressEvent).then(() => {
                resolve(true)
            }).catch(reject)
        })


    }
    public startUpdate(progressEvent?: (event: HotUpdateProgressEvent) => void): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!this.isHotUpdate()) {
                // cc.log(`${this.name || 'fromework'} 不需要更新 `)
                // 不需要更新
                return resolve(false)
            }
            if (!this.initManifest()) {
                return reject(`${this.name || 'fromework'} 更新时 初始化manifest失败`)
            }
            var progress = new HotUpdateProgressEvent()
            progressEvent = progressEvent || function () { }
            this.assetsManager.setEventCallback((event: any) => {
                switch (event.getEventCode()) {
                    case jsb.EventAssetsManager.READY_TO_UPDATE:
                        cc.log(`${this.name || 'fromework'} 断点续传: ${event.isResuming()}`)
                        break
                    case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                        cc.log(`${this.name || 'fromework'} 找到了最新的版本文件`)
                        var remote = this.assetsManager.getRemoteManifest();
                        if (remote) {
                            this.setRemoteUrls(remote)
                        }
                        break
                    case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                        progress.message = event.getMessage()
                        progress.percentByByte = event.getPercent()
                        progress.percentByFile = event.getPercentByFile()
                        progress.downloadedBytes = event.getDownloadedBytes()
                        progress.downloadedFiles = event.getDownloadedFiles()
                        progress.totalBytes = event.getTotalBytes()
                        progress.totalFiles = event.getTotalFiles()
                        progressEvent(progress)
                        break
                    case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                        this.assetsManager.setEventCallback(null)
                        reject(`${this.name || 'fromework'} 本地 manifest 错误`)
                        break
                    case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                        this.assetsManager.setEventCallback(null)
                        reject(`${this.name || 'fromework'} 下载 manifest 错误`)
                        break
                    case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                        this.assetsManager.setEventCallback(null)
                        reject(`${this.name || 'fromework'} 解析 manifest 错误`)
                        break
                    case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                        cc.error(`${this.name || 'fromework'} 解压文件${event.getAssetId()}失败,原因:${event.getMessage()}`)
                        this.assetsManager.setEventCallback(null)
                        reject(`${this.name || 'fromework'} 模块解压文件${event.getAssetId()}失败`)
                        break
                    case jsb.EventAssetsManager.ERROR_UPDATING:
                        cc.warn(`${this.name || 'fromework'} 下载文件${event.getAssetId()}失败,原因:${event.getMessage()}`)
                        break
                    case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                        cc.log(`${this.name || 'fromework'} 已经是最新版本`)
                        this.assetsManager.setEventCallback(null)
                        resolve(false)
                        break
                    case jsb.EventAssetsManager.UPDATE_FINISHED:
                        cc.log(`${this.name || 'fromework'} 更新完成！`)
                        this.assetsManager.setEventCallback(null)
                        this.updateSearchPath()
                        resolve(true)
                        break
                    case jsb.EventAssetsManager.UPDATE_FAILED:
                        if (this.retryCount > 0) {
                            this.assetsManager.downloadFailedAssets()
                            this.retryCount--
                            cc.error(`${this.name || 'fromework'} 更新失败！尝试重新下载 剩余下载次数:${this.retryCount}`)
                        } else {
                            this.assetsManager.setEventCallback(null)
                            reject(`${this.name || 'fromework'} 更新失败`)
                        }
                        break
                    case jsb.EventAssetsManager.ASSET_UPDATED:
                        cc.log(`${this.name || 'fromework'} 下载文件${event.getAssetId()}成功`)
                        if (cc.path.extname(event.getAssetId()) == ".zip") {
                            var manifestFile = cc.path.join(`${this.localSavePath}_temp`, `${this.projectManifest}.temp`)
                            var isExists = jsb.fileUtils.isFileExist(manifestFile)
                            if (isExists) {
                                jsb.fileUtils.removeFile(manifestFile)
                            }
                        }
                        break
                }
            })
            cc.log(`${this.name || 'fromework'} 更新中...`)
            this.assetsManager.update()
        })
    }

    private isHotUpdate() {
        // 不是热更新环境
        if (!Utils.isHotUpdate) return false
        // 不是子模块
        if (this.name && !Runtime.instance.isSubpackage(this.name)) return false
        // 是热更新环境
        return true
    }

    private initManifest() {
        // 初始化manifest
        if (this.assetsManager.getState() == jsb.AssetsManager.State.UNINITED) {
            let manifest = this.getManifest()
            var manifestObj = new jsb.Manifest(JSON.stringify(manifest), this.localSavePath);
            this.assetsManager.loadLocalManifest(manifestObj, this.localSavePath)
            cc.log(`${this.name || 'fromework'} 模块:初始化manifest`, manifest)
        }
        if (!this.assetsManager.getLocalManifest() || !this.assetsManager.getLocalManifest().isLoaded()) {
            cc.error(`${this.name || 'fromework'} 模块:初始化manifest失败`)
            return false
        }
        // 将服务器更新地址写入manifest
        let manifest = this.assetsManager.getLocalManifest()
        this.setRemoteUrls(manifest)
        return true
    }

    private getManifest(): any {
        var manifest = {
            packageUrl: "",
            remoteManifestUrl: "",
            remoteVersionUrl: "",
            version: "0.0.0",
            assets: {},
            searchPaths: []
        }
        var localProjectPath = cc.path.join("./res", this.projectManifest)
        var json = jsb.fileUtils.getStringFromFile(localProjectPath)
        if (json != 0) {
            manifest = JSON.parse(json)
        }
        return manifest
    }
    /**
     * 写入更新地址
     */
    private setRemoteUrls(manifest) {
        var relativePath = relative(jsb.fileUtils.getWritablePath(), this.localSavePath).replace(this.remote_assets, "")
        manifest.setPackageUrl(urlJoin(Company.instance.hotUpdateUrl, Runtime.instance.template, "/"))
        manifest.setManifestUrl(urlJoin(manifest.getPackageUrl(), relativePath, this.projectManifest))
        manifest.setVersionUrl(urlJoin(manifest.getPackageUrl(), relativePath, this.versionManifest))
        cc.log(`${this.name || 'fromework'} 模块更新地址:`, manifest.getPackageUrl(), manifest.getVersionFileUrl(), manifest.getManifestFileUrl())
    }
    /**
     * 更新搜索路径
     */
    private updateSearchPath() {
        var searchPaths = jsb.fileUtils.getSearchPaths();
        var newPaths = this.assetsManager.getLocalManifest().getSearchPaths();
        Array.prototype.unshift.apply(searchPaths, newPaths);
        searchPaths = Array.from(new Set(searchPaths))
        cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
        jsb.fileUtils.setSearchPaths(searchPaths);
    }
    private versionCompareHandle(versionA: string, versionB: string): number {
        var vA: string[] = versionA.split('.');
        var vB: string[] = versionB.split('.');
        for (let i = 0; i < vA.length; i++) {
            const a = parseInt(vA[i]);
            const b = parseInt(vB[i]);
            if (a === b) {
                continue;
            }
            else {
                cc.log(`${this.name || 'fromework'} 模块: 本地版本:${versionA} <=> 远程版本:${versionB} ${(a - b) < 0 ? "需要更新" : "不更新"}`)
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            cc.log(`${this.name || 'fromework'} 模块: 本地版本:${versionA} <=> 远程版本:${versionB} ${vB.length > vA.length ? "需要更新" : "不更新"}`)
            return -1;
        }
        else {
            cc.log(`${this.name || 'fromework'} 模块: 本地版本:${versionA} <=> 远程版本:${versionB} 不更新`)
            return 0;
        }
    }
    private verifyCallback(path: string, asset: any): boolean {
        // 压缩资产时，我们不需要检查其 md5，因为 zip 文件已被删除。
        var compressed = asset.compressed;
        // 检索正确的 md5 值。
        var expectedMD5 = asset.md5;
        // asset路径是相对路径，path是绝对路径。
        var relativePath = asset.path;
        // asset文件的大小，但此值可能不存在。
        var size = asset.size;
        if (compressed) {
            return true;
        }
        else {
            return true;
        }
    }
}


export class HotUpdateProgressEvent {
    /**
     * 下载进度百分比
     */
    percentByByte: number
    /**
     * 下载文件进度百分比
     */
    percentByFile: number
    /**
     * 当前下载文件数量
     */
    downloadedFiles: number
    /**
     * 当前下载字节进度
     */
    downloadedBytes: number
    /**
     * 总文件数量
     */
    totalFiles: number
    /**
     * 总字节
     */
    totalBytes: number
    /**
     * 下载消息
     */
    message: string
}