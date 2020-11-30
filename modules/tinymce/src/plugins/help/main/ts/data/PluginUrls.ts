/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';

type PluginType = 'opensource' | 'premium';

interface PartialPluginUrl {
  readonly key: string;
  readonly name: string;
  readonly type?: PluginType;
  readonly slug?: string;
}

export interface PluginUrl extends PartialPluginUrl {
  readonly type: PluginType;
  readonly slug: string;
}

const premiumType: PluginType = 'premium';
const openSourceType: PluginType = 'opensource';

const urls = Arr.map<PartialPluginUrl, PluginUrl>([
  { key: 'advlist', name: 'Advanced List' },
  { key: 'anchor', name: 'Anchor' },
  { key: 'autolink', name: 'Autolink' },
  { key: 'autoresize', name: 'Autoresize' },
  { key: 'autosave', name: 'Autosave' },
  { key: 'bbcode', name: 'BBCode' },
  { key: 'charmap', name: 'Character Map' },
  { key: 'code', name: 'Code' },
  { key: 'codesample', name: 'Code Sample' },
  { key: 'colorpicker', name: 'Color Picker' },
  { key: 'directionality', name: 'Directionality' },
  { key: 'emoticons', name: 'Emoticons' },
  { key: 'fullpage', name: 'Full Page' },
  { key: 'fullscreen', name: 'Full Screen' },
  { key: 'help', name: 'Help' },
  { key: 'hr', name: 'Horizontal Rule' },
  { key: 'image', name: 'Image' },
  { key: 'imagetools', name: 'Image Tools' },
  { key: 'importcss', name: 'Import CSS' },
  { key: 'insertdatetime', name: 'Insert Date/Time' },
  { key: 'legacyoutput', name: 'Legacy Output' },
  { key: 'link', name: 'Link' },
  { key: 'lists', name: 'Lists' },
  { key: 'media', name: 'Media' },
  { key: 'nonbreaking', name: 'Nonbreaking' },
  { key: 'noneditable', name: 'Noneditable' },
  { key: 'pagebreak', name: 'Page Break' },
  { key: 'paste', name: 'Paste' },
  { key: 'preview', name: 'Preview' },
  { key: 'print', name: 'Print' },
  { key: 'save', name: 'Save' },
  { key: 'searchreplace', name: 'Search and Replace' },
  { key: 'spellchecker', name: 'Spell Checker' },
  { key: 'tabfocus', name: 'Tab Focus' },
  { key: 'table', name: 'Table' },
  { key: 'template', name: 'Template' },
  { key: 'textcolor', name: 'Text Color' },
  { key: 'textpattern', name: 'Text Pattern' },
  { key: 'toc', name: 'Table of Contents' },
  { key: 'visualblocks', name: 'Visual Blocks' },
  { key: 'visualchars', name: 'Visual Characters' },
  { key: 'wordcount', name: 'Word Count' },
  // TODO: Add other premium plugins when they are included in the website
  { key: 'advcode', name: 'Advanced Code Editor*', type: premiumType },
  { key: 'formatpainter', name: 'Format Painter*', type: premiumType },
  { key: 'powerpaste', name: 'PowerPaste*', type: premiumType },
  { key: 'tinydrive', name: 'Tiny Drive*', type: premiumType },
  { key: 'tinymcespellchecker', name: 'Spell Checker Pro*', type: premiumType },
  { key: 'a11ychecker', name: 'Accessibility Checker*', type: premiumType },
  { key: 'linkchecker', name: 'Link Checker*', type: premiumType },
  { key: 'mentions', name: 'Mentions*', type: premiumType },
  { key: 'mediaembed', name: 'Enhanced Media Embed*', type: premiumType },
  { key: 'checklist', name: 'Checklist*', type: premiumType },
  { key: 'casechange', name: 'Case Change*', type: premiumType },
  { key: 'permanentpen', name: 'Permanent Pen*', type: premiumType },
  { key: 'pageembed', name: 'Page Embed*', type: premiumType },
  { key: 'tinycomments', name: 'Tiny Comments*', type: premiumType, slug: 'comments' },
  { key: 'advtable', name: 'Advanced Tables*', type: premiumType },
  { key: 'autocorrect', name: 'Autocorrect*', type: premiumType },
  { key: 'export', name: 'Export*', type: premiumType }
], (item) => ({
  ...item,
  // Set the defaults/fallbacks for the plugin urls
  type: item.type || openSourceType,
  slug: item.slug || item.key
}));

export {
  urls
};
