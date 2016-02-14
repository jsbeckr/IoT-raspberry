IoT.controller('IoTIftttCtrl', function ($scope, $rootScope, $timeout, $compile, $routeParams, $location, constant, SocketFactory)
{
    //-----------------------------------------------------

    $rootScope.showLogout = true;

    $rootScope.sidebar =
    {
        "Sensor Data":
        [{
            title: "Dashboard",
            href: "#dashboard/" + $routeParams.client_id
        },
        {
            title: "History",
            href: "#history/" + $routeParams.client_id
        }],
        "Actions":
        [{
            title: "Action",
            href: "#action/" + $routeParams.client_id
        },
        {
            title: "If This, Then That",
            href: "#ifttt/" + $routeParams.client_id,
            active: true
        },
        {
            title: "Maintenance",
            href: "#maintenance/" + $routeParams.client_id
        }],
        "Device Overview":
        [{
            title: "Connected Devices",
            href: "#index"
        }]
    };

    //-----------------------------------------------------

    $scope.addCondition = function()
    {
        $scope.conditions.push({
            conditiontext: "",
            isActive: true
        });

        setTimeout(function()
        {
            $("input[name=cond]:last").focus();
        }, 200);
    };

    $scope.removeCondition = function(cond)
    {
        console.log("removing condition", cond);

        for (var i = 0; i < $scope.conditions.length; i++)
        {
            if ($scope.conditions[i] === cond)
            {
                $scope.conditions.splice(i, 1);
            }
        }
    };

    $scope.toggleCondition = function(cond)
    {
        console.log("toggle condition", cond);

        for (var i = 0; i < $scope.conditions.length; i++)
        {
            if ($scope.conditions[i] === cond)
            {
                $scope.conditions[i].isActive = !$scope.conditions[i].isActive;
            }
        }
    };

    $scope.availableOptions = function()
    {
        console.log("available options!");

        var ifttt = {
            mode: "availableoptions"
        };

        SocketFactory.send("ui:ifttt", ifttt, function(err, opts)
        {
            console.log("got available options response", err, opts);

            if (err)
            {
                SocketFactory.callLifecycleCallback("functional_error", "Could not load available options: " + err);
            }
            else
            {
                $scope.availableOptions = opts;

                setTimeout(function()
                {
                    $("#opts").removeClass("block-opt-refresh");
                }, 500);
            }
        });
    };

    $scope.conditionList = function()
    {
        console.log("conditionlist!");

        var ifttt = {
            mode: "conditionlist"
        };

        SocketFactory.send("ui:ifttt", ifttt, function(err, resp)
        {
            console.log("got conditionlist response", err, resp);

            if (err)
            {
                SocketFactory.callLifecycleCallback("functional_error", "Could not load statements: " + err);
            }
            else
            {
                $scope.conditions = resp;

                setTimeout(function()
                {
                    $("#conds").removeClass("block-opt-refresh");
                }, 500);
            }
        });
    };

    $scope.sendConditions = function()
    {
        $("#conds").addClass("block-opt-refresh");

        var sendConds = [];

        $("input[name=cond]").each(function(i, c)
        {
            if (!$(c).val().length) return;

            sendConds.push({
                conditiontext: $(c).val(),
                isActive: $(c).attr("readonly") != "readonly"
            });
        });

        var conditions = {
            mode: "saveconditions",
            conditions: sendConds
        };

        console.log("sending conditions", conditions);

        SocketFactory.send('ui:ifttt', conditions, function(err, resp)
        {
            console.log("got saveconditions response", err, resp);

            setTimeout(function()
            {
                $("#conds").removeClass("block-opt-refresh");
            }, 500);

            if (err)
            {
                SocketFactory.callLifecycleCallback("functional_error", "Could not save statements: " + err);
            }
        });
    };

    //-----------------------------------------------------

    $scope.init = function()
    {
        $rootScope.mainHeadline = "IoT Portal: If This, Then That";
        $rootScope.subHeadline = "Define Conditions and Actions";

        $scope.connect(false, function()
        {
            $scope.availableOptions();
            $scope.conditionList();
            $scope.currentSensorValue = {};
            SocketFactory.registerLifecycleCallback("dataupdate", function(sensorUpdate)
            {
                $scope.currentSensorValue[sensorUpdate.type] = sensorUpdate.data;
            });
        });
    };

    //-----------------------------------------------------

    $scope.init();
});