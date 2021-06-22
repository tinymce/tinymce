/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Obj, Optional, Singleton, Type } from '@ephox/katamari';
import { Attribute, Dimension, SugarElement, SugarNode, TransformFind } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { ContentLanguage } from 'tinymce/core/api/SettingsTypes';
import { Menu } from 'tinymce/core/api/ui/Ui';

import * as Settings from '../../api/Settings';

interface ControlSpec<T> {
  readonly name: string;
  readonly text: string;
  readonly icon: string;

  readonly getOptions: (editor: Editor) => Array<T>;
  readonly normalise: (item: T) => string;
  readonly display: (item: T) => string;

  readonly getCurrent: (editor: Editor) => Optional<T>;
  readonly setCurrent: (editor: Editor, value: T) => void;
}

const registerController = <T>(editor: Editor, spec: ControlSpec<T>) => {
  const getMenuItems = (): Menu.ToggleMenuItemSpec[] => {
    const options = spec.getOptions(editor);

    // All of the API objects (one for each option)
    const apis: Record<string, Menu.ToggleMenuItemInstanceApi> = {};
    // The currently active API object (in a destroyable so that it automatically cleans itself up)
    const lastApi = Singleton.destroyable();

    const callback = () => {
      const current = spec.getCurrent(editor);
      const apiOpt = current.map(spec.normalise).bind((key) => Obj.get(apis, key));
      apiOpt.fold(
        // If we don't have a menu item for the current state, make sure we're not highlighting anything
        lastApi.clear,
        // If we do have a menu item for the current state, highlight it
        (api) => {
          lastApi.set({
            destroy: () => api.setActive(false)
          });
          api.setActive(true);
        }
      );
    };

    editor.on('NodeChange', callback);

    return Arr.map(
      options,
      (value, i) => ({
        type: 'togglemenuitem',
        text: spec.display(value),
        onSetup: (api) => {
          apis[spec.normalise(value)] = api;

          if (i + 1 === options.length) {
            // run the callback once on startup (on the last option so that we know the apis map has been set up)
            callback();
          }

          return () => {
            // only clean up global things once
            if (i === 0) {
              editor.off('NodeChange', callback);
              lastApi.clear();
            }
          };
        },
        onAction: () => spec.setCurrent(editor, value)
      })
    );
  };

  editor.ui.registry.addMenuButton(spec.name, {
    tooltip: spec.text,
    icon: spec.icon,
    fetch: (callback) => callback(getMenuItems())
  });

  editor.ui.registry.addNestedMenuItem(spec.name, {
    type: 'nestedmenuitem',
    text: spec.text,
    getSubmenuItems: getMenuItems
  });
};

const lineHeightSpec: ControlSpec<string> = {
  name: 'lineheight',
  text: 'Line height',
  icon: 'line-height',

  getOptions: Settings.getLineHeightFormats,
  normalise: (input) => Dimension.normalise(input, [ 'fixed', 'relative', 'empty' ]).getOr(input),
  display: Fun.identity,

  getCurrent: (editor) => Optional.some(editor.queryCommandValue('LineHeight')),
  setCurrent: (editor, value) => editor.execCommand('LineHeight', false, value)
};

const languageSpec: ControlSpec<ContentLanguage> = {
  name: 'language',
  text: 'Language',
  icon: 'translate',

  getOptions: Settings.getContentLangugaes,
  normalise: (input) => Type.isUndefined(input.customCode) ? input.code : `${input.code}/${input.customCode}`,
  display: (input) => input.title,

  getCurrent: (editor) => {
    const selection = SugarElement.fromDom(editor.selection.getRng().startContainer);
    return TransformFind.ancestor(selection, (node) => {
      if (!SugarNode.isElement(node)) {
        return Optional.none();
      }

      const codeOpt = Attribute.getOpt(node, 'lang');
      const customCode = Attribute.getOpt(node, 'data-mce-lang').getOrUndefined();
      // The actual language title doesn't matter, because all we're going to do
      // is pass this to normalise (which ignores the title)
      const title = '';

      return codeOpt.map((code): ContentLanguage => ({ code, customCode, title }));
    });
  },
  setCurrent: (editor, lang) => {
    editor.formatter.toggle('lang', {
      value: lang.code,
      customValue: lang.customCode
    });
    editor.nodeChanged();
  }
};

const register = (editor: Editor) => {
  registerController(editor, lineHeightSpec);
  registerController(editor, languageSpec);
};

export {
  register
};
