const recognition = new webkitSpeechRecognition();

recognition.onresult = function(event){
document.getElementById("ai-question").value =
event.results[0][0].transcript;
};

function startVoice(){
recognition.start();
}
