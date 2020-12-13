/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import { Class, Classes, Css, DomEvent, Insert, InsertAll, RawRect, Remove, SugarElement, Traverse } from '@ephox/sugar';

import * as Styles from '../../style/Styles';
import * as Rectangles from '../../util/Rectangles';
import * as ResumeEditing from './ResumeEditing';

export default (win, frame) => {
  // NOTE: This may be required for android also.

  /*
   * FakeSelection is used to draw rectangles around selection so that when the content loses
   * focus, the selection is still visible. The selections should match the current content
   * selection, and be removed as soon as the user clicks on them (because the content will
   * get focus again)
   */
  const doc = win.document;

  const container = SugarElement.fromTag('div');
  Class.add(container, Styles.resolve('unfocused-selections'));

  Insert.append(SugarElement.fromDom(doc.documentElement), container);

  const onTouch = DomEvent.bind(container, 'touchstart', (event) => {
    // We preventDefault the event incase the touch is between 2 letters creating a new collapsed selection,
    // in this very specific case we just want to turn the fake cursor into a real cursor.  Remember that
    // touchstart may be used to dimiss popups too, so don't kill it completely, just prevent its
    // default native selection
    event.prevent();
    ResumeEditing.resume(win, frame);
    clear();
  });

  const make = (rectangle: RawRect) => {
    const span = SugarElement.fromTag('span');
    Classes.add(span, [ Styles.resolve('layer-editor'), Styles.resolve('unfocused-selection') ]);
    Css.setAll(span, {
      left: rectangle.left + 'px',
      top: rectangle.top + 'px',
      width: rectangle.width + 'px',
      height: rectangle.height + 'px'
    });
    return span;
  };

  const update = () => {
    clear();
    const rectangles = Rectangles.getRectangles(win);
    const spans = Arr.map(rectangles, make);
    InsertAll.append(container, spans);
  };

  const clear = () => {
    Remove.empty(container);
  };

  const destroy = () => {
    onTouch.unbind();
    Remove.remove(container);
  };

  const isActive = () => {
    return Traverse.children(container).length > 0;
  };

  return {
    update,
    isActive,
    destroy,
    clear
  };
};
