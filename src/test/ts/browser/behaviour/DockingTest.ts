import { ApproxStructure, Assertions, Logger, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Docking } from 'ephox/alloy/api/behaviour/Docking';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import { Container } from 'ephox/alloy/api/ui/Container';
import GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('DockingTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const subject = Memento.record(
    Container.sketch({
      dom: {
        styles: {
          width: '100px',
          height: '100px',
          background: 'blue'
        }
      },
      containerBehaviours: Behaviour.derive([
        Docking.config({
          leftAttr: 'data-dock-left',
          topAttr: 'data-dock-top'
        })
      ])
    })
  );

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          styles: {
            'margin-top': '2000px',
            'margin-bottom': '5000px'
          }
        },
        components: [
          subject.asSpec()
        ]
      })
    );

  }, function (doc, body, gui, component, store) {
    const box = subject.get(component);

    const boxWithNoPosition = function () {
      return ApproxStructure.build(function (s, str, arr) {
        return s.element('div', {
          styles: {
            position: str.none()
          }
        });
      });
    };

    const boxWithPosition = function (position) {
      return ApproxStructure.build(function (s, str, arr) {
        return s.element('div', {
          styles: {
            position: str.is(position)
          }
        });
      });
    };

    return [
      // On initial load, it should have no position.
      Assertions.sAssertStructure(
        'On initial load, box should have neither position: absolute nor position: fixed',
        boxWithNoPosition(),
        box.element()
      ),

      Logger.t(
        'Scroll completely offscreen',
        Step.sync(function () {
          window.scrollTo(0, 3000);
        })
      ),

      Waiter.sTryUntil(
        'Waiting until position is fixed',
        Assertions.sAssertStructure(
          'Now that box is offscreen normally, it should switch to fixed coordinates',
          boxWithPosition('fixed'),
          box.element()
        ),
        100,
        1000
      ),

      Logger.t(
        'Scroll back onscreen',
        Step.sync(function () {
          window.scrollTo(0, 2000);
        })
      ),

      Waiter.sTryUntil(
        'Waiting until position is absolute',
        Assertions.sAssertStructure(
          'Now that box is back on screen, it should switch to absolute coordinates',
          boxWithPosition('absolute'),
          box.element()
        ),
        100,
        1000
      )
    ];
  }, function () { success(); }, failure);
});
