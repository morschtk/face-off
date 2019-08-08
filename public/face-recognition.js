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
        
        /** Create detections with descriptions for each image and push to array of all that persons descriptors. */
        

      }
      /** return new LabeledFaceDescriptors for that person. */
      
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

  /** Dont do this yet dude just chill!!! */
  // faceMatcher = await createFaceMatcher();

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

  /** oh no our canvas is never going to fit over the image perfectly */



  /**
   * Same as last time we have to detect the faces from the uploaded image AND get they're descriptors
   * Meow their might be more then one face in the uploaded file... END USERS CANT BE TRUSTED! 
  */


  // resize detection and landmarks in case displayed image is smaller than original size
  const resizedDetections = faceapi.resizeResults(detections, image);

  resizedDetections.forEach(({ detection, descriptor }) => {
    /** 
     * So what were doing here is passing the description for each face to the faceMatcher, which will return the label of the closest description it has in its bank.
     * The descriptor from the detections is just a list of points plotting their face.  
    */
   

  });
}

$(document).ready(() => {
  startThatShit();
})
