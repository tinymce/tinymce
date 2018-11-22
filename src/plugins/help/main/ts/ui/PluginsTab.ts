/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Obj, Strings } from '@ephox/katamari';
import I18n from 'tinymce/core/api/util/I18n';
import PluginUrls from '../data/PluginUrls';

const makeLink = Fun.curry(Strings.supplant, '<a href="${url}" target="_blank" rel="noopener">${name}</a>');

const maybeUrlize = function (editor, key) {
  return Arr.find(PluginUrls.urls, function (x) {
    return x.key === key;
  }).fold(function () {
    const getMetadata = editor.plugins[key].getMetadata;
    return typeof getMetadata === 'function' ? makeLink(getMetadata()) : key;
  }, function (x) {
    return makeLink({ name: x.name, url: 'https://www.tinymce.com/docs/plugins/' + x.key });
  });
};

const getPluginKeys = function (editor) {
  const keys = Obj.keys(editor.plugins);
  return editor.settings.forced_plugins === undefined ?
    keys :
    Arr.filter(keys, Fun.not(Fun.curry(Arr.contains, editor.settings.forced_plugins)));
};

const pluginLister = function (editor) {
  const pluginKeys = getPluginKeys(editor);
  const pluginLis = Arr.map(pluginKeys, function (key) {
    return '<li>' + maybeUrlize(editor, key) + '</li>';
  });
  const count = pluginLis.length;
  const pluginsString = pluginLis.join('');

  return '<p><b>' + I18n.translate(['Plugins installed ({0}):', count ]) + '</b></p>' +
          '<ul>' + pluginsString + '</ul>';
};

const installedPlugins = function (editor) {
  return {
    type: 'container',
    html: '<div style="overflow-y: auto; overflow-x: hidden; max-height: 230px; height: 230px;" data-mce-tabstop="1" tabindex="-1">' +
            pluginLister(editor) +
          '</div>',
    flex: 1
  };
};

const availablePlugins = function () {
  return {
    type: 'container',
    html: '<div style="padding: 10px; background: #e3e7f4; height: 100%;" data-mce-tabstop="1" tabindex="-1">' +
            '<p><b>' + I18n.translate('Premium plugins:') + '</b></p>' +
            '<ul>' +
              '<li>PowerPaste</li>' +
              '<li>Spell Checker Pro</li>' +
              '<li>Accessibility Checker</li>' +
              '<li>Advanced Code Editor</li>' +
              '<li>Enhanced Media Embed</li>' +
              '<li>Link Checker</li>' +
            '</ul><br />' +
            '<p style="float: right;"><a href="https://www.tinymce.com/pricing/?utm_campaign=editor_referral&utm_medium=help_dialog&utm_source=tinymce" target="_blank">' + I18n.translate('Learn more...') + '</a></p>' +
          '</div>',
    flex: 1
  };
};

const makeTab = function (editor) {
  return {
    title: 'Plugins',
    type: 'container',
    style: 'overflow-y: auto; overflow-x: hidden;',
    layout: 'flex',
    padding: 10,
    spacing: 10,
    items: [
      installedPlugins(editor),
      availablePlugins()
    ]
  };
};

export default {
  makeTab
};