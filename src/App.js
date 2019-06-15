import React from 'react';
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

class App extends React.Component {
  state = {
    title: '',
    description: '',
    tags: ''
  };
  componentDidMount() {}

  handleInputChange = e => {
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
      </div>
    );
  }
}

export default App;
