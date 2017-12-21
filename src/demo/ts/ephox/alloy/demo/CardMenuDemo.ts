import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Transitioning from 'ephox/alloy/api/behaviour/Transitioning';
import Attachment from 'ephox/alloy/api/system/Attachment';
import Gui from 'ephox/alloy/api/system/Gui';
import Menu from 'ephox/alloy/api/ui/Menu';
import TieredMenu from 'ephox/alloy/api/ui/TieredMenu';
import HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import { Objects } from '@ephox/boulder';
import { Element } from '@ephox/sugar';
import { Class } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import { Width } from '@ephox/sugar';



export default <any> function () {
  var gui = Gui.create();
  var body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);


  var makeBack = function (text) {
    return {
      data: TieredMenu.collapseItem(text),
      type: 'item',
      dom: {
        tag: 'div',
        innerHtml: text
      },
      components: [ ]
    };
  };

  var makeItem = function (value, text) {
    return {
      data: {
        value: value,
        text: text
      },
      type: 'item',
      dom: {
        tag: 'div',
        innerHtml: text
      },
      components: [ ]
    };
  };

  var makeSeparator = function (text) {
    return {
      type: 'separator',
      dom: {
        tag: 'div',
        classes: [ 'separator' ]
      },
      components: [
        {
          dom: {
            tag: 'strong',
            innerHtml: text
          }
        }
      ]
    };
  };

  var makeMenu = function (value, items) {
    return {
      value: value,
      dom: {
        tag: 'div'
      },
      components: [
        Objects.exclude(makeSeparator(value), [ 'type' ]),
        {
          dom: {
            tag: 'div',
            classes: [ 'menu-items-container' ]
          },
          components: [
            Menu.parts().items({ })
          ]
        }
      ],
      items: items,
      menuBehaviours: Behaviour.derive([
        Transitioning.config({
          initialState: 'after',
          routes: Transitioning.createTristate('before', 'current', 'after', {
            transition: {
              property: 'transform',
              transitionClass: 'transitioning'
            }
          })
        })
      ])
    };
  };

  // https://jsfiddle.net/xuto3by2/1/
  var tieredMenu = TieredMenu.sketch({
    dom: {
      tag: 'div',
      classes: [ 'demo-tiered-menu' ]
    },
    components: [
      
    ],

    // Focus causes issues when the things being focused are offscreen.
    fakeFocus: true,
    // For animations, need things to stay around in the DOM (at least until animation is done)
    stayInDom: true,

    onExecute: function () {
      console.log('Executing');
    },
    onEscape: function () {
      console.log('Escaping');
    },
    onOpenMenu: function (container, menu) {
      var w = Width.get(container.element());
      Width.set(menu.element(), w);
      Transitioning.jumpTo(menu, 'current');
    },
    onOpenSubmenu: function (container, item, submenu) {
      var w = Width.get(container.element());
      var menu = SelectorFind.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');
      var menuComp = container.getSystem().getByDom(menu).getOrDie();

      Width.set(submenu.element(), w);

      Transitioning.progressTo(menuComp, 'before');
      Transitioning.jumpTo(submenu, 'after');
      Transitioning.progressTo(submenu, 'current');
    },

    onCollapseMenu: function (container, item, menu) {
      var submenu = SelectorFind.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');
      var submenuComp = container.getSystem().getByDom(submenu).getOrDie();
      Transitioning.progressTo(submenuComp, 'after');
      Transitioning.progressTo(menu, 'current');
    },

    navigateOnHover: false,

    openImmediately: true,
    data: TieredMenu.tieredData(
      'styles',
      {
        'styles': makeMenu('Styles', [
          makeItem('headers', 'Headers'),
          makeItem('inline', 'Inline'),
          makeItem('blocks', 'Blocks'),
          makeItem('alignment', 'Alignment')
        ]),

        'headers': makeMenu('Headers', [
          makeBack('< Back'),
          makeItem('h1', 'Header 1'),
          makeItem('h2', 'Header 2'),
          makeItem('h3', 'Header 3')
        ]),

        'inline': makeMenu('Inline', [
          makeBack('< Back'),
          makeItem('bold', 'Bold'),
          makeItem('italic', 'Italic')
        ]),

        'blocks': makeMenu('Blocks', [
          makeBack('< Back'),
          makeItem('p', 'Paragraph'),
          makeItem('blockquote', 'Blockquote'),
          makeItem('div', 'Div')
        ]),

        'alignment': makeMenu('Alignment', [
          makeBack('< Back'),
          makeItem('alignleft', 'Left')
        ])
      },
      {
        'headers': 'headers',
        'inline': 'inline',
        'blocks': 'blocks',
        'alignment': 'alignment'
      }
    ),

    markers: {
      backgroundMenu: 'background-menu',
      menu: 'menu',
      selectedMenu: 'selected-menu',
      item: 'item',
      selectedItem: 'selected-item'
    }
  });

  var menu = HtmlDisplay.section(
    gui,
    'This menu is a card menu',
    tieredMenu
  );
};