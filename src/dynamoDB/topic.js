export const addTopic = (docClient, title, description) => {
  let params = {
    TableName: 'Topic',
    Item: {
      id: '001',
      title,
      description,
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

export const getTopics = (docClient, field) => {
  let params = {
    TableName: 'Topic'
    // ProjectionExpression: 'title'
    // FilterExpression: '#yr between :start_yr and :end_yr',
    // ExpressionAttributeNames: {
    //   '#yr': 'year'
    // },
    // ExpressionAttributeValues: {
    //   ':start_yr': 1950,
    //   ':end_yr': 1959
    // }
  };

  console.log('Scanning Topics table.');
  docClient.scan(params, onScan);

  function onScan(err, data) {
    if (err) {
      console.error(
        'Unable to scan the table. Error JSON:',
        JSON.stringify(err, null, 2)
      );
    } else {
      // print all the topics
      console.log('Scan succeeded.');
      let content = [];
      data.Items.forEach(function(topic) {
        content.push(topic.title);
      });
      field.current.value = content.map(item => {
        return item;
      });

      // continue scanning if we have more topics, because
      // scan can retrieve a maximum of 1MB of data
      if (typeof data.LastEvaluatedKey != 'undefined') {
        console.log('Scanning for more...');
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  }
};

export const getTopic = (docClient, field) => {
  let params = {
    TableName: 'Topic',
    Key: {
      id: '001',
      title: 'question1'
      // description: "description",
      // tags: "tags"
    }
  };
  docClient.get(params, function(err, data) {
    if (err) {
      field.current.value =
        'Unable to read item: ' + '\n' + JSON.stringify(err, undefined, 2);
    } else {
      field.current.value =
        'GetItem succeeded: ' + '\n' + JSON.stringify(data, undefined, 2);
    }
  });
};

export const updateTopic = (docClient, field) => {
  let params = {
    TableName: 'Topic',
    Key: {
      id: '001',
      title: 'question1'
    },
    UpdateExpression: 'set comments=:c',
    ExpressionAttributeValues: {
      ':c': {
        username: 'newuser1',
        text: 'this is the answer',
        date: 'Jun 15, 2019'
      }
    },
    ReturnValues: 'UPDATED_NEW'
  };

  docClient.update(params, function(err, data) {
    if (err) {
      document.querySelector('textarea').value =
        'Unable to update item: ' + '\n' + JSON.stringify(err, undefined, 2);
    } else {
      document.querySelector('textarea').value =
        'UpdateItem succeeded: ' + '\n' + JSON.stringify(data, undefined, 2);
    }
  });
};

export const conditionalDeleteTopic = docClient => {
  let params = {
    TableName: 'Topic',
    Key: {
      id: '001',
      title: 'question1'
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
