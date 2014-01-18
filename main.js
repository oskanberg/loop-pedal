navigator.getUserMedia = navigator.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.URL.createObjectURL = window.URL.createObjectURL || window.webkitURL.createObjectURL;
window.numberOfTracks = 0;
window.loopLength = -1;

function errorCallback(e) {
    $('#status').text('WHAT. PLEASE LET ME HEAR YOU PLAY.');
};

function countDown(seconds, callback) {
    $('#status').text(Math.round(seconds));
    //skip the first second
    seconds--;
    var interval = setInterval(function () {
        $('#status').text(Math.round(seconds));
        if (seconds <= 0) {
            clearInterval(interval);
            callback();
        }
        seconds--;
    }, 1000);
};

function startRecording() {
    $('#status').text('RECORDING: press space to finish');
    window.recorder.clear();
    window.recorder.record();
};

function stopRecording() {
    window.recorder.stop();
    recorder.exportWAV(function (recording) {
        var url = window.URL.createObjectURL(recording);
        $('#tracks').append('<li></li>');
        $('#tracks li').last()
            .append('<span><audio id="' + window.numberOfTracks + '"></audio></span>')
            .append('<span><a href="#" class="delete-button" id="' + window.numberOfTracks + '">X</a></span>');
        $('.delete-button').on('click', function (e) {
            $(this).parent().parent().remove();
        })
        $('audio#' + window.numberOfTracks)
            .attr('autoplay', 'true')
            .attr('controls', 'true')
            .attr('loop', 'true')
            .attr('src', url)
            .get(0).load();
        // there are several bugs around triggering on load
        setTimeout(function () {
            window.loopLength = $('audio').get(0).duration;
        }, 1000);
        window.numberOfTracks++;
    });
};

function handleRecord(e) {
    if (e.which == 32) {
        if (window.recording) {
            stopRecording();
            window.recording = false;
            $('p#status').text('press space to record a new track');
        } else {
            if (window.loopLength > -1) {
                //we've already recorded a track
                var track = $('audio').get(0);
                // start at the next second
                var timeLeft = loopLength - track.currentTime;
                var subSecondTime = timeLeft - Math.floor(timeLeft);
                setTimeout(function () {
                    countDown(Math.floor(timeLeft), startRecording);
                }, subSecondTime);
            } else {
                countDown(3, startRecording);
            }
            //TODO: kill race condition pressing space before countdown finished
            window.recording = true;
        }
    }
}

function loadLoopPedal() {
    navigator.getUserMedia({
        "audio": true
    },

    function (stream) {
        var audioContext = new window.AudioContext();
        var mediaStreamSource = audioContext.createMediaStreamSource(stream);
        //mediaStreamSource.connect(audioContext.destination);
        window.recorder = new Recorder(mediaStreamSource, {
            workerPath: "recorderWorker.js"
        });
        $(document).keypress(function (e) {
            handleRecord(e)
        });
        $('p#status').text('press space to record a new track');
    }, errorCallback);
};

if ( !! navigator.getUserMedia && !! window.AudioContext) {
    loadLoopPedal();
} else {
    // getUserMedia or AudioContext not available
    alert('oi, you need a new browser');
}