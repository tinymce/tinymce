import { AlloyComponent, Gui } from '@ephox/alloy';
import { Optional, Singleton } from '@ephox/katamari';
import { Compare } from '@ephox/sugar';

export interface SinkAndMothership {
  readonly sink: AlloyComponent;
  readonly mothership: Gui.GuiSystem;
}

export interface MainUi {
  readonly mothership: Gui.GuiSystem;
  readonly outerContainer: AlloyComponent;
}

export interface ReadyUiReferences {
  readonly dialogUi: SinkAndMothership;
  readonly popupUi: SinkAndMothership;
  readonly mainUi: MainUi;
  readonly uiMotherships: Gui.GuiSystem[];
}

export interface LazyUiReferences {
  readonly dialogUi: Singleton.Value<SinkAndMothership>;
  readonly popupUi: Singleton.Value<SinkAndMothership>;
  readonly mainUi: Singleton.Value<MainUi>;

  // We abstract over all "UI Motherships" for things like
  // * showing / hiding on editor focus/blur
  // * destroying on remove
  // * broadcasting events for dismissing popups on mousedown etc.
  // Unless ui_mode: split is set, there will only be one UI mothership
  readonly getUiMotherships: () => Array<Gui.GuiSystem>;

  readonly lazyGetInOuterOrDie: <A>(label: string, f: (oc: AlloyComponent) => Optional<A>) => () => A;
}

export const LazyUiReferences = (): LazyUiReferences => {
  const dialogUi = Singleton.value<SinkAndMothership>();
  const popupUi = Singleton.value<SinkAndMothership>();
  const mainUi = Singleton.value<{ mothership: Gui.GuiSystem; outerContainer: AlloyComponent }>();

  const lazyGetInOuterOrDie = <A>(label: string, f: (oc: AlloyComponent) => Optional<A>): () => A =>
    () => mainUi.get().bind(
      (oc) => f(oc.outerContainer)
    ).getOrDie(
      `Could not find ${label} element in OuterContainer`
    );

  // TINY-9226: If the motherships are the same, return just the dialog Ui of them (ui_mode: combined mode)
  const getUiMotherships = () => {
    const optDialogMothership = dialogUi.get().map((ui) => ui.mothership);
    const optPopupMothership = popupUi.get().map((ui) => ui.mothership);

    return optDialogMothership.fold(
      () => optPopupMothership.toArray(),
      (dm) => optPopupMothership.fold(
        () => [ dm ],
        (pm) => Compare.eq(dm.element, pm.element) ? [ dm ] : [ dm, pm ]
      )
    );
  };

  return {
    dialogUi,
    popupUi,
    mainUi,
    getUiMotherships,
    lazyGetInOuterOrDie
  };
};
