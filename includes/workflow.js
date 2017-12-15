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
    /** retrieve_workflow_init_from_database - This represents a table in the "Database" which will link a http request
     *      method to an inital workflow process.
     *
     * @param {object} req
     * @param {string} filename
     *
     * @description
     * Reads the the initial_workflow_set from the "Database" (json file in this example).
     * Compares the http method and url and returns the workflow_name.
     *
     * @return workflow_name.
     */

    var workflow_string = fs.readFileSync(path.join(__dirname, '../database/', filename));

    var initial_workflow_set = JSON.parse(workflow_string);

    for (var i = 0; i < initial_workflow_set.length; i++) {
        if (initial_workflow_set[i].method === req.method && req.url.split('/')[1] === (initial_workflow_set[i].workflow_name.split('_')[0] + '_' + initial_workflow_set[i].workflow_name.split('_')[1])) {
            return initial_workflow_set[i];
        }
    }
}

function retrieve_workflow_from_database(req, filename) {
    /** retrieve_workflow_init_from_database - This represents a table in the "Database" which will link a http request
     *      method to an inital workflow process.
     *
     * @param {object} req
     * @param {string} filename
     *
     * @description
     * Reads the the workflow_set from the "Database" (json file in this example).
     * Compares the workflow_name and returns the workflow_element.
     *
     * @return workflow_element.
     */

    var workflow_string = fs.readFileSync(path.join(__dirname, '../database/', filename));
    var workflow_set = JSON.parse(workflow_string);

    for (var i = 0; i < workflow_set.length; i++) {
        if (req.workflow.name === workflow_set[i].workflow_name) {
            return workflow_set[i];
        }
    }
}

function execute_workflow(workflow) {
    /** execute_workflow - Executes the function based on the job.
     *
     * @param {object} workflow
     *
     * @description
     * All functions are to be added to the {object} step.
     * Executes the function based on the name passed as job.
     * Increments the workflow counter.
     *
     * @return {object} workflow.
     */

    workflow = step[workflow.job](workflow);

    // done with job update to next step
    workflow.previous_job = workflow.job;
    workflow.counter += 1;

    return workflow;
}

function workflow_local_history(workflow) {
    /** workflow_local_history - Stores the current workflow state in the local history of the workflow.
     *
     * @param {object} workflow
     *
     * @description
     * Set {object} partial to be a partial of the current workflow.
     * Some elements are converted to strings, then back to JSON object, this is to prevent it from referencing the
     *      memory location, but to store the current instance.
     * Set {number} history_counter to keep track of the current history.
     * Add the partial as a state to the local history of the workflow.
     *
     * @return {object} workflow.
     */

    var partial = {
        name: workflow.name,
        http_code: workflow.http_code,
        message: workflow.message,
        workflow_id: workflow.workflow_id,
        counter: workflow.counter,
        previous_job: workflow.previous_job,
        job: workflow.job,
        data: JSON.parse(JSON.stringify(workflow.data)),
        errors: JSON.parse(JSON.stringify(workflow.errors)),
        workflow: workflow.workflow
    };

    var history_counter = Object.keys(workflow.local_history).length;

    // workflow.local_history['state' + history_counter.length] = JSON.stringify(partial);
    workflow.local_history['state_' + history_counter] = partial;
    return workflow;
}

function response_handling(workflow, res) {
    /** response_handling - Very basic response handling. Just checks if it is an error response or a successful
     *      response.
     *
     * @param {object} workflow
     * @param {object} res
     *
     * @description
     * If there are any errors, handle as an error.
     *      Check for http_code and message.
     *      Send response.
     * Else handle as a successful workflow.
     *      Send response.
     *
     * @return response with {object} workflow
     */

    if (workflow.errors.length > 0) {
        if (workflow.http_code === 200) {
            workflow.http_code = 500;
        }
        workflow.message = workflow.message || 'Internal Server Error => ';
        return res.status(workflow.http_code).send(workflow);
    } else {
        return res.json(workflow);
    }
}

/* #################### PRIMARY FUNCTIONS #################### */

function workflow(req, res) {
    /** workflow - The brains of the operation. Workflow retrieves the workflow element from the entire set of workflow
     *      elements. It executes the functions of the workflow, then recursively executes the next function. It can
     *      also switch between workflows or based on conditions make a decision to run specific workflows. Next it
     *      stores a local history of the workflow and finally does response handling.
     *
     * @param {object} req
     * @param {object} res
     *
     * @description
     * Retrieve the workflow_element from the "Database".
     * Check if it is a function_name to be executed.
     *      Executes the function.
     * Else if it is a workflow_name to retrieve the workflow_element.
     *      Call {function} workflow.
     * Else if it is a decision to based on the condition retrieve the workflow_element.
     *      Call {function} workflow.
     *
     * Call {function} execute_workflow to execute the function.
     * Call {function} workflow_local_history to store the workflow's current state.
     *
     * If the workflow is complete or an error occurred.
     *      Call {function} response_handling to handle the responses.
     * Else execute the next function in the workflow.
     *      Call {function} workflow to execute the next function.
     */

    var workflow_element = retrieve_workflow_from_database(req, 'workflow.json');

    var counter = req.workflow.counter;

    req.workflow.name = workflow_element.workflow_name;
    req.workflow.workflow = workflow_element.workflow;

    if (workflow_element.workflow[counter].function_name) {
        req.workflow.job = workflow_element.workflow[counter].function_name
    } else if (workflow_element.workflow[counter].workflow_name) {
        req.workflow.name = workflow_element.workflow[counter].workflow_name;
            req.workflow.counter = 0;
            return workflow(req, res);
    } else if (workflow_element.workflow[counter].decision) {
        if (eval(workflow_element.workflow[counter].decision.condition)) {
            req.workflow.name = workflow_element.workflow[counter].decision.workflow_true;
            req.workflow.counter = 0;
            return workflow(req, res);
        } else {
            req.workflow.name = workflow_element.workflow[counter].decision.workflow_false;
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
    /** workflow_init - Initiates the workflow process from the server.js file.
     *
     * @param {object} req
     * @param {object} res
     *
     * @description
     * From the initiate table, this compare the http method and url to the "Database" entries and retrieves the
     *      workflow_name and counter set to zero.
     * @function workflow retrieves the actual workflow and executes and handles the responses.
     */

    console.log('-> workflow init');

    var workflow_name_init = retrieve_workflow_init_from_database(req, 'workflow_init.json');

    if (workflow_name_init.counter === 0) {
        req.workflow.name = workflow_name_init.workflow_name;
        req.workflow.counter = workflow_name_init.counter
    }

    workflow(req, res);
}

/* #################### EXPORTED FUNCTIONS #################### */

module.exports = {
    workflow_init: workflow_init
};