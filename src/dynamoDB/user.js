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
      document.querySelector('textarea').value =
        'Unable to add item: ' + '\n' + JSON.stringify(err, undefined, 2);
    } else {
      document.querySelector('textarea').value =
        'PutItem succeeded: ' + '\n' + JSON.stringify(data, undefined, 2);
    }
  });
};
