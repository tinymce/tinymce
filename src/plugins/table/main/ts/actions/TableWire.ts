/**
 * TableWire.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { ResizeWire } from '@ephox/snooker';
import { Body, Css, Element, Insert, Remove } from '@ephox/sugar';

import * as Util from '../alien/Util';
import { Editor } from 'tinymce/core/api/Editor';

const createContainer = function () {
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

const get = function (editor: Editor, container?) {
  return editor.inline ? ResizeWire.body(Util.getBody(editor), createContainer()) : ResizeWire.only(Element.fromDom(editor.getDoc()));
};

const remove = function (editor: Editor, wire) {
  if (editor.inline) {
    Remove.remove(wire.parent());
  }
};

export default {
  get,
  remove
};