
function log_url(req, res, next) {
    /** log_url - logs the url. */

    console.log(req.url);
    next();
}

function build_workflow_object(req, res, next) {
    /** build_workflow_object - builds blueprint for the workflow object. */

    req.workflow = {
        http_code: 200,
        message: '',
        name: null,
        workflow_id: new Date().getTime().toString() + Math.random() * (1),
        counter: 0,
        previous_job: '',
        job: '',
        data: {},
        errors: [],
        workflow: [],
        local_history: {}
    };
    next();
}

module.exports = {
    log_url: log_url,
    build_workflow_object: build_workflow_object
};