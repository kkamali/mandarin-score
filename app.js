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
    console.log("Please direct me to an audio file!");
});

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    recognizeSpeech(d.toString().trim(), function(transcript) {
        console.log(transcript);
    });
});

function recognizeSpeech(file, callback) {

    var golden_sentences = [];

    var lineReader = require('readline').createInterface({
        input: fs.createReadStream('golden_sentences.txt')
    });

    lineReader.on('line', function (line) {
        golden_sentences.push(line);
    });

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
            var transcribed = transcript.results[0].alternatives[0].transcript;
            var final_transcription = transcribed.replace(/ /g,'');
            console.log("speech to text : " + final_transcription);
            console.log("golden sentence: " + golden_sentences[parseInt(file.replace(".flac", "")) - 1]);
            console.log("You can give me another audio file name!"); 
        });
}
