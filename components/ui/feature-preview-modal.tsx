import React, { useState, useEffect, useRef } from 'react';
import { GYM_FEATURES, FeatureDefinition, FeatureStatus } from '../../shared/featureStatus';

export interface FeaturePreviewModalProps {
  featureId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onLaunch?: (route: string) => void;
  onJoinWaitlist?: (email: string, featureId: string) => Promise<{ ok: boolean; message: string }>;
}

export const FeaturePreviewModal: React.FC<FeaturePreviewModalProps> = ({
  featureId,
  isOpen,
  onClose,
  onLaunch,
  onJoinWaitlist,
}) => {
  const [email, setEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Sandbox states
  // 1. formCorrectionAi state
  const [squatDepth, setSquatDepth] = useState<number>(89);
  const [isPlayingForm, setIsPlayingForm] = useState<boolean>(true);
  const formCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 2. wearableSync state
  const [isBleConnected, setIsBleConnected] = useState<boolean>(true);
  const [heartRate, setHeartRate] = useState<number>(148);
  const [hrZone, setHrZone] = useState<string>('Zone 4 - Anaerobic');

  // 3. gymCrowdMeter state
  const [currentOccupancy, setCurrentOccupancy] = useState<number>(68);
  const [racksUsed, setRacksUsed] = useState<number>(3);
  const [benchesUsed, setBenchesUsed] = useState<number>(5);
  const [cardioUsed, setCardioUsed] = useState<number>(12);

  const refreshGymTelemetry = () => {
    setCurrentOccupancy(Math.round(52 + Math.random() * 36));
    setRacksUsed(Math.floor(Math.random() * 2) + 3);
    setBenchesUsed(Math.floor(Math.random() * 2) + 4);
    setCardioUsed(Math.floor(Math.random() * 6) + 10);
  };

  // 4. mealPlanAi state
  const [proteinTarget, setProteinTarget] = useState<number>(165);

  // 5. bodyScan3D state
  const rotAngleRef = useRef<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const bodyCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const feature: FeatureDefinition | undefined = featureId ? GYM_FEATURES[featureId] : undefined;

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setWaitlistStatus('idle');
      setFeedbackMessage('');
    }
  }, [isOpen, featureId]);

  // Form correction animation
  useEffect(() => {
    if (!isOpen || featureId !== 'formCorrectionAi') return;
    let animId: number;
    let angle = 0;

    const canvas = formCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (isPlayingForm) {
        angle += 0.04;
        // Oscillate depth between 75 and 115 degrees
        const currentAngle = Math.round(92 + 20 * Math.sin(angle));
        setSquatDepth(currentAngle);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background grid
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Bar path vertical ideal line
      const barX = 170;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(barX, 40);
      ctx.lineTo(barX, 260);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current bar path curve
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(barX, 50);
      const wobble = Math.sin(angle) * 8;
      ctx.quadraticCurveTo(barX + wobble, 140, barX + (wobble * 0.5), 230);
      ctx.stroke();

      // Stick figure athlete
      const hipY = 150 + Math.sin(angle) * 35;
      const kneeY = 220;
      const kneeX = 140;
      const hipX = 180 + Math.sin(angle) * 15;
      const headY = hipY - 70;
      const ankleX = 145;
      const ankleY = 270;

      // Joints & skeleton
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Head
      ctx.beginPath();
      ctx.arc(hipX - 10, headY, 14, 0, Math.PI * 2);
      ctx.fill();

      // Torso
      ctx.beginPath();
      ctx.moveTo(hipX - 10, headY + 14);
      ctx.lineTo(hipX, hipY);
      ctx.stroke();

      // Thigh
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(kneeX, kneeY);
      ctx.stroke();

      // Shin
      ctx.beginPath();
      ctx.moveTo(kneeX, kneeY);
      ctx.lineTo(ankleX, ankleY);
      ctx.stroke();

      // Foot
      ctx.beginPath();
      ctx.moveTo(ankleX, ankleY);
      ctx.lineTo(ankleX + 25, ankleY);
      ctx.stroke();

      // Barbell on shoulders
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(hipX - 5, headY + 22, 9, 0, Math.PI * 2);
      ctx.fill();

      // Keypoints markers
      const joints = [
        { x: hipX, y: hipY, label: 'Hip' },
        { x: kneeX, y: kneeY, label: 'Knee' },
        { x: ankleX, y: ankleY, label: 'Ankle' }
      ];
      joints.forEach(j => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(j.x, j.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, featureId, isPlayingForm]);

  // Wearable live ticker
  useEffect(() => {
    if (!isOpen || featureId !== 'wearableSync' || !isBleConnected) return;
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.5) * 4;
      setHeartRate(prev => {
        const next = Math.min(185, Math.max(120, Math.round(prev + delta)));
        if (next < 130) setHrZone('Zone 2 - Aerobic Base');
        else if (next < 145) setHrZone('Zone 3 - Aerobic Threshold');
        else if (next < 165) setHrZone('Zone 4 - Anaerobic / Lactate');
        else setHrZone('Zone 5 - Neuromuscular Peak');
        return next;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isOpen, featureId, isBleConnected]);

  // 3D Body Mesh Rotation Canvas
  useEffect(() => {
    if (!isOpen || featureId !== 'bodyScan3D') return;
    let animId: number;
    const canvas = bodyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (isAutoRotating) {
        rotAngleRef.current += 0.018;
      }
      const rot = rotAngleRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw wireframe silhouette
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;

      // 3D Elliptical slices with Chest, Waist, Biceps calipers
      const slices = [
        { y: -105, rx: 20, ry: 15, label: 'Head' },
        { y: -65, rx: 32, ry: 20, label: 'Neck/Traps' },
        { y: -30, rx: 50, ry: 30, label: 'Chest: 41.5"', caliper: true },
        { y: -5, rx: 26, ry: 18, label: 'Biceps: 15.4"', caliper: true },
        { y: 20, rx: 38, ry: 25, label: 'Waist: 32.2"', caliper: true },
        { y: 55, rx: 46, ry: 28, label: 'Hips: 39.8"' },
        { y: 100, rx: 24, ry: 18, label: 'Thigh: 24.1"' },
        { y: 140, rx: 18, ry: 12, label: 'Calf: 15.6"' }
      ];

      slices.forEach(s => {
        const py = cy + s.y;
        const currentRx = s.rx * Math.abs(Math.cos(rot)) + s.ry * Math.abs(Math.sin(rot));
        ctx.beginPath();
        ctx.ellipse(cx, py, currentRx, 8, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Caliper callouts
        if (s.caliper) {
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.arc(cx + currentRx, py, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#f8fafc';
          ctx.font = '11px sans-serif';
          ctx.fillText(s.label, cx + currentRx + 12, py + 4);

          ctx.setLineDash([2, 2]);
          ctx.strokeStyle = '#0891b2';
          ctx.beginPath();
          ctx.moveTo(cx + currentRx, py);
          ctx.lineTo(cx + currentRx + 10, py);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Vertical spine line
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 115);
      ctx.lineTo(cx, cy + 150);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, featureId, isAutoRotating]);

  if (!isOpen || !feature) return null;

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setWaitlistStatus('error');
      setFeedbackMessage('Please enter a valid email address.');
      return;
    }

    setWaitlistStatus('submitting');
    try {
      if (onJoinWaitlist) {
        const res = await onJoinWaitlist(cleanEmail, feature.id);
        setWaitlistStatus(res.ok ? 'success' : 'error');
        setFeedbackMessage(res.message);
      } else {
        // Direct API call fallback
        const res = await fetch('/api/features/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, featureId: feature.id })
        });
        const data = await res.json();
        if (res.ok) {
          setWaitlistStatus('success');
          setFeedbackMessage(data.message || 'You are on the priority early-access waitlist!');
        } else {
          setWaitlistStatus('error');
          setFeedbackMessage(data.error || 'Failed to register. Please try again.');
        }
      }
    } catch (err: any) {
      setWaitlistStatus('error');
      setFeedbackMessage(err.message || 'Network error submitting waitlist.');
    }
  };

  const getStatusBadge = (status: FeatureStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live in Production
          </span>
        );
      case 'beta':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Public Beta
          </span>
        );
      case 'coming-soon':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            In Active Development
          </span>
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feature-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700">
                {feature.category}
              </span>
              {getStatusBadge(feature.status)}
              {feature.estimatedArrival && (
                <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-zinc-800/80 text-zinc-400">
                  ETA: {feature.estimatedArrival}
                </span>
              )}
            </div>
            <h2 id="feature-modal-title" className="text-2xl font-bold tracking-tight text-white">
              {feature.name}
            </h2>
            <p className="text-sm text-zinc-400">{feature.tagline}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close feature details modal"
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Honest Explanation Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Operational Capability & Reality</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">{feature.description}</p>
            {feature.technicalReason && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span className="font-semibold text-amber-200">Engineering Notice: </span>
                  {feature.technicalReason}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Live Sandbox Section */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Interactive Live Sandbox Simulator
                </span>
              </div>
              <span className="text-[11px] text-zinc-500">Real-time Preview</span>
            </div>

            {/* Sandbox 1: formCorrectionAi */}
            {feature.id === 'formCorrectionAi' && (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex justify-center items-center py-2">
                  <canvas ref={formCanvasRef} width={340} height={280} className="w-full max-w-[340px] h-[280px]" />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2.5 py-1 rounded text-xs border border-zinc-700">
                    <span className="text-zinc-400">Squat Depth: </span>
                    <span className={`font-mono font-bold ${squatDepth <= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {squatDepth <= 90 ? 'Parallel Achieved' : 'Above Parallel'} ({squatDepth}°)
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur px-2.5 py-1 rounded text-xs border border-zinc-700 text-emerald-400">
                    Bar Path: 94% Centered
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPlayingForm(!isPlayingForm)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition"
                    >
                      {isPlayingForm ? 'Pause Simulation' : 'Resume Animation'}
                    </button>
                    <span>Hip Depth angle: <strong className="text-zinc-200">{squatDepth}°</strong></span>
                  </div>
                  <span className="text-emerald-400 font-semibold">120 FPS Pose Engine</span>
                </div>
              </div>
            )}

            {/* Sandbox 2: wearableSync */}
            {feature.id === 'wearableSync' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-zinc-900/90 p-3 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold">
                      HR
                    </div>
                    <div>
                      <div className="text-xs text-zinc-400">Simulated Heart Rate</div>
                      <div className="text-2xl font-black font-mono text-white flex items-baseline gap-1">
                        {isBleConnected ? heartRate : '--'} <span className="text-xs font-normal text-zinc-400">BPM</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-400">Zone Telemetry</div>
                    <div className={`text-xs font-bold ${isBleConnected ? 'text-amber-400' : 'text-zinc-500'}`}>
                      {isBleConnected ? hrZone : 'Signal Disconnected'}
                    </div>
                  </div>
                </div>

                {/* Simulated ECG pulse graph */}
                <div className="h-16 bg-zinc-900 rounded-lg border border-zinc-800 p-2 flex items-center justify-center relative overflow-hidden">
                  <div className="w-full flex items-center justify-around gap-1 h-8">
                    {[30, 45, 90, 20, 60, 100, 35, 25, 75, 40, 95, 30, 45, 85].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all duration-300 ${
                          isBleConnected ? 'bg-red-400' : 'bg-zinc-700'
                        }`}
                        style={{ height: isBleConnected ? `${h}%` : '20%' }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setIsBleConnected(!isBleConnected)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      isBleConnected ? 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {isBleConnected ? '✓ BLE Device Connected (Apple Watch Ultra)' : 'Simulate BLE Connection'}
                  </button>
                  <span className="text-zinc-400">Telemetry: 2.4 GHz Low Energy</span>
                </div>
              </div>
            )}

            {/* Sandbox 3: gymCrowdMeter */}
            {feature.id === 'gymCrowdMeter' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                  <div>
                    <div className="text-xs text-zinc-400">Current Occupancy</div>
                    <div className="text-2xl font-black text-amber-400">{currentOccupancy}% Capacity</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-400">Peak Hours Forecast</div>
                    <div className="text-sm font-bold text-zinc-200">6:00 PM (88% Peak)</div>
                  </div>
                </div>

                {/* Equipment breakdown bars */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-zinc-300 mb-1">
                      <span>Squat Racks</span>
                      <strong className="text-amber-400">{racksUsed} of 4 in use ({Math.round((racksUsed / 4) * 100)}%)</strong>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${Math.round((racksUsed / 4) * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-zinc-300 mb-1">
                      <span>Bench Press Stations</span>
                      <strong className="text-red-400">{benchesUsed} of 6 in use ({Math.round((benchesUsed / 6) * 100)}%)</strong>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div className="bg-red-400 h-2 rounded-full" style={{ width: `${Math.round((benchesUsed / 6) * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-zinc-300 mb-1">
                      <span>Cardio Treadmills</span>
                      <strong className="text-emerald-400">{cardioUsed} of 20 in use ({Math.round((cardioUsed / 20) * 100)}%)</strong>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${Math.round((cardioUsed / 20) * 100)}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <span>Privacy-preserving BLE Sensor Grid</span>
                  <button
                    type="button"
                    onClick={refreshGymTelemetry}
                    className="text-cyan-400 hover:underline"
                  >
                    Refresh Sensor Heatmap
                  </button>
                </div>
              </div>
            )}

            {/* Sandbox 4: mealPlanAi */}
            {feature.id === 'mealPlanAi' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-zinc-300">Daily Protein Target:</span>
                    <strong className="text-cyan-400 font-mono text-sm">{proteinTarget}g Protein</strong>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="220"
                    step="5"
                    value={proteinTarget}
                    onChange={(e) => setProteinTarget(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-zinc-800 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                    <span>120g (Maintenance)</span>
                    <span>170g (Lean Bulk)</span>
                    <span>220g (Maximum Anabolism)</span>
                  </div>
                </div>

                {/* Instant macro meal breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="font-semibold text-zinc-200">Meal 1: Protein Oats</div>
                    <div className="text-zinc-400">{Math.round(proteinTarget * 0.22)}g P | 420 kcal</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="font-semibold text-zinc-200">Meal 2: Chicken & Quinoa</div>
                    <div className="text-zinc-400">{Math.round(proteinTarget * 0.35)}g P | 580 kcal</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="font-semibold text-zinc-200">Meal 3: Whey Post-Workout</div>
                    <div className="text-zinc-400">{Math.round(proteinTarget * 0.18)}g P | 170 kcal</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="font-semibold text-zinc-200">Meal 4: Salmon & Sweet Potato</div>
                    <div className="text-zinc-400">{Math.round(proteinTarget * 0.25)}g P | 610 kcal</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
                  <span>Total Calculated: {proteinTarget}g Protein • {Math.round(proteinTarget * 13.8)} kcal</span>
                  <span className="font-semibold">1-Click Instacart Ready</span>
                </div>
              </div>
            )}

            {/* Sandbox 5: bodyScan3D */}
            {feature.id === 'bodyScan3D' && (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex justify-center items-center py-2">
                  <canvas ref={bodyCanvasRef} width={340} height={280} className="w-full max-w-[340px] h-[280px]" />
                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur px-2.5 py-1 rounded text-xs border border-zinc-700 text-cyan-300">
                    WebGPU 3D NeRF Mesh
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur px-2 py-0.5 rounded text-[11px] border border-zinc-800 text-zinc-400">
                    Milimeter Tape Caliper Model
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <button
                    type="button"
                    onClick={() => setIsAutoRotating(!isAutoRotating)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition"
                  >
                    {isAutoRotating ? 'Pause 360° Spin' : 'Resume 360° Spin'}
                  </button>
                  <span>ISO 8559-1 Anatomical Level Mapping</span>
                </div>
              </div>
            )}

            {/* Default sandbox for other features */}
            {!['formCorrectionAi', 'wearableSync', 'gymCrowdMeter', 'mealPlanAi', 'bodyScan3D'].includes(feature.id) && (
              <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-center space-y-2">
                <div className="text-sm font-semibold text-zinc-200">{feature.name} Live Environment</div>
                <p className="text-xs text-zinc-400">
                  This feature is currently configured and operational in production. You can access it directly inside the web app.
                </p>
                <div className="inline-block px-3 py-1 rounded bg-zinc-800 font-mono text-xs text-zinc-300">
                  Route: {feature.actionRoute || '/app'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-950/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          {feature.status === 'available' || feature.status === 'beta' ? (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-zinc-400">
                {feature.status === 'available' ? 'Ready for immediate use.' : 'Experimental public beta release.'}
              </span>
              <a
                href={feature.actionRoute || '/'}
                onClick={(e) => {
                  if (onLaunch && feature.actionRoute) {
                    e.preventDefault();
                    onLaunch(feature.actionRoute);
                  }
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-zinc-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 transition-all text-center shadow-lg shadow-emerald-500/20"
              >
                Launch Feature in App →
              </a>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="w-full space-y-2">
              <div className="text-xs font-semibold text-zinc-300">
                Get Early Access: Enter your email to be notified when this launches
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  disabled={waitlistStatus === 'submitting'}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 transition active:scale-95 disabled:opacity-50 whitespace-nowrap"
                >
                  {waitlistStatus === 'submitting' ? 'Submitting...' : 'Join Waitlist'}
                </button>
              </div>
              {feedbackMessage && (
                <div
                  className={`text-xs p-2 rounded-lg ${
                    waitlistStatus === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {feedbackMessage}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
