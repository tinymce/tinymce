/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { CssUtils, ResizeWire } from '@ephox/snooker';
import { Body, Css, Element, Insert, Remove } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

const createContainer = () => {
  const container = Element.fromTag('div');

  Css.setAll(container, {
    position: 'static',
    height: '0',
    width: '0',
    padding: '0',
    margin: '0',
    border: '0'
  });

  Insert.append(Body.body(), container);

  return container;
};

const get = (editor: Editor, _container?) =>
  editor.inline ? ResizeWire.body(CssUtils.getBody(editor), createContainer()) : ResizeWire.only(Element.fromDom(editor.getDoc()));

const remove = (editor: Editor, wire) => {
  if (editor.inline) {
    Remove.remove(wire.parent());
  }
};

export { get, remove };
