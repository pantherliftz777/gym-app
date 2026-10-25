/* FitFuel MediaPipe Real-Time Pose Engine & Biomechanical Analyzer */
(function() {
  'use strict';

  let poseDetector = null;
  let isPoseRunning = false;
  let repCount = 0;
  let currentExercise = 'squat'; // squat, deadlift, press
  let repState = 'standing'; // standing -> descending -> bottom -> ascending -> complete

  // Calculate angle between three 2D/3D points: A -> B (vertex) -> C
  function calculateAngle(a, b, c) {
    if (!a || !b || !c) return 0;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360.0 - angle;
    return Math.round(angle);
  }

  // Draw skeletal landmark lines on canvas
  function drawSkeleton(ctx, landmarks, width, height, isFormValid) {
    if (!landmarks || landmarks.length === 0) return;

    const connections = [
      [11, 12], // Shoulders
      [11, 13], [13, 15], // Left arm
      [12, 14], [14, 16], // Right arm
      [11, 23], [12, 24], // Torso
      [23, 24], // Hips
      [23, 25], [25, 27], // Left leg
      [24, 26], [26, 28]  // Right leg
    ];

    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = isFormValid ? '#10b981' : '#f43f5e';
    ctx.shadowColor = isFormValid ? 'rgba(16, 185, 129, 0.7)' : 'rgba(244, 63, 94, 0.7)';
    ctx.shadowBlur = 12;

    for (const [i, j] of connections) {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      if (p1 && p2 && (p1.visibility === undefined || p1.visibility > 0.5) && (p2.visibility === undefined || p2.visibility > 0.5)) {
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }
    }

    // Draw key joint circles
    for (const idx of [11, 12, 23, 24, 25, 26, 27, 28]) {
      const p = landmarks[idx];
      if (p && (p.visibility === undefined || p.visibility > 0.5)) {
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = isFormValid ? '#10b981' : '#f43f5e';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // Analyze squat biomechanics
  function analyzeSquat(landmarks) {
    const hip = landmarks[24] || landmarks[23];
    const knee = landmarks[26] || landmarks[25];
    const ankle = landmarks[28] || landmarks[27];
    const shoulder = landmarks[12] || landmarks[11];

    if (!hip || !knee || !ankle || !shoulder) return { valid: true, angle: 180, status: 'Aligning body...' };

    const kneeAngle = calculateAngle(hip, knee, ankle);
    const hipHeight = hip.y;
    const kneeHeight = knee.y;

    // Squat Depth Check
    const isAtDepth = kneeAngle <= 95 || hipHeight >= (kneeHeight - 0.02);
    let statusText = 'Stand tall & brace core';

    if (kneeAngle > 160) {
      if (repState === 'ascending' || repState === 'bottom') {
        repState = 'standing';
        repCount++;
        if (window.FitFuelVoice) {
          window.FitFuelVoice.playSuccessChime();
          window.FitFuelVoice.speak(`Rep ${repCount}!`);
        }
        statusText = `Rep ${repCount} Complete!`;
      } else {
        repState = 'standing';
      }
    } else if (kneeAngle <= 140 && kneeAngle > 105) {
      repState = 'descending';
      statusText = 'Descending — hit parallel';
    } else if (isAtDepth) {
      repState = 'bottom';
      statusText = 'FULL DEPTH REACHED! Drive up!';
    }

    return {
      valid: isAtDepth || repState === 'standing',
      angle: kneeAngle,
      status: statusText,
      repCount: repCount,
      depthPercent: Math.min(100, Math.max(0, Math.round(((160 - kneeAngle) / (160 - 90)) * 100)))
    };
  }

  // Initialize MediaPipe Pose pipeline if loaded from CDN
  async function initPosePipeline(videoEl, canvasEl, onFrameResult) {
    if (typeof window.Pose === 'undefined') {
      console.log('[FitFuel Posture] MediaPipe Pose CDN loading or running in lightweight mode.');
      return false;
    }

    try {
      poseDetector = new window.Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });

      poseDetector.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      poseDetector.onResults(results => {
        if (!canvasEl) return;
        const ctx = canvasEl.getContext('2d');
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

        if (results.poseLandmarks) {
          const analysis = analyzeSquat(results.poseLandmarks);
          drawSkeleton(ctx, results.poseLandmarks, canvasEl.width, canvasEl.height, analysis.valid);
          if (onFrameResult) onFrameResult(analysis);
        }
      });

      return true;
    } catch (err) {
      console.warn('[FitFuel Posture] MediaPipe initialization error:', err);
      return false;
    }
  }

  function resetReps() {
    repCount = 0;
    repState = 'standing';
  }

  if (typeof window !== 'undefined') {
    window.FitFuelPostureAI = {
      calculateAngle,
      analyzeSquat,
      drawSkeleton,
      initPosePipeline,
      resetReps,
      getReps: () => repCount
    };
  }
})();
