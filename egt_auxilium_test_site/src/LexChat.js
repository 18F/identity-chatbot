import React, { Component} from 'react';
import PropTypes from 'prop-types';
import Recorder from './Components/Recorder';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import Autolinker, { Match } from 'autolinker';
let AWS = require('aws-sdk');


class LexChat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: '',
            lexUserId: 'chatbot-demo' + Date.now(),
            sessionAttributes: {}, visible: 'closed'
        };
        this.handleChange = this.handleChange.bind(this);
        this.styleResponse = this.styleResponse.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.initialPrompt = this.initialPrompt.bind(this);
        this.autolinker = new Autolinker( {
            urls : {
                schemeMatches : true,
                wwwMatches    : true,
                tldMatches    : true
            },
            email       : true,
            phone       : true,
            mention     : false,
            hashtag     : false,

            stripPrefix : false,
            stripTrailingSlash : true,
            newWindow   : true,

            truncate : {
                length   : 0,
                location : 'end'
            },

            className : ''
        } );
    }

    componentDidMount() {
        document.getElementById("inputField").focus();
        AWS.config.region = this.props.region || 'us-east-1';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: this.props.IdentityPoolId,
        });
        var lexruntime = new AWS.LexRuntime();
        this.lexruntime = lexruntime;

        this.initialPrompt();
    }

    initialPrompt() {
        var conversationDiv = document.getElementById('conversation');
        var responsePara = document.createElement("P");
        responsePara.className = 'lexResponse';
        responsePara.appendChild(document.createTextNode('Hi! I can answer your questions about login.gov. What would you like to know?'));
        responsePara.appendChild(document.createElement('br'));
        conversationDiv.appendChild(responsePara);
        conversationDiv.scrollTop = conversationDiv.scrollHeight;
    }

    handleClick() {
        this.setState({ visible: this.state.visible == 'open'? 'closed' : 'open' });
        console.log(this.state);
    }

    pushChat(event) {
        event.preventDefault();

        var inputFieldText = document.getElementById('inputField');

        if (inputFieldText && inputFieldText.value && inputFieldText.value.trim().length > 0) {

            // disable input to show we're sending it
            var inputField = inputFieldText.value.trim();
            inputFieldText.value = '...';
            inputFieldText.locked = true;

            // send it to the Lex runtime
            var params = {
                botAlias: this.props.botAlias,
                botName: this.props.botName,
                inputText: inputField,
                userId: this.state.lexUserId,
                sessionAttributes: this.state.sessionAttributes
            };
            this.showRequest(inputField);
            var a = function(err, data) {
                if (err) {
                    console.log(err, err.stack);
                    this.showError('Error:  ' + err.message + ' (see console for details)')
                }
                if (data) {
                    // capture the sessionAttributes for the next cycle
                    this.setState({sessionAttributes: data.sessionAttributes})
                    //sessionAttributes = data.sessionAttributes;
                    // show response and/or error/dialog status
                    this.showResponse(data);
                }
                // re-enable input
                inputFieldText.value = '';
                inputFieldText.locked = false;
            };

           this.lexruntime.postText(params, a.bind(this));
        }
        // we always cancel form submission
        return false;
    }

    showRequest(daText) {
        var conversationDiv = document.getElementById('conversation');
        var requestPara = document.createElement("P");
        requestPara.className = 'userRequest';
        var text = Autolinker.link(daText,{replaceFn : function( match ) {
            var tag = match.buildTag();
            console.log(match.getType());
            if(match.getType() == 'phone') {
             tag.setAttr('newWindow' , false);
             tag.setAttr('target' , '');
            }
            if(match.getType() == 'url') {
            	 match.stripPrefix.scheme = false;
	           	 match.stripPrefix.www = false;
	           	 return match;
              }
            return tag;
        }}
        		 );
        requestPara.innerHTML = text;
       // requestPara.appendChild(document.createTextNode(daText));
        conversationDiv.appendChild(requestPara);
        conversationDiv.scrollTop = conversationDiv.scrollHeight;
    }

    showError(daText) {

        var conversationDiv = document.getElementById('conversation');
        var errorPara = document.createElement("P");
        errorPara.className = 'lexError';
        errorPara.appendChild(document.createTextNode(daText));
        conversationDiv.appendChild(errorPara);
        conversationDiv.scrollTop = conversationDiv.scrollHeight;
    }

    styleResponse(responsePara, msg) {
    	  for (let key in msg) {
              var div = document.createElement('div');
              var text = Autolinker.link(msg[key].value.replace(/&quot;/g,'"'),{replaceFn : function( match ) {
                  var tag = match.buildTag();
                  console.log(match.getType());
                  if(match.getType() == 'phone') {
                   tag.setAttr('newWindow' , false);
                   tag.setAttr('target' , '');
                  }
                  if(match.getType() == 'url') {
                      match.stripPrefix.scheme = false;
                	  match.stripPrefix.www = false;
                	  return match;
                  }
                  return tag;
              }});
              div.innerHTML = text;
              div.style.paddingBottom = "10px";
              responsePara.appendChild(div);
          }
    }

    showResponse(lexResponse) {
        var conversationDiv = document.getElementById('conversation');
        var responsePara = document.createElement("P");
        responsePara.className = 'lexResponse';

        if (lexResponse.message) {
            try {
                JSON.parse(lexResponse.message);
                this.styleResponse(responsePara, JSON.parse(lexResponse.message).messages);
            } catch(e) {
                var div = document.createElement('div');
                var text = Autolinker.link(lexResponse.message.replace(/&quot;/g,'"'),{replaceFn : function( match ) {
                    var tag = match.buildTag();
                    console.log(match.getType());
                    if(match.getType() == 'phone') {
                     tag.setAttr('newWindow' , false);
                     tag.setAttr('target' , '');
                    }
                    if(match.getType() == 'url') {
                    	 match.stripPrefix.scheme = false;
	                   	 match.stripPrefix.www = false;
	                   	 return match;
                       }
                    return tag;
                }});
                console.log(text);
                console.log(div)
                //div.appendChild(document.createTextNode(text));
                div.innerHTML = text;
                responsePara.appendChild(div);

//                var div = document.createElement('div');
//                div.appendChild(document.createTextNode(lexResponse.message.replace(/&quot;/g,'"')));
//                responsePara.appendChild(div)
            }
        }
        if (lexResponse.dialogState === 'ReadyForFulfillment') {
            responsePara.appendChild(document.createTextNode(
                'Ready for fulfillment'));
            // TODO:  show slot values
        } else {
            responsePara.appendChild(document.createTextNode(
                ''));
        }
        conversationDiv.appendChild(responsePara);
        conversationDiv.scrollTop = conversationDiv.scrollHeight;
    }

    handleChange(event) {
        event.preventDefault();
        this.setState({data: event.target.value});
    }

    render() {

        const inputStyle = {
            padding: '4px',
            fontSize: 18,
            width: '320px',
            height: '30px',
            borderRadius: '1px',
            border: '10px'
        }

        const inputRowStyle = {
            borderTop: 'thin solid #bfbfbf'
        }

        const conversationStyle = {
            width: '348px',
            height: this.props.height,
            border: 'px solid #ccc',
            backgroundColor: this.props.backgroundColor,
            padding: '4px',
            overflowY: 'scroll'
        }

        const headerRectStyle = {
            backgroundColor: '#1274ED',
            width: '348px',
            textAlign: 'center',
            paddingTop: 8,
            height: '50px',
            color: '#FFFFFF',
            fontSize: '22px',
            fontWeight: '600',
            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
        }

        const chatcontainerStyle = {
            backgroundColor: '#FFFFFF',
            width: '348px'
        }

        const chatFormStyle = {
            margin: '1px',
            padding: '2px'
        }


        return (

            <div id="chatwrapper">
                <div id="chat-header-rect" style={headerRectStyle} onClick={this.handleClick} >
                    <div style={{float: 'left', textAlign: 'left', width: '430px', marginLeft: '20px'}}>
                        {this.props.headerText}
                    </div>
                    <div style={{position: 'relative', marginRight: '20px'}}>
                        {(this.state.visible === 'open') ? <FontAwesomeIcon icon={faCaretDown} /> : <FontAwesomeIcon icon={faCaretUp} />}
                    </div>
                </div>
                <div id="chatcontainer" className={this.state.visible} style={chatcontainerStyle}>

                <div id="conversation" style={conversationStyle} ></div>
                <div className="row" style={inputRowStyle}>
                    <div className="speech col-md-11">
	                    <form id="chatform" style={chatFormStyle} onSubmit={this.pushChat.bind(this)}>
	                    	<input type="text"
	                               id="inputField"
	                               size="40"
	                               value={this.state.data}
	                               placeholder={this.props.placeholder}
	                               onChange={this.handleChange.bind(this)}
	                    		   style={inputStyle}
	                        />
	                    </form>
	                  </div>
                </div>
		            </div>
            </div>
        )
    }
}

LexChat.propTypes = {
    botName: PropTypes.string,
    IdentityPoolId: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string,
    height: PropTypes.string,
    headerText: PropTypes.string
}

export default LexChat;
