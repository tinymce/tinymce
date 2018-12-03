/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Obj, Strings } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';
import PluginUrls from '../data/PluginUrls';
import { Types } from '@ephox/bridge';

export interface PluginUrlType {
  key: string;
  name: string;
}

const tab = (editor: Editor) => {
  const availablePlugins = () => {
    return '<div style="padding: 10px; background: #e3e7f4; height: 100%;" data-mce-tabstop="1" tabindex="-1">' +
      '<p><b>' + I18n.translate('Premium plugins:') + '</b></p>' +
      '<ul>' +
      '<li>PowerPaste</li>' +
      '<li>Spell Checker Pro</li>' +
      '<li>Accessibility Checker</li>' +
      '<li>Advanced Code Editor</li>' +
      '<li>Enhanced Media Embed</li>' +
      '<li>Link Checker</li>' +
      '</ul><br />' +
      '<p style="float: right;"><a href="https://www.tiny.cloud/pricing/?utm_campaign=editor_referral&utm_medium=help_dialog&utm_source=tinymce" target="_blank">' + I18n.translate('Learn more...') + '</a></p>' +
      '</div>';
  };

  const makeLink = Fun.curry(Strings.supplant, '<a href="${url}" target="_blank" rel="noopener">${name}</a>');

  const maybeUrlize = (editor, key: string) => {
    return Arr.find(PluginUrls.urls, function (x: PluginUrlType) {
      return x.key === key;
    }).fold(function () {
      const getMetadata = editor.plugins[key].getMetadata;
      return typeof getMetadata === 'function' ? makeLink(getMetadata()) : key;
    }, function (x) {
      return makeLink({ name: x.name, url: 'https://www.tiny.cloud/docs/plugins/' + x.key });
    });
  };

  const getPluginKeys = (editor) => {
    const keys = Obj.keys(editor.plugins);
    return editor.settings.forced_plugins === undefined ?
      keys :
      Arr.filter(keys, Fun.not(Fun.curry(Arr.contains, editor.settings.forced_plugins)));
  };

  const pluginLister = (editor) => {
    const pluginKeys = getPluginKeys(editor);
    const pluginLis = Arr.map(pluginKeys, function (key) {
      return '<li>' + maybeUrlize(editor, key) + '</li>';
    });
    const count = pluginLis.length;
    const pluginsString = pluginLis.join('');

    return '<p><b>' + I18n.translate(['Plugins installed ({0}):', count]) + '</b></p>' +
      '<ul>' + pluginsString + '</ul>';
  };

  const installedPlugins = (editor) => {
    if (editor == null) {
      return '';
    }
    return '<div style="overflow-y: auto; overflow-x: hidden; max-height: 230px; height: 230px;" data-mce-tabstop="1" tabindex="-1">' +
      pluginLister(editor) +
      '</div>';
  };

  const htmlPanel: Types.Dialog.BodyComponentApi = {
    type: 'htmlpanel',
    html: [
      installedPlugins(editor),
      availablePlugins()
    ].join('')
  };
  return {
    title: 'Plugins',
    items: [
      htmlPanel
    ]
  };
};

export default {
  tab
};