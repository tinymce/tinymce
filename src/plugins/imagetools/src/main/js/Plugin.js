/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.imagetools.Plugin',
  [
    'ephox.imagetools.api.BlobConversions',
    'ephox.imagetools.api.ImageTransformations',
    'tinymce.core.Env',
    'tinymce.core.PluginManager',
    'tinymce.core.util.Delay',
    'tinymce.core.util.Promise',
    'tinymce.core.util.Tools',
    'tinymce.core.util.URI',
    'tinymce.plugins.imagetools.core.ImageSize',
    'tinymce.plugins.imagetools.core.Proxy',
    'tinymce.plugins.imagetools.ui.Dialog'
  ],
  function (
    BlobConversions, ImageTransformations, Env, PluginManager, Delay, Promise, Tools,
    URI, ImageSize, Proxy, Dialog
  ) {
    var plugin = function (editor) {
      var count = 0, imageUploadTimer, lastSelectedImage;

      if (!Env.fileApi) {
        return;
      }

      function displayError(error) {
        editor.notificationManager.open({
          text: error,
          type: 'error'
        });
      }

      function getSelectedImage() {
        return editor.selection.getNode();
      }

      function extractFilename(url) {
        var m = url.match(/\/([^\/\?]+)?\.(?:jpeg|jpg|png|gif)(?:\?|$)/i);
        if (m) {
          return editor.dom.encode(m[1]);
        }
        return null;
      }

      function createId() {
        return 'imagetools' + count++;
      }

      function isLocalImage(img) {
        var url = img.src;

        return url.indexOf('data:') === 0 || url.indexOf('blob:') === 0 || new URI(url).host === editor.documentBaseURI.host;
      }

      function isCorsImage(img) {
        return Tools.inArray(editor.settings.imagetools_cors_hosts, new URI(img.src).host) !== -1;
      }

      function getApiKey() {
        return editor.settings.api_key || editor.settings.imagetools_api_key;
      }

      function imageToBlob(img) {
        var src = img.src, apiKey;

        if (isCorsImage(img)) {
          return Proxy.getUrl(img.src, null);
        }

        if (!isLocalImage(img)) {
          src = editor.settings.imagetools_proxy;
          src += (src.indexOf('?') === -1 ? '?' : '&') + 'url=' + encodeURIComponent(img.src);
          apiKey = getApiKey();
          return Proxy.getUrl(src, apiKey);
        }

        return BlobConversions.imageToBlob(img);
      }

      function findSelectedBlob() {
        var blobInfo;
        blobInfo = editor.editorUpload.blobCache.getByUri(getSelectedImage().src);
        if (blobInfo) {
          return Promise.resolve(blobInfo.blob());
        }

        return imageToBlob(getSelectedImage());
      }

      function startTimedUpload() {
        imageUploadTimer = Delay.setEditorTimeout(editor, function () {
          editor.editorUpload.uploadImagesAuto();
        }, editor.settings.images_upload_timeout || 30000);
      }

      function cancelTimedUpload() {
        clearTimeout(imageUploadTimer);
      }

      function updateSelectedImage(ir, uploadImmediately) {
        return ir.toBlob().then(function (blob) {
          var uri, name, blobCache, blobInfo, selectedImage;

          blobCache = editor.editorUpload.blobCache;
          selectedImage = getSelectedImage();
          uri = selectedImage.src;

          if (editor.settings.images_reuse_filename) {
            blobInfo = blobCache.getByUri(uri);
            if (blobInfo) {
              uri = blobInfo.uri();
              name = blobInfo.name();
            } else {
              name = extractFilename(uri);
            }
          }

          blobInfo = blobCache.create({
            id: createId(),
            blob: blob,
            base64: ir.toBase64(),
            uri: uri,
            name: name
          });

          blobCache.add(blobInfo);

          editor.undoManager.transact(function () {
            function imageLoadedHandler() {
              editor.$(selectedImage).off('load', imageLoadedHandler);
              editor.nodeChanged();

              if (uploadImmediately) {
                editor.editorUpload.uploadImagesAuto();
              } else {
                cancelTimedUpload();
                startTimedUpload();
              }
            }

            editor.$(selectedImage).on('load', imageLoadedHandler);

            editor.$(selectedImage).attr({
              src: blobInfo.blobUri()
            }).removeAttr('data-mce-src');
          });

          return blobInfo;
        });
      }

      function selectedImageOperation(fn) {
        return function () {
          return editor._scanForImages().
            then(findSelectedBlob).
            then(BlobConversions.blobToImageResult).
            then(fn).
            then(updateSelectedImage, displayError);
        };
      }

      function rotate(angle) {
        return function () {
          return selectedImageOperation(function (imageResult) {
            var size = ImageSize.getImageSize(getSelectedImage());

            if (size) {
              ImageSize.setImageSize(getSelectedImage(), {
                w: size.h,
                h: size.w
              });
            }

            return ImageTransformations.rotate(imageResult, angle);
          })();
        };
      }

      function flip(axis) {
        return function () {
          return selectedImageOperation(function (imageResult) {
            return ImageTransformations.flip(imageResult, axis);
          })();
        };
      }

      function editImageDialog() {
        var img = getSelectedImage(), originalSize = ImageSize.getNaturalImageSize(img);

        var handleDialogBlob = function (blob) {
          return new Promise(function (resolve) {
            BlobConversions.blobToImage(blob).
              then(function (newImage) {
                var newSize = ImageSize.getNaturalImageSize(newImage);

                if (originalSize.w != newSize.w || originalSize.h != newSize.h) {
                  if (ImageSize.getImageSize(img)) {
                    ImageSize.setImageSize(img, newSize);
                  }
                }

                URL.revokeObjectURL(newImage.src);
                resolve(blob);
              });
          });
        };

        var openDialog = function (imageResult) {
          return Dialog.edit(imageResult).then(handleDialogBlob).
            then(BlobConversions.blobToImageResult).
            then(function (imageResult) {
              return updateSelectedImage(imageResult, true);
            }, function () {
              // Close dialog
            });
        };

        findSelectedBlob().
          then(BlobConversions.blobToImageResult).
          then(openDialog, displayError);
      }

      function addButtons() {
        editor.addButton('rotateleft', {
          title: 'Rotate counterclockwise',
          cmd: 'mceImageRotateLeft'
        });

        editor.addButton('rotateright', {
          title: 'Rotate clockwise',
          cmd: 'mceImageRotateRight'
        });

        editor.addButton('flipv', {
          title: 'Flip vertically',
          cmd: 'mceImageFlipVertical'
        });

        editor.addButton('fliph', {
          title: 'Flip horizontally',
          cmd: 'mceImageFlipHorizontal'
        });

        editor.addButton('editimage', {
          title: 'Edit image',
          cmd: 'mceEditImage'
        });

        editor.addButton('imageoptions', {
          title: 'Image options',
          icon: 'options',
          cmd: 'mceImage'
        });

        /*
        editor.addButton('crop', {
          title: 'Crop',
          onclick: startCrop
        });
        */
      }

      function addEvents() {
        editor.on('NodeChange', function (e) {
          // If the last node we selected was an image
          // And had a source that doesn't match the current blob url
          // We need to attempt to upload it
          if (lastSelectedImage && lastSelectedImage.src != e.element.src) {
            cancelTimedUpload();
            editor.editorUpload.uploadImagesAuto();
            lastSelectedImage = undefined;
          }

          // Set up the lastSelectedImage
          if (isEditableImage(e.element)) {
            lastSelectedImage = e.element;
          }
        });
      }

      function isEditableImage(img) {
        var selectorMatched = editor.dom.is(img, 'img:not([data-mce-object],[data-mce-placeholder])');

        return selectorMatched && (isLocalImage(img) || isCorsImage(img) || editor.settings.imagetools_proxy);
      }

      function addToolbars() {
        var toolbarItems = editor.settings.imagetools_toolbar;

        if (!toolbarItems) {
          toolbarItems = 'rotateleft rotateright | flipv fliph | crop editimage imageoptions';
        }

        editor.addContextToolbar(
          isEditableImage,
          toolbarItems
        );
      }

      Tools.each({
        mceImageRotateLeft: rotate(-90),
        mceImageRotateRight: rotate(90),
        mceImageFlipVertical: flip('v'),
        mceImageFlipHorizontal: flip('h'),
        mceEditImage: editImageDialog
      }, function (fn, cmd) {
        editor.addCommand(cmd, fn);
      });

      addButtons();
      addToolbars();
      addEvents();
    };

    PluginManager.add('imagetools', plugin);

    return function () { };
  }
);
