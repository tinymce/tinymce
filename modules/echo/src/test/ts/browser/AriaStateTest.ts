import { UnitTest, assert } from "@ephox/bedrock";
import { Fun } from "@ephox/katamari";
import { Insert, Element, Attr, Class } from "@ephox/sugar";
import AriaState from "ephox/echo/api/AriaState";

UnitTest.test('ariaStateTest', function () {
  var butter = function () {
    var container = Element.fromTag('span');
    var button = Element.fromTag('button');
    Insert.append(container, button);
    var selected = Class.toggler(container, 'test-statebutton-selected');
    return {
      element: Fun.constant(container),
      select: selected.on,
      deselect: selected.off,
      selected: selected.isOn
    };
  };

  var element = function () {
    return Element.fromTag('div');
  };

  var test = function (method, element, attribute, expected) {
    method(element);
    assert.eq(Attr.get(element, attribute), expected);
  };

  test(AriaState.expanded, element(), 'aria-expanded', 'true');
  test(AriaState.collapsed, element(), 'aria-expanded', 'false');
  test(AriaState.enable, element(), 'aria-disabled', 'false');
  test(AriaState.disable, element(), 'aria-disabled', 'true');

  var button = butter();

  // Test our scaffolding toggle button
  assert.eq(button.selected(), false);
  button.select();
  assert.eq(button.selected(), true);
  button.deselect();
  assert.eq(button.selected(), false);

  var testButton = function (method, button, attribute, expected) {
    method(button);
    assert.eq(Attr.get(button.element(), attribute), expected);
  };

  testButton(AriaState.pressed, button, 'aria-pressed', 'false');
  button.select();
  testButton(AriaState.pressed, button, 'aria-pressed', 'true');
  button.deselect();
  testButton(AriaState.pressed, button, 'aria-pressed', 'false');
});
