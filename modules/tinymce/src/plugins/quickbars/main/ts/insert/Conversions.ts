const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve((reader.result as string).split(',')[1]);
    };

    reader.readAsDataURL(blob);
  });
};

export {
  blobToBase64
};
