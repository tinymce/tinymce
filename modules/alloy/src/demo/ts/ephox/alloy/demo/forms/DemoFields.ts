import { Arr, Future, Result } from '@ephox/katamari';
import { Value } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Invalidating } from 'ephox/alloy/api/behaviour/Invalidating';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import { LazySink } from 'ephox/alloy/api/component/CommonTypes';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as ComponentUtil from 'ephox/alloy/api/component/ComponentUtil';
import * as DomFactory from 'ephox/alloy/api/component/DomFactory';
import { SketchSpec } from 'ephox/alloy/api/component/SpecTypes';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import { Container } from 'ephox/alloy/api/ui/Container';
import { FormChooser } from 'ephox/alloy/api/ui/FormChooser';
import { FormCoupledInputs } from 'ephox/alloy/api/ui/FormCoupledInputs';
import { FormField } from 'ephox/alloy/api/ui/FormField';
import { HtmlSelect } from 'ephox/alloy/api/ui/HtmlSelect';
import { Input } from 'ephox/alloy/api/ui/Input';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import { Typeahead } from 'ephox/alloy/api/ui/Typeahead';
import * as Tagger from 'ephox/alloy/registry/Tagger';

import * as DemoRenders from './DemoRenders';

interface TextMungerSpec {
  label: string;
}

const invalidation = (validate: (v: string) => Result<Record<string, string>, string>, invalidUid: string) => Invalidating.config({
  invalidClass: 'invalid-input',
  notify: {
    getContainer: (input) => {
      return ComponentUtil.getByUid(input, invalidUid).map(ComponentUtil.toElem);
    }
  },
  validator: {
    validate: Invalidating.validation<Record<string, string>>(validate),
    onEvent: NativeEvents.input()
  }
});

const rawTextMunger = (spec: TextMungerSpec) => {
  const invalidUid = Tagger.generate('demo-invalid-uid');

  const pLabel = FormField.parts.label({
    dom: { tag: 'label', innerHtml: spec.label }
  });

  const pField = FormField.parts.field({
    factory: Input,
    inputBehaviours: Behaviour.derive([
      invalidation((v) => v.indexOf('a') === 0 ? Result.error('Do not start with a!') : Result.value({ }), invalidUid),
      Tabstopping.config({ })
    ])
  });

  return {
    dom: {
      tag: 'div'
    },
    components: [
      pLabel,
      Container.sketch({ uid: invalidUid }),
      pField
    ]
  };
};

const textMunger = (spec: TextMungerSpec): SketchSpec => {
  const m = rawTextMunger(spec);
  return FormField.sketch(m);
};

const selectMunger = (spec: { label: string; options: Array<{ value: string; text: string }> }): SketchSpec => {
  const pLabel = FormField.parts.label({
    dom: { tag: 'label', innerHtml: spec.label }
  });

  const pField = FormField.parts.field({
    factory: HtmlSelect,
    dom: {
      classes: [ 'ephox-select-wrapper' ]
    },
    selectBehaviours: Behaviour.derive([
      Tabstopping.config({ })
    ]),
    options: spec.options
  });

  return FormField.sketch({
    dom: DomFactory.fromHtml('<div style="border: 1px solid blue;"></div>'),
    components: [
      pLabel,
      Container.sketch({
        dom: DomFactory.fromHtml('<div class="wrapper"></div>'),
        components: [
          pField
        ]
      })
    ]
  });
};

const chooserMunger = (spec: { legend: string; choices: Array<{ text: string; value: string }> }): SketchSpec => {
  const pLegend = FormChooser.parts.legend({
    dom: {
      innerHtml: spec.legend
    }
  });

  const pChoices = FormChooser.parts.choices({ });

  return FormChooser.sketch({
    markers: {
      choiceClass: 'demo-alloy-choice',
      selectedClass: 'demo-alloy-choice-selected'
    },

    dom: {
      tag: 'div'
    },
    components: [
      pLegend,
      pChoices
    ],
    chooserBehaviours: Behaviour.derive([
      Tabstopping.config({ })
    ]),
    choices: Arr.map(spec.choices, DemoRenders.choice)
  });
};

const coupledTextMunger = (spec: { field1: TextMungerSpec; field2: TextMungerSpec }): SketchSpec => {
  const pField1 = FormCoupledInputs.parts.field1(
    rawTextMunger(spec.field1)
  );
  const pField2 = FormCoupledInputs.parts.field2(
    rawTextMunger(spec.field2)
  );

  const pLock = FormCoupledInputs.parts.lock({
    dom: { tag: 'button', innerHtml: 'x' },
    buttonBehaviours: Behaviour.derive([
      Tabstopping.config({ })
    ])
  });

  return FormCoupledInputs.sketch({
    dom: {
      tag: 'div'
    },
    markers: {
      lockClass: 'demo-selected'
    },
    onLockedChange: (current, other) => {
      const cValue = Representing.getValue(current);
      Representing.setValue(other, cValue);
    },

    components: [
      pField1,
      pField2,
      pLock
    ]
  });
};

const typeaheadMunger = (spec: { label: string; lazySink: LazySink; dataset: any[] }): SketchSpec => {
  const pLabel = FormField.parts.label({
    dom: {
      tag: 'label',
      innerHtml: spec.label
    }
  });

  const pField = FormField.parts.field({
    factory: Typeahead,
    minChars: 1,

    lazySink: spec.lazySink,

    fetch: (input: AlloyComponent) => {

      const text = Value.get(input.element);
      const matching: DemoRenders.DemoItems[] = Arr.bind(spec.dataset, (d) => {
        const index = d.indexOf(text.toLowerCase());
        if (index > -1) {
          const html = d.substring(0, index) + '<b>' + d.substring(index, index + text.length) + '</b>' +
            d.substring(index + text.length);
          return [{ 'type': 'item', 'data': { value: d, text: d, html }, 'item-class': 'class-' + d }];
        } else {
          return [ ];
        }
      });

      const matches = matching.length > 0 ? matching : [
        { type: 'separator', text: 'No items' } as DemoRenders.DemoSeparatorItem
      ];

      const future = Future.pure(matches);
      return future.map((items) => {
        const menu = DemoRenders.menu({
          value: 'typeahead-menu-blah',
          items: Arr.map(items, DemoRenders.item)
        });
        return TieredMenu.singleData('blah', menu);
      });
    },
    dom: {

    },
    parts: {
      menu: {
        markers: DemoRenders.tieredMarkers()
      }
    },

    markers: {
      openClass: 'alloy-selected-open'
    },

    typeaheadBehaviours: Behaviour.derive([
      Tabstopping.config({ })
    ])
  });

  return FormField.sketch({
    dom: {
      tag: 'div'
    },
    components: [
      pLabel,
      pField
    ]
  });
};

export {
  textMunger,
  selectMunger,
  chooserMunger,
  coupledTextMunger,
  typeaheadMunger
};
