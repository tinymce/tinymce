import { Generators, PropertySteps, Step } from '@ephox/agar';
import { Element, Html, SimRange } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';
import { Editor } from '../alien/EditorTypes';

type ContentGenerator = any;
type SelectionExclusions = { containers: (container: Element) => boolean; };
type ArbScenarioOptions = { exclusions: SelectionExclusions };
type AsyncPropertyOptions = { scenario: ArbScenarioOptions, property: Record<string, any> };

interface Scenario {
  input: string;
  selection: SimRange;
}

export interface TinyScenarios {
  genScenario: (genContent: ContentGenerator, selectionExclusions: SelectionExclusions) => Scenario;
  arbScenario: (genContent: ContentGenerator, options: ArbScenarioOptions) => Scenario;

  sAsyncProperty: <T, X, Y>(label: string, generator: ContentGenerator, step: Step<X, Y>, options: AsyncPropertyOptions) => Step<T, T>;
}

export const TinyScenarios = function (editor: Editor): TinyScenarios {

  // We can't just generate a scenario because normalisation is going to cause issues
  // with getting a selection.
  const genScenario = function (genContent: ContentGenerator, selectionExclusions: SelectionExclusions) {
    return genContent.flatMap(function (structure: Element) {
      const html = Html.getOuter(structure);
      editor.setContent(html);
      return Generators.selection(Element.fromDom(editor.getBody()), selectionExclusions).map(function (selection: SimRange) {
        const win = editor.selection.win;
        const rng = win.document.createRange();
        rng.setStart(selection.start().dom(), selection.soffset());
        rng.setEnd(selection.finish().dom(), selection.foffset());
        editor.selection.setRng(rng);
        return {
          input: html,
          selection
        };
      });
    });
  };

  const arbScenario = function (genContent: ContentGenerator, options: ArbScenarioOptions) {
    return Jsc.bless({
      generator: genScenario(genContent, options.exclusions),
      show (scenario: Scenario) {
        const root = Element.fromDom(editor.getBody());
        return JSON.stringify({
          input: scenario.input,
          selection: Generators.describeSelection(root, scenario.selection)
        }, null, 2);
      }
    });
  };

  const sAsyncProperty = function <T, X, Y>(label: string, generator: ContentGenerator, step: Step<X, Y>, options: AsyncPropertyOptions) {
    return PropertySteps.sAsyncProperty<T, X, Y>(
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
