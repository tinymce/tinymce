/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloySpec, AnchorSpec, Bubble, FormTypes, Layout, LayoutInside } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Option, Result } from '@ephox/katamari';
import { Element, Selection } from '@ephox/sugar';
import { Editor } from 'tinymce/core/api/Editor';
import I18n, { TranslatedString } from 'tinymce/core/api/util/I18n';
import * as UiFactory from 'tinymce/themes/silver/ui/general/UiFactory';
import { SelectData } from '../ui/core/complex/BespokeSelect';
import { IconProvider } from '../ui/icons/Icons';
import { ColorInputBackstage, UiFactoryBackstageForColorInput } from './ColorInputBackstage';
import { init as initStyleFormatBackstage } from './StyleFormatsBackstage';
import { UiFactoryBackstageForUrlInput, UrlInputBackstage } from './UrlInputBackstage';
import { useFixedContainer } from '../modes/Settings';

// INVESTIGATE: Make this a body component API ?
export type BridgedType = any;

export interface UiFactoryBackstageProviders {
  icons: IconProvider;
  menuItems: () => Record<string, Menu.MenuItemApi | Menu.NestedMenuItemApi | Menu.ToggleMenuItemApi>;
  translate: (any) => TranslatedString;
}

type UiFactoryBackstageForStyleButton = SelectData;

export interface UiFactoryBackstageShared {
  providers?: UiFactoryBackstageProviders;
  interpreter?: (spec: BridgedType) => AlloySpec;
  anchors?: {
    toolbar: () => AnchorSpec,
    banner: () => AnchorSpec,
    cursor: () => AnchorSpec,
    node: (elem: Option<Element>) => AnchorSpec
  };
  formInterpreter?: (parts: FormTypes.FormParts, spec: BridgedType, backstage: UiFactoryBackstage) => AlloySpec;
  getSink?: () => Result<AlloyComponent, any>;
}

export interface UiFactoryBackstage {
  urlinput?: UiFactoryBackstageForUrlInput;
  styleselect?: UiFactoryBackstageForStyleButton;
  shared?: UiFactoryBackstageShared;
  colorinput?: UiFactoryBackstageForColorInput;
}

const bubbleAlignments = {
  valignCentre: [],
  alignCentre: [],
  alignLeft: [],
  alignRight: [],
  right: [],
  left: [],
  bottom: [],
  top: []
};

const init = (sink: AlloyComponent, editor: Editor, lazyAnchorbar: () => AlloyComponent): UiFactoryBackstage => {
  const useFixedToolbarContainer = useFixedContainer(editor);
  const bodyElement = () => Element.fromDom(editor.getBody());
  const backstage: UiFactoryBackstage = {
    shared: {
      providers: {
        icons: () => editor.ui.registry.getAll().icons,
        menuItems: () => editor.ui.registry.getAll().menuItems,
        translate: I18n.translate,
      },
      interpreter: (s) => {
        return UiFactory.interpretWithoutForm(s, backstage);
      },
      anchors: {
        toolbar: () => {
          // If using fixed_toolbar_container, anchor to the inside top of the editable area
          // Else, anchor below the div.tox-anchorbar in the editor chrome
          const fixedToolbarAnchor = (): AnchorSpec => ({
            anchor: 'node',
            root: bodyElement(),
            node: Option.from(bodyElement()),
            bubble: Bubble.nu(-12, 12, bubbleAlignments),
            layouts: {
              onRtl: () => [ LayoutInside.southeast ],
              onLtr: () => [ LayoutInside.southwest ]
            }
          });

          const standardAnchor = (): AnchorSpec => ({
            anchor: 'hotspot',
            // TODO AP-174 (below)
            hotspot: lazyAnchorbar(),
            bubble: Bubble.nu(-12, 12, bubbleAlignments),
            layouts: {
              onRtl: () => [ Layout.southeast ],
              onLtr: () => [ Layout.southwest ]
            }
          });

          return useFixedToolbarContainer ? fixedToolbarAnchor() : standardAnchor();
        },
        banner: () => {
          // If using fixed_toolbar_container, anchor to the inside top of the editable area
          // Else, anchor below the div.tox-anchorbar in the editor chrome
          const fixedToolbarAnchor = (): AnchorSpec => ({
            anchor: 'node',
            root: bodyElement(),
            node: Option.from(bodyElement()),
            layouts: {
              onRtl: () => [ LayoutInside.north ],
              onLtr: () => [ LayoutInside.north ]
            }
          });

          const standardAnchor = (): AnchorSpec => ({
            anchor: 'hotspot',
            // TODO AP-174 (below)
            hotspot: lazyAnchorbar(),
            layouts: {
              onRtl: () => [ Layout.south ],
              onLtr: () => [ Layout.south ]
            }
          });

          return useFixedToolbarContainer ? fixedToolbarAnchor() : standardAnchor();
        },
        cursor: () => {
          return {
            anchor: 'selection',
            root: bodyElement(),
            getSelection: () => {
              const rng = editor.selection.getRng();
              return Option.some(
                Selection.range(Element.fromDom(rng.startContainer), rng.startOffset, Element.fromDom(rng.endContainer), rng.endOffset)
              );
            }
          };
        },
        node: (element: Option<Element>) => {
          return {
            anchor: 'node',
            root: bodyElement(),
            node: element
          };
        }
      },
      getSink: () => Result.value(sink)
    },
    urlinput: UrlInputBackstage(editor),
    styleselect: initStyleFormatBackstage(editor),
    colorinput: ColorInputBackstage(editor)
  };

  return backstage;
};

export { init };
