import React, { Component } from 'react';
import RecorderJS from 'recorder-js';
import LexChat from '../LexChat.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from "@fortawesome/fontawesome-svg-core";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { getAudioStream, exportBuffer } from '../utilities/audio';
let AWS = require('aws-sdk');

class Recorder extends React.Component {

	constructor(props) {
    super(props);
    this.state = {
      stream: null,
      recording: false,
      recorder: null,
    };

    this.startRecord = this.startRecord.bind(this);
    this.stopRecord = this.stopRecord.bind(this);
  }

  async componentDidMount() {
    let stream;

    try {
      stream = await getAudioStream();
    } catch (error) {
      // Users browser doesn't support audio.
      // Add your handler here.
      console.log(error);
    }

    this.setState({ stream });
  }


  startRecord() {

	  var inputFieldText = document.getElementById('inputField');
      inputFieldText.value = 'Listening...';
      inputFieldText.disabled = true;

	  const { stream } = this.state;

	    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
	    const recorder = new RecorderJS(audioContext);
	    recorder.init(stream);

	    this.setState(
	      {
	        recorder,
	        recording: true
	      },
	      () => {
	        recorder.start();
	      }
	    );
	  }

  async stopRecord() {
    const { recorder } = this.state;

    const { buffer } = await recorder.stop()
    const audio = exportBuffer(buffer[0]);
    // Process the audio here.
    console.log(audio);

    var params = {
            botAlias: "eVerifybot_demo",
            botName: "eVerifybot",
            contentType: 'audio/x-l16; sample-rate=16000',
            userId: 'chatbot-demo' + Date.now(),
            accept: 'audio/mpeg'
        };
    // send it to the Lex runtime

        params.inputStream = audio;
        new AWS.LexRuntime().postContent(params, function(err, data) {

        	var inputFieldText = document.getElementById('inputField');
        	inputFieldText.value = '';
        	inputFieldText.disabled = false;

        	if (err) {
                // an error occured
            	console.log("error occurred" , err)
            } else {
            	console.log("successful!")
            	console.log(data);

            	var myBlob = new Blob([data.audioStream], { type: 'audio/mpeg' });
                var audio = document.createElement('audio');
                var objectUrl = window.URL.createObjectURL(myBlob);
                audio.src = objectUrl;
                audio.addEventListener('ended', function() {
                  audio.currentTime = 0;
                });
                audio.play();
                //
                var lexChat = new LexChat();
                lexChat.showRequest(data.inputTranscript);
                lexChat.showResponse(data);
                // success, now let's play the response
            }
        });

        this.setState({
	      recording: false
	    });
  }

  render() {
    const { recording, stream } = this.state;

    library.add(faMicrophone);

    // Don't show record button if their browser doesn't support it.
    if (!stream) {
      return null;
    }

    const buttonStyle = {
    		backgroundColor: '#fff',
            width: '33px',
            height: '38px',
            margin: '1px',
            padding: '1px'
        }
    const spinIconStyle = {
    		color : '#0000FF',
            width: '25px',
            height: '25px',
        }

    return (
	    <div>
		      <button className="btn border-left-0 rounded-0 rounded-right"  style={buttonStyle}
		        onClick={() => {
		          recording ? this.stopRecord() : this.startRecord();
		        }}
		        >
		        {recording ?  <FontAwesomeIcon  className="elementToFadeInAndOut" data-toggle="tooltip" data-placement="top" title="Press to stop" color={'red'} icon="microphone"/> :  <FontAwesomeIcon icon="microphone"/>}

		       </button>
	     </div>
    );
  }
}

export default Recorder;
