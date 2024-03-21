var express = require('express');
var router = express.Router();
const fs = require("fs");
var ConnectionM = require('tedious').Connection;
var RequestM = require('tedious').Request;
var types = require('tedious').TYPES;
const { DateTime } = require("luxon");

const waitSeconds = (n) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("5 seconds passed");
            resolve("Finished waiting!");
        }, n*1000);
    });
}

function generateTemporaryCode() {
    return getRandomInt(10).toString()+getRandomInt(10).toString()+
    getRandomInt(10).toString()+getRandomInt(10).toString();
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

exports.generateTemporaryCode = generateTemporaryCode;