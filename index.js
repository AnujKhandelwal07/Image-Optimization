
const express = require('express');
const multer = require('multer');
const { Worker } = require('worker_threads');
const path = require('path');
const fs = require('fs');
const os = require('os');
const ImageLog = require('./ImageLog'); 
const sequelize = require('./db');


const app = express();
const port = 3000;

// multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

// Get the number of CPU cores
const numOfCores = os.cpus().length;

let activeWorkers = [];

app.post('/optimize-image', upload.array('images', 100), async (req, res) => {
  if (!req.files || req.files.length === 0) {
      return res.status(400).send({ error: 'No image files uploaded' });
  }

  const startTime = Date.now(); // Log the overall start time

  const optimizedImages = [];
  let processedCount = 0;

  // Loop through each file and log the original size
  req.files.forEach((file, index) => {
      console.log(`Original size of image ${index + 1}: ${file.size} bytes`);
  });

  // Function to process each image
  const processImage = (imageBuffer, index, workerIndex) => {
      return new Promise(async (resolve, reject) => {
          const workerStartTime = Date.now(); // Log the start time for this worker

          const worker = new Worker(path.join(__dirname, 'worker.js'));

          activeWorkers.push(worker);

          // Log entry before processing starts
          const imageLog = await ImageLog.create({
              original_name: req.files[index].originalname,
              status: 'processing',
              start_time: new Date(workerStartTime),
              original_size: req.files[index].size 
          });

          worker.on('message', (optimizedImage) => {
              const workerEndTime = Date.now(); // Log the end time for this worker

              // Log the time taken by this worker to process the image
              console.log(`Image ${index + 1} processed by worker ${workerIndex + 1} in ${workerEndTime - workerStartTime}ms`);

              // Save the optimized image to disk
              const outputPath = path.join(__dirname, 'optimized_images', `optimized_${Date.now()}_${index}.png`);
              fs.writeFile(outputPath, optimizedImage, async (err) => {
                  if (err) reject(err);
                  else {
                      const optimizedSize = optimizedImage.length;

                      // Update the log entry after successful processing
                      await imageLog.update({
                          optimized_path: outputPath,
                          status: 'successful',
                          end_time: new Date(workerEndTime),
                          processing_duration: workerEndTime - workerStartTime,
                          optimized_size: optimizedSize 
                      });

                      resolve(outputPath);
                  }
              });

              worker.terminate();
              activeWorkers = activeWorkers.filter(w => w !== worker); // Remove from active workers
          });

          worker.on('error', async (err) => {
              const workerEndTime = Date.now();

              // Log the error and update the log entry
              await imageLog.update({
                  status: 'failed',
                  error_message: err.message,
                  end_time: new Date(workerEndTime),
                  processing_duration: workerEndTime - workerStartTime,
              });

              reject(err);
              worker.terminate();
              activeWorkers = activeWorkers.filter(w => w !== worker);
          });

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
      const workerIndex = index % numOfCores; 
      return processImage(file.buffer, index, workerIndex);
  });

  // Wait for all images to be processed
  Promise.allSettled(imageProcessingPromises)
      .then(async (processedFiles) => {
          const endTime = Date.now(); // Log the overall end time

          // Log the total time for processing all images
          console.log(`Total time for processing all images: ${endTime - startTime}ms`);

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

