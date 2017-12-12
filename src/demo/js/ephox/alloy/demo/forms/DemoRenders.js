import DomFactory from 'ephox/alloy/api/component/DomFactory';
import FormChooser from 'ephox/alloy/api/ui/FormChooser';
import ItemWidget from 'ephox/alloy/api/ui/ItemWidget';
import Menu from 'ephox/alloy/api/ui/Menu';
import ToolbarGroup from 'ephox/alloy/api/ui/ToolbarGroup';
import { FieldSchema } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

var demoItem = ValueSchema.objOf([
  FieldSchema.strictObjOf('data', [
    FieldSchema.strict('value'),
    FieldSchema.strict('text')
  ]),
  FieldSchema.strict('type')
]);

var demoWidgetItem = ValueSchema.objOf([
  FieldSchema.strictObjOf('data', [
    FieldSchema.strict('value'),
    FieldSchema.strict('text')
  ]),
  FieldSchema.strict('type'),
  FieldSchema.defaulted('autofocus', false),
  FieldSchema.strict('widget')
]);

var demoMenu = ValueSchema.objOf([
  FieldSchema.strict('value'),
  FieldSchema.strict('items')
]);

var demoGridMenu = ValueSchema.objOf([
  FieldSchema.strict('columns'),
  FieldSchema.strict('rows'),
  FieldSchema.strict('items')
]);

var demoChoice = ValueSchema.objOf([ ]);

var demoChoiceRender = function (choice) {
  var spec = ValueSchema.asRawOrDie('DemoRenders.choice', demoChoice, choice);
  return {
    dom: DomFactory.fromHtml(
      '<span class="ephox-pastry-independent-button" title="' + spec.text + '" style="display: flex;"></span>'
    )
  };
};

var demoSeparatorRender = function (spec) {
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

var demoItemRender = function (item) {
  if (item.type === 'widget') return demoWidgetItemRender(item);
  else if (item.type === 'separator') return demoSeparatorRender(item);
  var spec = ValueSchema.asRawOrDie('DemoRenders.item', demoItem, item);
  return {
    type: spec.type,
    data: spec.data,
    dom: DomFactory.fromHtml('<div class="demo-alloy-item">' + spec.data.text + '</div>'),
    components: [ ]
  };
};

var demoGridItemRender = function (item) {
  var spec = ValueSchema.asRawOrDie('DemoRenders.gridItem', demoItem, item);
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

var demoWidgetItemRender = function (item) {
  var spec = ValueSchema.asRawOrDie('DemoRenders.widgetItem', demoWidgetItem, item);
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

var demoGridMenuRender = function (menu) {
  var spec = ValueSchema.asRawOrDie('DemoRenders.gridMenu', demoGridMenu, menu);
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

var demoMenuRender = function (menu) {
  var spec = ValueSchema.asRawOrDie('DemoRenders.menu', demoMenu, menu);
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

var demoOrbRender = function (orb) {
  var spec = orb;
  return {
    type: 'item',
    data: spec.data,
    dom: {
      tag: 'div',
      styles: {
        display: 'flex',
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

var demoToolbarItemRender = function (item) {
  var spec = item;
  return {
    dom: {
      tag: 'span',
      classes: [ 'demo-alloy-toolbar-item' ],
      innerHtml: spec.text
    }
  };
};

var demoToolbarGroupRender = function (group) {
  var spec = group;
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

var orbMarkers = {
  item: 'demo-alloy-orb',
  selectedItem: 'demo-alloy-orb-selected'
};

var tieredMarkers = {
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