import { PlatformDetection } from "@ephox/sand";


// On Firefox, pressing space fires a click event. We could potentially resolve this
          // by listening to keyup instead of keydown, but that seems like a big change. Alternatively,
          // we could make execution be able to do that.

// This file is used for stuff.

const isFirefox: boolean = PlatformDetection.detect().browser.isFirefox();

