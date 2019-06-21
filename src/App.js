import React from 'react';
import AWS from 'aws-sdk';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';
import * as AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import './App.css';

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
import {
  addTopic,
  updateTopic,
  getTopics,
  getTopic,
  conditionalDeleteTopic,
  getTopicsByTag
} from './dynamoDB/topic';
import { addUser, deleteUser } from './dynamoDB/user';

Auth.configure(awsconfig);

let dynamodb = null;
let docClient = null;
let cognitoUser = null;
let poolData = {
  UserPoolId: user_pool_id, // your user pool id here
  ClientId: clientId // your app client id here
};
let userPool = null;
let userData = {};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      verificationCode: '',
      title: '',
      description: '',
      tags: '',
      cognitoUser: null,
      userId: '',
      targetTag: '',
      image: ''
    };
    this.textareaForTopic = React.createRef();
    this.imageRef = React.createRef();
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
    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    userData = {
      Username: username, // your username here
      Pool: userPool
    };
  }

  onInputChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  setUserId = userId => {
    this.setState({ userId: userId });
  };

  signIn = newUser => {
    let authenticationData = {
      Username: this.state.email, // your username here
      Password: this.state.password // your password here (1234567890)
    };
    let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
      authenticationData
    );
    let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    this.setState({ cognitoUser });
    let username = this.state.username;
    let setUserId = this.setUserId;
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function(result) {
        let accessToken = result.getAccessToken().getJwtToken();
        let sub = result.getAccessToken().payload.sub;
        setUserId(sub);
        console.log('signed in!');
        if (newUser) {
          addUser(docClient, sub, username);
        }
      },
      onFailure: function(err) {
        alert(err);
        console.log(err);
      }
      // mfaRequired: function(codeDeliveryDetails) {
      //   let verificationCode = prompt('Please input verification code', '');
      //   cognitoUser.sendMFACode(verificationCode, this);
      // }
    });
  };

  signUp = () => {
    let attributeList = [];

    let dataEmail = {
      Name: 'email',
      Value: this.state.email // your email here
    };
    let attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(
      dataEmail
    );

    attributeList.push(attributeEmail);

    userPool.signUp(
      this.state.email,
      this.state.password,
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

  deleteUserAccount = () => {
    let userId = this.state.userId;
    this.state.cognitoUser.deleteUser(function(err, result) {
      if (err) {
        alert(err);
        return;
      }
      deleteUser(userId, docClient);

      console.log('call result: ' + result);
    });
  };

  readURL = e => {
    if (e.target.files && e.target.files[0]) {
      let reader = new FileReader();
      let name = e.target.files[0].name;
      let imageRef = this.imageRef;
      let thisD = this;

      reader.onload = function(e) {
        imageRef.current.src = e.target.result;
        thisD.setState({ image: name });
      };

      reader.readAsDataURL(e.target.files[0]);
    }
  };

  deleteFile = () => {
    this.imageRef.current.src = '';
    this.setState({ image: '' });
  };

  render() {
    console.log(this.imageRef);

    const {
      username,
      email,
      password,
      verificationCode,
      title,
      description,
      tags,
      targetTag
    } = this.state;
    return (
      <div className="App">
        username:{' '}
        <input name="username" value={username} onChange={this.onInputChange} />
        <br />
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
        <button onClick={() => this.signIn(true)}>Sign in (new user)</button>
        <br />
        <button onClick={() => this.signIn(false)}>Sign in</button>
        <br />
        <button onClick={this.deleteUserAccount}>Delete account</button>
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
        <button onClick={() => addTopic(docClient, title, description, tags)}>
          ADD TOPIC
        </button>
        <br />
        <button onClick={() => conditionalDeleteTopic(docClient)}>
          DELETE TOPIC
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
        <input
          name="targetTag"
          value={targetTag}
          onChange={this.onInputChange}
        />
        <button
          onClick={() =>
            getTopicsByTag(docClient, this.textareaForTopic, targetTag)
          }
        >
          get Topic by Tag
        </button>
        <br />
        <textarea
          ref={this.textareaForTopic}
          style={{ width: 450, height: 200 }}
        />
        <br />
        <div className="file-input">
          <label className="file-upload">
            <input type="file" onChange={this.readURL} />
            <div>+ Add Image</div>
          </label>
          {this.state.image ? (
            <span className="file-name">
              <i onClick={this.deleteFile} className="times circle icon" />
              {this.state.image}
            </span>
          ) : null}
        </div>
        <div className="topic-image-container">
          <img className="topic-image" ref={this.imageRef} src="" alt="" />
        </div>
      </div>
    );
  }
}

export default App;
