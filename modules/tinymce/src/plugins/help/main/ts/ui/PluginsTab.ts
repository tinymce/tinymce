import { Arr, Obj, Type } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';
import type { PluginMetadata } from 'tinymce/core/api/PluginManager';
import type { TinyMCE } from 'tinymce/core/api/Tinymce';
import type { Dialog } from 'tinymce/core/api/ui/Ui';
import I18n from 'tinymce/core/api/util/I18n';

import * as Options from '../api/Options';

declare let tinymce: TinyMCE;

interface PluginEntry {
  readonly name: string;
  readonly html: string;
}

const pricingUrl = 'https://www.tiny.cloud/pricing/?utm_campaign=help_dialog_plugin_tab&utm_source=tiny&utm_medium=referral&utm_term=read_more&utm_content=premium_plugin_heading';

const renderPremiumName = (name: string): string => `${name}<sup>*</sup>`;

const makeLink = (name: string, url: string): string =>
  `<a data-alloy-tabstop="true" tabindex="-1" href="${url}" target="_blank" rel="noopener">${name}</a>`;

const buildDocsUrl = (slug: string): string =>
  `https://www.tiny.cloud/docs/tinymce/${tinymce.majorVersion}/${slug}/`;

const getMetadata = (editor: Editor, key: string): PluginMetadata | undefined => {
  const plugin = editor.plugins[key];
  const fn = plugin?.getMetadata;
  return Type.isFunction(fn) ? fn() : undefined;
};

const entryForPlugin = (editor: Editor, key: string): PluginEntry | undefined => {
  const metadata = getMetadata(editor, key);
  if (Type.isUndefined(metadata)) {
    return { name: key, html: key };
  }
  if (metadata.hidden === true) {
    return undefined;
  }
  if ('type' in metadata) {
    const displayName = metadata.type === 'premium' ? renderPremiumName(metadata.name) : metadata.name;
    const url = buildDocsUrl(metadata.slug ?? key);
    return { name: metadata.name, html: makeLink(displayName, url) };
  }
  return { name: metadata.name, html: makeLink(metadata.name, metadata.url) };
};

const getVisiblePluginKeys = (editor: Editor): string[] => {
  const keys = Obj.keys(editor.plugins);
  const forcedPlugins = Options.getForcedPlugins(editor);
  const forced = Type.isUndefined(forcedPlugins) ? [] : forcedPlugins;
  return Arr.filter(keys, (k) => !Arr.contains(forced, k));
};

const renderPremiumFooter = (): string =>
  '<p class="tox-help__more-link">' +
  I18n.translate('* indicates a premium plugin.') + ' ' +
  `<a href="${pricingUrl}" rel="noopener" target="_blank" data-alloy-tabstop="true" tabindex="-1">` +
  I18n.translate('Learn more...') + '</a>' +
  '</p>';

const pluginLister = (editor: Editor): string => {
  const keys = getVisiblePluginKeys(editor);
  const entries = Arr.filter(
    Arr.map(keys, (k) => entryForPlugin(editor, k)),
    (entry): entry is PluginEntry => Type.isNonNullable(entry)
  );
  const sorted = Arr.sort(entries, (a, b) => a.name.localeCompare(b.name));

  const pluginLis = Arr.map(sorted, (entry) => '<li>' + entry.html + '</li>').join('');
  const heading = '<h1>' + I18n.translate([ 'Plugins installed ({0}):', sorted.length ]) + '</h1>';

  return heading + '<ul>' + pluginLis + '</ul>' + renderPremiumFooter();
};

const tab = (editor: Editor): Dialog.TabSpec & { name: string } => {
  const htmlPanel: Dialog.HtmlPanelSpec = {
    type: 'htmlpanel',
    presets: 'document',
    html: editor == null ? '' : '<div>' + pluginLister(editor) + '</div>'
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
