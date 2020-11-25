/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const urls = [
  { key: 'advlist', name: 'Advanced List', slug: 'opensource/advlist' },
  { key: 'anchor', name: 'Anchor', slug: 'opensource/anchor' },
  { key: 'autolink', name: 'Autolink', slug: 'opensource/autolink' },
  { key: 'autoresize', name: 'Autoresize', slug: 'opensource/autoresize' },
  { key: 'autosave', name: 'Autosave', slug: 'opensource/autosave' },
  { key: 'bbcode', name: 'BBCode', slug: 'opensource/bbcode' },
  { key: 'charmap', name: 'Character Map', slug: 'opensource/charmap' },
  { key: 'code', name: 'Code', slug: 'opensource/code' },
  { key: 'codesample', name: 'Code Sample', slug: 'opensource/codesample' },
  { key: 'colorpicker', name: 'Color Picker', slug: 'opensource/colorpicker' },
  { key: 'directionality', name: 'Directionality', slug: 'opensource/directionality' },
  { key: 'emoticons', name: 'Emoticons', slug: 'opensource/emoticons' },
  { key: 'fullpage', name: 'Full Page', slug: 'opensource/fullpage' },
  { key: 'fullscreen', name: 'Full Screen', slug: 'opensource/fullscreen' },
  { key: 'help', name: 'Help', slug: 'opensource/help' },
  { key: 'hr', name: 'Horizontal Rule', slug: 'opensource/hr' },
  { key: 'image', name: 'Image', slug: 'opensource/image' },
  { key: 'imagetools', name: 'Image Tools', slug: 'opensource/imagetools' },
  { key: 'importcss', name: 'Import CSS', slug: 'opensource/importcss' },
  { key: 'insertdatetime', name: 'Insert Date/Time', slug: 'opensource/insertdatetime' },
  { key: 'legacyoutput', name: 'Legacy Output', slug: 'opensource/legacyoutput' },
  { key: 'link', name: 'Link', slug: 'opensource/link' },
  { key: 'lists', name: 'Lists', slug: 'opensource/lists' },
  { key: 'media', name: 'Media', slug: 'opensource/media' },
  { key: 'nonbreaking', name: 'Nonbreaking', slug: 'opensource/nonbreaking' },
  { key: 'noneditable', name: 'Noneditable', slug: 'opensource/noneditable' },
  { key: 'pagebreak', name: 'Page Break', slug: 'opensource/pagebreak' },
  { key: 'paste', name: 'Paste', slug: 'opensource/paste' },
  { key: 'preview', name: 'Preview', slug: 'opensource/preview' },
  { key: 'print', name: 'Print', slug: 'opensource/print' },
  { key: 'save', name: 'Save', slug: 'opensource/save' },
  { key: 'searchreplace', name: 'Search and Replace', slug: 'opensource/searchreplace' },
  { key: 'spellchecker', name: 'Spell Checker', slug: 'opensource/spellchecker' },
  { key: 'tabfocus', name: 'Tab Focus', slug: 'opensource/tabfocus' },
  { key: 'table', name: 'Table', slug: 'opensource/table' },
  { key: 'template', name: 'Template', slug: 'opensource/template' },
  { key: 'textcolor', name: 'Text Color', slug: 'opensource/textcolor' },
  { key: 'textpattern', name: 'Text Pattern', slug: 'opensource/textpattern' },
  { key: 'toc', name: 'Table of Contents', slug: 'opensource/toc' },
  { key: 'visualblocks', name: 'Visual Blocks', slug: 'opensource/visualblocks' },
  { key: 'visualchars', name: 'Visual Characters', slug: 'opensource/visualchars' },
  { key: 'wordcount', name: 'Word Count', slug: 'opensource/wordcount' },
  // TODO: Add other premium plugins when they are included in the website
  { key: 'advcode', name: 'Advanced Code Editor*', slug: 'premium/advcode' },
  { key: 'formatpainter', name: 'Format Painter*', slug: 'premium/formatpainter' },
  { key: 'powerpaste', name: 'PowerPaste*', slug: 'premium/powerpaste' },
  { key: 'tinydrive', name: 'Tiny Drive*', slug: 'premium/tinydrive' },
  { key: 'tinymcespellchecker', name: 'Spell Checker Pro*', slug: 'premium/tinymcespellchecker' },
  { key: 'a11ychecker', name: 'Accessibility Checker*', slug: 'premium/a11ychecker' },
  { key: 'linkchecker', name: 'Link Checker*', slug: 'premium/linkchecker' },
  { key: 'mentions', name: 'Mentions*', slug: 'premium/mentions' },
  { key: 'mediaembed', name: 'Enhanced Media Embed*', slug: 'premium/mediaembed' },
  { key: 'checklist', name: 'Checklist*', slug: 'premium/checklist' },
  { key: 'casechange', name: 'Case Change*', slug: 'premium/casechange' },
  { key: 'permanentpen', name: 'Permanent Pen*', slug: 'premium/permanentpen' },
  { key: 'pageembed', name: 'Page Embed*', slug: 'premium/pageembed' },
  { key: 'tinycomments', name: 'Tiny Comments*', slug: 'premium/comments' },
  { key: 'advtable', name: 'Advanced Tables*', slug: 'premium/advtable' },
  { key: 'autocorrect', name: 'Autocorrect*', slug: 'premium/autocorrect' },
  { key: 'export', name: 'Export*', slug: 'premium/export' }
];

export {
  urls
};
