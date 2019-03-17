/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddEventsBehaviour, AlloyEvents, Behaviour, Button, Keying, Replacing, Tabstopping } from '@ephox/alloy';
import { Arr } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

const isHidden = (elm) => {
  if (elm.nodeType === 1) {
    if (elm.nodeName === 'BR' || !!elm.getAttribute('data-mce-bogus')) {
      return true;
    }

    if (elm.getAttribute('data-mce-type') === 'bookmark') {
      return true;
    }
  }

  return false;
};

const renderElementPath = (editor: Editor, settings) => {
  if (!settings.delimiter) {
    settings.delimiter = '\u00BB';
  }

  const getDataPath = (data) => {
    const parts = data || [];

    const newPathElements = Arr.map(parts, (part, index) => {
      return Button.sketch({
        dom: {
          tag: 'div',
          classes: [ 'tox-statusbar__path-item' ],
          attributes: {
            'role': 'button',
            'data-index': index,
            'tab-index': -1,
            'aria-level': index + 1
          },
          innerHtml: part.name
        },
        action: (btn) => {
          editor.focus();
          editor.selection.select(part.element);
          editor.nodeChanged();
        }
      });
    });

    const divider = {
      dom: {
        tag: 'div',
        classes: [ 'tox-statusbar__path-divider' ],
        attributes: {
          'aria-hidden': true
        },
        innerHtml: ` ${settings.delimiter} `
      }
    };

    return Arr.foldl(newPathElements.slice(1), (acc, element) => {
      const newAcc: any[] = acc;
      newAcc.push(divider);
      newAcc.push(element);
      return newAcc;
    }, [newPathElements[0]]);
  };

  const updatePath = (parents) => {
    const newPath = [];
    let i = parents.length;

    while (i-- > 0) {
      const parent = parents[i];
      if (parent.nodeType === 1 && !isHidden(parent)) {
        const args = editor.fire('ResolveName', {
          name: parent.nodeName.toLowerCase(),
          target: parent
        });

        if (!args.isDefaultPrevented()) {
          newPath.push({ name: args.name, element: parent });
        }

        if (args.isPropagationStopped()) {
          break;
        }
      }
    }

    return newPath;
  };

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-statusbar__path' ],
      attributes: {
        role: 'navigation'
      }
    },
    behaviours: Behaviour.derive([
      Keying.config({
        mode: 'flow',
        selector: 'div[role=button]'
      }),
      Tabstopping.config({ }),
      Replacing.config({ }),
      AddEventsBehaviour.config('elementPathEvents', [
        AlloyEvents.runOnAttached((comp, e) => {
          // NOTE: If statusbar ever gets re-rendered, we will need to free this.
          editor.shortcuts.add('alt+F11', 'focus statusbar elementpath', () => Keying.focusIn(comp));

          editor.on('NodeChange', (e) => {
            const newPath = updatePath(e.parents);
            if (newPath.length > 0) {
              Replacing.set(comp, getDataPath(newPath));
            }
          });
        })
      ])
    ]),
    components: []
  };
};

export default {
  renderElementPath
};