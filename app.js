const express = require("express");
const bodyParser = require("body-parser");
const { Connection, Request } = require("tedious");

const app = express();
app.use(bodyParser.json());

const config = {
  authentication: {
    options: {
      userName: "hari7priya", // Azure SQL admin username
      password: "ha@#RI1234", // Azure SQL admin password
    },
    type: "default",
  },
  server: "hpazuresqlserver.database.windows.net", // Azure SQL Server name
  options: {
    database: "healthappdb", // Database name
    encrypt: true,
    trustServerCertificate: true,
  },
};

let connection;

function connectToDb() {
  connection = new Connection(config);

  connection.on("connect", (err) => {
    if (err) {
      console.error("Connection Failed:", err);
    } else {
      console.log("Connected to Azure SQL Database");
    }
  });

  connection.on("end", () => {
    console.log("Connection ended.");
  });

  connection.on("error", (err) => {
    console.error("Connection error:", err);
  });

  connection.connect();
  setTimeout(() => {
    console.log("Current connection state:", connection.state);
  }, 5000); // Check after 5 seconds
}

// Call the function to initiate the connection
connectToDb();

// API to handle form submission
app.post("/submit", (req, res) => {
  const { name, email, message } = req.body;

  console.log(connection);
  if (connection && connection.state.name === "LoggedIn") {
    const sql = `INSERT INTO Forms (name, email, message) VALUES ('${name}', '${email}', '${message}')`;

    const request = new Request(sql, (err) => {
      if (err) {
        console.error("SQL Error", err);
        res.status(500).send("Error saving data");
      } else {
        res.status(200).send("Form submitted successfully!");
      }
    });

    connection.execSql(request);
  } else {
    res.status(500).send("Database connection is not available.");
    console.error("Error: Database connection is not available.");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
