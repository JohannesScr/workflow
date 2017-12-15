var path = require('path');

var express = require('express');

var workflow = require('./includes/workflow');
var server_settings = require('./includes/server.settings');

var app = express();

var PORT = 3000;

// default html page
app.use(express.static(path.join(__dirname, 'public')));
app.use(server_settings.log_url);
app.use(server_settings.build_workflow_object);

app.post('/flow_one', workflow.workflow_init);
app.get('/flow_two', workflow.workflow_init);

app.post('/flow_three', workflow.workflow_init);
app.get('/flow_four', workflow.workflow_init);

app.get('/flow_five', workflow.workflow_init);

app.listen(PORT, function() {
    console.log('Express running on port ' + PORT);
});
