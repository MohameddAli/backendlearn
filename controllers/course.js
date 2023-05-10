import fs from 'fs';
import Course from '../models/course';
import slugify from 'slugify';

// export const uploadImage = async (req, res) => {
//   try {
//       console.log("uploadImage",req.file);
//     const { path } = req.file; // get the file path from req.file
//     const newFileName = `${Date.now()}_${req.file.originalname}`;
//     console.log("uploadImage");
//     const newPath = `./public/images/${newFileName}` // set the new file path
//     fs.renameSync(path, newPath); // rename and move the file to the new path

//     // return the new file name and path as a response
//     res.json({ fileName: newFileName, filePath: newPath });
//   } catch (err) {
//     console.log(err);
//     res.status(400).send("Image upload failed");
//   }
// };

// export const uploadImage = async (req, res) => {
//     try {
//         console.log("uploadImage",req.file);
//       const { path } = req.file; // get the file path from req.file
//       const newFileName = `${Date.now()}_${req.file.originalname}`;
//       console.log("uploadImage");
//       const newPath = `./public/images/${newFileName}` // set the new file path
//       fs.renameSync(path, newPath); // rename and move the file to the new path
  
//       // return the new file name and path as a response
//       res.json({ fileName: newFileName, filePath: newPath });
//     } catch (err) {
//       console.log(err);
//       res.status(400).send("Image upload failed");
//     }
//   };
// uploadImage function
  // export const uploadImage = async (req, res) => {
  //   try {
  //     console.log("uploadImage",req.file);
  //     const { path } = req.file; // get the file path from req.file
  //     const newFileName = `${Date.now()}_${req.file.originalname}`;
  //     console.log("uploadImage");
  //     const newPath = `./public/images/${newFileName}` // set the new file path
  //     fs.renameSync(path, newPath); // rename and move the file to the new path

  //     // return the new file name and path as a response
  //     res.json({ fileName: newFileName, filePath: newPath });
  //   } catch (err) {
  //     console.log(err);
  //     res.status(400).send("Image upload failed");
  //   }
  // };
  export const uploadImage = async (req, res) => {
    try {
       console.log("uploadImage",req.file);
       const newFileName = req.file.filename;
       const newPath = req.file.path;
  
       // return the new file name and path as a response
       res.json({ fileName: newFileName, filePath: newPath });


    } catch (err) {
      console.log(err);
      res.status(400).send("Image upload failed");
    }
  };
  // export const uploadImage = async (req, res) => {
  //   try {
  //     console.log("uploadImage", req.file);
  //     const { path } = req.file; // get the file path from req.file
  //     const newFileName = `${Date.now()}_${req.file.originalname}`;
  //     console.log("uploadImage");
  //     const newPath = `./public/images/${newFileName}`; // set the new file path
  //     fs.renameSync(path, newPath); // rename and move the file to the new path
  
  //     // return the new file name and path as a response
  //     const fileUrl = `http://localhost:8000/${newPath}`;
  //     res.json({ fileUrl });
  //   } catch (err) {
  //     console.log(err);
  //     res.status(400).send("Image upload failed");
  //   }
  // };
  

  export const removeImage = async (req, res) => {
    try {
      const { image } = req.body;
      // image path
      const imagePath = `./public/images/${image.fileName}`;
  
      // check if file exists
      if (!fs.existsSync(imagePath)) {
        console.log('File not found');
        return res.sendStatus(400);
      }
  
      // delete file
      fs.unlinkSync(imagePath);
  
      res.send({ ok: true });
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  };
  
  // React course for beginners
  // react-course-for-beginners
  export const create = async (req, res) => {
    console.log('create course: ', req.body);
    // return;
    try {
      const alreadyExist = await Course.findOne({
        slug: slugify(req.body.name.toLowerCase()),
      }).exec();
      if (alreadyExist) return res.status(400).send("Title is taken");
      const course = await new Course({
        slug: slugify(req.body.name),
        instructor: req.auth._id,
        ...req.body,
      }).save();

      res.json(course);
    } catch (err) {
      console.log("create course: ", err);
      return res.status(400).send("Course creation failed. Try again.");
    }
  };