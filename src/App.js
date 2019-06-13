import React from 'react';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';

import {
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
  componentDidMount() {}

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
    return <div className="App">app</div>;
  }
}

export default App;
