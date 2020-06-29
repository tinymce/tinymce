/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyTriggers, Attachment, Swapping } from '@ephox/alloy';
import { HTMLIFrameElement } from '@ephox/dom-globals';
import { Cell, Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Element, Focus, Node } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import ThemeManager from 'tinymce/core/api/ThemeManager';
import Editor from 'tinymce/core/api/Editor';

import * as TinyCodeDupe from './alien/TinyCodeDupe';
import * as Settings from './api/Settings';
import * as TinyChannels from './channels/TinyChannels';
import * as Features from './features/Features';
import * as Styles from './style/Styles';
import * as Orientation from './touch/view/Orientation';
import AndroidRealm from './ui/AndroidRealm';
import * as Buttons from './ui/Buttons';
import IosRealm from './ui/IosRealm';
import * as CssUrls from './util/CssUrls';
import * as FormatChangers from './util/FormatChangers';
import * as SkinLoaded from './util/SkinLoaded';
import { NotificationSpec } from 'tinymce/core/api/NotificationManager';

// not to be confused with editor mode
const READING = 'toReading'; // 'hide the keyboard'
const EDITING = 'toEditing'; // 'show the keyboard'

const renderMobileTheme = (editor: Editor) => {
  const renderUI = () => {
    const targetNode = editor.getElement();
    const cssUrls = CssUrls.derive(editor);

    if (Settings.isSkinDisabled(editor) === false) {
      editor.contentCSS.push(cssUrls.content);
      DOMUtils.DOM.styleSheetLoader.load(cssUrls.ui, SkinLoaded.fireSkinLoaded(editor));
    } else {
      SkinLoaded.fireSkinLoaded(editor)();
    }

    const doScrollIntoView = () => {
      editor.fire('ScrollIntoView');
    };

    const realm = PlatformDetection.detect().os.isAndroid() ? AndroidRealm(doScrollIntoView) : IosRealm(doScrollIntoView);
    const original = Element.fromDom(targetNode);
    Attachment.attachSystemAfter(original, realm.system());

    const findFocusIn = (elem) => Focus.search(elem).bind((focused) =>
      realm.system().getByDom(focused).toOption());

    const outerWindow = targetNode.ownerDocument.defaultView;
    const orientation = Orientation.onChange(outerWindow, {
      onChange() {
        const alloy = realm.system();
        alloy.broadcastOn([ TinyChannels.orientationChanged ], { width: Orientation.getActualWidth(outerWindow) });
      },
      onReady: Fun.noop
    });

    const setReadOnly = (dynamicGroup, readOnlyGroups, mainGroups, ro) => {
      if (ro === false) {
        editor.selection.collapse();
      }
      const toolbars = configureToolbar(dynamicGroup, readOnlyGroups, mainGroups);
      realm.setToolbarGroups(ro === true ? toolbars.readOnly : toolbars.main);

      editor.setMode(ro === true ? 'readonly' : 'design');
      editor.fire(ro === true ? READING : EDITING);
      realm.updateMode(ro);
    };

    const configureToolbar = (dynamicGroup, readOnlyGroups, mainGroups) => {
      const dynamic = dynamicGroup.get();
      const toolbars = {
        readOnly: dynamic.backToMask.concat(readOnlyGroups.get()),
        main: dynamic.backToMask.concat(mainGroups.get())
      };

      if (Settings.readOnlyOnInit(editor)) {
        toolbars.readOnly = dynamic.backToMask.concat(readOnlyGroups.get());
        toolbars.main = dynamic.backToReadOnly.concat(mainGroups.get());
      }

      return toolbars;
    };

    const bindHandler = (label: string, handler) => {
      editor.on(label, handler);
      return {
        unbind() {
          editor.off(label);
        }
      };
    };

    editor.on('init', () => {
      realm.init({
        editor: {
          getFrame() {
            return Element.fromDom(editor.contentAreaContainer.querySelector('iframe'));
          },

          onDomChanged() {
            return {
              unbind: Fun.noop
            };
          },

          onToReading(handler) {
            return bindHandler(READING, handler);
          },

          onToEditing(handler) {
            return bindHandler(EDITING, handler);
          },

          onScrollToCursor(handler) {
            editor.on('ScrollIntoView', (tinyEvent) => {
              handler(tinyEvent);
            });

            const unbind = () => {
              editor.off('ScrollIntoView');
              orientation.destroy();
            };

            return {
              unbind
            };
          },

          onTouchToolstrip() {
            hideDropup();
          },

          onTouchContent() {
            const toolbar = Element.fromDom(editor.editorContainer.querySelector('.' + Styles.resolve('toolbar')));
            // If something in the toolbar had focus, fire an execute on it (execute on tap away)
            // Perhaps it will be clearer later what is a better way of doing this.
            findFocusIn(toolbar).each(AlloyTriggers.emitExecute);
            realm.restoreToolbar();
            hideDropup();
          },

          onTapContent(evt) {
            const target = evt.target();
            // If the user has tapped (touchstart, touchend without movement) on an image, select it.
            if (Node.name(target) === 'img') {
              editor.selection.select(target.dom());
              // Prevent the default behaviour from firing so that the image stays selected
              evt.kill();
            } else if (Node.name(target) === 'a') {
              const component = realm.system().getByDom(Element.fromDom(editor.editorContainer));
              component.each((container) => {
                // view mode
                if (Swapping.isAlpha(container)) {
                  TinyCodeDupe.openLink(target.dom());
                }
              });
            }
          }
        },
        container: Element.fromDom(editor.editorContainer),
        socket: Element.fromDom(editor.contentAreaContainer),
        toolstrip: Element.fromDom(editor.editorContainer.querySelector('.' + Styles.resolve('toolstrip'))),
        toolbar: Element.fromDom(editor.editorContainer.querySelector('.' + Styles.resolve('toolbar'))),
        dropup: realm.dropup(),
        alloy: realm.system(),
        translate: Fun.noop,

        setReadOnly(ro) {
          setReadOnly(dynamicGroup, readOnlyGroups, mainGroups, ro);
        },

        readOnlyOnInit() {
          return Settings.readOnlyOnInit(editor);
        }
      });

      const hideDropup = () => {
        realm.dropup().disappear(() => {
          realm.system().broadcastOn([ TinyChannels.dropupDismissed ], { });
        });
      };

      const backToMaskGroup = {
        label: 'The first group',
        scrollable: false,
        items: [
          Buttons.forToolbar('back', (/* btn */) => {
            editor.selection.collapse();
            realm.exit();
          }, { }, editor)
        ]
      };

      const backToReadOnlyGroup = {
        label: 'Back to read only',
        scrollable: false,
        items: [
          Buttons.forToolbar('readonly-back', (/* btn */) => {
            setReadOnly(dynamicGroup, readOnlyGroups, mainGroups, true);
          }, {}, editor)
        ]
      };

      const readOnlyGroup = {
        label: 'The read only mode group',
        scrollable: true,
        items: []
      };

      const features = Features.setup(realm, editor);
      const items = Features.detect(editor, features);

      const actionGroup = {
        label: 'the action group',
        scrollable: true,
        items
      };

      const extraGroup = {
        label: 'The extra group',
        scrollable: false,
        items: [
          // This is where the "add button" button goes.
        ]
      };

      const mainGroups = Cell([ actionGroup, extraGroup ]);
      const readOnlyGroups = Cell([ readOnlyGroup, extraGroup ]);
      const dynamicGroup = Cell({
        backToMask: [ backToMaskGroup ],
        backToReadOnly: [ backToReadOnlyGroup ]
      });
      // Investigate ways to keep in sync with the ui
      FormatChangers.init(realm, editor);
    });

    editor.on('remove', () => {
      realm.exit();
    });

    editor.on('detach', () => {
      Attachment.detachSystem(realm.system());
      realm.system().destroy();
    });

    return {
      iframeContainer: realm.socket().element().dom() as HTMLIFrameElement,
      editorContainer: realm.element().dom()
    };
  };

  return {
    getNotificationManagerImpl() {
      return {
        open: Fun.constant({
          progressBar: { value: Fun.noop },
          close: Fun.noop,
          text: Fun.noop,
          getEl: Fun.constant(null),
          moveTo: Fun.noop,
          moveRel: Fun.noop,
          settings: {} as NotificationSpec
        }),
        close: Fun.noop,
        reposition: Fun.noop,
        getArgs: Fun.constant({} as NotificationSpec)
      };
    },
    renderUI
  };
};

export default () => {
  ThemeManager.add('mobile', renderMobileTheme);
};
