const fs = require('fs-extra')
const path = require('path')

module.exports = {

    getProjectPath() {
        return Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.projectInfo.path;
    },

    /**
     * 获取所有一级子目录 返回目录名
     */
    getFolderNames(_path) {
        if (!fs.existsSync(_path)) return []
        return fs.readdirSync(_path).filter(function (file) {
            return fs.statSync(_path + '/' + file).isDirectory();
        });
    },
    /**
     * 获取所有目录（递归子目录） 返回所有目录完整路径
     */
    getFoldersFullPath(dir) {
        return new Promise((resolve, reject) => {
            this.fileDisplay(dir, (err, results) => {
                if (err) return reject(err)
                resolve(results)
            })
        })
    },
    getAllFolders(dir) {
        return new Promise((resolve, reject) => {
            this.fileDisplay(dir, (err, results) => {
                if (err) return reject(err)
                resolve(results)
            })
        })
    },
    /**
     * 递归查找目录
     */
    fileDisplay(dir, done) {
        var results = [];
        var self = this
        fs.readdir(dir, function (err, list) {
            if (err) return done(err);
            var pending = list.length;
            if (!pending) return done(null, results);
            list.forEach(function (file) {
                file = path.resolve(dir, file);
                fs.stat(file, function (err, stat) {
                    if (stat && stat.isDirectory()) {
                        results.push(file);
                        self.fileDisplay(file, function (err, res) {
                            results = results.concat(res);
                            if (!--pending) done(null, results);
                        });
                    } else {
                        if (!--pending) done(null, results);
                    }
                });
            });
        });
    },

    fileDisplay2(dirPath, arr) {
        var filesList = fs.readdirSync(dirPath);
        var self = this
        for (var i = 0; i < filesList.length; i++) {
            //描述此文件/文件夹的对象
            var fileObj = {};
            fileObj.name = filesList[i];
            //拼接当前文件的路径(上一层路径+当前file的名字)
            var filePath = path.join(dirPath, filesList[i]);
            //根据文件路径获取文件信息，返回一个fs.Stats对象
            var stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                //如果是文件夹
                fileObj.type = 'dir';
                fileObj.child = [];
                arr.push(fileObj);
                //递归调用
                self.fileDisplay2(filePath, arr[i].child);
            } else {
                //不是文件夹,则添加type属性为文件后缀名
                fileObj.type = path.extname(filesList[i]).substring(1);
                arr.push(fileObj);
            }
        }
    },


    /**
     * 拷贝文件夹
     */
    async copyFolderAsync(source, target) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(path.dirname(target))) {
                this.mkdirsSync(path.dirname(target))
            }
            fs.copy(source, target, { recursive: true }).then(resolve).catch(reject)
        })
    },
    async moveFolderAsync(source, target, options) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(source)) return resolve()
            if (!options) options = { overwrite: false }
            fs.move(source, target, options).then(resolve).catch(reject)
        })
    },
    /**
     * 递归创建目录
     */
    mkdirsSync(dirname) {
        if (fs.existsSync(dirname)) {
            return true;
        } else {
            if (this.mkdirsSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            }
        }
    },
}