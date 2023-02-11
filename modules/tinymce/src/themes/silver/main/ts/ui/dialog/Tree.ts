import { Behaviour, Button as AlloyButton, Tabstopping, GuiFactory, SimpleSpec, SketchSpec, Toggling } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Fun, Id, Optional } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderMenuButton } from '../button/MenuButton';
import * as Icons from '../icons/Icons';

type TreeSpec = Omit<Dialog.Tree, 'type'>;
type AlloyButtonSpec = Parameters<typeof AlloyButton['sketch']>[0];
type OnLeafAction = (id: string) => void;

const renderLabel = (text: string ): SimpleSpec => ({
  dom: {
    tag: 'span',
    classes: [ `tree-label` ]
  },
  components: [
    GuiFactory.text(text)
  ],
});

const renderItemLabel = (item: Dialog.Leaf, level: number, onLeafAction: OnLeafAction, backstage: UiFactoryBackstage): AlloyButtonSpec => {
  const internalMenuButton = item.menu.map((btn) => renderMenuButton(btn, 'tox-mbtn', backstage, Optional.none()));
  const components = [ renderLabel(item.title) ];
  internalMenuButton.each((btn) => components.push(btn));

  return AlloyButton.sketch({
    dom: {
      tag: 'span',
      classes: [ `tree-item-label`, 'tox-trbtn' ],
      styles: {
        'padding-left': `${level * 8}px`,
        'font-weight': '400',
      }
    },
    components,
    action: (_button) => {
      onLeafAction(item.id);
    },
    buttonBehaviours: Behaviour.derive([
      Tabstopping.config({})
    ])
  });
};

const renderIcon = (iconName: string, iconsProvider: Icons.IconProvider, behaviours: Array<Behaviour.NamedConfiguredBehaviour<any, any, any>>): SimpleSpec =>
  Icons.render(iconName, {
    tag: 'span',
    classes: [
      'tox-tree__icon-wrap',
      'tox-icon',
    ],
    behaviours
  }, iconsProvider);

const renderIconFromPack = (iconName: string, iconsProvider: Icons.IconProvider): SimpleSpec =>
  renderIcon(iconName, iconsProvider, []);

const renderDirectoryLabel = (directory: Dialog.Directory, level: number, backstage: UiFactoryBackstage): AlloyButtonSpec => {
  const internalMenuButton = directory.menu.map((btn) => renderMenuButton(btn, 'tox-mbtn', backstage, Optional.none()));
  const components: SimpleSpec[] = [
    {
      dom: {
        tag: 'div',
        classes: [ 'chevron' ]
      },
      components: [
        renderIconFromPack('chevron-right', backstage.shared.providers.icons),
      ]
    },
    {
      dom: {
        tag: 'span',
        styles: {
          'padding-left': '4px'
        }
      },
      components: [ renderLabel(directory.title) ]
    }
  ];
  internalMenuButton.each((btn) => {
    components.push(btn);
  });
  return AlloyButton.sketch({

    dom: {
      tag: 'div',
      classes: [ `tree-directory-label`, 'tox-trbtn' ],
      styles: {
        'padding-left': `${level * 8}px`,
        'font-weight': '700',
      }
    },
    components,
    action: (button) => {
      SelectorFind.sibling(button.element, '.tree-directory-children').each((childrenEle) => {
        button.getSystem().getByDom(childrenEle).each((childrenComp) => Toggling.toggle(childrenComp));
      });
    },
    buttonBehaviours: Behaviour.derive([
      Toggling.config({
        toggleOnExecute: true,
        toggleClass: 'active'
      }),
      Tabstopping.config({})
    ])
  });
};

const renderDirectoryChildren = (children: Dialog.TreeItem[], level: number, onLeafAction: OnLeafAction, backstage: UiFactoryBackstage): SimpleSpec => {
  return {
    dom: {
      tag: 'div',
      classes: [ 'tree-directory-children' ],
      styles: {
        'padding-left': `${level * 8}px`
      }
    },
    components: children.map((item) => {
      return item.type === 'leaf' ? renderItemLabel(item, level + 1, onLeafAction, backstage) : renderDirectory(item, level + 1, onLeafAction, backstage);
    }),
    behaviours: Behaviour.derive([
      Toggling.config({
        toggleClass: 'expanded'
      }),
      Tabstopping.config({})
    ])
  };
};

const renderDirectory = (dir: Dialog.Directory, level: number, onLeafAction: OnLeafAction, backstage: UiFactoryBackstage): SimpleSpec => {
  const children =
    renderDirectoryChildren(dir.children, level, onLeafAction, backstage);
  return ({
    dom: {
      tag: 'div',
      classes: [ `tree-directory` ],
      styles: {
        'display': 'flex',
        'flex-direction': 'column',
      }
    },
    components: [
      renderDirectoryLabel(dir, level, backstage),
      children
    ],
  });
};

const renderTree = (
  spec: TreeSpec,
  backstage: UiFactoryBackstage,
  level = 1
): SimpleSpec => {
  const onLeafAction = spec.onLeafAction.getOr(Fun.noop);
  return {
    dom: {
      tag: 'div',
      styles: {
        'display': 'flex',
        'flex-direction': 'column'
      }
    },
    components: spec.items.map((item) => {
      return item.type === 'leaf' ?
        renderItemLabel(item, level, onLeafAction, backstage) :
        renderDirectory(item, level, onLeafAction, backstage);
    })
  };
};

export {
  renderTree
};
