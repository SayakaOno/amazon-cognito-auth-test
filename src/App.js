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

Auth.configure(awsconfig);

let dynamodb = null;
let docClient = null;

class App extends React.Component {
  state = {
    title: '',
    description: '',
    tags: ''
  };
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

  addTopic = () => {
    var params = {
      TableName: 'Topic',
      Item: {
        id: '001',
        title: this.state.title,
        description: this.state.description,
        tags: ['dog', 'cat']
      }
    };
    docClient.put(params, function(err, data) {
      if (err) {
        document.querySelector('textarea').value =
          'Unable to add item: ' + '\n' + JSON.stringify(err, undefined, 2);
      } else {
        document.querySelector('textarea').value =
          'PutItem succeeded: ' + '\n' + JSON.stringify(data, undefined, 2);
      }
    });
  };

  render() {
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
        <button onClick={this.addTopic}>ADD TOPIC</button>
        <br />
        <textarea />
      </div>
    );
  }
}

export default App;
