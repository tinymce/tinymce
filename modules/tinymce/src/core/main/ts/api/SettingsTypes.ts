/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, HTMLElement, HTMLImageElement, Node } from '@ephox/dom-globals';
import { UploadHandler } from '../file/Uploader';
import { AllowedFormat } from './fmt/StyleFormat';
import { Formats } from './fmt/Format';
import Editor from './Editor';
import { SchemaType } from './html/Schema';

export type ThemeInitFunc = (editor: Editor, elm: HTMLElement) => {
  editorContainer: HTMLElement;
  iframeContainer: HTMLElement;
  height?: number;
  iframeHeight?: number;
};

export type SetupCallback = (editor: Editor) => void;

export type FilePickerCallback = (callback: Function, value: any, meta: Record<string, any>) => void;
export type FilePickerValidationStatus = 'valid' | 'unknown' | 'invalid' | 'none';
export type FilePickerValidationCallback = (info: { type: string, url: string }, callback: (validation: { status: FilePickerValidationStatus, message: string}) => void) => void;

export type URLConverter = (url: string, name: string, elm?: HTMLElement) => string;
export type URLConverterCallback = (url: string, node: Node, on_save: boolean, name: string) => void;

export interface RawEditorSettings {
  add_form_submit_trigger?: boolean;
  add_unload_trigger?: boolean;
  allow_conditional_comments?: boolean;
  allow_html_in_named_anchor?: boolean;
  allow_script_urls?: boolean;
  allow_unsafe_link_target?: boolean;
  anchor_bottom?: boolean | string;
  anchor_top?: boolean | string;
  auto_focus?: string | true;
  automatic_uploads?: boolean;
  base_url?: string;
  block_formats?: string;
  body_id?: string;
  body_class?: string;
  br_in_pre?: boolean;
  br_newline_selector?: string;
  browser_spellcheck?: boolean;
  branding?: boolean;
  cache_suffix?: string;
  color_cols?: number;
  color_map?: string[];
  content_css?: boolean | string | string[];
  content_css_cors?: boolean;
  content_security_policy?: string;
  content_style?: string;
  contextmenu?: string | false;
  contextmenu_never_use_native?: boolean;
  convert_fonts_to_spans?: boolean;
  convert_urls?: boolean;
  custom_colors?: boolean;
  custom_elements?: string;
  custom_ui_selector?: string;
  custom_undo_redo_levels?: number;
  directionality?: 'ltr' | 'rtl';
  doctype?: string;
  document_base_url?: string;
  element_format?: 'xhtml' | 'html';
  elementpath?: boolean;
  encoding?: string;
  end_container_on_empty_block?: boolean;
  entities?: string;
  entity_encoding?: string;
  extended_valid_elements?: string;
  external_plugins?: Record<string, string>;
  event_root?: string;
  file_picker_callback?: FilePickerCallback;
  file_picker_types?: string;
  filepicker_validator_handler?: FilePickerValidationCallback;
  fix_list_elements?: boolean;
  fixed_toolbar_container?: string;
  font_formats?: string;
  font_size_classes?: string;
  font_size_legacy_values?: string;
  font_size_style_values?: string;
  fontsize_formats?: string;
  force_hex_style_colors?: boolean;
  forced_root_block?: boolean | string;
  forced_root_block_attrs?: Record<string, string>;
  formats?: Formats;
  gecko_spellcheck?: boolean;
  height?: number | string;
  hidden_input?: boolean;
  icons?: string;
  icons_url?: string;
  id?: string;
  images_dataimg_filter?: (imgElm: HTMLImageElement) => boolean;
  images_replace_blob_uris?: boolean;
  images_reuse_filename?: boolean;
  images_upload_base_path?: string;
  images_upload_credentials?: boolean;
  images_upload_handler?: UploadHandler;
  images_upload_url?: string;
  indent?: boolean;
  indent_after?: string;
  indent_before?: string;
  indent_use_margin?: boolean;
  indentation?: string;
  init_instance_callback?: SetupCallback;
  inline?: boolean;
  inline_boundaries?: boolean;
  inline_boundaries_selector?: string;
  inline_styles?: boolean;
  invalid_elements?: string;
  invalid_styles?: string;
  keep_styles?: boolean;
  language?: string;
  language_load?: boolean;
  language_url?: string;
  max_height?: number;
  max_width?: number;
  menu?: Record<string, { title: string, items: string }>;
  menubar?: boolean | string;
  min_height?: number;
  min_width?: number;
  mobile?: RawEditorSettings;
  no_newline_selector?: string;
  nowrap?: boolean;
  object_resizing?: boolean | string;
  plugins?: string | string[];
  preview_styles?: boolean | string;
  protect?: RegExp[];
  readonly?: boolean;
  relative_urls?: boolean;
  remove_script_host?: boolean;
  remove_trailing_brs?: boolean;
  removed_menuitems?: string;
  resize?: boolean | 'both';
  resize_img_proportional?: boolean;
  root_name?: string;
  schema?: SchemaType;
  selector?: string;
  setup?: SetupCallback;
  skin?: boolean | string;
  skin_url?: string;
  statusbar?: boolean;
  style_formats?: AllowedFormat[];
  style_formats_autohide?: boolean;
  style_formats_merge?: boolean;
  submit_patch?: boolean;
  suffix?: string;
  target?: Element;
  theme?: string | ThemeInitFunc;
  theme_url?: string;
  toolbar?: boolean | string | string[] | { name: string, items: string[]}[];
  toolbar1?: string;
  toolbar2?: string;
  toolbar3?: string;
  toolbar4?: string;
  toolbar5?: string;
  toolbar6?: string;
  toolbar7?: string;
  toolbar8?: string;
  toolbar9?: string;
  toolbar_drawer?: 'floating' | 'sliding';
  typeahead_urls?: boolean;
  url_converter?: URLConverter;
  url_converter_scope?: {};
  urlconverter_callback?: string | URLConverterCallback;
  valid_children?: string;
  valid_classes?: string | Record<string, string>;
  valid_elements?: string;
  valid_styles?: string | Record<string, string>;
  visual?: boolean;
  visual_anchor_class?: string;
  visual_table_class?: string;
  width?: number | string;

  // Deprecated settings
  editor_deselector?: string;
  editor_selector?: string;
  elements?: string;
  mode?: 'exact' | 'textareas' | 'specific_textareas';
  types?: Record<string, any>[];

  // Considered for deprecation (Schema settings)
  block_elements?: string;
  boolean_attributes?: string;
  move_caret_before_on_enter_elements?: string;
  non_empty_elements?: string;
  self_closing_elements?: string;
  short_ended_elements?: string;
  text_block_elements?: string;
  text_inline_elements?: string;
  whitespace_elements?: string;

  // Internal settings (used by cloud or tests)
  disable_nodechange?: boolean;
  forced_plugins?: string | string[];
  plugin_base_urls?: Record<string, string>;
  service_message?: string;

  // Special always forced on setting
  // TODO: Get rid of this one
  validate?: boolean;

  // Allow additional dynamic settings
  [key: string]: any;
}

// EditorSettings.ts processes the plugins setting to turn it into a string
export interface EditorSettings extends RawEditorSettings {
  mobile?: EditorSettings;
  plugins?: string;
}
