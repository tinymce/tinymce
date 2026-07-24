import { Arr, Fun, Obj, Optional, Optionals, Type } from '@ephox/katamari';

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

const withPremiumMarker = (name: string): string => `${name}<sup>*</sup>`;

const buildLink = (name: string, url: string): string =>
  `<a data-alloy-tabstop="true" tabindex="-1" href="${url}" target="_blank" rel="noopener">${name}</a>`;

const buildDocsUrl = (slug: string): string =>
  `https://www.tiny.cloud/docs/tinymce/${tinymce.majorVersion}/${slug}/`;

const readPluginMetadata = (editor: Editor, key: string): Optional<PluginMetadata> =>
  Obj.get(editor.plugins, key)
    .bind((plugin) => Optional.from(plugin.getMetadata))
    .filter(Type.isFunction)
    .map(Fun.apply);

const toEntry = (metadata: PluginMetadata): PluginEntry => {
  if ('type' in metadata) {
    const displayName = metadata.type === 'premium' ? withPremiumMarker(metadata.name) : metadata.name;
    const url = buildDocsUrl(metadata.slug);
    return { name: metadata.name, html: buildLink(displayName, url) };
  }
  return { name: metadata.name, html: buildLink(metadata.name, metadata.url) };
};

const buildPluginEntry = (editor: Editor, key: string): Optional<PluginEntry> =>
  readPluginMetadata(editor, key).fold(
    () => Optional.some({ name: key, html: key }),
    (metadata) => metadata.hidden === true ? Optional.none<PluginEntry>() : Optional.some(toEntry(metadata))
  );

const getVisiblePluginKeys = (editor: Editor): string[] => {
  const keys = Obj.keys(editor.plugins);
  const forced = Optional.from(Options.getForcedPlugins(editor)).getOr([]);
  return Arr.filter(keys, (k) => !Arr.contains(forced, k));
};

const renderPremiumFooter = (): string => {
  const learnMoreLink =
    `<a href="${pricingUrl}" rel="noopener" target="_blank" data-alloy-tabstop="true" tabindex="-1">` +
    I18n.translate('Learn more...') +
    '</a>';
  return '<p class="tox-help__more-link">' +
    I18n.translate([ '* indicates a premium plugin. {0}', learnMoreLink ]) +
    '</p>';
};

const renderPluginList = (editor: Editor): string => {
  const keys = getVisiblePluginKeys(editor);
  const entries = Optionals.cat(Arr.map(keys, (k) => buildPluginEntry(editor, k)));
  const sorted = Arr.sort(entries, (a, b) => a.name.localeCompare(b.name));

  const pluginLis = Arr.map(sorted, (entry) => '<li>' + entry.html + '</li>').join('');
  const heading = '<h1>' + I18n.translate([ 'Plugins installed ({0}):', sorted.length ]) + '</h1>';

  return heading + '<ul>' + pluginLis + '</ul>' + renderPremiumFooter();
};

const tab = (editor: Editor): Dialog.TabSpec & { name: string } => {
  const htmlPanel: Dialog.HtmlPanelSpec = {
    type: 'htmlpanel',
    presets: 'document',
    html: editor == null ? '' : '<div>' + renderPluginList(editor) + '</div>'
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
