import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";

let selfieSegmentation;
let inputCanvas = document.getElementById('inputCanvas');
let inputCtx = inputCanvas.getContext('2d');
let maskCanvas = document.getElementById('maskCanvas');
let maskCtx = maskCanvas.getContext('2d');

export async function initSegmenter() {
    const audio = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
      );
    
      selfieSegmentation = await ImageSegmenter.createFromOptions(audio, {
        baseOptions: {
          modelAssetPath:
            "/mediapipe-webview1/models/deeplab_v3.tflite",
          delegate: "GPU"
        },
        runningMode: "IMAGE",
        outputCategoryMask: true,
        outputConfidenceMasks: false
      });

      console.warn('Selfie segmenter initialized.');
}

function uint8ToBase64(uint8Array) {
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}


export async function processCameraFrame(base64ImageData) {
  if (!selfieSegmentation) {
    console.warn('Segmentation not ready yet');
    return;
  }

  if (window.Android && Android.print) {
    Android.print("FRAME RECEIVED!")
  }

  const img = new Image(360, 480);
  img.onload = async () => {
    inputCanvas.width = img.width;
    inputCanvas.height = img.height;
    inputCtx.drawImage(img, 0, 0);

    const lastTimestamp = performance.now()
    const result = await selfieSegmentation.segment(inputCanvas);

    maskCanvas.width = result.categoryMask.width;
    maskCanvas.height = result.categoryMask.height;

    const { width, height } = result.categoryMask;
    const maskArray = result.categoryMask.getAsUint8Array();

    const maskBase64 = uint8ToBase64(maskArray);
    const inferenceTime = (performance.now() - lastTimestamp)

    if (window.Android && Android.onMaskReady) {
      Android.onMaskReady(maskBase64, width, height, inferenceTime);
    }
  };

  img.src = `data:image/jpeg;base64,${base64ImageData}`;
}
