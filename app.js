require('dotenv-extended').load();

var restify = require('restify');

var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
var fs = require('fs');

var speech_to_text = new SpeechToTextV1 ({
  username: process.env.USERNAME,
  password: process.env.PASSWORD
});

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 8000, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var files = [];
fs.readdirSync('./audio-files').forEach(file => {
    files.push(file);
});

recognizeSpeech(files);

function recognizeSpeech(files) {
    for (var file of files) {
        var params = {
            audio: fs.createReadStream("./audio-files/" + file),
            content_type: 'audio/flac',
            model: 'zh-CN_BroadbandModel',
            timestamps: true,
            word_alternatives_threshold: 0.9,
        };

        speech_to_text.recognize(params, function(error, transcript) {
             if (error)
               console.log('Error:', error);
             else
               console.log(transcript.results[0].alternatives[0].transcript);
        });
    }
}
