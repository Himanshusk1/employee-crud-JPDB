// === Configuration ===
var baseURL = "http://api.login2explore.com:5577";
var connToken = "90934604|-31949211920232748|90956789";
var jpdbirl = "/api/irl";
var jpdbiml = "/api/iml";
var empDBName = "EmployeeDB2";
var empRelationName = "Emp-Data2";

setBaseUrl(baseURL);

// === Utility Functions ===
function disableCtrl(state) {
    $("#new, #save, #edit, #change, #reset").prop("disabled", state);
}

function disableNav(state) {
    $("#first, #prev, #next, #last").prop("disabled", state);
}

function disableForm(state) {
    $("#eid, #ename, #bs, #hra, #da, #dd").prop("disabled", state);
}

function makeDataFormEmpty() {
    $("#eid, #ename, #bs, #hra, #da, #dd").val('');
}

function isNoRecordPresent() {
    return getFirstRec() === "0" && getLastRec() === "0";
}

function isOnlyOneRecordPresent() {
    return !isNoRecordPresent() && getFirstRec() === getLastRec();
}

function getCurrRec() {
    return localStorage.getItem('rec_no');
}

function setFirstRec(jsonObj) {
    var data = JSON.parse(jsonObj.data);
    localStorage.setItem("first_rec_no", data.rec_no || "0");
}

function getFirstRec() {
    return localStorage.getItem("first_rec_no");
}

function setLastRec(jsonObj) {
    var data = JSON.parse(jsonObj.data);
    localStorage.setItem("last_rec_no", data.rec_no || "0");
}

function getLastRec() {
    return localStorage.getItem("last_rec_no");
}

function setCurrRec(jsonObj) {
    var data = JSON.parse(jsonObj.data);
    localStorage.setItem("rec_no", data.rec_no);
}

function getEmpIdAsJsonObj() {
    return JSON.stringify({ id: $("#eid").val() });
}

// === Form Control Actions ===
function initEmpForm() {
    localStorage.clear();
    console.log("initForm() - done");
}

function newData() {
    makeDataFormEmpty();
    disableForm(false);
    $("#eid").focus();
    disableNav(true);
    disableCtrl(true);
    $("#save, #reset").prop("disabled", false);
}

function editData() {
    disableForm(false);
    $("#eid").prop("disabled", true);
    $("#ename").focus();
    disableNav(true);
    disableCtrl(true);
    $("#change, #reset").prop("disabled", false);
}

function resetForm() {
    disableCtrl(true);
    disableNav(false);

    var getCurrRequest = createGET_BY_RECORDRequest(connToken, empDBName, empRelationName, getCurrRec());
    jQuery.ajaxSetup({ async: false });
    var result = executeCommand(getCurrRequest, jpdbirl);
    jQuery.ajaxSetup({ async: true });

    if (isNoRecordPresent()) {
        makeDataFormEmpty();
        disableNav(true);
    }

    showData(result);
    disableForm(true);
    $("#new").prop("disabled", false);

    if (isOnlyOneRecordPresent()) {
        disableNav(true);
        $("#edit").prop("disabled", false);
    }
}

function saveData() {
    var jsonStrObj = validateData();
    if (jsonStrObj === '') return;

    var putRequest = createPUTRequest(connToken, jsonStrObj, empDBName, empRelationName);
    jQuery.ajaxSetup({ async: false });
    var jsonObj = executeCommand(putRequest, jpdbiml);
    jQuery.ajaxSetup({ async: true });

    if (jsonObj.status === 200) {
        if (isNoRecordPresent()) setFirstRec(jsonObj);
        setLastRec(jsonObj);
        setCurrRec(jsonObj);
        resetForm();

        Swal.fire({
            icon: 'success',
            title: 'Saved!',
            text: 'Employee data has been saved successfully.',
            timer: 2000,
            showConfirmButton: false
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Save Failed',
            text: jsonObj.message || 'Could not save employee data.'
        });
    }
}

function changeData() {
    var jsonObj = validateData();
    if (jsonObj === '') return;

    var updateRequest = createUPDATERecordRequest(connToken, jsonObj, empDBName, empRelationName, getCurrRec());
    jQuery.ajaxSetup({ async: false });
    var result = executeCommandAtGivenBaseUrl(updateRequest, baseURL, jpdbiml);
    jQuery.ajaxSetup({ async: true });

    if (result.status === 200) {
        resetForm();
        $("#eid").focus();

        Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Employee data has been updated successfully.',
            timer: 2000,
            showConfirmButton: false
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: result.message || 'Could not update employee data.'
        });
    }
}

function validateData() {
    var empid, empname, empsal, hra, da, deduct;
    empid = $("#eid").val();
    empname = $("#ename").val();
    empsal = $("#bs").val();
    hra = $("#hra").val();
    da = $("#da").val();
    deduct = $("#dd").val();

    if (empid === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Field',
            text: 'Employee ID is required',
        });
        $("#eid").focus();
        return "";
    }
    if (empname === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Field',
            text: 'Employee Name is required',
        });
        $("#ename").focus();
        return "";
    }
    if (empsal === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Field',
            text: 'Employee Salary is required',
        });
        $("#bs").focus();
        return "";
    }
    if (hra === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Field',
            text: 'HRA is required',
        });
        $("#hra").focus();
        return "";
    }
    if (da === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Field',
            text: 'DA is required',
        });
        $("#da").focus();
        return "";
    }
    if (deduct === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Field',
            text: 'Deduction is required',
        });
        $("#dd").focus();
        return "";
    }

    var jsonStrObj = {
        id: empid,
        name: empname,
        salary: empsal,
        hra: hra,
        da: da,
        deduct: deduct
    };
    return JSON.stringify(jsonStrObj);
}

function getFirst() {
    var request = createFIRST_RECORDRequest(connToken, empDBName, empRelationName);
    jQuery.ajaxSetup({ async: false });
    var result = executeCommand(request, jpdbirl);
    jQuery.ajaxSetup({ async: true });
    showData(result);
    setFirstRec(result);
    $('#eid').prop("disabled", true);
    $('#first, #prev').prop("disabled", true);
    $('#next').prop("disabled", false);
}

function getLast() {
    var request = createLAST_RECORDRequest(connToken, empDBName, empRelationName);
    jQuery.ajaxSetup({ async: false });
    var result = executeCommand(request, jpdbirl);
    jQuery.ajaxSetup({ async: true });
    showData(result);
    setLastRec(result);
    $('#eid').prop("disabled", true);
    $('#last, #next').prop("disabled", true);
    $('#first, #prev').prop("disabled", false);
}

function getPrev() {
    var r = getCurrRec();
    var request = createPREV_RECORDRequest(connToken, empDBName, empRelationName, r);
    jQuery.ajaxSetup({ async: false });
    var result = executeCommand(request, jpdbirl);
    jQuery.ajaxSetup({ async: true });
    showData(result);

    if (getCurrRec() === getFirstRec()) {
        $("#prev, #first").prop("disabled", true);
    }
    $("#save").prop("disabled", true);
}

function getNext() {
    var r = getCurrRec();
    var request = createNEXT_RECORDRequest(connToken, empDBName, empRelationName, r);
    jQuery.ajaxSetup({ async: false });
    var result = executeCommand(request, jpdbirl);
    jQuery.ajaxSetup({ async: true });
    showData(result);
    $("#save").prop("disabled", true);
}

function showData(jsonObj) {
    if (jsonObj.status === 400) return;

    var data = JSON.parse(jsonObj.data).record;
    setCurrRec(jsonObj);

    $("#eid").val(data.id);
    $("#ename").val(data.name);
    $("#bs").val(data.salary);
    $("#hra").val(data.hra);
    $("#da").val(data.da);
    $("#dd").val(data.deduct);

    disableNav(false);
    disableForm(true);

    $("#save, #change, #reset").prop("disabled", true);
    $("#new, #edit").prop("disabled", false);

    if (getCurrRec() === getLastRec()) {
        $("#next, #last").prop("disabled", true);
    }
    if (getCurrRec() === getFirstRec()) {
        $("#first, #prev").prop("disabled", true);
    }
}

// === Existence Check ===
function getEmp() {
    var empId = getEmpIdAsJsonObj();
    var request = createGET_BY_KEYRequest(connToken, empDBName, empRelationName, empId);

    jQuery.ajaxSetup({ async: false });
    var jsonObj = executeCommandAtGivenBaseUrl(request, baseURL, jpdbirl);
    jQuery.ajaxSetup({ async: true });

    if (jsonObj.status === 200) {
        Swal.fire({
            icon: 'info',
            title: 'ID Exists',
            text: 'Employee ID already exists!',
        });
        resetForm();
        $("#eid").prop("disabled", true);
    }
}

function checkForNoRecord() {
    if (isNoRecordPresent()) {
        disableForm(true);
        disableNav(true);
        disableCtrl(true);
        $("#new").prop("disabled", false);
    } else if (isOnlyOneRecordPresent()) {
        disableForm(true);
        disableNav(true);
        disableCtrl(true);
        $("#new").prop("disabled", false);
        $("#edit").prop("disabled", false);
    }
}

// === Initialization ===
initEmpForm();
getFirst();
getLast();
checkForNoRecord();
