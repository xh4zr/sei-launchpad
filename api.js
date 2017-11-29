const config = require('./config');
const request = require('request');
const jwt = require('jsonwebtoken');
const Q = require('q');


// Database
var PersistentStorage = require('./repository');
var db = new PersistentStorage();

// Express
const express = require('express');
var app = express();

// API routes
// splash page
app.get('/', function (req, res) {
    res.render('pages/splash', { seiBase: config.SEI_BASE, caveonId: config.SEI_ID });
});

// called when returning from SEI integration page
// saves integration credentials
app.get('/authorize', function (req, res) {
    var confirmToken = req.query.confirm_token;
    if (!confirmToken) {
        res.sendStatus(400);
    }

    confirmIntegration(confirmToken).then(function (integrationInfo) {
        db.set(integrationInfo.exam_id, integrationInfo);
        res.render('pages/integrationSuccess');
    });
});

// full page SEI app
// form for entering emails and examinee info
app.get('/main', function (req, res) {
    res.render('pages/main');
    var examId = req.query.exam_id;
    var token = req.query.jwt;
    if (!examId || !token) {
        res.sendStatus(500);
    }

    db.get(examId).then(function (integrationInfo) {
        try {
            jwt.verify(token, integrationInfo.secret);
            request.get(config.SEI_BASE + '/api/exams/' + integrationInfo.exam_id + '?include=settings',
            { 'auth': { 'bearer': integrationInfo.token } }, function (error, response, body) {
                var exam = JSON.parse(body);
                var emailKey = undefined;
                var examineeSchema = exam.settings.examinee_schema;
                for (var i = 0; i < examineeSchema.length; i++) {
                    if (examineeSchema[i].key === 'email' ||
                        examineeSchema[i].key === 'Email') {
                            emailKey = examineeSchema[i].key;
                            examineeSchema.splice(i, 1);
                            break;
                    }
                }
                res.render('pages/main', { examineeSchema: examineeSchema, examName: exam.name, emailKey: emailKey });
            });
        } catch (e) {
            res.status(500).send(e);
        }
    });
});

// save examinee info and kickstart emails
app.post('/main', function (req, res) {
    var examId = req.query.exam_id;
    var token = req.query.jwt;

    if (!examId || !token) {
        res.sendStatus(500);
    }

    db.get(examId).then(function (integrationInfo) {
        try {
            jwt.verify(token, integrationInfo.secret);
            res.render('pages/success');
        } catch (e) {
            res.status(500).send(e);
        }
    });
});

function confirmIntegration(confirmToken) {
    var deferred = Q.defer();
    request.get(config.SEI_BASE + '/api/integrations/confirm/' + confirmToken,
        { 'auth': { 'user': config.SEI_ID, 'pass': config.SEI_SECRET } },
        function (error, response, body) {
            if (error || response.statusCode >= 400) {
                deferred.reject(false);
            }

            deferred.resolve(JSON.parse(body));
        }
    );
    return deferred.promise;
}

module.exports = app;
