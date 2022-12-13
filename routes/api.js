'use strict';
//package to generate random id for tickets 
const { v4: uuidv4 } = require('uuid');

module.exports = function(app) {
  let ticketList = {};
  if( process.env.TEST_DATA ){
    ticketList["test"] = JSON.parse(process.env.TEST_DATA);   
  }
  
  app.route('/api/issues/:project')

    /* Select and display all tickets for a project */
    .get(function(req, res) {
      let project = req.params.project;
      let result = [];

      //if project is provided
      if (project) {
        let projectList = Object.keys(ticketList);

        //if project is found
        if (projectList.indexOf(project) > -1) {
          result = ticketList[project];
        }

        //if filters are provided
        let queryList = Object.keys(req.query);
        if (queryList.length > 0) {
          /* FORMAT NON STRING FILTERS*/
          if (queryList.indexOf("open") > -1) {
            req.query["open"] = req.query["open"] == "false" ? false : true;
          }
          if (queryList.indexOf("created_on") > -1) {
            req.query["created_on"] = new Date(req.query["created_on"]);
          }
          if (queryList.indexOf("updated_on") > -1) {
            req.query["updated_on"] = new Date(req.query["updated_on"]);
          }

          /* FILTER */
          let filteredList = [];
          // loop through issue tickets
          for (let idx in result) {
            let ticket = result[idx];
            let sumSuccess = 0;
            // loop through filters
            for (let idxx in queryList) {
              let filter = queryList[idxx];
              // count filter passed for each ticket
              sumSuccess += (ticket[filter] == req.query[filter]);
            }
            //if ticket passes through all filters
            if (sumSuccess == queryList.length){
              filteredList.push(ticket);
            }
          }
          result = filteredList;
        }// end if fitlers are provided

      }//end if project is provided 

      //send list 
      res.json(result);
    })


    /* Add ticket for project */
    .post(function(req, res) {
      let project = req.params.project;

      //complete issue object fields
      let obj = req.body;

      //if all required fields are provided
      if (obj["issue_title"] && obj["issue_text"] && obj["created_by"]) {
        let result = {
          assigned_to: obj["assigned_to"] || "",
          status_text: obj["status_text"] || "",
          open: true,
          _id: uuidv4(),
          issue_title: obj["issue_title"],
          issue_text: obj["issue_text"],
          created_by: obj["created_by"],
          created_on: new Date(),
          updated_on: new Date()
        };

        //if project exists 
        if (Object.keys(ticketList).indexOf(project) > -1) {
          //insert object to issue list for this project
          ticketList[project].push(result);
        } else {
          //create a new list for this project
          ticketList[project] = [result];
        }

        res.json(result);
      } else {
        res.send({ error: 'required field(s) missing' });
      }

    })


    /* Update ticket in project */
    .put(function(req, res) {
      let project = req.params.project;
      let obj = req.body;
      let ticketID = obj["_id"];

      let fieldLabels = Object.keys(obj);
      //get all values of obj except for _id
      let fieldValues = fieldLabels.map((field) => {
        if (field != "_id") {
          return obj[field]
        }
      });

      let countEmptyFields = fieldValues.reduce((sum, value) => sum + (value ? 0 : 1), 0);

      //if _id is provided and at least one other field is updated
      if (ticketID && fieldLabels.length > 1 && countEmptyFields < fieldValues.length) {
        let projectList = Object.keys(ticketList);
        let projectFound = false;
        let ticketFound = false;

        //if project is found
        if (projectList.indexOf(project) > -1) {
          projectFound = true;

          // look for ticket id    
          let ticketForThisProject = ticketList[project];
          let result = findItem(ticketID, ticketForThisProject);
          ticketFound = result[0];
          let idx = result[1];

          //if ticket id found
          if (ticketFound) {
            //loop through and update fields
            let objectKeys = Object.keys(obj);
            for (let item in objectKeys) {
              let field = objectKeys[item];
              //if key is not _id and field is not empty
              if (field != "_id" && obj[field]) {
                //if field is open
                if (field == "open") {
                  ticketList[project][idx][field] = obj[field] == "false" ? false : true;
                } else {
                  //if field is empty keep stored information
                  ticketList[project][idx][field] = obj[field];
                }
              }
            }//end update field loop

            //update updated_on
            ticketList[project][idx]["updated_on"] = new Date();

          }//end if ticket _id found
        }//end if project found

        //if ticket is found 
        if (ticketFound) {
          res.send({ result: "successfully updated", "_id": ticketID })
        } else {
          res.send({ error: "could not update", "_id": ticketID });
        }

      }//end if _id is provided and at least one other field is updated
      else if (!ticketID) {
        res.send({ error: 'missing _id' });
      }
      else if (fieldLabels.length < 2 || countEmptyFields == fieldValues.length) {
        res.send({ error: 'no update field(s) sent', '_id': ticketID })
      }
    })


    /* Delete ticket from project */
    .delete(function(req, res) {
      let project = req.params.project
      let ticketID = req.body["_id"];

      //if _id is provided
      if (ticketID) {
        let projectFound = false;
        let ticketFound = true;

        //if project is found
        if (Object.keys(ticketList).indexOf(project) > -1) {
          projectFound = true;

          //look for ticket _id
          let ticketForThisProject = ticketList[project];
          let result = findItem(ticketID, ticketForThisProject);
          ticketFound = result[0];
          let idx = result[1];

          //if ticket found
          if (ticketFound) {
            ticketList[project].splice(idx, 1);
          }

        }//end if project found


        //if project and ticket are found
        if (projectFound && ticketFound) {
          res.send({ result: "successfully deleted", "_id": ticketID });
        } else {
          res.send({ error: "could not delete", "_id": ticketID })
        }
      }
      //if _id is NOT provided
      else {
        res.send({ error: 'missing _id' });
      }
    });

};//end module



/* function : look for object item in list, with _id = item */
function findItem(item, itemList) {
  let itemFound = false;

  let idx = 0;
  while (idx < itemList.length && !itemFound) {
    //if item is found
    if (itemList[idx]["_id"] == item) {
      itemFound = true;
    }
    idx += 1;
  }
  return [itemFound, idx - 1];
}
