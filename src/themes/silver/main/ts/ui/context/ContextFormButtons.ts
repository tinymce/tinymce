/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AlloyComponent,
  AlloyEvents,
  AlloyTriggers,
  Disabling,
  Memento,
  MementoRecord,
  Representing,
  SystemEvents,
} from '@ephox/alloy';
import { ValueSchema } from '@ephox/boulder';
import { Toolbar } from '@ephox/bridge';
import { Arr, Fun, Option, Options } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { internalToolbarButtonExecute, InternalToolbarButtonExecuteEvent } from '../toolbar/button/ButtonEvents';
import { renderToolbarButtonWith, renderToolbarToggleButtonWith } from '../toolbar/button/ToolbarButtons';

// Can probably generalise.

const getFormApi = (input): Toolbar.ContextFormInstanceApi => {
  return {
    hide: () => AlloyTriggers.emit(input, SystemEvents.sandboxClose()),
    getValue: () => Representing.getValue(input)
  };
};

const runOnExecute = <T>(memInput: MementoRecord, original: { onAction: (formApi, buttonApi: T) => void }) => AlloyEvents.run<InternalToolbarButtonExecuteEvent<T>>(internalToolbarButtonExecute, (comp, se) => {
  const input = memInput.get(comp);
  const formApi = getFormApi(input);
  original.onAction(formApi, se.event().buttonApi());
});

const renderContextButton = (memInput: MementoRecord, button: Toolbar.ContextButton, extras) => {
  const { primary, ...rest } = button.original;
  const bridged = ValueSchema.getOrDie(
    Toolbar.createToolbarButton({
      ...rest,
      type: 'button',
      onAction: () => { }
    })
  );

  return renderToolbarButtonWith(bridged, extras.backstage.shared.providers, [
    runOnExecute<Toolbar.ToolbarButtonInstanceApi>(memInput, button)
  ]);
};

const renderContextToggleButton = (memInput: MementoRecord, button: Toolbar.ContextToggleButton, extras) => {
  const { primary, ...rest } = button.original;
  const bridged = ValueSchema.getOrDie(
    Toolbar.createToggleButton({
      ...rest,
      type: 'togglebutton',
      onAction: () => { }
    })
  );

  return renderToolbarToggleButtonWith(bridged, extras.backstage.shared.providers, [
    runOnExecute<Toolbar.ToolbarButtonInstanceApi>(memInput, button)
  ]);
};

const generateOne = (memInput: MementoRecord, button: Toolbar.ContextToggleButton | Toolbar.ContextButton, providersBackstage: UiFactoryBackstageProviders) => {
  const extras = {
    backstage: {
      shared: {
        providers: providersBackstage
      }
    }
  };

  if (button.type === 'contextformtogglebutton') {
    return renderContextToggleButton(memInput, button, extras);
  } else {
    return renderContextButton(memInput, button, extras);
  }
};

const generate = (memInput: MementoRecord, buttons: Array<Toolbar.ContextToggleButton | Toolbar.ContextButton>, providersBackstage: UiFactoryBackstageProviders) => {

  const mementos = Arr.map(buttons, (button) => {
    return Memento.record(
      generateOne(memInput, button, providersBackstage)
    );
  });

  const asSpecs = () => Arr.map(mementos, (mem) => mem.asSpec());

  const findPrimary = (compInSystem: AlloyComponent): Option<AlloyComponent> => {
    return Options.findMap(buttons, (button, i) => {
      if (button.primary) {
        return Option.from(mementos[i]).bind((mem) => mem.getOpt(compInSystem)).filter(Fun.not(Disabling.isDisabled));
      } else {
        return Option.none();
      }
    });
  };

  return {
    asSpecs,
    findPrimary
  };
};

export {
  generate
};