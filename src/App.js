import React from 'react';
import AWS from 'aws-sdk';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';

import {
  region,
  endpoint,
  accessKeyId,
  secretAccessKey,
  user_pool_id,
  clientId,
  username,
  password,
  email,
  phone_number,
  code,
  newPassword
} from './config';
import { addTopic, updateTopic, getTopics, getTopic } from './dynamoDB/topic';

Auth.configure(awsconfig);

let dynamodb = null;
let docClient = null;
let cognitoUser;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      verificationCode: '',
      title: '',
      description: '',
      tags: ''
    };
    this.textareaForTopic = React.createRef();
  }

  componentDidMount() {
    AWS.config.update({
      region,
      endpoint,
      // accessKeyId default can be used while using the downloadable version of DynamoDB.
      // For security reasons, do notå store AWS Credentials in your files. Use Amazon Cognito instead.
      accessKeyId,
      // secretAccessKey default can be used while using the downloadable version of DynamoDB.
      // For security reasons, do not store AWS Credentials in your files. Use Amazon Cognito instead.
      secretAccessKey
    });

    dynamodb = new AWS.DynamoDB();
    docClient = new AWS.DynamoDB.DocumentClient();
  }

  onInputChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  signIn = () => {
    Auth.signIn(username, password)
      .then(success => console.log('successful sign in'))
      .catch(err => console.log(err));
  };

  signUp = () => {
    var poolData = {
      UserPoolId: user_pool_id, // your user pool id here
      ClientId: clientId // your app client id here
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
      Username: username, // your username here
      Pool: userPool
    };

    var attributeList = [];

    var dataEmail = {
      Name: 'email',
      Value: this.state.email // your email here
    };
    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(
      dataEmail
    );

    attributeList.push(attributeEmail);

    userPool.signUp(
      this.state.email,
      this.state.password, // '!1Password',
      attributeList,
      null,
      function(err, result) {
        if (err) {
          console.log(err);
          alert(err);
          return;
        }
        cognitoUser = result.user;
        console.log(cognitoUser);
        console.log('user name is ' + cognitoUser.getUsername());
      }
    );
  };

  confirm = () => {
    cognitoUser.confirmRegistration(this.state.verificationCode, true, function(
      err,
      result
    ) {
      if (err) {
        console.log(err);
        alert(err);
        return;
      }
      console.log('call result: ' + result);
    });
  };

  render() {
    const {
      email,
      password,
      verificationCode,
      title,
      description
    } = this.state;
    return (
      <div className="App">
        email:{' '}
        <input name="email" value={email} onChange={this.onInputChange} />
        <br />
        password:{' '}
        <input
          type="password"
          name="password"
          value={password}
          onChange={this.onInputChange}
        />
        <br />
        <button onClick={this.signUp}>Sign up</button>
        <br />
        <input
          name="verification-code"
          value={verificationCode}
          onChange={e => this.setState({ verificationCode: e.target.value })}
        />
        <button onClick={this.confirm}>Confirm</button>
        <br />
        <button onClick={this.signIn}>Sign in</button>
        <br />
        <br />
        title:{' '}
        <input name="title" value={this.title} onChange={this.onInputChange} />
        <br />
        description:{' '}
        <input
          name="description"
          value={this.description}
          onChange={this.onInputChange}
        />
        <br />
        tags:{' '}
        <input name="tags" value={this.tags} onChange={this.onInputChange} />
        <br />
        <button onClick={() => addTopic(docClient, title, description)}>
          ADD TOPIC
        </button>
        <br />
        <button onClick={() => updateTopic(docClient, this.textareaForTopic)}>
          update topic
        </button>
        <br />
        <textarea style={{ width: 300, height: 150 }} />
        <br />
        <button onClick={() => getTopics(docClient, this.textareaForTopic)}>
          get All Topics
        </button>
        <button onClick={() => getTopic(docClient, this.textareaForTopic)}>
          get Topic
        </button>
        <br />
        <textarea
          ref={this.textareaForTopic}
          style={{ width: 450, height: 200 }}
        />
      </div>
    );
  }
}

export default App;
