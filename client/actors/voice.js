"use strict";

var baseActor = require("./baseActor");
var config = require('../config');
var spawn = require('child_process').spawn;
var request = require('request');
var fs = require('fs');
var crypto = require('crypto');
var glob = require('glob');
var path = require('path');
var actormanagement = require('../actormanagement');
const MAX_KEEP_FILES = 5;

// ######################################################

class voice extends baseActor
{
    constructor(options)
    {
        super("voice", options);
    }

    exposed()
    {
        return {
            speak: {
                method: this.speak.bind(this),
                params: [{
                    name: "text",
                    isOptional: false,
                    dataType: "string",
                    notes: "text that should be spoken."
                }]
            }
        };
    }

    deleteOldFiles()
    {
        var that = this;
        
        glob(config.mediaBasePath + "/voice-*.mp3", {}, function(err, files)
        {
            if (err)
            {
                return that.logger.error("error grepping: " + err);
            }

            var sortedFiles = files.sort(function(a, b)
            {
                return fs.statSync(a).mtime.getTime() - fs.statSync(b).mtime.getTime();
            });

            var filesToDelete = sortedFiles.length - MAX_KEEP_FILES;

            if (filesToDelete > 0)
            {
                for (var i = 0; i < filesToDelete; i++)
                {
                    fs.unlink(sortedFiles[i], function(err)
                    {
                        if (err)
                        {
                            that.logger.error("could not delete file " + sortedFiles[i] + " - " + err);
                        }
                    });
                }
            }
        });
    };

    speak(text, cb)
    {
        var that = this;

        cb = cb || function(err, resp)
        {
            that.logger.info("actor result", err, resp);
        };

        that.logger.info("voice acting");
        that.deleteOldFiles();

        var play = function(fileName)
        {
            actormanagement.registeredActors["music"].play(path.basename(fileName));
        };

        var ttsApiKey = that.options.ttsApiKey;
        text = text || "no text given";
        var speakerLanguage = "en-us";
        var speed = 0; //-10 = slowest, 10 = fastest
        var url = "https://api.voicerss.org/?key=" + ttsApiKey + "&src=" + text + "&hl=" + speakerLanguage + "&r=" + speed + "&f=44khz_16bit_stereo";
        var fileName = "voice-" + crypto.createHash('md5').update(url).digest('hex') + ".mp3";
        fileName = config.mediaBasePath + "/" + fileName;

        if (fs.existsSync(fileName))
        {
            cb(null, "voice from cache");
            play(fileName);
            return;
        }

        request(url).on("error", function(err)
        {
            return cb("voice rec error: " + err);
        })
        .pipe(fs.createWriteStream(fileName))
        .on("finish", function()
        {
            cb(null, "voice live rec");
            play(fileName);
        });
    };
}

module.exports = voice;