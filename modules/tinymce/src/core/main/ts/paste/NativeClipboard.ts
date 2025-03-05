// import Env from '../api/Env';

// // TODO: read - handles permissions
// // TODO: write
// // TODO: Create

// // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard`
// // https://developer.mozilla.org/en-US/docs/Web/Security/User_activation
// // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API#security_considerations
// // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText
// // This method must be called within user gesture event handlers.
// // TODO: Consider transient activation: https://developer.mozilla.org/en-US/docs/Glossary/Transient_activation

// // readText
// // All browsers require secure context
// // Safari: No other conditions
// // Firefox: Requires method to be called within user gesture event handlers.
// // Chromium Based Browsers: The user must grant the clipboard-read permission.

// // writeText
// // All browsers require secure context
// // Safari: This method must be called within user gesture event handlers.
// // Firefox: This method must be called within user gesture event handlers.
// // Chrome: From version 107, this method must be called within user gesture event handlers, or the user must grant the clipboard-write permission.

// // if (!window.isSecureContext) {
// //   handleError(editor, 'Error: This operation requires a secure context (HTTPS).');
// //   return;
// // }

// // if (!navigator.userActivation.isActive) {
// //   handleError(editor, 'Error: This operation requires recent interaction with the page.');
// //   return;
// // }

// const isSecure = () => window.isSecureContext;
// const isActive = () => navigator.userActivation.isActive;
// const isReadPermitted = async () => {
//   if (Env.browser.isChromium()) {
//     const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
//     return permission.state === 'granted';
//   } else {
//     return true;
//   }
// };

// const canRead = () => {
//   return isSecure() && isActive();

// };

// const safeRead = () => {
//   if (Env.browser.isChromium()) {
//     const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
//     if (permission.state === 'denied') {
//       return handleError(editor, 'Clipboard permission denied. Please allow clipboard access to use this feature.');
//     }
//   }

// };
