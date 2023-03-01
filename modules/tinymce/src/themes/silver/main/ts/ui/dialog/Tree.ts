import { Behaviour, Button as AlloyButton, Tabstopping, GuiFactory, SimpleSpec, Toggling } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Fun, Optional } from '@ephox/katamari';
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
    classes: [ `tox-tree__label` ]
  },
  components: [
    GuiFactory.text(text)
  ],
});

const renderLeafLabel = (leaf: Dialog.Leaf, onLeafAction: OnLeafAction, backstage: UiFactoryBackstage): AlloyButtonSpec => {
  const internalMenuButton = leaf.menu.map((btn) => renderMenuButton(btn, 'tox-mbtn', backstage, Optional.none()));
  const components = [ renderLabel(leaf.title) ];
  internalMenuButton.each((btn) => components.push(btn));

  return AlloyButton.sketch({
    dom: {
      tag: 'span',
      classes: [ `tox-tree--leaf__label`, 'tox-trbtn' ],
    },
    components,
    action: (_button) => {
      onLeafAction(leaf.id);
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

const renderDirectoryLabel = (directory: Dialog.Directory, backstage: UiFactoryBackstage): AlloyButtonSpec => {
  const internalMenuButton = directory.menu.map((btn) => renderMenuButton(btn, 'tox-mbtn', backstage, Optional.none()));
  const directoryLabelWrapper = {
    dom: {
      tag: 'span',
      classes: [ 'tox-tree--directory__title__wrapper' ],
    },
    components: [ renderLabel(directory.title) ]
  };
  const components: SimpleSpec[] = [
    {
      dom: {
        tag: 'div',
        classes: [ 'tox-chevron' ]
      },
      components: [
        renderIconFromPack('chevron-right', backstage.shared.providers.icons),
      ]
    },
    directoryLabelWrapper
  ];
  internalMenuButton.each((btn) => {
    components.push(btn);
  });
  return AlloyButton.sketch({

    dom: {
      tag: 'div',
      classes: [ `tox-tree--directory__label`, 'tox-trbtn' ],
    },
    components,
    action: (button) => {
      SelectorFind.sibling(button.element, '.tox-tree--directory__children').each((childrenEle) => {
        button.getSystem().getByDom(childrenEle).each((childrenComp) => Toggling.toggle(childrenComp));
      });
    },
    buttonBehaviours: Behaviour.derive([
      Toggling.config({
        toggleOnExecute: true,
        toggleClass: 'tox-tree--directory__label--active'
      }),
      Tabstopping.config({})
    ])
  });
};

const renderDirectoryChildren = (children: Dialog.TreeItem[], onLeafAction: OnLeafAction, backstage: UiFactoryBackstage): SimpleSpec => {
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-tree--directory__children' ],
    },
    components: children.map((item) => {
      return item.type === 'leaf' ? renderLeafLabel(item, onLeafAction, backstage) : renderDirectory(item, onLeafAction, backstage);
    }),
    behaviours: Behaviour.derive([
      Toggling.config({
        toggleClass: 'tox-trbtn--expanded'
      }),
      Tabstopping.config({})
    ])
  };
};

const renderDirectory = (dir: Dialog.Directory, onLeafAction: OnLeafAction, backstage: UiFactoryBackstage): SimpleSpec => {
  const children =
    renderDirectoryChildren(dir.children, onLeafAction, backstage);
  return ({
    dom: {
      tag: 'div',
      classes: [ `tox-tree--directory` ],
    },
    components: [
      renderDirectoryLabel(dir, backstage),
      children
    ],
  });
};

const renderTree = (
  spec: TreeSpec,
  backstage: UiFactoryBackstage
): SimpleSpec => {
  const onLeafAction = spec.onLeafAction.getOr(Fun.noop);
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-tree' ],
    },
    components: spec.items.map((item) => {
      return item.type === 'leaf' ?
        renderLeafLabel(item, onLeafAction, backstage) :
        renderDirectory(item, onLeafAction, backstage);
    })
  };
};

export {
  renderTree
};
