const mongoose = require('mongoose');

const dbConnection = () => {
  mongoose
    .connect(
      process.env.DATA_BASE_STRING.replace(
        '<password>',
        process.env.DATA_BASE_PASSWORD,
      ),
    )
    .then(conn => console.log(`DataBase Connected: ${conn.connection.host}`));
};
module.exports = dbConnection;
