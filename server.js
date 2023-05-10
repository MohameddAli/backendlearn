// import path from 'path';
import express from 'express';
import cors from 'cors';
import fs, { readdirSync } from 'fs';
const mongoose = require('mongoose');
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import multer from 'multer';
const crypto = require('crypto');
const path = require('path');
import { nanoid } from 'nanoid';
const serveStatic = require('serve-static');

const morgan = require('morgan');
require('dotenv').config();
console.log(process.env.EMAIL_FROM);
console.log(process.env.EMAIL_PASS);

const csrfProtection = csrf({ cookie: true });

// Create express app
const app = express();
// bodyParser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.DATABASE || 'mongodb://localhost:27017/edemy', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// apply middlewares
app.use(cors());
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'public')));
app.use(serveStatic(path.join(__dirname, 'public')));
// app.use(express.static('public'));
app.use(express.json({ limit: '10mb'}));
app.use(cookieParser());
app.use(morgan('dev'));
app.use((req, res, next) => {
  console.log("This is my own middleware");
  next();
});
// app.use(express.static('public'));
// Serve static files from the public directory
// app.use(express.static(path.join(__dirname, "public")));

// multer config
// Get the extension of a filename
function getExtension(filename) {
  return path.extname(filename).toLowerCase();
}

// Configure the storage options for multer
// const storage = multer.diskStorage({
//   // Limit the file size to 10 MB
//   limits: { fileSize: 10 * 1024 * 1024 },
//   // Specify the destination directory for uploaded files
//   destination: async function (req, file, cb) {
//     const destinationDir = path.join(__dirname, 'public', 'images');
//     try {
//       // Create the destination directory if it doesn't exist
//       await fs.promises.mkdir(destinationDir, { recursive: true });
//       cb(null, destinationDir);
//     } catch (err) {
//       cb(err);
//     }
//   },
//   // Generate a random filename for uploaded files
//   filename: function (req, file, cb) {
//     const fileExtension = getExtension(file.originalname);
//     const randomName = crypto.randomBytes(16).toString('hex');
//     const filename = `${randomName}${fileExtension}`;
//     cb(null, filename);
//   },
// });

// // Configure the upload options for multer
// export const upload = multer({
//   storage,
//   // Only allow JPEG and PNG files
//   fileFilter: async function (req, file, cb) {
//     const allowedExtensions = ['.jpg', '.jpeg', '.png'];
//     const fileExtension = getExtension(file.originalname);
//     if (!allowedExtensions.includes(fileExtension)) {
//       return cb(new Error('Only image files are allowed!'));
//     }
//     const allowedMimeTypes = ['image/jpeg', 'image/png'];
//     const fileMimeType = file.mimetype;
//     if (!allowedMimeTypes.includes(fileMimeType)) {
//       return cb(new Error('Only jpeg and png image files are allowed!'));
//     }
//     cb(null, true);
//   },
// });
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];

const storage = multer.diskStorage({
  limits: { fileSize: MAX_FILE_SIZE },
  destination: async function (req, file, cb) {
    const destinationDir = path.join(__dirname, 'public', 'images');
    try {
      await fs.promises.mkdir(destinationDir, { recursive: true });
      cb(null, destinationDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: function (req, file, cb) {
    const fileExtension = getExtension(file.originalname);
    const randomName = crypto.randomBytes(16).toString('hex');
    const filename = `${randomName}${fileExtension}`;
    cb(null, filename);
  },
});

export const upload = multer({
  storage,
  fileFilter: async function (req, file, cb) {
    try {
      const fileExtension = getExtension(file.originalname);
      const fileMimeType = file.mimetype;
      if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        throw new Error('Only image files are allowed!');
      }
      if (!ALLOWED_MIME_TYPES.includes(fileMimeType)) {
        throw new Error('Only jpeg and png image files are allowed!');
      }
      cb(null, true);
    } catch (err) {
      cb(err.toString());
    }
  },
});

// routes
 readdirSync('./routes').map((r) => app.use('/api/', require(`./routes/${r}`)));
//  csrf protection
app.use(csrfProtection);


app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// port
const port = process.env.PORT || 8000;


app.listen(port, () => console.log(`Server is running on port ${port}`));

