let faceMatcher = null;

async function createFaceMatcher() {
  let theHomies = [];
  await $.get('/whereMyPeopleAt', (data) => {
    theHomies = data.theHomies;
  });

  // loadLabeledImages
  const labeledFaceDescriptors = await Promise.all(
    theHomies.map(async homie => {
      const { label, imagesForTraining } = homie;
      const descriptors = [];
      for (let i=0; i<imagesForTraining.length; i++) {
        const img = await faceapi.fetchImage(`${label}/${imagesForTraining[i]}`);
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
