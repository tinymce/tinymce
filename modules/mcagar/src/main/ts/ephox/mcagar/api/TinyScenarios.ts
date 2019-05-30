import { Generators } from '@ephox/agar';
import { PropertySteps } from '@ephox/agar';
import { JSON as Json } from '@ephox/sand';
import { Element } from '@ephox/sugar';
import { Html } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';

export default function (editor) {

  // We can't just generate a scenario because normalisation is going to cause issues
  // with getting a selection.
  var genScenario = function (genContent, selectionExclusions) {
    return genContent.flatMap(function (structure) {
      var html = Html.getOuter(structure);
      editor.setContent(html);
      return Generators.selection(Element.fromDom(editor.getBody()), selectionExclusions).map(function (selection) {
        var win = editor.selection.win;
        var rng = win.document.createRange();
        rng.setStart(selection.start().dom(), selection.soffset());
        rng.setEnd(selection.finish().dom(), selection.foffset());
        editor.selection.setRng(rng);
        return {
          input: html,
          selection: selection
        };
      });
    });
  };

  var arbScenario = function (genContent, options) {
    return Jsc.bless({
      generator: genScenario(genContent, options.exclusions),
      show: function (scenario) {
        var root = Element.fromDom(editor.getBody());
        return Json.stringify({
          input: scenario.input,
          selection: Generators.describeSelection(root, scenario.selection)
        }, null, 2);
      }
    });
  };

  var sAsyncProperty = function (label, generator, step, options) {
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
    genScenario: genScenario,
    arbScenario: arbScenario,

    sAsyncProperty: sAsyncProperty
  };
};