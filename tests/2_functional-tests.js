const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = process.env.SERVER;

chai.use(chaiHttp);

suite('Functional Tests', function() {
  // Test #1
  test("Create an issue with every field: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .post('api/issues/apitest')
      .send({
        assigned_to: "Them",
        status_text: "Pending",
        issue_title: "Title",
        issue_text: "Text",
        created_by: "author"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body["assigned_to"], "Them");
        assert.equal(res.body["status_text"], "Pending");
        assert.equal(res.body["issue_title"], "Title");
        assert.equal(res.body["issue_text"], "Text");
        assert.equal(res.body["created_by"], "author");
        assert.isAtLeast(
          new Date(res.body["created_on"]).getTime(),
          new Date().getTime() - 5000);
        assert.isAtLeast(
          new Date(res.body["updated_on"]).getTime(),
          new Date().getTime() - 5000);
        assert.equal(res.body["open"], true);
        assert.isString(res.body["_id"]);
        done();
      });
  })
  // Test #2
  test("Create an issue with only required fields: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .post('api/issues/apitest')
      .send({
        assigned_to: "",
        status_text: "",
        issue_title: "Title",
        issue_text: "Text",
        created_by: "author"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body["assigned_to"], "");
        assert.equal(res.body["status_text"], "");
        assert.equal(res.body["issue_title"], "Title");
        assert.equal(res.body["issue_text"], "Text");
        assert.equal(res.body["created_by"], "author");
        assert.isAtLeast(
          new Date(res.body["created_on"]).getTime(),
          new Date().getTime() - 5000);
        assert.isAtLeast(
          new Date(res.body["updated_on"]).getTime(),
          new Date().getTime() - 5000);
        assert.equal(res.body["open"], true);
        assert.isString(res.body["_id"]);
        done();
      });
  })
  // Test #3
  test("Create an issue with missing required fields: POST request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .post('api/issues/apitest')
      .send({
        assigned_to: "",
        status_text: "",
        issue_title: "",
        issue_text: "Text",
        created_by: "author"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body["error"], 'required field(s) missing');
        done();
      });
  })
  // Test #4
  test("View issues on a project: GET request to /api/issues/{project}", (done) => {
    let expectedList = JSON.parse(process.env.TEST_DATA);
    chai
      .request(server)
      .get('api/issues/test')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.length, expectedList.length);
        if(res.body.length == expectedList.length){
          for (let idx in res.body){
            //check if each issue object is what's expected
            assert.deepEqual(res.body[idx], expectedList[idx], `Issue ${idx} is not what is expected.`);
          }
        }
        done();
      });
  })
  // Test #5
  test("View issues on a project with one filter: GET request to /api/issues/{project}", (done) => {
    let expectedObj = [JSON.parse(process.env.TEST_DATA)[1], JSON.parse(process.env.TEST_DATA)[2]];
    chai
      .request(server)
      .get('api/issues/test?open=false')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.length, 2);
        assert.deepEqual(res.body[0], expectedObj[0]);
        assert.deepEqual(res.body[1], expectedObj[1]);
        done();
      });
  })
  // Test #6
  test("View issues on a project with multiple filters: GET request to /api/issues/{project}", (done) => {
    let expectedObj = JSON.parse(process.env.TEST_DATA)[1];
    chai
      .request(server)
      .get('api/issues/test?open=false&issue_title=Title2')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.length, 1);
        assert.deepEqual(res.body[0], expectedObj);
        done();
      });
  })
  // Test #7
  test("Update one field on an issue: PUT request to /api/issues/{project}", (done) => {
    let expectedObj = { 
      result: "successfully updated", 
      _id: "8ab28b98" 
    };
    chai
      .request(server)
      .put('api/issues/test')
      .send({
        _id: "8ab28b98",
        issue_text: "text is updated"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.deepEqual(res.body, expectedObj);
        done();
      });
  })
  // Test #8
  test("Update multiple fields on an issue: PUT request to /api/issues/{project}", (done) => {
    let expectedObj = { 
      result: "successfully updated", 
      _id: "8ab28b98" 
    };
    chai
      .request(server)
      .put('api/issues/test')
      .send({
        _id: "8ab28b98",
        issue_text: "text is updated",
        assigned_to: "You",
        status_text: "pending"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.deepEqual(res.body, expectedObj);
        done();
      });
  })
  // Test #9
  test("Update an issue with missing _id: PUT request to /api/issues/{project}", (done) => {
    let expectedObj = { 
      error: 'missing _id' 
    };
    chai
      .request(server)
      .put('api/issues/test')
      .send({
        _id: "",
        issue_text: "text is updated",
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.deepEqual(res.body, expectedObj);
        done();
      });
  })
  // Test #10
  test("Update an issue with no fields to update: PUT request to /api/issues/{project}", (done) => {
    let expectedObj = { 
      error: 'no update field(s) sent', 
      _id: "8ab28b98" 
    };
    chai
      .request(server)
      .put('api/issues/test')
      .send({
        _id: "8ab28b98",
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.deepEqual(res.body, expectedObj);
        done();
      });
  })
  // Test #11
  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", (done) => {
    let expectedObj = { 
      error: "could not update", 
      _id: "10" 
    };
    chai
      .request(server)
      .put('api/issues/test')
      .send({
        _id: "10",
        issue_text: "text is updated"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.deepEqual(res.body, expectedObj);
        done();
      });
  })
  // Test #12
  test("Delete an issue: DELETE request to /api/issues/{project}", (done) => {
    let expectedObj = { 
      result: "successfully deleted", 
      _id: "8ab28b98" 
    };
    
    chai
      .request(server)
      .delete('api/issues/test')
      .send({
        _id: "8ab28b98"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.deepEqual(res.body, expectedObj);
        done();
      });
  })
  // Test #13
  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done) => {
    let expectedObj = { 
      error: "could not delete", 
      _id: "10" 
    };
    
    chai
      .request(server)
      .delete('api/issues/test')
      .send({
        _id: "10"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.deepEqual(res.body, expectedObj);
        done();
      });
  })
  // Test #14
  test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", (done) => {
    let expectedObj = { 
      error: "missing _id" 
    };
    
    chai
      .request(server)
      .delete('api/issues/test')
      .send({
        _id: ""
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.deepEqual(res.body, expectedObj);
        done();
      });
  })
});
