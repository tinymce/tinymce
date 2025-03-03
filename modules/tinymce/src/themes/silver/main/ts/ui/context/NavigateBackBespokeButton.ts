import { AlloyEvents, AlloyTriggers, SketchSpec } from '@ephox/alloy';
import { StructureSchema } from '@ephox/boulder';
import { Toolbar } from '@ephox/bridge';
import { Fun } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import * as ButtonEvents from '../toolbar/button/ButtonEvents';
import * as ToolbarButtons from '../toolbar/button/ToolbarButtons';
import * as ContextUi from './ContextUi';

export const createNavigateBackButton = (editor: Editor, backstage: UiFactoryBackstage): SketchSpec => {
  const bridged = StructureSchema.getOrDie(
    Toolbar.createToolbarButton({
      type: 'button',
      icon: 'chevron-left',
      tooltip: 'Back',
      onAction: Fun.noop
    })
  );

  return ToolbarButtons.renderToolbarButtonWith(bridged, backstage.shared.providers, [
    AlloyEvents.run<ButtonEvents.InternalToolbarButtonExecuteEvent<unknown>>(ButtonEvents.internalToolbarButtonExecute, (comp) => {
      AlloyTriggers.emit(comp, ContextUi.backSlideEvent);
    })
  ]);
};

