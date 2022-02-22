import { AlloySpec, SketchSpec, VerticalDir } from '@ephox/alloy';
import { StructureSchema } from '@ephox/boulder';
import { Toolbar } from '@ephox/bridge';
import { Arr, Obj, Optional, Result, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { getToolbarMode, ToolbarGroupOption, ToolbarMode } from '../../api/Options';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import { RenderToolbarConfig } from '../../Render';
import { renderMenuButton } from '../button/MenuButton';
import { createAlignButton } from '../core/complex/AlignBespoke';
import { createBlocksButton } from '../core/complex/BlocksBespoke';
import { createFontFamilyButton } from '../core/complex/FontFamilyBespoke';
import { createFontSizeButton } from '../core/complex/FontSizeBespoke';
import { createStylesButton } from '../core/complex/StylesBespoke';
import { ToolbarButtonClasses } from './button/ButtonClasses';
import { renderFloatingToolbarButton, renderSplitButton, renderToolbarButton, renderToolbarToggleButton } from './button/ToolbarButtons';
import { ToolbarGroup } from './CommonToolbar';

export const handleError = (error) => {
  // eslint-disable-next-line no-console
  console.error(StructureSchema.formatError(error));
};

export type ToolbarButton = Toolbar.ToolbarButtonSpec | Toolbar.ToolbarMenuButtonSpec | Toolbar.ToolbarToggleButtonSpec | Toolbar.ToolbarSplitButtonSpec;

interface Extras {
  backstage: UiFactoryBackstage;
}

const defaultToolbar = [
  {
    name: 'history', items: [ 'undo', 'redo' ]
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

const renderFromBridge = <BI, ToolbarButton>(bridgeBuilder: (i: BI) => Result<ToolbarButton, StructureSchema.SchemaError<any>>, render: (o: ToolbarButton, extras: Extras, editor: Editor) => AlloySpec) => (spec, extras, editor) => {
  const internal = bridgeBuilder(spec).mapError((errInfo) => StructureSchema.formatError(errInfo)).getOrDie();

  return render(internal, extras, editor);
};

const types = {
  button: renderFromBridge(
    Toolbar.createToolbarButton,
    (s: Toolbar.ToolbarButton, extras) => renderToolbarButton(
      s,
      extras.backstage.shared.providers
    )
  ),

  togglebutton: renderFromBridge(
    Toolbar.createToggleButton,
    (s: Toolbar.ToolbarToggleButton, extras) => renderToolbarToggleButton(
      s,
      extras.backstage.shared.providers
    )
  ),

  menubutton: renderFromBridge<Toolbar.ToolbarMenuButtonSpec, Toolbar.ToolbarMenuButton>(
    Toolbar.createMenuButton,
    (s: Toolbar.ToolbarMenuButton, extras) => renderMenuButton(
      s,
      ToolbarButtonClasses.Button,
      extras.backstage,
      Optional.none()
    )
  ),

  splitbutton: renderFromBridge(
    Toolbar.createSplitButton,
    (s: Toolbar.ToolbarSplitButton, extras) => renderSplitButton(
      s,
      extras.backstage.shared
    )
  ),

  grouptoolbarbutton: renderFromBridge(
    Toolbar.createGroupToolbarButton,
    (s: Toolbar.GroupToolbarButton, extras, editor: Editor) => {
      const buttons = editor.ui.registry.getAll().buttons;
      const identify = (toolbar: string | ToolbarGroupOption[]) =>
        identifyButtons(editor, { buttons, toolbar, allowToolbarGroups: false }, extras, Optional.none());
      const attributes = {
        [VerticalDir.Attribute]: extras.backstage.shared.header.isPositionedAtTop() ? VerticalDir.AttributeValue.TopToBottom : VerticalDir.AttributeValue.BottomToTop
      };

      switch (getToolbarMode(editor)) {
        case ToolbarMode.floating:
          return renderFloatingToolbarButton(s, extras.backstage, identify, attributes);
        default:
          // TODO change this message and add a case when sliding is available
          throw new Error('Toolbar groups are only supported when using floating toolbar mode');
      }
    }
  ),

  styleSelectButton: (editor: Editor, extras: Extras) => createStylesButton(editor, extras.backstage),
  fontsizeSelectButton: (editor: Editor, extras: Extras) => createFontSizeButton(editor, extras.backstage),
  fontSelectButton: (editor: Editor, extras: Extras) => createFontFamilyButton(editor, extras.backstage),
  formatButton: (editor: Editor, extras: Extras) => createBlocksButton(editor, extras.backstage),
  alignMenuButton: (editor: Editor, extras: Extras) => createAlignButton(editor, extras.backstage)
};

const extractFrom = (spec: ToolbarButton, extras: Extras, editor: Editor): Optional<AlloySpec> => Obj.get(types, spec.type).fold(
  () => {
    // eslint-disable-next-line no-console
    console.error('skipping button defined by', spec);
    return Optional.none();
  },
  (render) => Optional.some(
    render(spec, extras, editor)
  )
);

const bespokeButtons: Record<string, (editor: Editor, extras: Extras) => SketchSpec> = {
  styles: types.styleSelectButton,
  fontsize: types.fontsizeSelectButton,
  fontfamily: types.fontSelectButton,
  blocks: types.formatButton,
  align: types.alignMenuButton
};

const removeUnusedDefaults = (buttons) => {
  const filteredItemGroups = Arr.map(defaultToolbar, (group) => {
    const items = Arr.filter(group.items, (subItem) => Obj.has(buttons, subItem) || Obj.has(bespokeButtons as any, subItem));
    return {
      name: group.name,
      items
    };
  });
  return Arr.filter(filteredItemGroups, (group) => group.items.length > 0);
};

const convertStringToolbar = (strToolbar) => {
  const groupsStrings = strToolbar.split('|');
  return Arr.map(groupsStrings, (g) => ({
    items: g.trim().split(' ')
  }));
};

const isToolbarGroupSettingArray = (toolbar): toolbar is ToolbarGroupOption[] => Type.isArrayOf(toolbar, (t): t is ToolbarGroupOption => Obj.has(t, 'name') && Obj.has(t, 'items'));

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

const lookupButton = (editor: Editor, buttons: Record<string, any>, toolbarItem: string, allowToolbarGroups: boolean, extras: Extras, prefixes: Optional<string[]>): Optional<AlloySpec> =>
  Obj.get(buttons, toolbarItem.toLowerCase()).orThunk(() => prefixes.bind((ps) => Arr.findMap(ps, (prefix) => Obj.get(buttons, prefix + toolbarItem.toLowerCase())))).fold(
    () => Obj.get(bespokeButtons, toolbarItem.toLowerCase()).map((r) => r(editor, extras)).orThunk(() =>
    // TODO: Add back after TINY-3232 is implemented
    // console.error('No representation for toolbarItem: ' + toolbarItem);
      Optional.none()
    ),
    (spec) => {
      if (spec.type === 'grouptoolbarbutton' && !allowToolbarGroups) {
        // TODO change this message when sliding is available
        // eslint-disable-next-line no-console
        console.warn(`Ignoring the '${toolbarItem}' toolbar button. Group toolbar buttons are only supported when using floating toolbar mode and cannot be nested.`);
        return Optional.none();
      } else {
        return extractFrom(spec, extras, editor);
      }
    }
  );

const identifyButtons = (editor: Editor, toolbarConfig: RenderToolbarConfig, extras: Extras, prefixes: Optional<string[]>): ToolbarGroup[] => {
  const toolbarGroups = createToolbar(toolbarConfig);
  const groups = Arr.map(toolbarGroups, (group) => {
    const items = Arr.bind(group.items, (toolbarItem) => toolbarItem.trim().length === 0 ? [] : lookupButton(editor, toolbarConfig.buttons, toolbarItem, toolbarConfig.allowToolbarGroups, extras, prefixes).toArray());
    return {
      title: Optional.from(editor.translate(group.name)),
      items
    };
  });

  return Arr.filter(groups, (group) => group.items.length > 0);
};

export { identifyButtons };
