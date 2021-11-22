/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';
import Tools from 'tinymce/core/api/util/Tools';

import { PastePreProcessEvent, PastePostProcessEvent } from './Events';

type PreProcessFn = (plugin: Plugin, args: PastePreProcessEvent) => void;
type PostProcessFn = (plugin: Plugin, args: PastePostProcessEvent) => void;

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K] | undefined;
  <T>(name: string): (editor: Editor) => T | undefined;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('paste_block_drop', {
    processor: 'boolean',
    default: false
  });

  registerOption('paste_data_images', {
    processor: 'boolean',
    default: false
  });

  registerOption('paste_filter_drop', {
    processor: 'boolean',
    default: true
  });

  registerOption('paste_preprocess', {
    processor: 'function'
  });

  registerOption('paste_postprocess', {
    processor: 'function'
  });

  registerOption('paste_webkit_styles', {
    processor: 'string'
  });

  registerOption('paste_remove_styles_if_webkit', {
    processor: 'boolean',
    default: true
  });

  registerOption('paste_merge_formats', {
    processor: 'boolean',
    default: true
  });

  registerOption('smart_paste', {
    processor: 'boolean',
    default: true
  });

  registerOption('paste_as_text', {
    processor: 'boolean',
    default: false
  });

  registerOption('paste_enable_default_filters', {
    processor: 'boolean',
    default: true
  });

  registerOption('paste_tab_spaces', {
    processor: 'number',
    default: 4
  });
};

const shouldBlockDrop = option<boolean>('paste_block_drop');
const shouldPasteDataImages = option<boolean>('paste_data_images');
const shouldFilterDrop = option<boolean>('paste_filter_drop');
const getPreProcess = option<PreProcessFn>('paste_preprocess');
const getPostProcess = option<PostProcessFn>('paste_postprocess');
const getWebkitStyles = option<string>('paste_webkit_styles');
const shouldRemoveWebKitStyles = option<boolean>('paste_remove_styles_if_webkit');
const shouldMergeFormats = option<boolean>('paste_merge_formats');
const isSmartPasteEnabled = option<boolean>('smart_paste');
const isPasteAsTextEnabled = option<boolean>('paste_as_text');
const shouldUseDefaultFilters = option<boolean>('paste_enable_default_filters');
const getTabSpaces = option<number>('paste_tab_spaces');
const getAllowHtmlDataUrls = option('allow_html_data_urls');
const getImagesReuseFilename = option('images_reuse_filename');
const getForcedRootBlock = option('forced_root_block');
const getForcedRootBlockAttrs = option('forced_root_block_attrs');

const getAllowedImageFileTypes = (editor: Editor): string[] =>
  Tools.explode(editor.options.get('images_file_types'));

export {
  register,
  shouldBlockDrop,
  shouldPasteDataImages,
  shouldFilterDrop,
  getPreProcess,
  getPostProcess,
  getWebkitStyles,
  shouldRemoveWebKitStyles,
  shouldMergeFormats,
  isSmartPasteEnabled,
  isPasteAsTextEnabled,
  shouldUseDefaultFilters,
  getAllowHtmlDataUrls,
  getImagesReuseFilename,
  getForcedRootBlock,
  getForcedRootBlockAttrs,
  getTabSpaces,
  getAllowedImageFileTypes
};
