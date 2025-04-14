
// TODO: TINY-12081: Add tests for this

// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest

/**
 * NOTE: Only works in a secure context
 */
const hash = async (algorithm: AlgorithmIdentifier, message: string): Promise<string> => {
  const msgUint8 = new window.TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await window.crypto.subtle.digest(algorithm, msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(''); // convert bytes to hex string
  return hashHex;
};

export {
  hash
};
