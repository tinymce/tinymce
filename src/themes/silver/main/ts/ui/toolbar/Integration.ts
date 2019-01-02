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
import { AddButtonSettings, Editor } from 'tinymce/core/api/Editor';
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

export const handleError = (error) => {
  // tslint:disable-next-line:no-console
  console.error(ValueSchema.formatError(error));
};

const defaultToolbar = 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | outdent indent | permanentpen | addcomment';

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

const extractFrom = function (spec: AddButtonSettings, extras): Option<SketchSpec> {
  return Objects.readOptFrom<(spec: AddButtonSettings, extras) => SketchSpec>(types, spec.type).fold(
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

const removeUnusedDefaults = (buttons, defaultItems: string) => {
  return Arr.filter(defaultItems.split(/[, ]/), (item) => {
    return item === '|' || Obj.has(buttons, item) || Obj.has(bespokeButtons as any, item);
  }).join(' ');
};

const createToolbar = (toolbarConfig: Partial<RenderUiConfig>) => {
  const toolbar = () => {
    if (toolbarConfig.toolbar === false) {
      return '';
    } else if (toolbarConfig.toolbar === undefined || toolbarConfig.toolbar === true) {
      return removeUnusedDefaults(toolbarConfig.buttons, defaultToolbar);
    } else {
      return toolbarConfig.toolbar;
    }
  };

  const toolbarArray = Type.isArray(toolbar()) ? toolbar() :  [ toolbar() ];
  return toolbarArray.join(' | ');
};

const identifyButtons = function (editor: Editor, toolbarConfig: Partial<RenderUiConfig>, extras): SketchSpec[][] {
  const toolbar = createToolbar(toolbarConfig);
  const groupsStrings = toolbar.split('|');
  const toolbarGroups = Arr.map(groupsStrings, (g) => g.trim().split(' '));
  const groups = Arr.map(toolbarGroups, (group) => {
    return Arr.bind(group, (toolbarItem) => {
      return toolbarItem.trim().length === 0 ? [] :  Objects.readOptFrom(toolbarConfig.buttons, toolbarItem.toLowerCase()).fold(
        () => {
          return Objects.readOptFrom<(spec: Editor, extras) => SketchSpec>(bespokeButtons, toolbarItem.toLowerCase()).map((r) => {
            return r(editor, extras);
          }).orThunk(() => {
            console.error('No representation for toolbarItem: ' + toolbarItem);
            return Option.none();
          });
        },
        (spec) => {
          return extractFrom(spec, extras);
        }
      ).toArray();
    });
  });

  return Arr.filter(groups, (group) => {
    return group.length > 0;
  });
};

export { identifyButtons };