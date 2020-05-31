'use strict';
const buildMain = require('./buildExtension/main')
const template = require('./template/main')
const subpackage = require('./subpackage/main')
module.exports = {
  load() {
    Editor.Builder.on('build-start', buildMain.onBuildStart);
    Editor.Builder.on('build-finished', buildMain.onBuildFinish);
  },
  unload() {
    Editor.Builder.removeListener('build-start', buildMain.onBuildStart);
    Editor.Builder.removeListener('build-finished', buildMain.onBuildFinish);
  },

  messages: {
    'configuration'() {
      Editor.Panel.open('sandbox-package.configuration');
    },
    'skinResurfacing'() {
      Editor.Panel.open('sandbox-package.skinResurfacing');
    },
    'languages'() {
      Editor.Panel.open('sandbox-package.languages');
    },
    'makeSubpackage'() {
      subpackage.start()
    },
    'asset-db:assets-moved'(a, b) {
      template.onAssetsMoved(a, b)
    },
    'asset-db:asset-changed'(a, b) {
      template.onAssetsChanged(a, b)
    },
    'asset-db:assets-deleted'(a, b) {
      template.onAssetsDeleted(a, b)
    },
  },
};