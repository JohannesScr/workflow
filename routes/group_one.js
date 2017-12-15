
/* #################### HELPER FUNCTIONS #################### */

/* #################### SECONDARY FUNCTIONS #################### */

/* #################### PRIMARY FUNCTIONS #################### */

function group_one_function_one(workflow) {
    console.log('G1: Function 1');
    workflow.data.g_one_f_one = 'G1: Function 1';
    workflow.data.total = workflow.data.total + 12;
    return workflow;
}

function group_one_function_two(workflow) {
    console.log('G1: Function 2');
    workflow.data.g_one_f_two = 'G1: Function 2';
    workflow.data.total = 2;
    return workflow;
}

function group_one_function_three(workflow) {
    console.log('G1: Function 3');
    workflow.data.g_one_f_three = 'G1: Function 3';
    workflow.data.total = workflow.data.total - 12;
    return workflow;
}

function group_one_function_four(workflow) {
    console.log('G1: Function 4');
    workflow.data.g_one_f_four = 'G1: Function 4';
    return workflow;
}

function group_one_function_five(workflow) {
    console.log('G1: Function 5');
    workflow.data.g_one_f_five = 'G1: Function 5';
    return workflow;
}

function group_one_function_six(workflow) {
    console.log('G1: Function 6');
    workflow.data.g_one_f_six = 'G1: Function 6';
    return workflow;
}

/* #################### EXPORTED FUNCTIONS #################### */

module.exports = {
    group_one_function_one: group_one_function_one,
    group_one_function_two: group_one_function_two,
    group_one_function_three: group_one_function_three,
    group_one_function_four: group_one_function_four,
    group_one_function_five: group_one_function_five,
    group_one_function_six: group_one_function_six
};