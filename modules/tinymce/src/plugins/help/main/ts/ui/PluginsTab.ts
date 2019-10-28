/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Arr, Fun, Obj, Strings } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';
import PluginUrls from '../data/PluginUrls';

export interface PluginUrlType {
  key: string;
  name: string;
}

const tab = (editor: Editor): Types.Dialog.TabApi => {
  const availablePlugins = () => {
    const premiumPlugins = [
      // TODO: Add other premium plugins such as permanent pen when they are included in the website
      'Accessibility Checker',
      'Advanced Code Editor',
      'Advanced Tables',
      // 'Autocorrect',
      'Case Change',
      'Checklist',
      'Tiny Comments',
      'Tiny Drive',
      'Enhanced Media Embed',
      'Format Painter',
      'Link Checker',
      'Mentions',
      'MoxieManager',
      'Page Embed',
      'Permanent Pen',
      'PowerPaste',
      'Spell Checker Pro'
    ];

    const premiumPluginList = Arr.map(premiumPlugins, (plugin) => {
      return '<li>' + I18n.translate(plugin) + '</li>';
    }).join('');

    return '<div data-mce-tabstop="1" tabindex="-1">' +
      '<p><b>' + I18n.translate('Premium plugins:') + '</b></p>' +
      '<ul>' +
      premiumPluginList +
      '<li style="list-style: none; margin-top: 1em;"><a href="https://www.tiny.cloud/pricing/?utm_campaign=editor_referral&utm_medium=help_dialog&utm_source=tinymce" target="_blank">' + I18n.translate('Learn more...') + '</a></li>' +
      '</ul>' +
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

    const html = '<p><b>' + I18n.translate(['Plugins installed ({0}):', count]) + '</b></p>' +
      '<ul>' + pluginsString + '</ul>';

    return html;
  };

  const installedPlugins = (editor) => {
    if (editor == null) {
      return '';
    }
    return '<div data-mce-tabstop="1" tabindex="-1">' +
      pluginLister(editor) +
      '</div>';
  };

  const htmlPanel: Types.Dialog.BodyComponentApi = {
    type: 'htmlpanel',
    presets: 'document',
    html: [
      installedPlugins(editor),
      availablePlugins()
    ].join('')
  };
  return {
    name: 'plugins',
    title: 'Plugins',
    items: [
      htmlPanel
    ]
  };
};

export default {
  tab
};
