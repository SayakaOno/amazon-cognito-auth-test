export const addUser = (docClient, id, username) => {
  var params = {
    TableName: 'User',
    Item: {
      id,
      username
    }
  };
  docClient.put(params, function(err, data) {
    if (err) {
      console.log(err);
      document.querySelector('textarea').value =
        'Unable to add item: ' + '\n' + JSON.stringify(err, undefined, 2);
    } else {
      console.log('User added!');
      document.querySelector('textarea').value =
        'PutItem succeeded: ' + '\n' + JSON.stringify(data, undefined, 2);
    }
  });
};

export const deleteUser = (userId, docClient) => {
  let params = {
    TableName: 'User',
    Key: {
      id: userId
    }
  };

  docClient.delete(params, function(err, data) {
    if (err) {
      console.log(
        'The conditional delete failed: ' +
          '\n' +
          JSON.stringify(err, undefined, 2)
      );
    } else {
      console.log(
        'The conditional delete succeeded: ' +
          '\n' +
          JSON.stringify(data, undefined, 2)
      );
    }
  });
};
