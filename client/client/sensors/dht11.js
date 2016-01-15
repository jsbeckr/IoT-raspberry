exports.watch = function(ondata, onclose)
{
    console.log("watching DHT11");
    var spawn = require('child_process').spawn;
    var prc = spawn('/var/www/IoT-raspberry/sensors/dht11',  []);
    prc.stdout.setEncoding('utf8');

    prc.stderr.on('data', function (data)
    {
        console.log("received err: ", data);
    });

    prc.stdout.on('data', function (data)
    {
        try
        {
            //console.log("received: ", data);
            data = JSON.parse("" + data);
            ondata(data);
        }
        catch (err)
        {
            return;
        }

        //console.log(`received temperature ${data.temperature}°C`);
        //console.log(`received humidity ${data.humidity}°C`);
    });

    prc.on('close', function (code)
    {
        //console.log('sensor reader exited with ' + code);

        onclose('dht11 sensor reader exited with ' + code);
    });
};