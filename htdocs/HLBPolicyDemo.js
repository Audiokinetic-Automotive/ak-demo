var afb = new AFB("api", "mysecret");
var ws;
var evtidx = 0;
var stream_id = -1;
var endpoint_id = -1;
var stream_state = 0;
var device_uri;
var media_path;
var audio_role;
var playing_id;
var play_looping; 0;

var stream_mute = 0;
window.onunload = term

//***********************
// Logger
//***********************
var log = {
    command: function (api, verb, query) {
        var q = urlws + "/" + api + "/" + verb + "?query=" + JSON.stringify(query);
        console.log("command: api=" + api + " verb=" + verb + " query=", query);
        log.write("COMMAND", "", q + "\n\n");
    },

    event: function (obj) {
        console.log("gotevent:" + JSON.stringify(obj));
        log.write("EVENT", (evtidx++), log.syntaxHighlight(obj) + "\n\n");
    },

    reply: function (obj) {
        console.log("replyok:" + JSON.stringify(obj));
        log.write("REPLY", "", log.syntaxHighlight(obj) + "\n\n");
    },

    error: function (obj) {
        console.log("replyerr:" + JSON.stringify(obj));
        log.write("ERROR", "", log.syntaxHighlight(obj) + "\n\n");
    },

    write: function (action, index, msg) {
        var logger = document.getElementById(action == "EVENT" ? "logger-event" : "logger-cmd");

        cls = 'action-' + action.toLowerCase();
        var txt = action
        if (index.toString() != "") {
            txt += " " + index.toString();
        }
        logger.innerHTML += '<span class="' + cls + ' ">' + txt + ':</span> ';
        logger.innerHTML += msg;

        // auto scroll down
        setTimeout(function () {
            logger.scrollTop = logger.scrollHeight;
        }, 100);

    },

    syntaxHighlight: function (json) {
        if (typeof json !== 'string') {
            json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    },

};

//***********************
// Generic function to call binder
//************************
function callbinder(api, verb, query) {
    log.command(api, verb, query);

    // ws.call return a Promise
    return ws.call(api + "/" + verb, query)
        .then(function (res) {
            log.reply(res);
            return res;
        })
        .catch(function (err) {
            log.error(err);
            throw err;
        });
}

//***********************
// Sound volume management
//***********************
var VOLUME_INCREMENT = 5;
var SPEED_INCREMENT = 5;

function initVolume() {
    var elVolume = document.getElementById("volume");
    return callbinder('audiohl', 'get_volume', { 'endpoint_type': 'sink', 'endpoint_id':endpoint_id })
        .then(function (res) {
            elVolume.value = res.response;
        })
        .catch(function (err) {
            elVolume.value = 50;
        });
}

function initSpeed() {
    var elSpeed = document.getElementById("speed");
    elSpeed.value = 60;
}


function volumeUpdateInput(val) {
    console.log("volume update call with: " + val);
    var elVolume = document.getElementById("volume");
    var volume = parseInt(elVolume.value.split(' ')[0]);
    console.log("Old volume value: " + volume);
    if ((volume == 0 && val < 0) ||
        (volume == 100 && val > 0)) {
        return;
    }
    volume += val;
    elVolume.value = volume.toString();
    console.log("New volume value: " + volume)

    callbinder('audiohl', 'set_volume', { 'endpoint_type': 'sink', 'endpoint_id': endpoint_id, 'volume': volume.toString() })

    console.log("Set volume done")
}

function speedUpdate(val) {
    console.log("speed update call with: " + val);
    var elSpeed = document.getElementById("speed");
    var speed = parseInt(elSpeed.value.split(' ')[0]);
    console.log("Old speed value: " + speed);
    if ((speed == 0 && val < 0) ||
        (speed == 500 && val > 0)) {
        return;
    }
    speed += val;
    elSpeed.value = speed.toString();
    console.log("New speed value: " + speed)
    callbinder('audiod', 'post_event', { 'event_name': 'speed', 'event_parameter': {'speed_value': speed}})
    console.log("Set speed done")
}


function volumeUpdateUI(val) {
    console.log("volume update with: " + val);
    var elVolume = document.getElementById("volume");
    var volume = parseInt(elVolume.value.split(' ')[0]);
    if ((volume == 0 && val < 0) ||
        (volume == 100 && val > 0)) {
        return;
    }
    volume = val;
    elVolume.value = volume.toString();
    console.log("New volume value: " + volume)
}


function volumeUpdate(val) {
    console.log("volume update call with: " + val);
    var elVolume = document.getElementById("volume");
    var volume = parseInt(elVolume.value.split(' ')[0]);
    console.log("Old volume value: " + volume);
    if ((val < 0) ||
        (volume > 100)) {
        return;
    }

    elVolume.value = volume.toString();
    console.log("New volume value: " + volume)

    callbinder('audiohl', 'set_volume', { 'endpoint_type': 'sink', 'endpoint_id': endpoint_id, 'volume': volume.toString() })

    console.log("Set volume done")
}


function volumeInc() {
    console.log("Volume increment clicked");
    volumeUpdateInput(VOLUME_INCREMENT);
    console.log("Set volume done")
}

function volumeDec() {
    console.log("Volume decrement clicked");
    volumeUpdateInput(0 - VOLUME_INCREMENT);
    console.log("Set volume done")
}

function speedInc() {
    console.log("Speed increment clicked");
    speedUpdate(SPEED_INCREMENT);
    console.log("Set speed done")
}

function speedDec() {
    console.log("Speed decrement clicked");
    speedUpdate(0 - SPEED_INCREMENT);
    console.log("Set speed done")
}

function mute(cb) {
    console.log("Mute clicked, new value = " + cb.checked); 

    callbinder('audiohl', 'set_stream_mute', { 'stream_id': stream_id, 'mute': cb.checked ? 'on' : 'off' })
}

function play() {
    console.log("Play clicked")

     callbinder('audiohl', 'set_stream_state', { 'stream_id': stream_id, 'state': 'running' })
}

function pause() {
    console.log("Pause clicked");

     callbinder('audiohl', 'set_stream_state', { 'stream_id': stream_id, 'state': 'paused' })
}

function stop() {
    console.log("Stop clicked");

    callbinder('audiohl', 'set_stream_state', { 'stream_id': stream_id, 'state': 'idle' })
}

function setMedia() {
    var elSong = document.getElementById("musicSelect");
    media_path = elSong.value;
    console.log("Song changed = " + media_path);
}

function changeZone(endpointID) {
    console.log("Zone changed = " + endpointID);

    TermStream();

    InitStream(endpointID);
}

//***********************
// Initialization
//***********************

function populateZones(output) {
    var zoneSelect = document.getElementById("musicZonesSelect");
    var el;

    // Add all entry
    var option = document.createElement("option");
    option.text = "Default";
    option.selected = "selected";
    option.value = -1;
    zoneSelect.add(option);

    for (el in output) {
        var option = document.createElement("option");
        option.text = output[el].device_name;
        option.value = output[el].endpoint_id;
        zoneSelect.add(option);
    }
}

function InitStream(endpointID) {  

    // Depending on parameters, use selected or default endpoint
    if (endpointID == -1) {
        // Open stream on default sink endpoint
        console.log("Using default endpoint");
        callbinder('audiohl', 'stream_open', { 'audio_role': audio_role, 'endpoint_type': 'sink' })
            .then(function (res) {
                stream_id = res.response.stream_id;
                endpoint_id = res.response.endpoint_info.endpoint_id;
                device_uri = res.response.device_uri;
                console.log("stream_open");
                console.log("stream_id " + stream_id);
                console.log("endpoint_id " + endpoint_id);
                console.log("device_uri " + device_uri);
                initVolume();
                setMedia();
            });
       
    }
    else {
        console.log("Using endpoint id : " + endpointID);
        callbinder('audiohl', 'stream_open', { 'audio_role': audio_role, 'endpoint_type': 'sink', 'endpoint_id': parseInt(endpointID) })
            .then(function (res) {
                stream_id = res.response.stream_id;
                endpoint_id = res.response.endpoint_info.endpoint_id;
                device_uri = res.response.device_uri;
                console.log("stream_open");
                console.log("stream_id " + stream_id);
                console.log("endpoint_id " + endpoint_id);
                console.log("device_uri " + device_uri);
                initVolume();                
                setMedia();
            });
    }

    // Register to audio backend events
    callbinder('audiod', 'subscribe', {'events':['audiod_audio_event']})
    console.log("Registered to audio backend events");
    
    callbinder('audiohl', 'subscribe', { 'events': ['ahl_endpoint_volume_event', 'ahl_endpoint_property_event','ahl_post_action']})
    console.log("Registered to audio high-level events");
}

function TermStream() {
    // Close stream
    callbinder('audiohl', 'stream_close', { 'stream_id': stream_id })
        .then(function (res) {
            console.log(res.response);
        });

    // Register to audio backend events
    callbinder('audiod', 'unsubscribe', {'events':['audiod_audio_event']})
    console.log("Unregistered to audio backend events");
}

function init(role,looping) {

    var btnConn = document.getElementById("connected");
    var page = document.getElementsByClassName("page-content")[0];
    var dashboard = document.getElementsByClassName("dashboard")[0];
    audio_role = role;
    play_looping = looping;
    console.log("Initialization for audio role: " + audio_role);
    console.log("Play media looping: " + play_looping);

    function onopen() {

        // Retrieve list of role specific sinks
        callbinder('audiohl', 'get_sinks', { 'audio_role': audio_role })
            .then(function (res) {
                // Populate available devices/zones
                console.log(res.response);
                populateZones(res.response);
            });

        if(audio_role == 'System')
        {
            callbinder('audiod', 'subscribe', {'events':['audiod_system_event']})
            console.log("Registered to audio backend events");

            console.log("Init Speed");
            initSpeed();
        }
        
        InitStream(endpoint_id); // Default

        ws.onevent("*", function gotevent(obj) {
            log.event(obj);
            console.log(obj)

            if (obj.event == "audiod/audio_events"){
                console.log("Received audio back end event for playing ID: " + obj.data.PlayingID);
                if (playing_id == obj.data.PlayingID) {
                    stop();
                }
            }
            else { // Assume HLB events
                console.log("Received event: " + obj.event);
                if (obj.event == "audiohl/ahl_endpoint_volume_event"){
                    console.log("Received ahl_endpoint_volume_event with endpoint_id: " + obj.data.endpoint_id);
                    console.log("Received ahl_endpoint_volume_event with endpoint_type: " + obj.data.endpoint_type);
                    console.log("Received ahl_endpoint_volume_event with value: " + obj.data.value);
                    console.log("Received ahl_endpoint_volume_event with audio_role: " + obj.data.audio_role);

                   if((audio_role == obj.data.audio_role) && endpoint_id == obj.data.endpoint_id && obj.data.endpoint_type=='sink')
                   {
                        volumeUpdateUI(obj.data.value);
                   }  
                }
                else if (obj.event == "audiohl/ahl_endpoint_property_event") {
                    console.log("Received ahl_endpoint_property_event with endpoint_id: " + obj.data.endpoint_id);
                    console.log("Received ahl_endpoint_property_event with endpoint_type: " + obj.data.endpoint_type);
                    console.log("Received ahl_endpoint_property_event with value: " + obj.data.value);
                    console.log("Received ahl_endpoint_property_event with audio_role: " + obj.data.audio_role);
                }
                else if (obj.event == "audiohl/ahl_post_action") {
                    console.log("Received ahl_post_action");
                }
                else {
                    // Otherwise a stream state event
                    switch (obj.data.state_event) {
                        // TODO: Need to switch to strings?
                        case 0:
                            console.log("Event type: start stream");  
                            callbinder('audiod', 'play', { 'device_name': device_uri, 'filepath': media_path, 'loop': play_looping})
                                .then(function (res) {
                                    playing_id = res.response.PlayingID;
                                    console.log("Audio backend started id: " + playing_id);
                                    stream_state = 1;//Running
                                });                 
                            break;
                        case 1:
                            console.log("Event type: stop stream");  
                            callbinder('audiod', 'stop',{})
                                .then(function (res) {
                                    stream_state = 0;//Idle
                                });
                            break;
                        case 2:
                            console.log("Event type: pause stream");
                            callbinder('audiod', 'pause', {})
                                .then(function (res) {
                                    stream_state = 2;//Paused
                                });
                            break;
                        case 3:
                            console.log("Event type: resume stream");
                            callbinder('audiod', 'play', { 'device_name': device_uri, 'filepath': media_path, 'loop': play_looping })
                                .then(function (res) {
                                    playing_id = res.response.PlayingID;
                                    console.log("Audio backend resumed id: " + playing_id);
                                    stream_state = 1;//Running
                                }); 
                            break;
                        case 4:
                            console.log("Event type: mute stream");
                            stream_mute = 1;
                            break;
                        case 5:
                            console.log("Event type: unmute stream");
                            stream_mute = 0;
                            break;
                        default:
                            console.log("Event type: unknown");
                            break;
                    }
                }
            }
        });

        btnConn.innerHTML = "Binder Connection Active";
        btnConn.style.background = "lightgreen";
        page.style.background = dashboard.style.opacity = dashboard.style.zIndex = "";
    }

    function onabort() {
        
        TermStream();

        btnConn.innerHTML = "Connection Closed";
        btnConn.style.background = "red";

        // Grey out page and disable dashboard
        page.style.background = "rgba(0,0,0,.5)";
        dashboard.style.opacity = "0.2";
        dashboard.style.zIndex = "-1";
    }
    ws = new afb.ws(onopen, onabort);
}

function term() {
    // // Close stream
    // callbinder('audiohl', 'stream_close', { 'stream_id': stream_id })
    //     .then(function (res) {
    //         console.log(res.response);
    //     });
}