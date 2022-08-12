import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

import { UserListItem } from '../ui/DialogTypes';
import { AssumeExternalTargets } from './Types';

type UserLinkListCallback = (callback: (items: UserListItem[]) => void) => void;

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('link_assume_external_targets', {
    processor: (value) => {
      const valid = Type.isString(value) || Type.isBoolean(value);
      if (valid) {
        if (value === true) {
          return { value: AssumeExternalTargets.WARN, valid };
        } else if (value === AssumeExternalTargets.ALWAYS_HTTP || value === AssumeExternalTargets.ALWAYS_HTTPS) {
          return { value, valid };
        } else {
          return { value: AssumeExternalTargets.OFF, valid };
        }
      } else {
        return { valid: false, message: 'Must be a string or a boolean.' };
      }
    },
    default: false
  });

  registerOption('link_context_toolbar', {
    processor: 'boolean',
    default: false
  });

  registerOption('link_list', {
    processor: (value) => Type.isString(value) || Type.isFunction(value) || Type.isArrayOf(value, Type.isObject)
  });

  registerOption('link_default_target', {
    processor: 'string'
  });

  registerOption('link_default_protocol', {
    processor: 'string',
    default: 'https'
  });

  registerOption('link_target_list', {
    processor: (value) => Type.isBoolean(value) || Type.isArrayOf(value, Type.isObject),
    default: true
  });

  registerOption('link_rel_list', {
    processor: 'object[]',
    default: []
  });

  registerOption('link_class_list', {
    processor: 'object[]',
    default: []
  });

  registerOption('link_title', {
    processor: 'boolean',
    default: true
  });

  registerOption('allow_unsafe_link_target', {
    processor: 'boolean',
    default: false
  });

  registerOption('link_quicklink', {
    processor: 'boolean',
    default: false
  });
};

const assumeExternalTargets = option<AssumeExternalTargets>('link_assume_external_targets');
const hasContextToolbar = option<boolean>('link_context_toolbar');
const getLinkList = option<string | UserListItem[] | UserLinkListCallback | undefined>('link_list');
const getDefaultLinkTarget = option<string | undefined>('link_default_target');
const getDefaultLinkProtocol = option<string>('link_default_protocol');
const getTargetList = option<boolean | UserListItem[]>('link_target_list');
const getRelList = option<UserListItem[]>('link_rel_list');
const getLinkClassList = option<UserListItem[]>('link_class_list');
const shouldShowLinkTitle = option<boolean>('link_title');
const allowUnsafeLinkTarget = option<boolean>('allow_unsafe_link_target');
const useQuickLink = option<boolean>('link_quicklink');

export {
  register,
  assumeExternalTargets,
  hasContextToolbar,
  getLinkList,
  getDefaultLinkTarget,
  getTargetList,
  getRelList,
  getLinkClassList,
  shouldShowLinkTitle,
  allowUnsafeLinkTarget,
  useQuickLink,
  getDefaultLinkProtocol
};
