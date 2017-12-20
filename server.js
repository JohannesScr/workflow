let path = require('path');

let express = require('express');

let {workflow_init} = require('./includes/workflow');
let {log_url, build_workflow_object} = require('./includes/server.settings');

let app = express();

let PORT = 3000;

// default html page
app.use(express.static(path.join(__dirname, 'public')));
app.use(log_url);
app.use(build_workflow_object);

app.post('/flow_one', workflow_init);
app.get('/flow_two', workflow_init);

app.post('/flow_three', workflow_init);
app.get('/flow_four', workflow_init);

app.get('/flow_five', workflow_init);

app.listen(PORT, function() {
    console.log('Express running on port ' + PORT);
});
