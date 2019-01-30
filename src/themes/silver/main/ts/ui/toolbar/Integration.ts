/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloySpec, SketchSpec } from '@ephox/alloy';
import { Objects, ValueSchema } from '@ephox/boulder';
import { Toolbar } from '@ephox/bridge';
import { Arr, Fun, Option, Result, Type, Obj } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';
import { ToolbarButtonClasses } from 'tinymce/themes/silver/ui/toolbar/button/ButtonClasses';
import {
  renderSplitButton,
  renderToolbarButton,
  renderToolbarToggleButton,
} from 'tinymce/themes/silver/ui/toolbar/button/ToolbarButtons';

import { createAlignSelect } from '../core/complex/AlignSelect';
import { createFontSelect } from '../core/complex/FontSelect';
import { createFontsizeSelect } from '../core/complex/FontsizeSelect';
import { createFormatSelect } from '../core/complex/FormatSelect';
import { createStyleSelect } from '../core/complex/StyleSelect';
import { renderMenuButton } from '../menus/menubar/Integration';
import { RenderUiConfig } from '../../Render';
import { ToolbarGroup } from './CommonToolbar';

export const handleError = (error) => {
  // tslint:disable-next-line:no-console
  console.error(ValueSchema.formatError(error));
};

interface ToolbarGroupSetting {
  name?: string;
  items: string[];
}

const defaultToolbar = [
  {
    name: 'history', items: [ 'undo', 'redo' ]
  },
  {
    name: 'styles', items: [ 'styleselect' ]
  },
  {
    name: 'formatting', items: [ 'bold', 'italic']
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

const renderFromBridge = <BI, BO>(bridgeBuilder: (i: BI) => Result<BO, ValueSchema.SchemaError<any>>, render: (o: BO, extras) => AlloySpec) => {
  return (spec, extras) => {
    const internal = bridgeBuilder(spec).fold(
      Fun.compose(Result.error, ValueSchema.formatError),
      Result.value
    ).getOrDie();

    return render(internal, extras);
  };
};

const types = {
  button: renderFromBridge(
    Toolbar.createToolbarButton,
    (s: Toolbar.ToolbarButton, extras) => {
      return renderToolbarButton(
        s,
        extras.backstage.shared.providers,
      );
    }
  ),

  togglebutton: renderFromBridge(
    Toolbar.createToggleButton,
    (s: Toolbar.ToolbarToggleButton, extras) => {
      return renderToolbarToggleButton(
        s,
        extras.backstage.shared.providers,
      );
    }
  ),
  menubutton: renderFromBridge<Toolbar.ToolbarMenuButtonApi, Toolbar.ToolbarMenuButton>(
    Toolbar.createMenuButton,
    (s: Toolbar.ToolbarMenuButton, extras) => {
      return renderMenuButton(
        s,
        ToolbarButtonClasses.Button,
        extras.backstage.shared,
        Option.none()
      );
    }
  ),

  splitbutton: renderFromBridge(
    Toolbar.createSplitButton,
    (s: Toolbar.ToolbarSplitButton, extras) => {
      return renderSplitButton(
        s,
        extras.backstage.shared
      );
    }
  ),

  styleSelectButton: (editor: Editor, extras) => createStyleSelect(editor, extras.backstage),
  fontsizeSelectButton: (editor: Editor, extras) => createFontsizeSelect(editor, extras.backstage),
  fontSelectButton: (editor: Editor, extras) => createFontSelect(editor, extras.backstage),
  formatButton: (editor: Editor, extras) => createFormatSelect(editor, extras.backstage),
  alignMenuButton: (editor: Editor, extras) => createAlignSelect(editor, extras.backstage)
};

const extractFrom = function (spec, extras): Option<SketchSpec> {
  return Objects.readOptFrom<(spec, extras) => SketchSpec>(types, spec.type).fold(
    () => {
      console.error('skipping button defined by', spec);
      return Option.none();
    },
    (render) => {
      return Option.some(
        render(spec, extras)
      );
    }
  );
};

const bespokeButtons = {
  styleselect: types.styleSelectButton,
  fontsizeselect: types.fontsizeSelectButton,
  fontselect: types.fontSelectButton,
  formatselect: types.formatButton,
  align: types.alignMenuButton
};

const removeUnusedDefaults = (buttons) => {
  const filteredItemGroups = Arr.map(defaultToolbar, (group) => {
    const items = Arr.filter(group.items, (subItem) => {
      return Obj.has(buttons, subItem) || Obj.has(bespokeButtons as any, subItem);
    });
    return {
      name: group.name,
      items
    };
  });
  return Arr.filter(filteredItemGroups, (group) => group.items.length > 0);
};

const convertStringToolbar = (strToolbar) => {
  const groupsStrings = strToolbar.split('|');
  return Arr.map(groupsStrings, (g) => {
    return {
      items: g.trim().split(' ')
    };
  });
};

// Toolbar settings
// false = disabled
// undefined or true = default
// string = enabled with specified buttons and groups
// string array = enabled with specified buttons and groups
// object array = enabled with specified buttons, groups and group titles
const createToolbar = (toolbarConfig: Partial<RenderUiConfig>): ToolbarGroupSetting[] => {
  if (toolbarConfig.toolbar === false) {
    return [];
  } else if (toolbarConfig.toolbar === undefined || toolbarConfig.toolbar === true) {
    return removeUnusedDefaults(toolbarConfig.buttons);
  } else if (Type.isString(toolbarConfig.toolbar)) {
    return convertStringToolbar(toolbarConfig.toolbar);
  } else if (Type.isArray(toolbarConfig.toolbar) && Type.isString(toolbarConfig.toolbar[0])) {
    return convertStringToolbar(toolbarConfig.toolbar.join(' | '));
  } else {
    return toolbarConfig.toolbar;
  }
};

const identifyButtons = function (editor: Editor, toolbarConfig: Partial<RenderUiConfig>, extras): ToolbarGroup[] {
  const toolbarGroups = createToolbar(toolbarConfig);
  const groups = Arr.map(toolbarGroups, (group) => {
    const items = Arr.bind(group.items, (toolbarItem) => {
      return toolbarItem.trim().length === 0 ? [] : Objects.readOptFrom(toolbarConfig.buttons, toolbarItem.toLowerCase()).fold(
        () => {
          return Objects.readOptFrom<(spec: Editor, extras) => SketchSpec>(bespokeButtons, toolbarItem.toLowerCase()).map((r) => {
            return r(editor, extras);
          }).orThunk(() => {
            // TODO: Add back after TINY-3232 is implemented
            // console.error('No representation for toolbarItem: ' + toolbarItem);
            return Option.none();
          });
        },
        (spec) => {
          return extractFrom(spec, extras);
        }
      ).toArray();
    });
    return {
      title: Option.from(editor.translate(group.name)),
      items
    };
  });

  return Arr.filter(groups, (group) => {
    return group.items.length > 0;
  });
};

export { identifyButtons };