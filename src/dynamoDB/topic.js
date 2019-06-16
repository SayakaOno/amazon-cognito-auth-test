export const addTopic = (docClient, title, description) => {
  var params = {
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
  var params = {
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
