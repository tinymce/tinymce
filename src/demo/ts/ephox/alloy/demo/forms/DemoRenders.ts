import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import * as DomFactory from 'ephox/alloy/api/component/DomFactory';
import * as ItemWidget from 'ephox/alloy/api/ui/ItemWidget';
import { Menu } from 'ephox/alloy/api/ui/Menu';
import { ToolbarGroup } from 'ephox/alloy/api/ui/ToolbarGroup';

import { PremadeSpec, SimpleOrSketchSpec, AlloySpec, RawDomSchema } from 'ephox/alloy/api/component/SpecTypes';
import { NormalItemSpec, ItemSpec, SeparatorItemSpec } from 'ephox/alloy/ui/types/ItemTypes';

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

const choice = (choiceSpec) => {
  const spec = ValueSchema.asRawOrDie('DemoRenders.choice', demoChoice, choiceSpec);
  return {
    dom: DomFactory.fromHtml(
      '<span class="ephox-pastry-independent-button" title="' + spec.text + '" style="display: flex;"></span>'
    ),
    value: choiceSpec.value
  };
};

const demoSeparatorRender = (spec): SeparatorItemSpec => {
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

const item = (itemSpec): ItemSpec => {
  if (itemSpec.type === 'widget') {
    return widgetItem(itemSpec);
  } else if (itemSpec.type === 'separator') {
    return demoSeparatorRender(itemSpec);
  }
  const spec = ValueSchema.asRawOrDie('DemoRenders.item', demoItem, itemSpec);
  return {
    type: spec.type,
    data: spec.data,
    dom: DomFactory.fromHtml('<div class="demo-alloy-item">' + spec.data.text + '</div>'),
    components: [ ]
  };
};

const gridItem = (itemSpec) => {
  const spec = ValueSchema.asRawOrDie('DemoRenders.gridItem', demoItem, itemSpec);
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

const widgetItem = (itemSpec) => {
  const spec = ValueSchema.asRawOrDie('DemoRenders.widgetItem', demoWidgetItem, itemSpec);
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

const gridMenu = (menuSpec) => {
  const spec = ValueSchema.asRawOrDie('DemoRenders.gridMenu', demoGridMenu, menuSpec);
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

const menu = (menuSpec) => {
  const spec = ValueSchema.asRawOrDie('DemoRenders.menu', demoMenu, menuSpec);
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

const orb = (spec): NormalItemSpec => {
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

const toolbarItem = (spec) => {
  return {
    dom: {
      tag: 'span',
      classes: [ 'demo-alloy-toolbar-item' ],
      innerHtml: spec.text
    }
  };
};

const toolbarGroup = (group) => {
  const spec = group;
  return {
    dom: {
      tag: 'div',
      classes: [ 'demo-alloy-toolbar-group' ]
    },

    components: [
      ToolbarGroup.parts().items({ })
    ],

    items: spec.items,
    markers: {
      itemClass: 'demo-alloy-toolbar-item'
    }
  };
};

const orbMarkers = () => ({
  item: 'demo-alloy-orb',
  selectedItem: 'demo-alloy-orb-selected'
});

const tieredMarkers = () => ({
  item: 'demo-alloy-item',
  selectedItem: 'demo-alloy-item-selected',
  menu: 'demo-alloy-menu',
  selectedMenu: 'demo-alloy-menu-selected',
  backgroundMenu: 'demo-alloy-menu-background'
});

export {
  item,
  gridItem,
  widgetItem,

  menu,
  gridMenu,

  choice,
  orb,

  toolbarItem,
  toolbarGroup,

  tieredMarkers,
  orbMarkers
};