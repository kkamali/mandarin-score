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

    var lineReader = require('readline').createInterface({
      input: require('fs').createReadStream('golden_sentences.txt')
    });

    var golden_sentences = [];

    lineReader.on('line', function (line) {
        golden_sentences.push(line);
    });

    var indices = [];
    var golden_index = 0;

    for (var file of files) {
        var params = {
            audio: fs.createReadStream("./audio-files/" + file),
            content_type: 'audio/flac',
            model: 'zh-CN_BroadbandModel',
            timestamps: true,
            word_alternatives_threshold: 0.9,
        };

        indices.push(parseInt(file.replace(".flac", "")) - 1);

        speech_to_text.recognize(params, function(error, transcript) {
            if (error)
                console.log('Error:', error);
            else
                var transcribed = transcript.results[0].alternatives[0].transcript;
                console.log("speech to text transcribed: " + transcribed.replace(/ /g,''));
                console.log("golden sentence: " + golden_sentences[indices[golden_index]]);
                golden_index = golden_index + 1;
        });
    }
}
