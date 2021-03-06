const { Client } = require("../models/entities");

// Controls login settings
const loginControl = (request, response) => {
  const clientServices = require("../services/clientServices");

  // Gets username and password from login form
  let username = request.body.username;
  let password = request.body.password;
  // If either field is empty, return error to the user
  if (!username || !password) {
    response.render("loggingIn", {
      message: "Logging in failed, Please try again.",
    });
  }
  // If fields aren't empty
  else {
    // Check whether user is already logged in
    if (request.session && request.session.user) {
      response.render("loggingIn", { message: "Already logged in." });
    }
    // If user is not logged in;
    else {
      clientServices.loginService(
        username,
        password,
        function (err, dberr, client) {
          console.log("Client from login service :" + JSON.stringify(client));
          if (client === null) {
            console.log("Authentication error!");
            response.render("loggingIn", {
              message: "Please check the username or password and try again.",
            });
          } else {
            console.log("User from login service :" + client[0].num_client);
            // Add username & ID to active session
            request.session.user = username;
            request.session.num_client = client[0].num_client;
            
            if (username == "gs2022") {
                request.session.admin = true;
              } else {
                request.session.admin = false;
              }
            
            response.render("loggingIn", {
              message: `Log in successful (Username: ${username}, ID: ${client[0].num_client})!`,
            });
          }
        }
      );
    }
  }
};

// Controls register settings
const registerControl = (request, response) => {
  const clientServices = require("../services/clientServices");

  // Get details from register form
  let username = request.body.username;
  let password = request.body.password;
  let society = request.body.society;
  let contact = request.body.contact;
  let addres = request.body.addres;
  let zipcode = request.body.zipcode;
  let city = request.body.city;
  let phone = request.body.phone;
  let fax = request.body.fax;
  let max_outstanding = request.body.max_outstanding;
  let client = new Client(
    username,
    password,
    0,
    society,
    contact,
    addres,
    zipcode,
    city,
    phone,
    fax,
    max_outstanding
  );

  // To register a user
  clientServices.registerService(client, function (err, exists, insertedID) {
    console.log("User from register service :" + insertedID);
    if (err) {
    }
    // If username already taken
    else if (exists) {
      console.log("Username already taken.");
      response.render("registering", {
        message: `Registration failed; Username (${username}) is already taken, please choose a different username.`,
      });
    }
    // If username not taken, create account
    else {
      client.num_client = insertedID;
      console.log();
      response.render("registering", {
        message: `Registration (${username}, ${insertedID}) successful!`,
      });
    }
    response.end();
  });
};


const getClients = (request, response) => {
  const clientServices = require("../services/clientServices");
  if (request.session.admin) {
    clientServices.searchService(function (err, rows) {
      response.render("client", { clients: rows });
    });
  }
  
  else {
    clientServices.searchService(function (err, rows1) {
      response.render("cl", {
        message: `You do not have access to this page.`,
      });
    });
  }
};

// Get client by unique ID
const getClientByNumclient = (request, response) => {
  const clientServices = require("../services/clientServices");
  let num_client = request.params.num_client;
  clientServices.searchNumclientService(num_client, function (err, rows) {
    response.json(rows);
    response.end();
  });
};

module.exports = {
  loginControl,
  registerControl,
  getClients,
  getClientByNumclient,
};