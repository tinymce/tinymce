/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import I18n from 'tinymce/core/api/util/I18n';
import * as Settings from '../api/Settings';
import * as PluginUrls from '../data/PluginUrls';

const tab = (editor: Editor): Dialog.TabSpec => {
  const availablePlugins = () => {
    const premiumPlugins = [
      // TODO: Add other premium plugins such as permanent pen when they are included in the website
      'Accessibility Checker',
      'Advanced Code Editor',
      'Advanced Tables',
      // 'Autocorrect',
      'Case Change',
      'Checklist',
      'Export',
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

    const premiumPluginList = Arr.map(premiumPlugins, (plugin) => '<li>' + I18n.translate(plugin) + '</li>').join('');

    return '<div data-mce-tabstop="1" tabindex="-1">' +
      '<p><b>' + I18n.translate('Premium plugins:') + '</b></p>' +
      '<ul>' +
      premiumPluginList +
      '<li class="tox-help__more-link" "><a href="https://www.tiny.cloud/pricing/?utm_campaign=editor_referral&utm_medium=help_dialog&utm_source=tinymce" target="_blank">' + I18n.translate('Learn more...') + '</a></li>' +
      '</ul>' +
      '</div>';
  };

  const makeLink = (p: { name: string; url: string }): string =>
    `<a href="${p.url}" target="_blank" rel="noopener">${p.name}</a>`;

  const maybeUrlize = (editor: Editor, key: string) => Arr.find(PluginUrls.urls, (x) => {
    return x.key === key;
  }).fold(() => {
    const getMetadata = editor.plugins[key].getMetadata;
    return typeof getMetadata === 'function' ? makeLink(getMetadata()) : key;
  }, (x) => {
    return makeLink({ name: x.name, url: `https://www.tiny.cloud/docs/plugins/${x.type}/${x.slug}` });
  });

  const getPluginKeys = (editor: Editor) => {
    const keys = Obj.keys(editor.plugins);
    const forced_plugins = Settings.getForcedPlugins(editor);

    return forced_plugins === undefined ?
      keys :
      Arr.filter(keys, (k) => !Arr.contains(forced_plugins, k));
  };

  const pluginLister = (editor) => {
    const pluginKeys = getPluginKeys(editor);
    const pluginLis = Arr.map(pluginKeys, (key) => {
      return '<li>' + maybeUrlize(editor, key) + '</li>';
    });
    const count = pluginLis.length;
    const pluginsString = pluginLis.join('');

    const html = '<p><b>' + I18n.translate([ 'Plugins installed ({0}):', count ]) + '</b></p>' +
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

  const htmlPanel: Dialog.HtmlPanelSpec = {
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

export {
  tab
};
