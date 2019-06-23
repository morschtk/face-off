// const axios = require('axios');
// const instance = axios.create({
//   headers: {'withCredentials': true}
// })
// const faceapi = require('face-api.js');
// const imgService = require('./image.service');
// const imageUpload = document.getElementById('imageUpload');

let faceMatcher = null;
const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark'];
// Promise.all([
//   faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
//   faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
//   faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
// ]).then(start);

function getFaceImageUri(className, idx) {
  return `${className}/${idx}.jpg`
}

async function createFaceMatcher() {
  // loadLabeledImages
  const labeledFaceDescriptors = await Promise.all(
    labels.map(async label => {
      const descriptors = [];
      for (let i=1; i<=2; i++) {
        const img = await faceapi.fetchImage(getFaceImageUri(label, i));
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        // Should we resize these detections to the image size?
        descriptors.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptors);
    })
  );

  return new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
}

async function startThatShit() {
  // load face detection, face landmark model and face recognition models
  await faceapi.loadFaceRecognitionModel('/');
  await faceapi.loadFaceLandmarkModel('/');
  await faceapi.loadSsdMobilenetv1Model('/');

  faceMatcher = await createFaceMatcher();
  $('#loader').hide();
  $('#content').show();
}

async function uploadImage(e) {
  const imgFile = $('#imageUpload').get(0).files[0];
  // convert blob to htmlImageElement
  const img = await faceapi.bufferToImage(imgFile);
  $('#image').get(0).src = img.src;

  const image = $('#image').get(0);
  const canvas = $('#canvas').get(0);

  faceapi.matchDimensions(canvas, image);

  const detections = await faceapi.detectAllFaces(image)
                            .withFaceLandmarks()
                            .withFaceDescriptors();

  // resize detection and landmarks in case displayed image is smaller than original size
  const resizedDetections = faceapi.resizeResults(detections, image);

  resizedDetections.forEach(({ detection, descriptor }) => {
    // So what were doing here is passing the description for each face to the faceMatcher, which will return the label of the closest description it has in its bank.
    const label = faceMatcher.findBestMatch(descriptor).toString();
    const options = { label };
    const drawBox = new faceapi.draw.DrawBox(detection.box, options);
    drawBox.draw(canvas);
  });
}

$(document).ready(() => {
  startThatShit();
})

// async function start() {
//   // const container = document.createElement('div');
//   // container.style.position = 'relative';
//   // document.body.append(container);
//   // const labeledFaceDescriptors = await imgService.loadImages();
//   // const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
//   // let image;
//   // let canvas;

  
//   // imageUpload.addEventListener('change', async () => {
//     // if (image) image.remove();
//     // if (canvas) canvas.remove();
//     // image = await faceapi.bufferToImage(imageUpload.files[0]);
//     // container.append(image);
//     const image = $('#image').get(0);
//     const canvas = $('#canvas').get(0);
//     // canvas = faceapi.createCanvasFromMedia(image);
//     // container.append(canvas);
//     // const displaySize = {
//     //   width: image.width,
//     //   height: image.height
//     // };
//     faceapi.matchDimensions(canvas, image);

//     const detections = await faceapi.detectAllFaces(image)
//                               .withFaceLandmarks()
//                               .withFaceDescriptors();

//     // resize detection and landmarks in case displayed image is smaller than original size
//     const resizedDetections = faceapi.resizeResults(detections, image);

//     resizedDetections.forEach(({ detection, descriptor }) => {
//       // So what were doing here is passing the description for each face to the faceMatcher, which will return the label of the closest description it has in its bank.
//       const label = faceMatcher.findBestMatch(descriptor).toString();
//       const options = { label };
//       const drawBox = new faceapi.draw.DrawBox(detection.box, options);
//       drawBox.draw(canvas);
//     });


//     // For each face in image of question find the best labeledFaceDescriptor from the faceMatcher.
//     // const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

//     // results.forEach((result, i) => {
//     //   const box = resizedDetections[i].detection.box;
//     //   const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
//     //   drawBox.draw(canvas);
//     // });
//   // });
// }


// function loadLabeledImages() {
//   const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark'];
//   return Promise.all(
//     labels.map(async label => {
//       const descriptors = [];
//       for (let i=1; i<=2; i++) {
//         const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`);
//         const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
//         // Should we resize these detections to the image size?
//         descriptors.push(detections.descriptor);
//       }
//       return new faceapi.LabeledFaceDescriptors(label, descriptors);
//     })
//   )
// }