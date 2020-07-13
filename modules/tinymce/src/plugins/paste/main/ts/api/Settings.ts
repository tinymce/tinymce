/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLImageElement } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';

const defaultValidElements = (
  '-strong/b,-em/i,-u,-span,-p,-ol,-ul,-li,-h1,-h2,-h3,-h4,-h5,-h6,' +
  '-p/div,-a[href|name],sub,sup,strike,br,del,table[width],tr,' +
  'td[colspan|rowspan|width],th[colspan|rowspan|width],thead,tfoot,tbody'
);

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const shouldBlockDrop = getSetting('paste_block_drop', false);

const shouldPasteDataImages = getSetting('paste_data_images', false);

const shouldFilterDrop = getSetting('paste_filter_drop', true);

type ProcessFn = (plugin, args) => void;

const getPreProcess = getSetting<ProcessFn>('paste_preprocess');

const getPostProcess = getSetting<ProcessFn>('paste_postprocess');

const getWebkitStyles = getSetting<string>('paste_webkit_styles');

const shouldRemoveWebKitStyles = getSetting('paste_remove_styles_if_webkit', true);

const shouldMergeFormats = getSetting('paste_merge_formats', true);

const isSmartPasteEnabled = getSetting('smart_paste', true);

const isPasteAsTextEnabled = getSetting('paste_as_text', false);

const getRetainStyleProps = getSetting<string>('paste_retain_style_properties');

const getWordValidElements = getSetting('paste_word_valid_elements', defaultValidElements);

const shouldConvertWordFakeLists = getSetting('paste_convert_word_fake_lists', true);

const shouldUseDefaultFilters = getSetting('paste_enable_default_filters', true);

const getValidate = getSetting<boolean>('validate');

const getAllowHtmlDataUrls = getSetting('allow_html_data_urls', false, 'boolean');

const getPasteDataImages = getSetting('paste_data_images', false, 'boolean');

const getImagesDataImgFilter = getSetting<(img: HTMLImageElement) => boolean>('images_dataimg_filter');

const getImagesReuseFilename = getSetting<boolean>('images_reuse_filename');

const getForcedRootBlock = getSetting<string | boolean>('forced_root_block');

const getForcedRootBlockAttrs = getSetting<Record<string, string>>('forced_root_block_attrs');

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
  getRetainStyleProps,
  getWordValidElements,
  shouldConvertWordFakeLists,
  shouldUseDefaultFilters,
  getValidate,
  getAllowHtmlDataUrls,
  getPasteDataImages,
  getImagesDataImgFilter,
  getImagesReuseFilename,
  getForcedRootBlock,
  getForcedRootBlockAttrs
};
