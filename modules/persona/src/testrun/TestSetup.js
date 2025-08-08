/**
 * If we want this to be TypeScript, we need node 22 on the CI server for "type stripping".
 *
 * There's a branch of `build-containers` with this change but it needs to be
 * dealt with by someone who knows how to deploy it.
 */

// set NodeJS console logging of objects to be actually useful
import * as Util from "util";
Util.inspect.defaultOptions.depth = null

// magic sauce that attaches a jsdom instance to `globalThis`
import 'global-jsdom/register';

// If we later need to unregister, change the above based on
// https://www.npmjs.com/package/global-jsdom#cleanup
