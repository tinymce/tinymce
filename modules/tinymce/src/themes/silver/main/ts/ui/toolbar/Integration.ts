import { AlloySpec, VerticalDir } from '@ephox/alloy';
import { StructureSchema } from '@ephox/boulder';
import { Toolbar } from '@ephox/bridge';
import { Arr, Obj, Optional, Result, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { getToolbarMode, ToolbarGroupOption, ToolbarMode } from '../../api/Options';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import { ToolbarConfig } from '../../Render';
import { renderMenuButton } from '../button/MenuButton';
import { createAlignButton } from '../core/complex/AlignBespoke';
import { createBlocksButton } from '../core/complex/BlocksBespoke';
import { createFontFamilyButton } from '../core/complex/FontFamilyBespoke';
import { createFontSizeButton, createFontSizeInputButton } from '../core/complex/FontSizeBespoke';
import { createStylesButton } from '../core/complex/StylesBespoke';
import { ToolbarButtonClasses } from './button/ButtonClasses';
import { renderFloatingToolbarButton, renderSplitButton, renderToolbarButton, renderToolbarToggleButton } from './button/ToolbarButtons';
import { ToolbarGroup } from './CommonToolbar';

export type ToolbarButton = Toolbar.ToolbarButtonSpec | Toolbar.ToolbarMenuButtonSpec | Toolbar.ToolbarToggleButtonSpec | Toolbar.ToolbarSplitButtonSpec;

export interface RenderToolbarConfig {
  readonly toolbar: ToolbarConfig;
  readonly buttons: Record<string, ToolbarButton | Toolbar.GroupToolbarButtonSpec>;
  readonly allowToolbarGroups: boolean;
}

type BridgeRenderFn<S> = (spec: S, backstage: UiFactoryBackstage, editor: Editor) => AlloySpec;

const defaultToolbar = [
  {
    name: 'history', items: [ 'undo', 'redo' ]
  },
  {
    name: 'ai', items: [ 'aidialog', 'aishortcuts' ]
  },
  {
    name: 'styles', items: [ 'styles' ]
  },
  {
    name: 'formatting', items: [ 'bold', 'italic' ]
  },
  {
    name: 'alignment', items: [ 'alignleft', 'aligncenter', 'alignright', 'alignjustify' ]
  },
  {
    name: 'indentation', items: [ 'outdent', 'indent' ]
  },
  {
    name: 'permanent pen', items: [ 'permanentpen' ]
  },
  {
    name: 'comments', items: [ 'addcomment' ]
  }
];

const renderFromBridge = <BI, BO>(bridgeBuilder: (i: BI) => Result<BO, StructureSchema.SchemaError<any>>, render: BridgeRenderFn<BO>) =>
  (spec: BI, backstage: UiFactoryBackstage, editor: Editor) => {
    const internal = bridgeBuilder(spec).mapError((errInfo) => StructureSchema.formatError(errInfo)).getOrDie();
    return render(internal, backstage, editor);
  };

const types: Record<string, BridgeRenderFn<any>> = {
  button: renderFromBridge(
    Toolbar.createToolbarButton,
    (s, backstage) => renderToolbarButton(s, backstage.shared.providers)
  ),

  togglebutton: renderFromBridge(
    Toolbar.createToggleButton,
    (s, backstage) => renderToolbarToggleButton(s, backstage.shared.providers)
  ),

  menubutton: renderFromBridge(
    Toolbar.createMenuButton,
    (s, backstage) => renderMenuButton(s, ToolbarButtonClasses.Button, backstage, Optional.none(), false)
  ),

  splitbutton: renderFromBridge(
    Toolbar.createSplitButton,
    (s, backstage) => renderSplitButton(s, backstage.shared)
  ),

  grouptoolbarbutton: renderFromBridge(
    Toolbar.createGroupToolbarButton,
    (s, backstage, editor) => {
      const buttons = editor.ui.registry.getAll().buttons;
      const identify = (toolbar: string | ToolbarGroupOption[]) =>
        identifyButtons(editor, { buttons, toolbar, allowToolbarGroups: false }, backstage, Optional.none());
      const attributes = {
        [VerticalDir.Attribute]: backstage.shared.header.isPositionedAtTop() ? VerticalDir.AttributeValue.TopToBottom : VerticalDir.AttributeValue.BottomToTop
      };

      switch (getToolbarMode(editor)) {
        case ToolbarMode.floating:
          return renderFloatingToolbarButton(s, backstage, identify, attributes);
        default:
          // TODO change this message and add a case when sliding is available
          throw new Error('Toolbar groups are only supported when using floating toolbar mode');
      }
    }
  )
};

const extractFrom = (spec: ToolbarButton & { type: string }, backstage: UiFactoryBackstage, editor: Editor): Optional<AlloySpec> =>
  Obj.get(types, spec.type).fold(
    () => {
      // eslint-disable-next-line no-console
      console.error('skipping button defined by', spec);
      return Optional.none();
    },
    (render) => Optional.some(
      render(spec, backstage, editor)
    )
  );

const bespokeButtons: Record<string, (editor: Editor, backstage: UiFactoryBackstage) => AlloySpec> = {
  styles: createStylesButton,
  fontsize: createFontSizeButton,
  fontsizeinput: createFontSizeInputButton,
  fontfamily: createFontFamilyButton,
  blocks: createBlocksButton,
  align: createAlignButton
};

const removeUnusedDefaults = (buttons: RenderToolbarConfig['buttons']) => {
  const filteredItemGroups = Arr.map(defaultToolbar, (group) => {
    const items = Arr.filter(group.items, (subItem) => Obj.has(buttons, subItem) || Obj.has(bespokeButtons as any, subItem));
    return {
      name: group.name,
      items
    };
  });
  return Arr.filter(filteredItemGroups, (group) => group.items.length > 0);
};

const convertStringToolbar = (strToolbar: string) => {
  const groupsStrings = strToolbar.split('|');
  return Arr.map(groupsStrings, (g) => ({
    items: g.trim().split(' ')
  }));
};

const isToolbarGroupSettingArray = (toolbar: ToolbarConfig): toolbar is ToolbarGroupOption[] =>
  Type.isArrayOf(toolbar, (t): t is ToolbarGroupOption => Obj.has(t, 'name') && Obj.has(t, 'items'));

// Toolbar settings
// false = disabled
// undefined or true = default
// string = enabled with specified buttons and groups
// string array = enabled with specified buttons and groups
// object array = enabled with specified buttons, groups and group titles
const createToolbar = (toolbarConfig: RenderToolbarConfig): ToolbarGroupOption[] => {
  const toolbar = toolbarConfig.toolbar;
  const buttons = toolbarConfig.buttons;
  if (toolbar === false) {
    return [];
  } else if (toolbar === undefined || toolbar === true) {
    return removeUnusedDefaults(buttons);
  } else if (Type.isString(toolbar)) {
    return convertStringToolbar(toolbar);
  } else if (isToolbarGroupSettingArray(toolbar)) {
    return toolbar;
  } else {
    // eslint-disable-next-line no-console
    console.error('Toolbar type should be string, string[], boolean or ToolbarGroup[]');
    return [];
  }
};

const lookupButton = (editor: Editor, buttons: Record<string, any>, toolbarItem: string, allowToolbarGroups: boolean, backstage: UiFactoryBackstage, prefixes: Optional<string[]>): Optional<AlloySpec> =>
  Obj.get(buttons, toolbarItem.toLowerCase())
    .orThunk(() => prefixes.bind((ps) => Arr.findMap(ps, (prefix) => Obj.get(buttons, prefix + toolbarItem.toLowerCase()))))
    .fold(
      () => Obj.get(bespokeButtons, toolbarItem.toLowerCase()).map((r) => r(editor, backstage)),
      // TODO: Add back after TINY-3232 is implemented
      // .orThunk(() => {
      //   console.error('No representation for toolbarItem: ' + toolbarItem);
      //   return Optional.none();
      // ),
      (spec) => {
        if (spec.type === 'grouptoolbarbutton' && !allowToolbarGroups) {
          // TODO change this message when sliding is available
          // eslint-disable-next-line no-console
          console.warn(`Ignoring the '${toolbarItem}' toolbar button. Group toolbar buttons are only supported when using floating toolbar mode and cannot be nested.`);
          return Optional.none();
        } else {
          return extractFrom(spec, backstage, editor);
        }
      }
    );

const identifyButtons = (editor: Editor, toolbarConfig: RenderToolbarConfig, backstage: UiFactoryBackstage, prefixes: Optional<string[]>): ToolbarGroup[] => {
  const toolbarGroups = createToolbar(toolbarConfig);
  const groups = Arr.map(toolbarGroups, (group) => {
    const items = Arr.bind(group.items, (toolbarItem) => {
      return toolbarItem.trim().length === 0 ? [] :
        lookupButton(editor, toolbarConfig.buttons, toolbarItem, toolbarConfig.allowToolbarGroups, backstage, prefixes).toArray();
    });
    return {
      title: Optional.from(editor.translate(group.name)),
      items
    };
  });

  return Arr.filter(groups, (group) => group.items.length > 0);
};

export { identifyButtons };
