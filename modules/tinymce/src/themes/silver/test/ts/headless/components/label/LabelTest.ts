import { ApproxStructure, Assertions } from '@ephox/agar';
import { AlloyComponent, GuiFactory, Memento } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';

import { UiFactoryBackstageShared } from 'tinymce/themes/silver/backstage/Backstage';
import { renderLabel } from 'tinymce/themes/silver/ui/dialog/Label';

import * as GuiSetup from '../../../module/GuiSetup';
import TestProviders from '../../../module/TestProviders';

describe('headless.tinymce.themes.silver.components.label.LabelTest', () => {
  const sharedBackstage = {
    providers: TestProviders,
    interpreter: Fun.identity as any
  } as UiFactoryBackstageShared;

  const items = [
    {
      dom: {
        tag: 'div',
        classes: [ 'tox-checkbox' ]
      }
    } as any
  ];

  const getCompByName = (_name: string) => Optional.none();

  const memBasicLabel = Memento.record(renderLabel({
    label: 'Group of Options',
    items,
    align: 'start',
    for: Optional.none()
  }, sharedBackstage, getCompByName));

  const memHtmlLabel = Memento.record(renderLabel({
    label: 'Some <html> like content',
    items,
    align: 'start',
    for: Optional.none()
  }, sharedBackstage, getCompByName));

  const memCenterLabel = Memento.record(renderLabel({
    label: 'Group of Options',
    items,
    align: 'center',
    for: Optional.none()
  }, sharedBackstage, getCompByName));

  const memEndLabel = Memento.record(renderLabel({
    label: 'Group of Options',
    items,
    align: 'end',
    for: Optional.none()
  }, sharedBackstage, getCompByName));

  const hook = GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build({
    dom: { tag: 'div' },
    components: [ memBasicLabel.asSpec(), memHtmlLabel.asSpec(), memCenterLabel.asSpec(), memEndLabel.asSpec() ]
  }));

  const assertLabelStructure = (component: AlloyComponent, alignment: 'start' | 'center' | 'end') => Assertions.assertStructure(
    'Checking initial structure',
    ApproxStructure.build((s, str, arr) => {
      const baseClass = 'tox-label';
      return s.element('div', {
        classes: [ arr.has('tox-form__group') ],
        children: [
          s.element('label', {
            classes: [
              arr.has(baseClass),
              (alignment === 'center' ? arr.has : arr.not)(`${baseClass}--center`),
              (alignment === 'end' ? arr.has : arr.not)(`${baseClass}--end`)
            ],
            children: [
              s.text(str.is('Group of Options'))
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-checkbox') ]
          })
        ]
      });
    }),
    component.element
  );

  it('Check basic structure', () => {
    const label = memBasicLabel.get(hook.component());
    assertLabelStructure(label, 'start');
  });

  it('TINY-7524: HTML like content should be rendered as plain text', () => {
    const htmlLabel = memHtmlLabel.get(hook.component());
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-form__group') ],
        children: [
          s.element('label', {
            classes: [ arr.has('tox-label') ],
            children: [
              s.text(str.is('Some <html> like content'))
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-checkbox') ]
          })
        ]
      })),
      htmlLabel.element
    );
  });

  it('TINY-10058: Check label with center alignment', () => {
    const label = memCenterLabel.get(hook.component());
    assertLabelStructure(label, 'center');
  });

  it('TINY-10058: Check label with end alignment', () => {
    const label = memEndLabel.get(hook.component());
    assertLabelStructure(label, 'end');
  });
});
