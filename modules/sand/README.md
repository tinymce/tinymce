# Description

`sand` is a library for handling platform detection and standardising native browser functions. It does not bundle any commands. It is only a collection of modules.


# Installation

`sand` is available as an `npm` package. You can install it via the npm package `@ephox/sand`

## Install from npm

`npm install @ephox/sand`.


# Using the API

The project `sand` has two purposes: platform detection and global wrappers.

## Platform Detection

In order to detect the current platform, execute `PlatformDetection.detect()`. This will return an object with three parts: `browser`, `os`, and `device`.

~~~javascript
var platform = PlatformDetection.detect();
console.log('browser', platform.browser);
console.log('os', platform.os);
console.log('device', platform.device);
~~~

Note, `PlatformQuery` has been introduced to provide convenience methods for common platform queries and manage the internal structure of detect's response itself.

### Browser

The `browser` field has the following information:

* `current`: the name of the browser as a string
* `version`: a `(major, minor)` tuple representing the version
* `isEdge`: returns true iff. the browser is *Microsoft Edge*
* `isChromium`: returns true iff. the browser is *Chromium Based*
* `isIE`: returns true iff. the browser is *Internet Explorer*
* `isOpera`: returns true iff. the browser is *Opera*
* `isFirefox`: returns true iff. the browser is *Firefox*
* `isSafari`: returns true iff. the browser is *Safari*

~~~javascript
var platform = PlatformDetection.detect();
var isFF = platform.browser.isFirefox();
~~~

### Operating System (OS)

The `os` field has the following information:

* `current`: the name of the OS as a string
* `version`: a `(major, minor)` tuple representing the version
* `isWindows`: returns true iff. the OS is Windows
* `isiOS`: returns true iff. the OS is iOS
* `isAndroid`: returns true iff. the OS is Android
* `isOSX`: returns true iff. the OS is OSX
* `isLinux`: returns true iff. the OS is Linux
* `isSolaris`: returns true iff. the OS is Solaris
* `isFreeBSD`: returns true iff. the OS is FreeBSD

~~~javascript
var platform = PlatformDetection.detect();
var isWin = platform.os.isWindows();
~~~


### Device

The `device` field has the following information:

* `isiPad`: returns true iff. the device is an iPad
* `isiPhone`: returns true iff. the device is an iPhone
* `isTablet`: returns true iff. the device is an Tablet
* `isPhone`: returns true iff. the device is an Phone
* `isTouch`: returns true iff. the device is an Touch
* `isAndroid`: returns true iff. the device is an Android
* `isiOS`: returns true iff. the device is an iOS
* `isWebView`: returns true iff. the device is an WebView

~~~javascript
var platform = PlatformDetection.detect();
var isPh = platform.device.isPhone();
~~~


## Global Wrappers

These wrappers allow dependencies on globals that only exist on newer browsers, where normal references to them would cause the script to fail to load. They don't provide any safety in accessing the globals; it is assumed the supporting code knows whether the current browser supports the global. They are simply a way to defer referencing it.


### Blob

https://developer.mozilla.org/en-US/docs/Web/API/Blob

### Event

https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events

### FileReader

https://developer.mozilla.org/en-US/docs/Web/API/FileReader

### FormData

https://developer.mozilla.org/en-US/docs/Web/API/FormData

### HTMLElement

https://developer.mozilla.org/en/docs/Web/API/HTMLElement

* `HTMLElement.isPrototypeOf(x)`

### JSON

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON

* `JSON.parse(obj)`
* `JSON.stringify(obj, replacer, space)`

### NodeFilter

https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter


### URL

https://developer.mozilla.org/en-US/docs/Web/API/URL.createObjectURL

* `URL.createObjectURL(blob)`
* `URL.removeObjectURL(u)`

### Uint8Array

https://developer.mozilla.org/en-US/docs/Web/API/Uint8Array


### Window

https://developer.mozilla.org/en/docs/Web/API/window.requestAnimationFrame

* `Window.requestAnimationFrame(callback)`
* `Window.atob(base64)`


### XMLHttpRequest

https://developer.mozilla.org/en/docs/XMLHttpRequest


### XMLSerializer

https://developer.mozilla.org/en/docs/XMLSerializer

* `XMLSerializer.serializeToString(node)`

# Running Tests

$ yarn test
