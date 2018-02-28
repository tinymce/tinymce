import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import DomFactory from 'ephox/alloy/api/component/DomFactory';
import * as ItemWidget from 'ephox/alloy/api/ui/ItemWidget';
import Menu from 'ephox/alloy/api/ui/Menu';
import ToolbarGroup from 'ephox/alloy/api/ui/ToolbarGroup';

const demoItem = ValueSchema.objOf([
  FieldSchema.strictObjOf('data', [
    FieldSchema.strict('value'),
    FieldSchema.strict('text')
  ]),
  FieldSchema.strict('type')
]);

const demoWidgetItem = ValueSchema.objOf([
  FieldSchema.strictObjOf('data', [
    FieldSchema.strict('value'),
    FieldSchema.strict('text')
  ]),
  FieldSchema.strict('type'),
  FieldSchema.defaulted('autofocus', false),
  FieldSchema.strict('widget')
]);

const demoMenu = ValueSchema.objOf([
  FieldSchema.strict('value'),
  FieldSchema.strict('items')
]);

const demoGridMenu = ValueSchema.objOf([
  FieldSchema.strict('columns'),
  FieldSchema.strict('rows'),
  FieldSchema.strict('items')
]);

const demoChoice = ValueSchema.objOf([ ]);

const demoChoiceRender = function (choice) {
  const spec = ValueSchema.asRawOrDie('DemoRenders.choice', demoChoice, choice);
  return {
    dom: DomFactory.fromHtml(
      '<span class="ephox-pastry-independent-button" title="' + spec.text + '" style="display: flex;"></span>'
    )
  };
};

const demoSeparatorRender = function (spec) {
  return {
    type: spec.type,
    dom: {
      tag: 'div',
      styles: {
        background: 'black',
        color: 'white'
      },
      innerHtml: spec.text !== undefined ? spec.text : spec.data.text
    },
    components: [ ]
  };
};

const demoItemRender = function (item) {
  if (item.type === 'widget') { return demoWidgetItemRender(item); } else if (item.type === 'separator') { return demoSeparatorRender(item); }
  const spec = ValueSchema.asRawOrDie('DemoRenders.item', demoItem, item);
  return {
    type: spec.type,
    data: spec.data,
    dom: DomFactory.fromHtml('<div class="demo-alloy-item">' + spec.data.text + '</div>'),
    components: [ ]
  };
};

const demoGridItemRender = function (item) {
  const spec = ValueSchema.asRawOrDie('DemoRenders.gridItem', demoItem, item);
  return {
    type: spec.type,
    data: spec.data,
    dom: {
      tag: 'span',
      classes: [ 'demo-alloy-item' ],
      innerHtml: spec.data.text,
      styles: {
        display: 'inline-block',
        width: '50px',
        padding: '0px'
      }
    },
    components: [ ]
  };
};

const demoWidgetItemRender = function (item) {
  const spec = ValueSchema.asRawOrDie('DemoRenders.widgetItem', demoWidgetItem, item);
  return {
    type: spec.type,
    data: spec.data,
    autofocus: spec.autofocus,
    dom: {
      tag: 'div',
      classes: [ 'demo-alloy-item' ]
    },
    components: [
      ItemWidget.parts().widget(spec.widget)
    ]
  };
};

const demoGridMenuRender = function (menu) {
  const spec = ValueSchema.asRawOrDie('DemoRenders.gridMenu', demoGridMenu, menu);
  return {
    movement: {
      mode: 'grid',
      initSize: {
        numColumns: spec.columns,
        numRows: spec.rows
      }
    },
    dom: {
      tag: 'div',
      classes: [ 'demo-alloy-menu' ],
      styles: {
        width: '100px'
      }
    },
    components: [
      Menu.parts().items({ })
    ],
    items: spec.items
  };
};

const demoMenuRender = function (menu) {
  const spec = ValueSchema.asRawOrDie('DemoRenders.menu', demoMenu, menu);
  return {
    dom: {
      tag: 'div',
      attributes: {
        'data-value': spec.value
      },
      classes: [ 'demo-alloy-menu' ]
    },
    items: spec.items,
    components: [
      Menu.parts().items({ })
    ]
  };
};

const demoOrbRender = function (orb) {
  const spec = orb;
  return {
    type: 'item',
    data: spec.data,
    dom: {
      tag: 'div',
      styles: {
        'display': 'flex',
        'justify-content': 'center'
      }
    },
    // data: spec.data,
    components: [
      {
        dom: DomFactory.fromHtml('<span>' + spec.data.text + '</span>')
      }
    ]
  };
};

const demoToolbarItemRender = function (item) {
  const spec = item;
  return {
    dom: {
      tag: 'span',
      classes: [ 'demo-alloy-toolbar-item' ],
      innerHtml: spec.text
    }
  };
};

const demoToolbarGroupRender = function (group) {
  const spec = group;
  return {
    dom: {
      tag: 'div',
      classes: [ 'demo-alloy-toolbar-group' ]
    },

    components: [
      ToolbarGroup.parts().items()
    ],

    items: spec.items,
    markers: {
      itemClass: 'demo-alloy-toolbar-item'
    }
  };
};

const orbMarkers = {
  item: 'demo-alloy-orb',
  selectedItem: 'demo-alloy-orb-selected'
};

const tieredMarkers = {
  item: 'demo-alloy-item',
  selectedItem: 'demo-alloy-item-selected',
  menu: 'demo-alloy-menu',
  selectedMenu: 'demo-alloy-menu-selected',
  backgroundMenu: 'demo-alloy-menu-background'
};

export default <any> {
  item: demoItemRender,
  gridItem: demoGridItemRender,
  widgetItem: demoWidgetItemRender,

  menu: demoMenuRender,
  gridMenu: demoGridMenuRender,

  choice: demoChoiceRender,
  orb: demoOrbRender,

  toolbarItem: demoToolbarItemRender,
  toolbarGroup: demoToolbarGroupRender,

  tieredMarkers: Fun.constant(tieredMarkers),
  orbMarkers: Fun.constant(orbMarkers)
};