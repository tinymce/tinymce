import { AlloyComponent, Gui } from '@ephox/alloy';
import { Optional, Singleton } from '@ephox/katamari';

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

  // TINY-9226: We abstract over all "UI Motherships" for things like
  // * showing / hiding on editor focus/blur
  // * destroying on remove
  // * broadcasting events for dismissing popups on mousedown etc.
  readonly getUiMotherships: () => Array<Gui.GuiSystem>;

  readonly setupDialogUi: (ui: { sink: AlloyComponent; mothership: Gui.GuiSystem }) => void;

  readonly lazyGetInOuterOrDie: <A>(label: string, f: (oc: AlloyComponent) => Optional<A>) => () => A;
}

export const LazyUiReferences = (): LazyUiReferences => {
  const dialogUi = Singleton.value<SinkAndMothership>();
  const popupUi = Singleton.value<SinkAndMothership>();
  const mainUi = Singleton.value<{ mothership: Gui.GuiSystem; outerContainer: AlloyComponent }>();

  const setupDialogUi = (ui: SinkAndMothership): void => {
    dialogUi.set(ui);
  };

  const lazyGetInOuterOrDie = <A>(label: string, f: (oc: AlloyComponent) => Optional<A>): () => A =>
    () => mainUi.get().bind(
      (oc) => f(oc.outerContainer)
    ).getOrDie(
      `Could not find ${label} element in OuterContainer`
    );

  return {
    dialogUi,
    popupUi,
    mainUi,

    // TINY-9226: We need to return the popup mothership here once it has been added to the code
    getUiMotherships: () => [
      ...dialogUi.get().map((e) => e.mothership).toArray()
    ],
    setupDialogUi,
    lazyGetInOuterOrDie
  };
};
