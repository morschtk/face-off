const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const views_dir = path.join(__dirname, 'views');
const img_dir = path.join(__dirname, 'images');
app.use(express.static(views_dir));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'face-api')));
app.use(express.static(img_dir));
app.use(express.static(path.join(__dirname, 'models')));

app.get('/', (req, res) => res.redirect('/whoAreYou'));
app.get('/whoAreYou', (req, res) => res.sendFile(path.join(views_dir, 'who-are-you.html')));
app.get('/whereMyPeopleAt', (req, res) => {
    let labels = fs.readdirSync(img_dir);
    // return Promise.all(
    let theHomies = labels.map((label) => {
        let imagesForTraining = fs.readdirSync(path.join(img_dir, `${label}`));
        console.log(imagesForTraining);
        return {
            label,
            imagesForTraining
        };
        // const descriptors = [];
        // for (let i=0; i<personsPics.length; i++) {
        //     console.log(label, personsPics[i]);
            // const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`);
        //   const img = await canvas.loadImage(`public/${label}/${personsPics[i]}`)
        //   const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            // Should we resize these detections to the image size?
        //   descriptors.push(detections.descriptor);
        // }
    });
    console.log(theHomies);
    res.json({
        theHomies
    });
    // );
});

app.listen(4200, () => console.log('Listening on port 4200!'));