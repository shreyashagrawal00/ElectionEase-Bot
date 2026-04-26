require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
// const mongoSanitize = require('express-mongo-sanitize');

// Connect Database
connectDB();

const app = express();

// Init Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
// app.use(mongoSanitize()); // Disabled due to Express 5 incompatibility

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/elections', require('./routes/electionRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));

// Error Handler Middleware (Should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
