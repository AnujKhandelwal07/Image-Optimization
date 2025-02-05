// const { parentPort } = require('worker_threads');
// const sharp = require('sharp');

// // Handle image optimization inside the worker thread
// parentPort.on('message', async (imageBuffer) => {
//   try {
//     // Perform image processing (resize in this case)
//     const optimizedImage = await sharp(imageBuffer)
//       .resize(200, 200) // Resize the image (example task)
//       .toBuffer(); // Return optimized image buffer
    
//     parentPort.postMessage(optimizedImage); // Send the result back to the main thread
//   } catch (error) {
//     parentPort.postMessage({ error: 'Image optimization failed' });
//   }
// });

const { parentPort } = require('worker_threads');
const sharp = require('sharp');

// Handle image optimization inside the worker thread
parentPort.on('message', async (imageBuffer) => {
  try {
    // Perform image processing (resize in this case)
    const optimizedImage = await sharp(imageBuffer)
      .resize(200, 200) // Resize the image (example task)
      .toBuffer(); // Return optimized image buffer
    
    parentPort.postMessage(optimizedImage); // Send the result back to the main thread
  } catch (error) {
    parentPort.postMessage({ error: 'Image optimization failed' });
  }
});
