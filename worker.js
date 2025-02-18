<<<<<<< HEAD

const { parentPort } = require('worker_threads');
const sharp = require('sharp');

// Handle image optimization inside the worker thread
parentPort.on('message', async (imageBuffer) => {
  const startTime = Date.now(); // Log the start time

  try {
    // Perform image processing (resize in this case)
    const optimizedImage = await sharp(imageBuffer)
      .resize(200, 200) // Resize the image (example task)
      .toBuffer(); // Return optimized image buffer

    const endTime = Date.now(); // Log the end time

    // Log the time taken by this worker to process the image
    console.log(`Worker completed task in ${endTime - startTime}ms`);

    parentPort.postMessage(optimizedImage); // Send the result back to the main thread
  } catch (error) {
    parentPort.postMessage({ error: 'Image optimization failed' });
  }
});
=======
const { parentPort } = require('worker_threads');
const sharp = require('sharp');

// Handle image optimization inside the worker thread
parentPort.on('message', async (imageBuffer) => {
  const startTime = Date.now(); // Log the start time

  try {
    // Perform image processing (resize in this case)
    const optimizedImage = await sharp(imageBuffer)
      .resize(200, 200) // Resize the image (example task)
      .toBuffer(); // Return optimized image buffer

    const endTime = Date.now(); // Log the end time

    // Log the time taken by this worker to process the image
    console.log(`Worker completed task in ${endTime - startTime}ms`);

    parentPort.postMessage(optimizedImage); // Send the result back to the main thread
  } catch (error) {
    parentPort.postMessage({ error: 'Image optimization failed' });
  }
});
>>>>>>> dcf98f139997ca05d3dcdb6f287c579d47c95033
