import { Generators, PropertySteps } from '@ephox/agar';
import { Element, Html } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';

export default function (editor) {

  // We can't just generate a scenario because normalisation is going to cause issues
  // with getting a selection.
  const genScenario = function (genContent, selectionExclusions) {
    return genContent.flatMap(function (structure) {
      const html = Html.getOuter(structure);
      editor.setContent(html);
      return Generators.selection(Element.fromDom(editor.getBody()), selectionExclusions).map(function (selection) {
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

  const arbScenario = function (genContent, options) {
    return Jsc.bless({
      generator: genScenario(genContent, options.exclusions),
      show (scenario) {
        const root = Element.fromDom(editor.getBody());
        return JSON.stringify({
          input: scenario.input,
          selection: Generators.describeSelection(root, scenario.selection)
        }, null, 2);
      }
    });
  };

  const sAsyncProperty = function (label: string, generator, step, options) {
    return PropertySteps.sAsyncProperty(
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
}
