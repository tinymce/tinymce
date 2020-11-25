/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

export interface PluginUrlType {
  key: string;
  name: string;
  type?: 'opensource' | 'premium';
  slug?: string;
}

const urls: PluginUrlType[] = [
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
  { key: 'advcode', name: 'Advanced Code Editor*', type: 'premium' },
  { key: 'formatpainter', name: 'Format Painter*', type: 'premium' },
  { key: 'powerpaste', name: 'PowerPaste*', type: 'premium' },
  { key: 'tinydrive', name: 'Tiny Drive*', type: 'premium' },
  { key: 'tinymcespellchecker', name: 'Spell Checker Pro*', type: 'premium' },
  { key: 'a11ychecker', name: 'Accessibility Checker*', type: 'premium' },
  { key: 'linkchecker', name: 'Link Checker*', type: 'premium' },
  { key: 'mentions', name: 'Mentions*', type: 'premium' },
  { key: 'mediaembed', name: 'Enhanced Media Embed*', type: 'premium' },
  { key: 'checklist', name: 'Checklist*', type: 'premium' },
  { key: 'casechange', name: 'Case Change*', type: 'premium' },
  { key: 'permanentpen', name: 'Permanent Pen*', type: 'premium' },
  { key: 'pageembed', name: 'Page Embed*', type: 'premium' },
  { key: 'tinycomments', name: 'Tiny Comments*', type: 'premium', slug: 'comments' },
  { key: 'advtable', name: 'Advanced Tables*', type: 'premium' },
  { key: 'autocorrect', name: 'Autocorrect*', type: 'premium' },
  { key: 'export', name: 'Export*', type: 'premium' }
];

export {
  urls
};
