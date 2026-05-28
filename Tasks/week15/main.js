const videoElement = document.getElementById('webcam');
const robotEl = document.getElementById('robot');

const GE = new fp.GestureEstimator([
    fp.Gestures.ThumbsUp,
    fp.Gestures.Victory,
]);

function playRobotAnimation(animationName) {
    const currentAnimation = robotEl.getAttribute('animation-mixer');
    
    if (currentAnimation && currentAnimation.clip === animationName) {
        return;
    }

    robotEl.setAttribute('animation-mixer', {
        clip: animationName,
        loop: 'repeat',
        crossFadeDuration: 0.4
    });
    
    console.log(`Робот виконує: ${animationName}`);
}

function onResults(results) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        playRobotAnimation('Idle');
        return;
    }

    const landmarks = results.multiHandLandmarks[0];
    const gestureEstimation = GE.estimate(landmarks, 8.0);
    
    if (gestureEstimation.gestures && gestureEstimation.gestures.length > 0) {
        const strongestGesture = gestureEstimation.gestures.reduce((p, c) => {
            return (p.confidence > c.confidence) ? p : c;
        });

        switch(strongestGesture.name) {
            case 'thumbs_up':
                playRobotAnimation('ThumbsUp');
                break;
            case 'victory':
                playRobotAnimation('Dance');
                break;
            case 'wave_hand':
                playRobotAnimation('Wave');
                break;
            case 'fist':
                playRobotAnimation('Punch');
                break;
            default:
                playRobotAnimation('Idle');
        }
    } else {
        playRobotAnimation('Idle');
    }
}

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({image: videoElement});
    },
    width: 640,
    height: 480
});
camera.start();