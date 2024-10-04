import {
  AlloyComponent, AlloyEvents,
  Disabling, Memento, MementoRecord,
  SimpleOrSketchSpec
} from '@ephox/alloy';
import { StructureSchema } from '@ephox/boulder';
import { InlineContent, Toolbar } from '@ephox/bridge';
import { Arr, Fun, Optional } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { internalToolbarButtonExecute, InternalToolbarButtonExecuteEvent } from '../toolbar/button/ButtonEvents';
import { renderToolbarButtonWith, renderToolbarToggleButtonWith } from '../toolbar/button/ToolbarButtons';
import { getFormApi } from './ContextFormApi';

type ContextFormButton = InlineContent.ContextFormToggleButton<any> | InlineContent.ContextFormButton<any>;

interface ContextFormButtonRegistry {
  readonly asSpecs: () => SimpleOrSketchSpec[];
  readonly findPrimary: (compInSystem: AlloyComponent) => Optional<AlloyComponent>;
}

const runOnExecute = <T>(memInput: MementoRecord, original: { onAction: (formApi: InlineContent.ContextFormInstanceApi<any>, buttonApi: T) => void }) =>
  AlloyEvents.run<InternalToolbarButtonExecuteEvent<T>>(internalToolbarButtonExecute, (comp, se) => {
    const input = memInput.get(comp);
    const formApi = getFormApi(input);
    original.onAction(formApi, se.event.buttonApi);
  });

const renderContextButton = (memInput: MementoRecord, button: InlineContent.ContextFormButton<any>, providers: UiFactoryBackstageProviders) => {
  const { primary, ...rest } = button.original;
  const bridged = StructureSchema.getOrDie(
    Toolbar.createToolbarButton({
      ...rest,
      type: 'button',
      onAction: Fun.noop
    })
  );

  return renderToolbarButtonWith(bridged, providers, [
    runOnExecute<Toolbar.ToolbarButtonInstanceApi>(memInput, button)
  ]);
};

const renderContextToggleButton = (memInput: MementoRecord, button: InlineContent.ContextFormToggleButton<any>, providers: UiFactoryBackstageProviders) => {
  const { primary, ...rest } = button.original;
  const bridged = StructureSchema.getOrDie(
    Toolbar.createToggleButton({
      ...rest,
      type: 'togglebutton',
      onAction: Fun.noop
    })
  );

  return renderToolbarToggleButtonWith(bridged, providers, [
    runOnExecute<InlineContent.ContextFormToggleButtonInstanceApi>(memInput, button)
  ]);
};

const isToggleButton = (button: ContextFormButton): button is InlineContent.ContextFormToggleButton<any> =>
  button.type === 'contextformtogglebutton';

const generateOne = (memInput: MementoRecord, button: ContextFormButton, providersBackstage: UiFactoryBackstageProviders) => {
  if (isToggleButton(button)) {
    return renderContextToggleButton(memInput, button, providersBackstage);
  } else {
    return renderContextButton(memInput, button, providersBackstage);
  }
};

const generate = (memInput: MementoRecord, buttons: ContextFormButton[], providersBackstage: UiFactoryBackstageProviders): ContextFormButtonRegistry => {

  const mementos = Arr.map(buttons, (button) => Memento.record(
    generateOne(memInput, button, providersBackstage)
  ));

  const asSpecs = () => Arr.map(mementos, (mem) => mem.asSpec());

  const findPrimary = (compInSystem: AlloyComponent): Optional<AlloyComponent> => Arr.findMap(buttons, (button, i) => {
    if (button.primary) {
      return Optional.from(mementos[i]).bind((mem) => mem.getOpt(compInSystem)).filter(Fun.not(Disabling.isDisabled));
    } else {
      return Optional.none();
    }
  });

  return {
    asSpecs,
    findPrimary
  };
};

export {
  generate
};

