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

function onChangeHideBoundingBoxes(e) {
  withBoxes = !$(e.target).prop('checked')
}

function interpolateAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 30)
  const avgPredictedAge = predictedAges.reduce((total, a) => total + a) / predictedAges.length
  return avgPredictedAge
}

function interpolateGenderPredictions(gender) {
  predictedGenders = [gender].concat(predictedGenders).slice(0, 30)
  const avgPredictedAge = predictedGenders.reduce((total, a) => total + a) / predictedGenders.length
  return avgPredictedAge
}

function extractExpressions(expressions) {
  const finalExpressions = [];
  Object.keys(expressions).forEach(key => {
    const percent = expressions[key] * 100;
    if (percent > EXPRESSION_WEIGHT) {
      finalExpressions.push(`${EXPRESSION_MAP[key]} ${key.toUpperCase()}: ${faceapi.round(percent, 2)}% ${EXPRESSION_MAP[key]}`)
    }
  });
  return finalExpressions;
}

async function startVideo() {
    await faceapi.loadTinyFaceDetectorModel('/');
    await faceapi.loadFaceLandmarkModel('/');
    await faceapi.loadFaceRecognitionModel('/');
    await faceapi.loadFaceExpressionModel('/');
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
    // const canvas = faceapi.createCanvasFromMedia(video);
    // $('.card-image').append(canvas);
    // const displaySize = {
    //     width: video.width,
    //     height: video.height
    // };
    faceapi.matchDimensions(canvas, video);

    setInterval(async () => {
        // What is TinyFaceDetectorOptions
        // Here we're only geting landmarks not descriptors so we can pass directions right in?
        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                                    .withFaceLandmarks()
                                    .withAgeAndGender()
                                    .withFaceExpressions();
      if (detections) {
        const resizedResult = faceapi.resizeResults(detections, video);

        canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height);
        // The faceMatcher is what finds the closest match not the actual api.
        // In this case the we dont need to loop through each dection to find best match.
        if (withBoxes) {
          faceapi.draw.drawDetections(canvas, resizedResult);
        }
        faceapi.draw.drawFaceLandmarks(canvas, resizedResult);
        // faceapi.draw.drawFaceExpressions(canvas, resizedResult);

        const { age, gender, genderProbability, expressions } = resizedResult;
        // interpolate gender predictions over last 30 frames
        // to make the displayed age more stable
        const interpolatedAge = interpolateAgePredictions(age);
        const interpolatedGender = interpolateGenderPredictions(genderProbability);
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
                $("<span>").text(express)
              )
            );
        });
      }
    }, 100)
});

$(document).ready(() => {
    startVideo();
});
