import { Generators, PropertySteps, Step } from '@ephox/agar';
import { Html, SimRange, SugarElement } from '@ephox/sugar';
import * as fc from 'fast-check';

import { Editor } from '../../alien/EditorTypes';

type ContentGenerator = fc.Arbitrary<SugarElement<HTMLElement>>;

interface SelectionExclusions {
  readonly containers: (container: SugarElement<Node>) => boolean;
}

interface ArbScenarioOptions {
  readonly exclusions: SelectionExclusions;
}

interface AsyncPropertyOptions {
  readonly scenario: ArbScenarioOptions;
  readonly property: fc.Parameters;
}

interface Scenario {
  readonly input: string;
  readonly selection: SimRange;
}

export interface TinyScenarios {
  readonly genScenario: (genContent: ContentGenerator, selectionExclusions: SelectionExclusions) => fc.Arbitrary<Scenario>;
  readonly arbScenario: (genContent: ContentGenerator, options: ArbScenarioOptions) => fc.Arbitrary<Scenario>;

  readonly sAsyncProperty: <T>(label: string, generator: ContentGenerator, step: Step<Scenario, any>, options: AsyncPropertyOptions) => Step<T, T>;
}

export const TinyScenarios = (editor: Editor): TinyScenarios => {

  // We can't just generate a scenario because normalisation is going to cause issues
  // with getting a selection.
  const genScenario = (genContent: ContentGenerator, selectionExclusions: SelectionExclusions) => {
    return genContent.chain((structure) => {
      const html = Html.getOuter(structure);
      editor.setContent(html);
      return Generators.selection(SugarElement.fromDom(editor.getBody()), selectionExclusions).map((selection: SimRange) => {
        const win = editor.selection.win;
        const rng = win.document.createRange();
        rng.setStart(selection.start.dom, selection.soffset);
        rng.setEnd(selection.finish.dom, selection.foffset);
        editor.selection.setRng(rng);
        return {
          input: html,
          selection
        };
      });
    });
  };

  const arbScenario = (genContent: ContentGenerator, options: ArbScenarioOptions) =>
    genScenario(genContent, options.exclusions);

  const sAsyncProperty = <T> (label: string, generator: ContentGenerator, step: Step<Scenario, any>, options: AsyncPropertyOptions) => {
    return PropertySteps.sAsyncProperty<T, Scenario>(
      label,
      [
        arbScenario(generator, options.scenario)
      ],
      step,
      options.property
    );
  };

  return {
    genScenario,
    arbScenario,

    sAsyncProperty
  };
};
