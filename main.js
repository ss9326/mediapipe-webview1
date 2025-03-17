import { initSegmenter, processCameraFrame } from './segmenter.js';

window.processCameraFrame = function(base64ImageData) {
    processCameraFrame(base64ImageData);
};

window.addEventListener('DOMContentLoaded', () => {
  initSegmenter();
});
