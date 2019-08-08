let faceMatcher = null;

async function createFaceMatcher() {
  let theHomies = [];
  // Here we get our information for constructing the url to get the actual img.
  await $.get('/whereMyPeopleAt', (data) => {
    theHomies = data.theHomies;
  });

  // loadLabeledImages
  const labeledFaceDescriptors = await Promise.all(
    theHomies.map(async homie => {
      const { label, imagesForTraining } = homie;
      const descriptors = [];
      for (let i=0; i<imagesForTraining.length; i++) {
        // This demonstrates actually retrieving each image required for faceapi to match against an uploaded image
        const img = await faceapi.fetchImage(`${label}/${imagesForTraining[i]}`);
        // Create detections for each image and push to array of all that persons descriptors.
        const detections = await faceapi.detectSingleFace(img)
                                  .withFaceLandmarks()
                                  .withFaceDescriptor();

        descriptors.push(detections.descriptor);
      }
      // create LabeledFaceDescriptors for that person.
      return new faceapi.LabeledFaceDescriptors(label, descriptors);
    })
  );

  return new faceapi.FaceMatcher(labeledFaceDescriptors, 0.64); // Distance threshold of two descriptors. The higher the distance the more unsimilar two faces can match.
}

async function startThatShit() {
  // load face detection, face landmark model and face recognition models
  await faceapi.loadFaceRecognitionModel('/');
  await faceapi.loadFaceLandmarkModel('/');
  // This is used to detect where the faces are and return their descriptions
  await faceapi.loadSsdMobilenetv1Model('/');

  faceMatcher = await createFaceMatcher();
  $('#loader').hide();
  $('#content').css({
    'display': 'flex',
    'justify-content': 'center',
  });
}

async function uploadImage(e) {
  const imgFile = $('#imageUpload').get(0).files[0];
  // convert uploaded blob file to HTML ImageElement
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
    // The descriptor from the detections is just a list of points plotting their face.
    const label = faceMatcher.findBestMatch(descriptor).toString();
    const options = { label };
    const drawBox = new faceapi.draw.DrawBox(detection.box, options);
    drawBox.draw(canvas);
  });
}

$(document).ready(() => {
  startThatShit();
})
