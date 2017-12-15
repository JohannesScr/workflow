
/* #################### HELPER FUNCTIONS #################### */

/* #################### SECONDARY FUNCTIONS #################### */

/* #################### PRIMARY FUNCTIONS #################### */

function group_two_function_one(workflow) {
    console.log('G2: Function 1');
    workflow.data.g_two_f_one = 'G2: Function 1';
    return workflow;
}

function group_two_function_two(workflow) {
    console.log('G2: Function 2');
    workflow.data.g_two_f_two = 'G2: Function 2';
    return workflow;
}

function group_two_function_three(workflow) {
    console.log('G2: Function 3');

    var err = new Error('Error => /group_two_function_three');
    workflow.http_code = 400;
    workflow.errors.push(err.message);

    if (!err) {
        workflow.data.g_two_f_three = 'G2: Function 3';
    }
    return workflow;
}

function group_two_function_four(workflow) {
    console.log('G2: Function 4');
    workflow.data.g_two_f_four = 'G2: Function 4';
    return workflow;
}

function group_two_function_five(workflow) {
    console.log('G2: Function 5');
    workflow.data.g_two_f_five = 'G2: Function 5';
    return workflow;
}

function group_two_function_six(workflow) {
    console.log('G2: Function 6');
    workflow.data.g_two_f_six = 'G2: Function 6';
    return workflow;
}

/* #################### EXPORTED FUNCTIONS #################### */

module.exports = {
    group_two_function_one: group_two_function_one,
    group_two_function_two: group_two_function_two,
    group_two_function_three: group_two_function_three,
    group_two_function_four: group_two_function_four,
    group_two_function_five: group_two_function_five,
    group_two_function_six: group_two_function_six
};