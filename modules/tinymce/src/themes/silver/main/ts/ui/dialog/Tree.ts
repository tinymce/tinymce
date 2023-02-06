import { Behaviour, Button as AlloyButton, GuiFactory, SimpleSpec, SketchSpec, Toggling } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Id } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import { UiFactoryBackstage, UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as Icons from '../icons/Icons';

type TreeSpec = Omit<Dialog.Tree, 'type'>;
type AlloyButtonSpec = Parameters<typeof AlloyButton['sketch']>[0];

const renderLabel = (text: string ): SimpleSpec => ({
  dom: {
    tag: 'span',
    classes: [ `tree-label` ]
  },
  components: [
    GuiFactory.text(text)
  ],
});

const renderItemLabel = (item: Dialog.Leaf, level: number): AlloyButtonSpec => {
  return AlloyButton.sketch({
    dom: {
      tag: 'span',
      classes: [ `tree-item-label`, 'tox-trbtn' ],
      styles: {
        'padding-left': `${level * 8}px`,
        'font-weight': '400',
      }
    },
    components: [
      renderLabel(item.title)
    ],
    action: (_button) => {
      console.log(`clicked on file ${item.title}, id: ${item.id}`);
    }
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

const renderDirectoryLabel = (text: string, level: number, iconsProvider: Icons.IconProvider): AlloyButtonSpec => {
  return AlloyButton.sketch({

    dom: {
      tag: 'div',
      classes: [ `tree-directory-label`, 'tox-trbtn' ],
      styles: {
        'padding-left': `${level * 8}px`,
        'font-weight': '700',
      }
    },
    components: [
      renderIconFromPack('chevron-right', iconsProvider),
      {
        dom: {
          tag: 'span',
          styles: {
            'padding-left': '4px'
          }
        },
        components: [ renderLabel(text) ]
      }
    ],
    action: (button) => {
      SelectorFind.sibling(button.element, '.tree-directory-children').each((childrenEle) => {
        button.getSystem().getByDom(childrenEle).each((childrenComp) => Toggling.toggle(childrenComp));
      });
    },
  });
};

const renderDirectoryChildren = (children: Dialog.TreeItem[], level: number, providers: UiFactoryBackstageProviders): SimpleSpec => {
  return {
    dom: {
      tag: 'div',
      classes: [ 'tree-directory-children' ],
      styles: {
        'padding-left': `${level * 8}px`
      }
    },
    components: children.map((item) => {
      return item.type === 'leaf' ? renderItemLabel(item, level + 1) : renderDirectory(item, level + 1, providers);
    }),
    behaviours: Behaviour.derive([
      Toggling.config({
        toggleClass: 'expanded'
      })
    ])
  };
};

const renderDirectory = (dir: Dialog.Directory, level: number, providers: UiFactoryBackstageProviders): SimpleSpec => {
  const children =
    renderDirectoryChildren(dir.children, level, providers);
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
      renderDirectoryLabel(dir.title, level, providers.icons),
      children
    ],
  });
};

const renderTree = (
  spec: TreeSpec,
  backstage: UiFactoryBackstage,
  level = 1
): SketchSpec => {
  return {
    uid: Id.generate(''),
    dom: {
      tag: 'div',
      styles: {
        'display': 'flex',
        'flex-direction': 'column'
      }
    },
    components: spec.items.map((item) => {
      return item.type === 'leaf' ?
        renderItemLabel(item, level) :
        renderDirectory(item, level, backstage.shared.providers);
    })
  };
};

export {
  renderTree
};
