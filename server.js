
const express = require('express');
const multer = require('multer');
const { Worker } = require('worker_threads');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const os = require('os');  // Import os module to get the number of CPU cores

const app = express();
const port = 3000;

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

// Get the number of CPU cores
const numOfCores = os.cpus().length; // Get the number of CPU cores

// Array to hold active workers (for graceful shutdown)
let activeWorkers = [];

// POST endpoint for optimizing images (support for multiple images)
app.post('/optimize-image', upload.array('images', 100), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send({ error: 'No image files uploaded' });
  }

  const optimizedImages = [];
  let processedCount = 0;

  // Function to process each image
  const processImage = (imageBuffer, index, workerIndex) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, 'worker.js'));

      activeWorkers.push(worker); // Track the worker for graceful shutdown

      worker.on('message', (optimizedImage) => {
        // Save the optimized image to disk
        const outputPath = path.join(__dirname, 'optimized_images', `optimized_${Date.now()}_${index}.png`);
        fs.writeFile(outputPath, optimizedImage, (err) => {
          if (err) reject(err);
          else resolve(outputPath);
        });
        worker.terminate();
        activeWorkers = activeWorkers.filter(w => w !== worker); // Remove from active workers
      });

      worker.on('error', (err) => {
        reject(err);
        worker.terminate();
        activeWorkers = activeWorkers.filter(w => w !== worker);
      });

      // Send image data to the worker and log which worker is processing the request
      console.log(`Worker ${workerIndex + 1} is processing image ${index + 1}`);
      worker.postMessage(imageBuffer);
    });
  };

  // Create the folder to store optimized images if not exists
  if (!fs.existsSync(path.join(__dirname, 'optimized_images'))) {
    fs.mkdirSync(path.join(__dirname, 'optimized_images'));
  }

  // Loop through each uploaded image, process them concurrently with varying worker counts
  const imageProcessingPromises = req.files.map((file, index) => {
    const workerIndex = index % numOfCores;  // Distribute work across workers using round-robin
    return processImage(file.buffer, index, workerIndex);
  });

  // Wait for all images to be processed
  Promise.all(imageProcessingPromises)
    .then((processedFiles) => {
      res.send({
        message: 'Images optimized successfully!',
        optimizedImages: processedFiles // Send the paths of the optimized images as a response
      });
    })
    .catch((error) => {
      console.log('Error during image processing:', error);
      res.status(500).send({ error: 'Image optimization failed' });
    });
});

// Graceful shutdown: listen for SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Gracefully shutting down...');
  activeWorkers.forEach(worker => worker.terminate());  // Terminate all active workers
  process.exit(0);  // Exit the process
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});










































// const express = require('express');
// const multer = require('multer');
// const { Worker } = require('worker_threads');
// const path = require('path');
// const sharp = require('sharp');
// const fs = require('fs');

// const app = express();
// const port = 3000;

// // Configure multer to store files in memory
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// app.use(express.json());

// // POST endpoint for optimizing images (support for multiple images)
// app.post('/optimize-image', upload.array('images', 10), (req, res) => {
//   if (!req.files || req.files.length === 0) {
//     return res.status(400).send({ error: 'No image files uploaded' });
//   }

//   const optimizedImages = [];
//   let processedCount = 0;

//   // Function to process each image
//   const processImage = (imageBuffer, index) => {
//     return new Promise((resolve, reject) => {
//       const worker = new Worker(path.join(__dirname, 'worker.js'));

//       worker.on('message', (optimizedImage) => {
//         // Save the optimized image to disk
//         const outputPath = path.join(__dirname, 'optimized_images', `optimized_${Date.now()}_${index}.png`);
//         fs.writeFile(outputPath, optimizedImage, (err) => {
//           if (err) reject(err);
//           else resolve(outputPath);
//         });
//         worker.terminate();
//       });

//       worker.on('error', (err) => {
//         reject(err);
//         worker.terminate();
//       });

//       worker.postMessage(imageBuffer);
//     });
//   };

//   // Create the folder to store optimized images if not exists
//   if (!fs.existsSync(path.join(__dirname, 'optimized_images'))) {
//     fs.mkdirSync(path.join(__dirname, 'optimized_images'));
//   }

//   // Loop through each uploaded image, process them concurrently
//   const imageProcessingPromises = req.files.map((file, index) => {
//     return processImage(file.buffer, index);
//   });

//   // Wait for all images to be processed
//   Promise.all(imageProcessingPromises)
//     .then((processedFiles) => {
//       res.send({
//         message: 'Images optimized successfully!',
//         optimizedImages: processedFiles // Send the paths of the optimized images as a response
//       });
//     })
//     .catch((error) => {
//       console.log('Error during image processing:', error);
//       res.status(500).send({ error: 'Image optimization failed' });
//     });
// });

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });
