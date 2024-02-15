const express = require('express');
const ApiError = require('./utils/ApiError');
const globalErrorHandle = require('./middlewares/globalErrorHandle');

const app = express();

app.use(express.json());

const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');

app.use('/api/v1/users', userRoute);
app.use('/api/v1/auth', authRoute);

app.all('*', (req, res, next) => {
  next(new ApiError(`Can not find this route ${req.originalUrl}`, 400));
});

app.use(globalErrorHandle);

module.exports = app;
