import { Behaviour, Button as AlloyButton, Tabstopping, GuiFactory, SimpleSpec, Toggling, Replacing, Keying } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Fun, Optional } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderMenuButton } from '../button/MenuButton';
import * as Icons from '../icons/Icons';

type TreeSpec = Omit<Dialog.Tree, 'type'>;
type OnLeafAction = (id: string) => void;

const renderLabel = (text: string ): SimpleSpec => ({
  dom: {
    tag: 'span',
    classes: [ `tox-tree__label` ],
    attributes: {
      'title': text,
      'aria-label': text,
    }
  },
  components: [
    GuiFactory.text(text)
  ],
});

const renderLeafLabel = (leaf: Dialog.Leaf, onLeafAction: OnLeafAction, visible: boolean, backstage: UiFactoryBackstage): SimpleSpec => {
  const internalMenuButton = leaf.menu.map((btn) => renderMenuButton(btn, 'tox-mbtn', backstage, Optional.none(), visible));
  const components = [ renderLabel(leaf.title) ];
  internalMenuButton.each((btn) => components.push(btn));

  return AlloyButton.sketch({
    dom: {
      tag: 'span',
      classes: [ `tox-tree--leaf__label`, 'tox-trbtn' ].concat(visible ? [ 'tox-tree--leaf__label--visible' ] : []),
    },
    components,
    role: 'treeitem',
    action: (_button) => {
      onLeafAction(leaf.id);
    },
    buttonBehaviours: Behaviour.derive([
      ...(visible ? [ Tabstopping.config({}) ] : []),
    ]),
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

const renderDirectoryLabel = (directory: Dialog.Directory, visible: boolean, backstage: UiFactoryBackstage): SimpleSpec => {
  const internalMenuButton = directory.menu.map((btn) => renderMenuButton(btn, 'tox-mbtn', backstage, Optional.none()));
  const components: SimpleSpec[] = [
    {
      dom: {
        tag: 'div',
        classes: [ 'tox-chevron' ],
      },
      components: [
        renderIconFromPack('chevron-right', backstage.shared.providers.icons),
      ]
    },
    renderLabel(directory.title)
  ];
  internalMenuButton.each((btn) => {
    components.push(btn);
  });
  return AlloyButton.sketch({

    dom: {
      tag: 'div',
      classes: [ `tox-tree--directory__label`, 'tox-trbtn' ].concat( visible ? [ 'tox-tree--directory__label--visible' ] : [] ),
    },
    components,
    action: (button) => {
      SelectorFind.sibling(button.element, '.tox-tree--directory__children').each((childrenEle) => {
        button.getSystem().getByDom(childrenEle).each((childrenComp) => Toggling.toggle(childrenComp));
      });
      SelectorFind.ancestor(button.element, '.tox-tree--directory').each((directoryEle) => {
        button.getSystem().getByDom(directoryEle).each((directoryComp) => Toggling.toggle(directoryComp));
      });
    },
    buttonBehaviours: Behaviour.derive([
      Toggling.config({
        toggleOnExecute: true,
        toggleClass: 'tox-tree--directory__label--active'
      }),
      ...(visible ? [ Tabstopping.config({}) ] : [])
    ])

  });
};

const renderDirectoryChildren = (children: Dialog.TreeItem[], onLeafAction: OnLeafAction, backstage: UiFactoryBackstage): SimpleSpec => {
  const computeChildren = (tabstopping: boolean) => children.map((item) => {
    return item.type === 'leaf' ? renderLeafLabel(item, onLeafAction, tabstopping, backstage) : renderDirectory(item, onLeafAction, tabstopping, backstage);
  });
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-tree--directory__children' ],
    },
    components: computeChildren(false),
    behaviours: Behaviour.derive([
      Toggling.config({
        toggleClass: 'tox-trbtn--expanded',
        onToggled: (cmp, state) => {
          Replacing.set(cmp, computeChildren(state));
        }
      }),
      Replacing.config({})
    ])
  };
};

const renderDirectory = (dir: Dialog.Directory, onLeafAction: OnLeafAction, labelTabstopping: boolean, backstage: UiFactoryBackstage): SimpleSpec => {
  const children =
    renderDirectoryChildren(dir.children, onLeafAction, backstage);
  return ({
    dom: {
      tag: 'div',
      classes: [ `tox-tree--directory` ],
      attributes: {
        role: 'treeitem'
      }
    },
    components: [
      renderDirectoryLabel(dir, labelTabstopping, backstage),
      children
    ],
    behaviours: Behaviour.derive([
      Toggling.config({
        aria: {
          mode: 'expanded',
        },
      })
    ])
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
      attributes: {
        role: 'tree'
      }
    },
    components: spec.items.map((item) => {
      return item.type === 'leaf' ?
        renderLeafLabel(item, onLeafAction, true, backstage) :
        renderDirectory(item, onLeafAction, true, backstage);
    }),
    behaviours: Behaviour.derive([
      Keying.config({
        mode: 'flow',
        selector: '.tox-tree--leaf__label--visible, .tox-tree--directory__label--visible',
        cycles: false
      })
    ])
  };
};

export {
  renderTree
};
