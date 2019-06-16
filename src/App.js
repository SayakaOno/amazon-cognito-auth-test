import React from 'react';
import AWS from 'aws-sdk';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';

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
import { addTopic, getTopics, getTopic } from './dynamoDB/topic';

Auth.configure(awsconfig);

let dynamodb = null;
let docClient = null;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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

  signUp = () => {
    Auth.signUp({
      username: username,
      password: password,
      attributes: {
        email: email
      }
    });
  };

  signIn = () => {
    Auth.signIn(username, password)
      .then(success => console.log('successful sign in'))
      .catch(err => console.log(err));
  };

  render() {
    const { title, description } = this.state;
    return (
      <div className="App">
        <button onClick={this.signUp}>Sign up</button>
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
