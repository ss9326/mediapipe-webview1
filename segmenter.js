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
            "/models/deeplab_v3.tflite",
          delegate: "GPU"
        },
        runningMode: "IMAGE",
        outputCategoryMask: true,
        outputConfidenceMasks: false
      });

      console.warn('Selfie segmenter initialized.');
}

export async function processCameraFrame(base64ImageData) {
  if (!selfieSegmentation) {
    console.warn('Segmentation not ready yet');
    return;
  }

  const img = new Image(360, 480);
  img.onload = async () => {
    inputCanvas.width = img.width;
    inputCanvas.height = img.height;
    inputCtx.drawImage(img, 0, 0);

    const result = await selfieSegmentation.segment(inputCanvas);


    maskCanvas.width = result.categoryMask.width;
    maskCanvas.height = result.categoryMask.height;

    const { width, height } = result.categoryMask;

    const maskArray = result.categoryMask.getAsUint8Array();

    // Convert Uint8Array to base64
    const binaryString = String.fromCharCode(...maskArray);
    const maskBase64 = btoa(binaryString);

    if (window.Android && Android.onMaskReady) {
      Android.onMaskReady(maskBase64, width, height);
    }
  };

  img.src = `data:image/jpeg;base64,${base64ImageData}`;
}
