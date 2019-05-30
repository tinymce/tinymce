import { UnitTest, ApproxStructure, Assertions, Step } from '@ephox/agar';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { CustomList } from 'ephox/alloy/api/ui/CustomList';
import { Toolbar } from 'ephox/alloy/api/ui/Toolbar';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Arr } from '@ephox/katamari';
import { ToolbarGroup } from 'ephox/alloy/api/ui/ToolbarGroup';

UnitTest.asynctest('MultipleToolbarTest', (success, failure) => {
  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      CustomList.sketch({
        uid: 'multiple-toolbar',
        dom: {
          tag: 'div',
          classes: [ 'test-multiple-toolbar' ],
        },
        shell: true,
        makeItem: () => {
          return Toolbar.sketch(
            {
              dom: {
                tag: 'div',
                classes: [ 'test-single-toolbar' ]
              },
              components: [ ]
            }
          );
        },
        setupItem: (mToolbar: AlloyComponent, tc: AlloyComponent, data: any, index: number) => {
          Toolbar.setGroups(tc, data);
        }
      })
    );
  }, (doc, body, gui, component, store) => {

    const makeToolbarItem = (itemSpec) => {
      return {
        dom: {
          tag: 'button',
          classes: [ 'test-toolbar-item' ],
          innerHtml: itemSpec.text
        }
      };
    };

    const makeToolbarGroup = (group) => {
      const spec = group;
      return {
        dom: {
          tag: 'div',
          classes: [ 'test-toolbar-group' ]
        },

        components: [
          ToolbarGroup.parts().items({ })
        ],

        items: spec.items,
        markers: {
          itemSelector: '.test-toolbar-item'
        }
      };
    };

    const toolbar = ApproxStructure.build((s, str, arr) => {
      return s.element('div', {
        classes: [ arr.has('test-single-toolbar') ],
        children: [
          s.element('div', {
            classes: [ arr.has('test-toolbar-group') ],
            children: [
              s.element('button', { html: str.is('A') }),
              s.element('button', { html: str.is('B') })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('test-toolbar-group') ],
            children: [
              s.element('button', { html: str.is('C') }),
              s.element('button', { html: str.is('D') })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('test-toolbar-group') ],
            children: [
              s.element('button', { html: str.is('E') }),
              s.element('button', { html: str.is('F') }),
              s.element('button', { html: str.is('G') })
            ]
          })
        ]
      });
    });

    const sAssertMultipleToolbars = (label: string) => {
      return Assertions.sAssertStructure(
        label,
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            classes: [ arr.has('test-multiple-toolbar') ],
            children: [
              toolbar,
              toolbar,
              toolbar
            ]
          });
        }),
        component.element()
      );
    };

    const toolbarList = component.getSystem().getByUid('multiple-toolbar').getOrDie();

    return [
      GuiSetup.mAddStyles(doc, [
        '.test-single-toolbar { display: flex; }',
        '.test-single-toolbar button { width: 100px; }'
      ]),

      Step.sync(() => {

        const groups = Arr.map([
          { items: Arr.map([ { text: 'A' }, { text: 'B' } ], makeToolbarItem) },
          { items: Arr.map([ { text: 'C' }, { text: 'D' } ], makeToolbarItem) },
          { items: Arr.map([ { text: 'E' }, { text: 'F' }, { text: 'G' } ], makeToolbarItem) }
        ], makeToolbarGroup);

        CustomList.setItems(toolbarList, [
          Arr.map(groups, ToolbarGroup.sketch),
          Arr.map(groups, ToolbarGroup.sketch),
          Arr.map(groups, ToolbarGroup.sketch)
        ]);
      }),

      sAssertMultipleToolbars('Checking structure of multiple toolbars'),

      GuiSetup.mRemoveStyles
    ];
  }, () => { success(); }, failure);
});