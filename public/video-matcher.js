let faceMatcher = null;
let bitches = new Map();
let videoTimer;

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
        const detections = await faceapi.detectSingleFace(img)
                                  .withFaceLandmarks()
                                  .withFaceDescriptor();
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
  $('#content').css({
    'display': 'flex',
    'justify-content': 'center',
  });
  onPlay($('#inputVideo').get(0));
}

async function onPlay(videoEl) {
  if(!videoEl.currentTime || videoEl.paused || videoEl.ended)
        return setTimeout(() => onPlay(videoEl))

  const canvas = $('#canvas').get(0);

  faceapi.matchDimensions(canvas, videoEl);

  const detections = await faceapi.detectAllFaces(videoEl)
                            .withFaceLandmarks()
                            .withFaceDescriptors();

  // resize detection and landmarks in case displayed videoEl is smaller than original size
  const resizedDetections = faceapi.resizeResults(detections, videoEl);

  resizedDetections.forEach(({ detection, descriptor }) => {
    // So what were doing here is passing the description for each face to the faceMatcher, which will return the label of the closest description it has in its bank.
    const label = faceMatcher.findBestMatch(descriptor).toString();
    // console.log(label);
    const options = { label };
    let personMeta = label.split('(')[0];
    if (bitches.has(personMeta)) {
      const newVal = bitches.get(personMeta) + 1;
      $(`.${personMeta.replace(' ', '')}`).text(`${personMeta}: ${newVal}`);
      bitches.set(personMeta, newVal);
    } else {
      $('.mylist').append($("<li>").append($("<span>", {class: `${personMeta.replace(' ', '')}`}).text(`${personMeta}: ${1}`)))
      bitches.set(personMeta, 1);
    }
    // bitches.set(personMeta, (bitches.get(personMeta) || 0) + 1);
    const drawBox = new faceapi.draw.DrawBox(detection.box, options);
    drawBox.draw(canvas);
  });
  videoTimer = setTimeout(() => onPlay(videoEl));
  // console.log(bitches);
}

async function resetVideo() {
  const videoEl = $('#inputVideo').get(0);
  clearInterval(videoTimer);
  bitches = new Map();
  videoEl.load();
  $('.mylist').empty();
  onPlay(videoEl);
}

$(document).ready(() => {
  startThatShit();
})
