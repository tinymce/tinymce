import { Gui, GuiFactory } from '@ephox/alloy';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Class, Classes } from '@ephox/sugar';
import { assert } from 'chai';

import { LazyUiReferences, SinkAndMothership } from 'tinymce/themes/silver/modes/UiReferences';

describe('headless.modes.UiReferencesTest', () => {
  context('getUiMotherships', () => {

    const makeSinkAndMothership = (className: string): SinkAndMothership => {
      const mothership = Gui.create();
      Class.add(mothership.element, className);
      // It's not used as a sink in this test, so it doesn't need Positioning.
      const sink = GuiFactory.build({
        dom: {
          tag: 'div'
        }
      });

      return {
        mothership,
        sink
      };
    };

    const assertClasses = (expected: string[][], motherships: Gui.GuiSystem[]) => {
      const actual = Arr.map(motherships, (m) => Classes.get(m.element));
      assert.deepEqual(actual, expected, 'Checking classes of motherships');
    };

    it('TINY-9226: No UIs set', () => {
      const lazyRefs = LazyUiReferences();
      assert.deepEqual(lazyRefs.getUiMotherships(), [ ], 'There should be no motherships');
    });

    it('TINY-9226: DialogUi set but not PopupUp', () => {
      const lazyRefs = LazyUiReferences();
      lazyRefs.dialogUi.set(
        makeSinkAndMothership('alpha')
      );
      assertClasses([[ 'alpha' ]], lazyRefs.getUiMotherships());
    });

    it('TINY-9226: PopupUi set but not DialogUi', () => {
      const lazyRefs = LazyUiReferences();
      lazyRefs.popupUi.set(
        makeSinkAndMothership('beta')
      );
      assertClasses([[ 'beta' ]], lazyRefs.getUiMotherships());
    });

    it('TINY-9226: PopupUi set and DialogUi set, but same component', () => {
      const lazyRefs = LazyUiReferences();
      const shared = makeSinkAndMothership('shared');
      lazyRefs.dialogUi.set(shared);
      lazyRefs.popupUi.set(shared);
      assertClasses([[ 'shared' ]], lazyRefs.getUiMotherships());
    });

    it('TINY-9226: PopupUi set and DialogUi set, and different components', () => {
      const lazyRefs = LazyUiReferences();
      lazyRefs.dialogUi.set(
        makeSinkAndMothership('alpha')
      );
      lazyRefs.popupUi.set(
        makeSinkAndMothership('beta')
      );
      assertClasses([[ 'alpha' ], [ 'beta' ]], lazyRefs.getUiMotherships());
    });
  });
});
