import { SketchSpec } from '@ephox/alloy';
import { Toolbar } from '@ephox/bridge';
import { Arr, Obj, Merger } from '@ephox/katamari';
import { UiFactoryBackstage, UiFactoryBackstageShared } from 'tinymce/themes/silver/backstage/Backstage';
import { formatSelectMenu } from '../../core/complex/FormatSelect';
import { styleSelectMenu } from '../../core/complex/StyleSelect';
import { renderCommonDropdown } from '../../dropdown/CommonDropdown';
import { ItemResponse } from '../item/MenuItems';
import * as NestedMenus from '../menu/NestedMenus';
import { MenubarItemSpec } from './SilverMenubar';
import { fontSelectMenu } from '../../core/complex/FontSelect';
import { fontsizeSelectMenu } from '../../core/complex/FontsizeSelect';

export interface MenuRegistry {
  menuItems: Record<string, any>;
  menubar: string | boolean;
  menus: Record<string, any>;
}

const defaultMenubar = 'file edit view insert format tools table';

const defaultMenus = {
  file: { title: 'File', items: 'newdocument restoredraft | preview | print' },
  edit: { title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall' },
  view: { title: 'View', items: 'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen' },
  insert: { title: 'Insert', items: 'image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime' },
  format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align formats formats formats formats formats formats formats formats formats formats formats formats formats formats | removeformat' },
  // format: { title: 'Fx', items: 'blockformats blockformats blockformats blockformats' },
  tools: { title: 'Tools', items: 'spellchecker spellcheckerlanguage | a11ycheck code' },
  table: { title: 'Table', items: 'inserttable tableprops deletetable row column cell' }, // TODO
  help: { title: 'Help', items: 'help' }
};

export const renderMenuButton = (spec: Toolbar.ToolbarMenuButton, prefix: string, sharedBackstage: UiFactoryBackstageShared, role: string): SketchSpec => {

  return renderCommonDropdown({
    text: spec.text,
    icon: spec.icon,
     // https://www.w3.org/TR/wai-aria-practices/examples/menubar/menubar-2/menubar-2.html
    role,
    fetch: (callback) => {
      spec.fetch((items) => {
        callback(
          NestedMenus.build(items, ItemResponse.CLOSE_ON_EXECUTE, sharedBackstage.providers)
        );
      });
    },
    onAttach: () => { },
    onDetach: () => { },
    columns: 1,
    presets: 'normal',
    classes: []
  },
  prefix,
  sharedBackstage);
};

const bespokeItems = {
  formats: styleSelectMenu,
  blockformats: formatSelectMenu,
  fontformats: fontSelectMenu,
  fontsizes: fontsizeSelectMenu
};

const make = (menu: {title: string, items: string[]}, registry: MenuRegistry, editor, backstage: UiFactoryBackstage): MenubarItemSpec => {
  return {
    text: menu.title,
    getItems: () => Arr.bind(menu.items, (i) => {
      if (i.trim().length === 0) {
        return [ ];
      } else if (i === 'separator' || i === '|') {
        return [{
          type: 'separator'
        }];
      } else if (registry.menuItems[i]) {
        return [ registry.menuItems[i] ];
      } else if (bespokeItems[i]) {
        return [
          bespokeItems[i](editor, backstage)
        ];
      } else {
        return [ ];
      }
    })
  };
};

const parseItemsString = (items: string): string[] => {
  if (typeof items === 'string') {
    return items.split(' ');
  }
  return items;
};

const identifyMenus = (editor, registry: MenuRegistry, backstage: UiFactoryBackstage): MenubarItemSpec[] => {
  const rawMenuData = Merger.merge(defaultMenus, registry.menus);
  const userDefinedMenus = Obj.keys(registry.menus).length > 0;

  const menubar: string[] = registry.menubar === undefined || registry.menubar === true ? parseItemsString(defaultMenubar) : parseItemsString(registry.menubar === false ? '' : registry.menubar);
  const validMenus = Arr.filter(menubar, (menuName) => {

    return userDefinedMenus ? ((registry.menus.hasOwnProperty(menuName) && registry.menus[menuName].hasOwnProperty('items')
      || defaultMenus.hasOwnProperty(menuName)))
      : defaultMenus.hasOwnProperty(menuName);
  });

  const menus: MenubarItemSpec[] = Arr.map(validMenus, (menuName) => {
    const menuData = rawMenuData[menuName];
    return make({ title: menuData.title, items: parseItemsString(menuData.items) }, registry, editor, backstage);
  });

  return Arr.filter(menus, (menu) => menu.getItems().length > 0);
};

export { identifyMenus };