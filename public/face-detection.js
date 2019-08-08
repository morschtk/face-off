const video = document.getElementById('video');
let predictedAges = []
let predictedGenders = []
const EXPRESSION_WEIGHT = 10;
let withBoxes = true
const EXPRESSION_MAP = {
  'angry': '😡',
  'disgusted': '🤢',
  'fearful': '😰',
  'happy': '😊',
  'neutral': '😐',
  'sad': '😔',
  'surprised': '🙀'
};

function onChangeHideBox(e) {
  withBoxes = !$(e.target).prop('checked')
}

function avgAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 30)
  const avgPredictedAge = predictedAges.reduce((total, a) => total + a) / predictedAges.length
  return avgPredictedAge
}

function assumeGenders(gender) {
  predictedGenders = [gender].concat(predictedGenders).slice(0, 30)
  const avgPredictedAge = predictedGenders.reduce((total, a) => total + a) / predictedGenders.length
  return avgPredictedAge
}

function extractExpressions(expressions) {
  const finalExpressions = [];
  Object.keys(expressions).forEach(key => {
    const percent = expressions[key] * 100;
    if (percent > EXPRESSION_WEIGHT) {
      finalExpressions.push([faceapi.round(percent, 2), `${EXPRESSION_MAP[key]} ${key.toUpperCase()}: ${faceapi.round(percent, 2)}% ${EXPRESSION_MAP[key]}`])
    }
  });
  finalExpressions.sort((a, b) => {
    return b[0] - a[0];
  });
  return finalExpressions;
}

async function startVideo() {
    // Normal face detector model just smaller and quicker for browser
    await faceapi.loadTinyFaceDetectorModel('/');
    // Register different parts of your face (nose, mouth, eyes..)
    await faceapi.loadFaceLandmarkModel('/');
    // Allows api to recognize where the face is and the box around it
    await faceapi.loadFaceRecognitionModel('/');
    // Model responsible for actually identifing expressions (happy, sad, etc..)
    await faceapi.loadFaceExpressionModel('/');
    // Model for identifing age and gender of the face
    await faceapi.nets.ageGenderNet.load('/');
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    );
    $('#loader').hide();
    $('#content').css({
        'display': 'flex',
        'justify-content': 'space-around',
    });
}

video.addEventListener('play', () => {
    const canvas = $('#canvas').get(0);
    faceapi.matchDimensions(canvas, video);

    setInterval(async () => {
        // detectSingleFace takes the image src and the type of library used to detect the faces
        // Here we're only geting landmarks not descriptors so we can pass directions right in?
        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                                    .withFaceLandmarks() // this returns detections, landmarks and other info about the faces
                                    .withAgeAndGender()
                                    .withFaceExpressions();
      
      // This is just to clear the 2D canvas of any elements currently inside it.
      canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height);
      if (detections) {
        // All this does is makes sure the boxes that show up around the faces are properly sized for the video and canvas elements.
        const resizedResult = faceapi.resizeResults(detections, video);

        // To make a ghost clear the canvas here instead....👻
        // canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height);

        // The faceMatcher is what finds the closest match not the actual api.
        // In this case the we dont need to loop through each detection to find best match.
        if (withBoxes) {
          faceapi.draw.drawDetections(canvas, resizedResult);
        }
        faceapi.draw.drawFaceLandmarks(canvas, resizedResult);
        // faceapi.draw.drawFaceExpressions(canvas, resizedResult);

        const { age, gender, genderProbability, expressions } = resizedResult;
        // interpolate gender predictions over last 30 frames
        // to make the displayed age more stable
        const interpolatedAge = avgAgePredictions(age);
        const interpolatedGender = assumeGenders(genderProbability);
        const expressionArr = extractExpressions(expressions);
        // new faceapi.draw.DrawTextField(
        //     [
        //     `${faceapi.round(interpolatedAge, 0)} years`,
        //     `${gender} (${faceapi.round(interpolatedGender)})`
        //     ],
        //     resizedResult.detection.box.bottomRight
        // ).draw(canvas);

        $('.gender').text(`${gender}: ${faceapi.round((interpolatedGender * 100), 0)}%`);
        $('.age').text(`${faceapi.round(interpolatedAge, 0)} years`);
        $('.expressions').empty();
        expressionArr.forEach(express => {
          $('.expressions').append(
              $("<li>").append(
                $("<span>").text(express[1])
              )
            );
        });
      }
    }, 100)
});

$(document).ready(() => {
    startVideo();
});
