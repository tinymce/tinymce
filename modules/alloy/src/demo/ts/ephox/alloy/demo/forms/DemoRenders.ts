import { FieldSchema, StructureSchema } from '@ephox/boulder';

import * as DomFactory from 'ephox/alloy/api/component/DomFactory';
import { AlloySpec, RawDomSchema, SketchSpec } from 'ephox/alloy/api/component/SpecTypes';
import * as ItemWidget from 'ephox/alloy/api/ui/ItemWidget';
import { Menu } from 'ephox/alloy/api/ui/Menu';
import { ToolbarGroup } from 'ephox/alloy/api/ui/ToolbarGroup';
import { ItemDataTuple, ItemSpec, SeparatorItemSpec, WidgetItemSpec } from 'ephox/alloy/ui/types/ItemTypes';
import { MenuSpec } from 'ephox/alloy/ui/types/MenuTypes';
import { PartialMenuSpec, TieredMenuSpec } from 'ephox/alloy/ui/types/TieredMenuTypes';
import { ToolbarGroupSpec } from 'ephox/alloy/ui/types/ToolbarGroupTypes';

export interface DemoItem {
  readonly type: 'item';
  readonly text?: string;
  readonly data: {
    readonly value: string;
    readonly meta?: {
      readonly text: string;

      [key: string]: string;
    };
  };

  [key: string]: any;
}

export interface DemoSeparatorItem {
  readonly type: 'separator';
  readonly text?: string;
  readonly data?: {
    readonly value: string;
    readonly meta?: {
      readonly text: string;
      [key: string]: string;
    };
  };
}

export interface DemoWidgetItem {
  readonly type: 'widget';
  readonly data: ItemDataTuple;
  readonly autofocus: boolean;
  readonly widget: SketchSpec;
}

export type DemoItems = DemoWidgetItem | DemoItem | DemoSeparatorItem;

export interface DemoMenu {
  readonly value: string;
  readonly items: ItemSpec[];

  [key: string]: any;
}

const demoItem = StructureSchema.objOf([
  FieldSchema.requiredObjOf('data', [
    FieldSchema.required('value'),
    FieldSchema.requiredObjOf('meta', [
      FieldSchema.required('text'),
      FieldSchema.defaulted('html', ''),
      FieldSchema.defaulted('meta-demo-content', { })
    ])
  ]),
  FieldSchema.required('type'),
  FieldSchema.defaulted('itemBehaviours', { })
]);

const demoWidgetItem = StructureSchema.objOf([
  FieldSchema.requiredObjOf('data', [
    FieldSchema.required('value'),
    FieldSchema.requiredObjOf('meta', [
      FieldSchema.required('text')
    ])
  ]),
  FieldSchema.required('type'),
  FieldSchema.defaulted('autofocus', false),
  FieldSchema.required('widget')
]);

const demoMenu = StructureSchema.objOf([
  FieldSchema.required('value'),
  FieldSchema.required('items')
]);

const demoGridMenu = StructureSchema.objOf([
  FieldSchema.required('columns'),
  FieldSchema.required('rows'),
  FieldSchema.required('items')
]);

const demoChoice = StructureSchema.objOf([ ]);

const choice = (choiceSpec: { value: string; text: string }): { dom: RawDomSchema; value: string } => {
  const spec = StructureSchema.asRawOrDie('DemoRenders.choice', demoChoice, choiceSpec);
  return {
    dom: DomFactory.fromHtml(
      '<span class="ephox-pastry-independent-button" title="' + spec.text + '" style="display: flex;"></span>'
    ),
    value: choiceSpec.value
  };
};

const demoSeparatorRender = (spec: DemoSeparatorItem): SeparatorItemSpec => {
  const html = (() => {
    if (spec.text) {
      return spec.text;
    } else if (spec.data && spec.data.meta && spec.data.meta.text) {
      return spec.data.meta.text;
    } else {
      return 'Missing.Text.For.Separator';
    }
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

const item = (itemSpec: DemoItems): ItemSpec => {
  if (itemSpec.type === 'widget') {
    return widgetItem(itemSpec);
  } else if (itemSpec.type === 'separator') {
    return demoSeparatorRender(itemSpec);
  }
  const spec = StructureSchema.asRawOrDie('DemoRenders.item', demoItem, itemSpec);
  const html = (() => {
    if (spec.data && spec.data.meta && spec.data.meta.html) {
      return spec.data.meta.html;
    } else if (spec.data && spec.data.meta && spec.data.meta.text) {
      return spec.data.meta.text;
    } else {
      return 'No.Text.For.Item';
    }
  })();

  return {
    type: spec.type,
    data: spec.data,
    dom: DomFactory.fromHtml('<div class="demo-alloy-item">' + html + '</div>'),
    components: [ ],
    itemBehaviours: spec.itemBehaviours
  };
};

const gridItem = (itemSpec: DemoItem): ItemSpec => {
  const spec = StructureSchema.asRawOrDie('DemoRenders.gridItem', demoItem, itemSpec);
  const html = (() => {
    if (spec.data && spec.data.meta && spec.data.meta.text) {
      return spec.data.meta.text;
    } else {
      return 'No.Text.For.Grid.Item';
    }
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

const widgetItem = (itemSpec: DemoWidgetItem): WidgetItemSpec => {
  const spec = StructureSchema.asRawOrDie('DemoRenders.widgetItem', demoWidgetItem, itemSpec);
  return {
    type: spec.type,
    data: spec.data,
    autofocus: spec.autofocus,
    dom: {
      tag: 'div',
      classes: [ 'demo-alloy-item' ]
    },
    components: [
      ItemWidget.parts.widget(spec.widget)
    ]
  };
};

const gridMenu = (menuSpec: DemoMenu & { columns: number; rows: number }): PartialMenuSpec => {
  const spec = StructureSchema.asRawOrDie('DemoRenders.gridMenu', demoGridMenu, menuSpec);
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
      Menu.parts.items({ })
    ],
    items: spec.items
  };
};

const menu = (menuSpec: DemoMenu): PartialMenuSpec => {
  const spec = StructureSchema.asRawOrDie('DemoRenders.menu', demoMenu, menuSpec);
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
      Menu.parts.items({ })
    ]
  };
};

const orb = (spec: DemoItem): ItemSpec => {
  const html = (() => {
    if (spec.data && spec.data.meta && spec.data.meta.text) {
      return spec.data.meta.text;
    }
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

const toolbarItem = (spec: { text: string; action: () => void }): AlloySpec => ({
  dom: {
    tag: 'span',
    classes: [ 'demo-alloy-toolbar-item' ],
    innerHtml: spec.text
  }
});

const toolbarGroup = (group: { label?: string; items: AlloySpec[] }): ToolbarGroupSpec => {
  const spec = group;
  return {
    dom: {
      tag: 'div',
      classes: [ 'demo-alloy-toolbar-group' ]
    },

    components: [
      ToolbarGroup.parts.items({ })
    ],

    items: spec.items,
    markers: {
      itemSelector: '.demo-alloy-toolbar-item'
    }
  };
};

const orbMarkers = (): MenuSpec['markers'] => ({
  item: 'demo-alloy-orb',
  selectedItem: 'demo-alloy-orb-selected'
});

const tieredMarkers = (): TieredMenuSpec['markers'] => ({
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
