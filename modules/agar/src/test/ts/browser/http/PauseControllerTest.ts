import { Assert, describe, it } from '@ephox/bedrock-client';

import * as Waiter from 'ephox/agar/api/Waiter';
import * as PauseController from 'ephox/agar/http/PauseController';

describe('browser.agar.http.PauseControllerTest', () => {
  it('TINY-13219: pause and resume', async () => {
    const pauseController = PauseController.createPauseController();
    let resumed = false;

    const waitPromise = pauseController.wait().then(() => {
      resumed = true;
    });

    await Waiter.pWait(10);
    Assert.eq('Should not have resumed yet', false, resumed);

    pauseController.resume();
    await waitPromise;
    Assert.eq('Should have resumed', true, resumed);
  });

  it('TINY-13219: wait timeout', async () => {
    const pauseController = PauseController.createPauseController();
    let didTimeout = false;

    try {
      await pauseController.wait(10);
    } catch (e) {
      didTimeout = true;
      Assert.eq('Should have the expected error message', 'PauseController wait timed out after 10ms', (e as Error).message);
    }

    Assert.eq('Should have timed out', true, didTimeout);
  });
});
