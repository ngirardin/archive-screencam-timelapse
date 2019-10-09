// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const fs = require("fs");
const screenshotDesktop = require("screenshot-desktop");
const electron = require("electron");

const videoTag = document.createElement("video");

const main = async () => {
  electron.remote.getCurrentWindow().hide();

  setInterval(async () => {
    const time = new Date().getTime();
    takePhoto(videoTag, time);
    await takeScreenshot(time);
  }, 60 * 1000);
};

const takePhoto = (videoTag, timestamp) => {
  console.log("Taking photo");

  let theStream;

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(stream => {
      theStream = stream;
      videoTag.srcObject = theStream; // don't use createObjectURL(MediaStream)
      return videoTag.play();
    })
    .then(() => {
      // Take a picture
      const canvas = document.createElement("canvas"); // create a canvas
      const ctx = canvas.getContext("2d"); // get its context
      canvas.width = videoTag.videoWidth; // set its size to the one of the video
      canvas.height = videoTag.videoHeight;
      ctx.drawImage(videoTag, 0, 0); // the video
      const dataURL = canvas.toDataURL("image/jpeg"); // request a Blob from the canvas

      // Save the picture
      fs.writeFileSync(
        `pics/${timestamp}_webcam.jpg`,
        dataURL.replace(/^data:image\/jpeg;base64,/, ""),
        "base64"
      );

      // Stop the stream
      theStream.getTracks()[0].stop();
    });
};

const takeScreenshot = async timestamp => {
  console.log("Taking screenshot");

  const screenshots = await screenshotDesktop.all();

  screenshots.forEach((screenshot /*: ArrayBuffer*/, index /*: number*/) => {
    fs.writeFileSync(`pics/${timestamp}_screen_${index}.jpg`, screenshot);
  });
};

main();
