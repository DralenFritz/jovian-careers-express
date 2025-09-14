require('dotenv').config();
const nodemailer = require('nodemailer');

const express = require('express');
const path = require('path');
const JOBS = require('./jobs'); 
const mustacheExpress = require('mustache-express');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public'))); // sends the files in the folder 'public' to be used

app.set('views', path.join(__dirname, 'pages'));
app.set('view engine', 'mustache');
app.engine('mustache', mustacheExpress());

app.get('/', (req, res) => {
    // res.send('Hello World!');
    // res.sendFile(path.join(__dirname, 'pages/index.html'));
    res.render('index', { jobs: JOBS});
});

app.get('/jobs/:id', (req, res) => {
    const id = req.params.id;
    const matchedJob = JOBS.find(job => job.id.toString() === id);
    res.render('job', {job: matchedJob});
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD
    }
});

app.post('/jobs/:id/apply', (req, res) => {
    const { name, email, phone, DOB, CoverLetter } = req.body;
    
    const id = req.params.id;
    const matchedJob = JOBS.find(job => job.id.toString() === id);

    const mailOptions = {
        from: process.env.EMAIL_ID, // Email in the transport
        to: process.env.EMAIL_ID,   // Wtv email you want
        subject: `New Application For ${matchedJob.title}`,
        html: `
            <p><strong>Name: </strong>${name}</p>
            <p><strong>Email: </strong>${email}</p>
            <p><strong>Phone: </strong>${phone}</p>
            <p><strong>Date of Birth: </strong>${DOB}</p>
            <p><strong>Cover Letter: </strong>${CoverLetter}</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error Sending Email');
        } 
        if (!matchedJob) {
            return res.status(404).send("Job not found");
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).render('applied');
        }
    });
})


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on https://localhost: ${port}`);
});