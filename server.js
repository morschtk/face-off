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
app.use(express.static(path.join(__dirname, 'videos')));
app.use(express.static(path.join(__dirname, 'face-api')));
app.use(express.static(img_dir));
app.use(express.static(path.join(__dirname, 'models')));

// Stupid browsers and stupid favicon requirments 
app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/', (req, res) => res.redirect('/whoAreYou'));
app.get('/whoAreYou', (req, res) => res.sendFile(path.join(views_dir, 'who-are-you.html')));
app.get('/whosTheStar', (req, res) => res.sendFile(path.join(views_dir, 'whos-the-star.html')));
app.get('/whoAmI', (req, res) => res.sendFile(path.join(views_dir, 'who-am-i.html')));
app.get('/whereMyPeopleAt', (req, res) => {
    let labels = fs.readdirSync(img_dir);
    let theHomies = labels.map((label) => {
        let imagesForTraining = fs.readdirSync(path.join(img_dir, `${label}`));
        return {
            label,
            imagesForTraining
        };
    });
    res.json({
        theHomies
    });
});

app.listen(4200, () => console.log('Listening on port 4200!'));