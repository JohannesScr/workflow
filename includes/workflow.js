var fs = require('fs');
var path = require('path');

var routes_group_one = require('./../routes/group_one');
var routes_group_two = require('./../routes/group_two');

var step = {
    group_one_function_one: routes_group_one.group_one_function_one,
    group_one_function_two: routes_group_one.group_one_function_two,
    group_one_function_three: routes_group_one.group_one_function_three,
    group_two_function_one: routes_group_two.group_two_function_one,
    group_two_function_two: routes_group_two.group_two_function_two,
    group_two_function_three: routes_group_two.group_two_function_three
};

/* #################### HELPER FUNCTIONS #################### */

/* #################### SECONDARY FUNCTIONS #################### */

function retrieve_workflow_init_from_database(req, filename) {
    var workflow_string = fs.readFileSync(path.join(__dirname, '../database/', filename));

    var path_init = JSON.parse(workflow_string);

    for (var i = 0; i < path_init.length; i++) {
        if (path_init[i].method === req.method && req.url.split('/')[1] === (path_init[i].workflow_name.split('_')[0] + '_' + path_init[i].workflow_name.split('_')[1])) {
            path_init = path_init[i];
        }
    }
    return path_init;
}

function retrieve_workflow_from_database(req, filename) {
    var workflow_string = fs.readFileSync(path.join(__dirname, '../database/', filename));
    var path_workflow = JSON.parse(workflow_string);

    for (var i = 0; i < path_workflow.length; i++) {
        if (req.workflow.name === path_workflow[i].workflow_name) {
            path_workflow = path_workflow[i];
        }
    }

    return path_workflow
}

function execute_workflow(workflow) {
    workflow = step[workflow.job](workflow);

    // done with job update to next step
    workflow.previous_job = workflow.job;
    workflow.counter += 1;

    return workflow;
}

function workflow_local_history(workflow) {
    var partial = {
        name: workflow.name,
        http_code: workflow.http_code,
        message: workflow.message,
        workflow_id: workflow.workflow_id,
        counter: workflow.counter,
        previous_job: workflow.previous_job,
        job: workflow.job,
        data: JSON.parse(JSON.stringify(workflow.data)),
        errors: workflow.errors,
        workflow: workflow.workflow
    };

    var history_counter = Object.keys(workflow.local_history);

    // workflow.local_history['state' + history_counter.length] = JSON.stringify(partial);
    workflow.local_history['state_' + history_counter.length] = partial;
    return workflow;
}

function response_handling(workflow, res) {
    if (workflow.errors.length > 0) {
        if (workflow.http_code !== 200) {
            workflow.http_cod = workflow.http_code
        } else {
            workflow.http_code = 500
        }
        workflow.message = workflow.message || 'Internal Server Error => ';
        return res.status(workflow.http_code).send(workflow);
    } else {
        return res.json(workflow);
    }
}

/* #################### PRIMARY FUNCTIONS #################### */

function workflow(req, res) {
    // retrieve the
    var path_workflow = retrieve_workflow_from_database(req, 'workflow.json');

    var counter = req.workflow.counter;

    req.workflow.name = path_workflow.workflow_name;
    req.workflow.workflow = path_workflow.workflow;

    if (path_workflow.workflow[counter].function_name) {
        req.workflow.job = path_workflow.workflow[counter].function_name
    } else if (path_workflow.workflow[counter].workflow_name) {
        req.workflow.name = path_workflow.workflow[counter].workflow_name;
            req.workflow.counter = 0;
            return workflow(req, res);
    } else if (path_workflow.workflow[counter].decision) {
        if (eval(path_workflow.workflow[counter].decision.condition)) {
            req.workflow.name = path_workflow.workflow[counter].decision.workflow_true;
            req.workflow.counter = 0;
            return workflow(req, res);
        } else {
            req.workflow.name = path_workflow.workflow[counter].decision.workflow_false;
            req.workflow.counter = 0;
            return workflow(req, res);
        }
    }


    req.workflow = execute_workflow(req.workflow);

    req.workflow = workflow_local_history(req.workflow);

    if (counter === req.workflow.workflow.length - 1 || req.workflow.errors.length > 0) {
        return response_handling(req.workflow, res);

    } else {
        return workflow(req, res);
    }
}

function workflow_init(req, res) {
    console.log('-> workflow init');

    var path_workflow_init = retrieve_workflow_init_from_database(req, 'workflow_init.json');

    if (path_workflow_init.counter === 0) {
        req.workflow.name = path_workflow_init.workflow_name;
        req.workflow.counter = path_workflow_init.counter
    }

    workflow(req, res);
}

/* #################### EXPORTED FUNCTIONS #################### */

module.exports = {
    workflow_init: workflow_init
};