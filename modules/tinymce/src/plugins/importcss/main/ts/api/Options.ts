import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { StyleFormat } from 'tinymce/core/api/fmt/StyleFormat';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

import { UserDefinedGroup } from '../core/ImportCss';

type SelectorConvertor = () => StyleFormat | undefined;
type FileFilter = string | RegExp | ((value: string, imported?: boolean) => boolean) | undefined;
type SelectorFilter = string | RegExp | ((value: string) => boolean) | undefined;

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  const filterProcessor = (value: unknown) =>
    Type.isString(value) || Type.isFunction(value) || Type.isObject(value);

  registerOption('importcss_merge_classes', {
    processor: 'boolean',
    default: true
  });

  registerOption('importcss_exclusive', {
    processor: 'boolean',
    default: true
  });

  registerOption('importcss_selector_converter', {
    processor: 'function'
  });

  registerOption('importcss_selector_filter', {
    processor: filterProcessor
  });

  registerOption('importcss_file_filter', {
    processor: filterProcessor
  });

  registerOption('importcss_groups', {
    processor: 'object[]'
  });

  registerOption('importcss_append', {
    processor: 'boolean',
    default: false
  });
};

const shouldMergeClasses = option<boolean>('importcss_merge_classes');
const shouldImportExclusive = option<boolean>('importcss_exclusive');
const getSelectorConverter = option<SelectorConvertor | undefined>('importcss_selector_converter');
const getSelectorFilter = option<SelectorFilter | undefined>('importcss_selector_filter');
const getCssGroups = option<UserDefinedGroup[] | undefined>('importcss_groups');
const shouldAppend = option<boolean>('importcss_append');
const getFileFilter = option<FileFilter | undefined>('importcss_file_filter');
const getSkin = option('skin');
const getSkinUrl = option('skin_url');

export {
  register,
  shouldMergeClasses,
  shouldImportExclusive,
  getSelectorConverter,
  getSelectorFilter,
  getCssGroups,
  shouldAppend,
  getFileFilter,
  getSkin,
  getSkinUrl
};
