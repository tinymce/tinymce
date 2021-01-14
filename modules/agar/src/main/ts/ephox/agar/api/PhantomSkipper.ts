import { before } from '@ephox/bedrock-client';

const detect = (): boolean => navigator.userAgent.indexOf('PhantomJS') > -1;

const bddSetup = (): void => {
  if (detect()) {
    before(function () {
      this.skip();
    });
  }
};

export {
  detect,
  bddSetup
};
