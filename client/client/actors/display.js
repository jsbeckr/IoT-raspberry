"use strict";

var baseActor = require("./baseActor");
var config = require('../config');
var spawn = require('child_process').spawn;

// ######################################################

class display extends baseActor
{
    constructor(options)
    {
        super("display", options);
    }

    exposed()
    {
        return {
            print: {
                method: this.print.bind(this),
                params: [{
                    name: "displaycontent",
                    isOptional: false,
                    dataType: "string or array",
                    notes: "The text that should be shown on the display"
                }]
            }
        };
    }

    print(displaycontent)
    {
        //make array
        if (!displaycontent.splice)
        {
            displaycontent = [displaycontent];
        }

        var prc = spawn(config.baseBath + '/actors/display', displaycontent);
        prc.stdout.setEncoding('utf8');
    }
}

module.exports = display;