var logger = require('../logger');
var config = require('../config');
var spawn = require('child_process').spawn;
var fs = require('fs');

exports.exposed = function()
{
    return {
        act: exports.act
    };
};

exports.act = function(title)
{
    //activated.mp3  deactivated.mp3  gong.mp3  light.mp3  siren.mp3  song.mp3
    title = title || "siren.mp3";
    title = title.replace("..", "");
    title = config.musicBasePath + "/" + title;

    if (!fs.existsSync(title))
    {
        return logger.error("file does not exist");
    }

    spawn('/usr/bin/mpg321', [title]);
};