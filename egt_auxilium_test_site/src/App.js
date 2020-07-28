import React, { Component } from 'react';
//import LexChat from 'react-lex';
import { library } from '@fortawesome/fontawesome-svg-core'
import LexChat from './LexChat';
import './App.css';
import './chatbot.css';

class App extends Component {
  render() {
    return (
        <div>
      	<LexChat botName="login_implementation"
                 IdentityPoolId="us-east-1:e76cd0a2-176f-442b-9e44-bc723d48c03b"
                 placeholder="  Type your question here"
                 botAlias="gas_login_auxilium"
                 style={{position: 'absolute'}}
                 backgroundColor="#FFFFFF"
                 height="500px"
                 headerText="Click Here to Ask Questions" />
        </div>

    );
  }
}

export default App;
