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

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const shouldBlockDrop = (editor: Editor): boolean =>
  editor.getParam('paste_block_drop', false);

const shouldPasteDataImages = (editor: Editor): boolean =>
  editor.getParam('paste_data_images', false);

const shouldFilterDrop = (editor: Editor): boolean =>
  editor.getParam('paste_filter_drop', true);

type PreProcessFn = (plugin: Plugin, args: PastePreProcessEvent) => void;
type PostProcessFn = (plugin: Plugin, args: PastePostProcessEvent) => void;

const getPreProcess = (editor: Editor): PreProcessFn | undefined =>
  editor.getParam('paste_preprocess');

const getPostProcess = (editor: Editor): PostProcessFn | undefined =>
  editor.getParam('paste_postprocess');

const getWebkitStyles = (editor: Editor): string | undefined =>
  editor.getParam('paste_webkit_styles');

const shouldRemoveWebKitStyles = (editor: Editor): boolean =>
  editor.getParam('paste_remove_styles_if_webkit', true);

const shouldMergeFormats = (editor: Editor): boolean =>
  editor.getParam('paste_merge_formats', true);

const isSmartPasteEnabled = (editor: Editor): boolean =>
  editor.getParam('smart_paste', true);

const isPasteAsTextEnabled = (editor: Editor): boolean =>
  editor.getParam('paste_as_text', false);

const shouldUseDefaultFilters = (editor: Editor): boolean =>
  editor.getParam('paste_enable_default_filters', true);

const getPasteDataImages = (editor: Editor): boolean =>
  editor.getParam('paste_data_images', false, 'boolean');

const getAllowHtmlDataUrls = option('allow_html_data_urls');
const getImagesReuseFilename = option('images_reuse_filename');
const getForcedRootBlock = option('forced_root_block');
const getForcedRootBlockAttrs = option('forced_root_block_attrs');

const getTabSpaces = (editor: Editor): number =>
  editor.getParam('paste_tab_spaces', 4, 'number');

const getAllowedImageFileTypes = (editor: Editor): string[] =>
  Tools.explode(editor.options.get('images_file_types'));

export {
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
  getPasteDataImages,
  getAllowHtmlDataUrls,
  getImagesReuseFilename,
  getForcedRootBlock,
  getForcedRootBlockAttrs,
  getTabSpaces,
  getAllowedImageFileTypes
};
