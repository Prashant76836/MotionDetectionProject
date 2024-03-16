document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const startCameraBtn = document.getElementById("startCameraBtn");
    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");

    let isCameraStarted = false;
    let isDetectionRunning = false;
    let previousFrame;
    const threshold = 30;

    startCameraBtn.addEventListener("click", startCamera);
    startBtn.addEventListener("click", startDetection);
    stopBtn.addEventListener("click", stopDetection);

    function startCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(handleSuccess)
            .catch(handleError);
    }

    function handleSuccess(stream) {
        video.srcObject = stream;
        video.addEventListener("loadeddata", function () {
            canvas.style.display = "block";
            startCameraBtn.disabled = true;
            startBtn.disabled = false;
            stopBtn.disabled = false;
            isCameraStarted = true;
        });
    }

    function handleError(error) {
        console.error("Error accessing webcam:", error);
    }

    function startDetection() {
        if (!isCameraStarted) {
            alert("Please start the camera first.");
            return;
        }

        isDetectionRunning = true;
        detectMotion();
    }

    function stopDetection() {
        isDetectionRunning = false;
        startCameraBtn.disabled = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        canvas.style.display = "none";
        video.srcObject.getTracks()[0].stop();
    }

    function detectMotion() {
        function processFrame() {
            if (!isDetectionRunning) {
                return;
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

            if (previousFrame) {
                const diffFrame = new ImageData(canvas.width, canvas.height);
                for (let i = 0; i < currentFrame.data.length; i += 4) {
                    const diff = Math.abs(previousFrame.data[i] - currentFrame.data[i]);
                    if (diff > threshold) {
                        diffFrame.data[i] = 255;
                        diffFrame.data[i + 1] = 0;
                        diffFrame.data[i + 2] = 0;
                        diffFrame.data[i + 3] = 255;
                    }
                }

                ctx.putImageData(diffFrame, 0, 0);
            }

            previousFrame = currentFrame;

            if (isDetectionRunning) {
                requestAnimationFrame(processFrame);
            }
        }

        startCameraBtn.disabled = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        canvas.style.display = "block";

        processFrame();
    }
});
