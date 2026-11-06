import React, { useState } from 'react';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Button';
import { Input, SegmentedPills } from '@/components/ui/Inputs';
import { StateData, UserProfile } from '@/lib/api';
import { bmrMifflinStJeor, calculateTDEE, calculateMacros } from '@/lib/algo';
import {
  User,
  Shield,
  Download,
  Trash2,
  Check,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export interface ProfileViewProps {
  state: StateData;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onResetAllData: () => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  state,
  onUpdateProfile,
  onResetAllData,
  showToast,
}) => {
  const { profile } = state;
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [isEraseModalOpen, setIsEraseModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleRecalculateMifflin = () => {
    const bmr = bmrMifflinStJeor(formData.weightKg, formData.heightCm, formData.age, formData.gender);
    const tdee = calculateTDEE(bmr, 'moderate');
    // For hypertrophy, add 300 kcal surplus
    const surplus = formData.goal === 'hypertrophy' || formData.goal === 'gain' ? 300 : formData.goal === 'loss' ? -400 : 0;
    const targetCal = tdee + surplus;
    const macroTargets = calculateMacros(targetCal, formData.goal, formData.weightKg);

    setFormData(prev => ({
      ...prev,
      bmr,
      tdee,
      targetCalories: targetCal,
      macros: {
        protein: macroTargets.protein,
        carbs: macroTargets.carbs,
        fat: macroTargets.fat,
      },
    }));
    showToast('Recalculated BMR, TDEE and Macro split using Mifflin-St Jeor equation!', 'info');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSavedSuccess(true);
    showToast('Biometrics and metabolic targets saved successfully.', 'success');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `fitfuel_athlete_export_${profile.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Complete state exported as JSON file.', 'success');
  };

  const handleConfirmErase = () => {
    onResetAllData();
    setIsEraseModalOpen(false);
    showToast('Account data permanently erased and restored to default seed.', 'warning');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-normal">
      {/* Header */}
      <div className="pb-2 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text">
            Athlete Biometrics & Target Overrides
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Configure physiological measurements, scientific energy models, and privacy controls.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleExportJSON} className="text-xs">
            <Download className="w-4 h-4 mr-1.5" />
            Export All Data (JSON)
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Core Biometrics Card */}
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-accent" />
              <h2 className="font-display font-extrabold text-base text-text">
                Personal Anthropometric Profile
              </h2>
            </div>
            <button
              type="button"
              onClick={handleRecalculateMifflin}
              className="text-xs font-mono font-bold text-accent hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Auto-Recompute via Mifflin-St Jeor
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Age (Years)"
              type="number"
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1.5">
                Biological Sex
              </label>
              <SegmentedPills
                value={formData.gender}
                onChange={g => setFormData({ ...formData, gender: g })}
                options={[
                  { label: 'Male', value: 'male' },
                  { label: 'Female', value: 'female' },
                ]}
                className="w-full"
              />
            </div>

            <Input
              label="Height (cm)"
              type="number"
              value={formData.heightCm}
              onChange={e => setFormData({ ...formData, heightCm: Number(e.target.value) })}
              required
            />

            <Input
              label="Current Weight (kg)"
              type="number"
              step="0.1"
              value={formData.weightKg}
              onChange={e => setFormData({ ...formData, weightKg: Number(e.target.value) })}
              required
            />

            <Input
              label="Target Goal Weight (kg)"
              type="number"
              step="0.1"
              value={formData.targetWeightKg}
              onChange={e => setFormData({ ...formData, targetWeightKg: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1.5">
                Primary Athletic Objective
              </label>
              <select
                value={formData.goal}
                onChange={e => setFormData({ ...formData, goal: e.target.value as any })}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-text focus-visible:outline focus-visible:outline-accent"
              >
                <option value="hypertrophy">Muscle Hypertrophy (+300 kcal Surplus)</option>
                <option value="loss">Fat Loss / Caloric Deficit (-400 kcal)</option>
                <option value="maintenance">Eucaloric Maintenance Balance</option>
                <option value="gain">Maximum Power / Bulk (+500 kcal)</option>
              </select>
            </div>

            <Input
              label="Assigned Training Split"
              value={formData.split}
              onChange={e => setFormData({ ...formData, split: e.target.value })}
              required
            />
          </div>
        </Card>

        {/* Target Overrides Card */}
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Shield className="w-5 h-5 text-accent" />
            <h2 className="font-display font-extrabold text-base text-text">
              Target Overrides & Daily Macro Ceilings
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <Input
              label="Target Calories (kcal)"
              type="number"
              value={formData.targetCalories}
              onChange={e => setFormData({ ...formData, targetCalories: Number(e.target.value) })}
              required
            />
            <Input
              label="Protein Target (g)"
              type="number"
              value={formData.macros.protein}
              onChange={e =>
                setFormData({
                  ...formData,
                  macros: { ...formData.macros, protein: Number(e.target.value) },
                })
              }
              required
            />
            <Input
              label="Carbohydrates Target (g)"
              type="number"
              value={formData.macros.carbs}
              onChange={e =>
                setFormData({
                  ...formData,
                  macros: { ...formData.macros, carbs: Number(e.target.value) },
                })
              }
              required
            />
            <Input
              label="Fats Target (g)"
              type="number"
              value={formData.macros.fat}
              onChange={e =>
                setFormData({
                  ...formData,
                  macros: { ...formData.macros, fat: Number(e.target.value) },
                })
              }
              required
            />
          </div>

          <Button type="submit" variant="primary" className="w-full sm:w-auto text-xs px-8">
            {savedSuccess ? 'Changes Saved ✓' : 'Save Biometric Updates'}
          </Button>
        </Card>

        {/* Danger Zone: Permanently Erase Account */}
        <div className="p-6 rounded-2xl bg-danger/10 border border-danger/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-sm text-danger flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone: Account & Biometric Purge
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Permanently wipe all local cached workouts, food entries, and anthropometric records.
            </p>
          </div>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setIsEraseModalOpen(true)}
            className="text-xs whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Permanently Erase Account
          </Button>
        </div>
      </form>

      {/* Confirmation Modal for Permanent Erase */}
      {isEraseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-surface border border-danger/50 rounded-2xl p-6 text-center shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-danger mx-auto mb-3" />
            <h3 className="font-display font-extrabold text-lg text-text mb-2">
              Confirm Account Erasure
            </h3>
            <p className="text-xs text-text-muted leading-relaxed mb-6">
              This action cannot be undone. All your workout records, PR history, and nutrition logs will be purged and restored to default Jordan Davis demonstration parameters.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsEraseModalOpen(false)}
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmErase}
                className="flex-1 text-xs"
              >
                Yes, Purge Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
