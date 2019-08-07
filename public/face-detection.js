const video = document.getElementById('video');

async function startVideo() {
    await faceapi.loadTinyFaceDetectorModel('/');
    await faceapi.loadFaceLandmarkModel('/');
    await faceapi.loadFaceRecognitionModel('/');
    await faceapi.loadFaceExpressionModel('/');
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    );
    $('#loader').hide();
    $('#content').css({
        'display': 'flex',
        'justify-content': 'center',
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
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                                    .withFaceLandmarks()
                                    .withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, video);
        canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height);
        // The faceMatcher is what finds the closest match not the actual api.
        // In this case the we dont need to loop through each dection to find best match.
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 100)
});

$(document).ready(() => {
    startVideo();
});
