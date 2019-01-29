import { FieldSchema, ValueSchema } from '@ephox/boulder';
import * as DomFactory from 'ephox/alloy/api/component/DomFactory';
import * as ItemWidget from 'ephox/alloy/api/ui/ItemWidget';
import { Menu } from 'ephox/alloy/api/ui/Menu';
import { ToolbarGroup } from 'ephox/alloy/api/ui/ToolbarGroup';
import { ItemSpec, NormalItemSpec, SeparatorItemSpec } from 'ephox/alloy/ui/types/ItemTypes';

import { PartialMenuSpec } from '../../../../../../main/ts/ephox/alloy/ui/types/TieredMenuTypes';

const demoItem = ValueSchema.objOf([
  FieldSchema.strictObjOf('data', [
    FieldSchema.strict('value'),
    FieldSchema.strictObjOf('meta', [
      FieldSchema.strict('text'),
      FieldSchema.defaulted('html', ''),
      FieldSchema.defaulted('meta-demo-content', { })
    ])
  ]),
  FieldSchema.strict('type'),
  FieldSchema.defaulted('itemBehaviours', { })
]);

const demoWidgetItem = ValueSchema.objOf([
  FieldSchema.strictObjOf('data', [
    FieldSchema.strict('value'),
    FieldSchema.strictObjOf('meta', [
      FieldSchema.strict('text')
    ])
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
  const html = (() => {
    if (spec.text) { return spec.text; }
    else if (spec.data && spec.data.meta && spec.data.meta.text) { return spec.data.meta.text; }
    else return 'Missing.Text.For.Separator';
  })();

  return {
    type: spec.type,
    dom: {
      tag: 'div',
      styles: {
        background: 'black',
        color: 'white'
      },
      innerHtml: html
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
  const html = (() => {
    if (spec.data && spec.data.meta && spec.data.meta.html) { return spec.data.meta.html }
    else if (spec && spec.data.meta && spec.data.meta.text) { return spec.data.meta.text }
    else return 'No.Text.For.Item';
  })();

  return {
    type: spec.type,
    data: spec.data,
    dom: DomFactory.fromHtml('<div class="demo-alloy-item">' + html + '</div>'),
    components: [ ],
    itemBehaviours: spec.itemBehaviours
  };
};

const gridItem = (itemSpec) => {
  const spec = ValueSchema.asRawOrDie('DemoRenders.gridItem', demoItem, itemSpec);
  const html = (() => {
    if (spec.data && spec.data.meta && spec.data.meta.text) { return spec.data.meta.text; }
    else return 'No.Text.For.Grid.Item';
  })();

  return {
    type: spec.type,
    data: spec.data,
    dom: {
      tag: 'span',
      classes: [ 'demo-alloy-item' ],
      innerHtml: html,
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
  } as PartialMenuSpec;
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
  const html = (() => {
    if (spec.data && spec.data.meta && spec.data.meta.text) { return spec.data.meta.text; }
    return 'No.Text.For.Orb';
  })();

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
        dom: DomFactory.fromHtml('<span>' + html + '</span>')
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
      itemSelector: '.demo-alloy-toolbar-item'
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