import React, { useState } from 'react';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Inputs';
import { StateData, FoodLogState, MealItem } from '@/lib/api';
import { FOOD_DATABASE, FoodItem } from '@/lib/foodData';
import {
  Search,
  Barcode,
  Plus,
  Trash2,
  Clock,
  Camera,
  X,
  Utensils,
  Check,
} from 'lucide-react';

export interface FoodLogViewProps {
  state: StateData;
  onAddMealItem: (slotKey: keyof FoodLogState, item: Omit<MealItem, 'id'>) => void;
  onRemoveMealItem: (slotKey: keyof FoodLogState, itemId: string) => void;
}

export const FoodLogView: React.FC<FoodLogViewProps> = ({
  state,
  onAddMealItem,
  onRemoveMealItem,
}) => {
  const { foodLog, profile } = state;
  const [selectedSlot, setSelectedSlot] = useState<keyof FoodLogState>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [activeBarcodeFood, setActiveBarcodeFood] = useState<FoodItem | null>(null);

  // Search auto-suggest filter
  const suggestions = searchQuery.trim()
    ? FOOD_DATABASE.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSelectFood = (food: FoodItem) => {
    onAddMealItem(selectedSlot, {
      name: food.name,
      calories: food.calories,
      protein: Math.round(food.protein),
      carbs: Math.round(food.carbs),
      fat: Math.round(food.fat),
      grams: food.servingGrams,
    });
    setSearchQuery('');
  };

  const handleSimulateBarcodeScan = (barcodeStr: string) => {
    const found = FOOD_DATABASE.find(f => f.barcode === barcodeStr) || FOOD_DATABASE[3];
    setActiveBarcodeFood(found);
  };

  const confirmBarcodeAdd = () => {
    if (activeBarcodeFood) {
      onAddMealItem(selectedSlot, {
        name: activeBarcodeFood.name,
        calories: activeBarcodeFood.calories,
        protein: Math.round(activeBarcodeFood.protein),
        carbs: Math.round(activeBarcodeFood.carbs),
        fat: Math.round(activeBarcodeFood.fat),
        grams: activeBarcodeFood.servingGrams,
      });
      setActiveBarcodeFood(null);
      setIsBarcodeModalOpen(false);
    }
  };

  // Compute macro totals
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalItemsCount = 0;

  Object.values(foodLog).forEach(slot => {
    slot.items.forEach((item: MealItem) => {
      totalCalories += item.calories;
      totalProtein += item.protein;
      totalCarbs += item.carbs;
      totalFat += item.fat;
      totalItemsCount += 1;
    });
  });

  const slots: { key: keyof FoodLogState; label: string }[] = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'snacks', label: 'Snacks' },
    { key: 'prePostWorkout', label: 'Pre/Post-Workout' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-normal">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text">
            Precision Nutrition & Food Log
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Track daily macronutrients with barcode scan and scientific energy split.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsBarcodeModalOpen(true)}
            className="text-xs border-accent text-accent"
          >
            <Barcode className="w-4 h-4 mr-1.5" />
            Scan Barcode
          </Button>
        </div>
      </div>

      {/* Daily Progress Bars Banner */}
      <div className="p-6 rounded-2xl bg-surface-card border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
              Energy Consumption
            </span>
            <div className="font-mono text-2xl font-black text-text">
              {totalCalories.toLocaleString()}{' '}
              <span className="text-sm font-normal text-text-muted">
                / {profile.targetCalories.toLocaleString()} kcal
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-cyan-400 font-bold block">P: {totalProtein}g</span>
              <span className="text-text-muted">Target {profile.macros.protein}g</span>
            </div>
            <div>
              <span className="text-amber-400 font-bold block">C: {totalCarbs}g</span>
              <span className="text-text-muted">Target {profile.macros.carbs}g</span>
            </div>
            <div>
              <span className="text-rose-500 font-bold block">F: {totalFat}g</span>
              <span className="text-text-muted">Target {profile.macros.fat}g</span>
            </div>
          </div>
        </div>

        {/* Multi-Segment Macro Progress Bar */}
        <div className="w-full bg-surface h-3 rounded-full overflow-hidden flex">
          <div
            className="bg-cyan-400 h-full transition-all"
            style={{ width: `${Math.min(40, (totalProtein / profile.macros.protein) * 30)}%` }}
            title={`Protein: ${totalProtein}g`}
          />
          <div
            className="bg-amber-400 h-full transition-all"
            style={{ width: `${Math.min(40, (totalCarbs / profile.macros.carbs) * 45)}%` }}
            title={`Carbs: ${totalCarbs}g`}
          />
          <div
            className="bg-rose-500 h-full transition-all"
            style={{ width: `${Math.min(30, (totalFat / profile.macros.fat) * 25)}%` }}
            title={`Fat: ${totalFat}g`}
          />
        </div>
      </div>

      {/* Search & Auto-Suggest Bar */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search 1,000+ foods (e.g. Chicken breast, Oats, Greek yogurt, Salmon)..."
              className="w-full min-h-[48px] pl-11 pr-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            />
          </div>
          <select
            value={selectedSlot}
            onChange={e => setSelectedSlot(e.target.value as keyof FoodLogState)}
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-surface-card border border-border text-xs font-bold text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {slots.map(s => (
              <option key={s.key} value={s.key}>
                Add to: {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Auto-suggest dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-30 mt-2 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden divide-y divide-border">
            {suggestions.map(food => (
              <button
                key={food.id}
                onClick={() => handleSelectFood(food)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface-hover transition-colors"
              >
                <div>
                  <div className="text-sm font-bold text-text">{food.name}</div>
                  <div className="text-xs text-text-muted">
                    {food.serving} • {food.calories} kcal
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-cyan-400 font-semibold">{food.protein}g P</span>
                  <span className="text-amber-400 font-semibold">{food.carbs}g C</span>
                  <span className="text-rose-500 font-semibold">{food.fat}g F</span>
                  <span className="p-1 rounded-lg bg-accent text-on-accent text-[11px] font-bold">
                    + Add
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty State Banner if no items */}
      {totalItemsCount === 0 && (
        <Card className="p-12 text-center border-dashed border-2">
          <Utensils className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
          <h3 className="font-display font-bold text-base text-text mb-1">
            No meals logged for today yet.
          </h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Tap the search bar or scan a barcode to log your first meal and populate your daily macro rings.
          </p>
        </Card>
      )}

      {/* 5 Meal Slots */}
      <div className="space-y-6">
        {slots.map(slot => {
          const currentSlot = foodLog[slot.key];
          let slotKcal = 0;
          let slotP = 0;
          let slotC = 0;
          let slotF = 0;
          currentSlot.items.forEach(i => {
            slotKcal += i.calories;
            slotP += i.protein;
            slotC += i.carbs;
            slotF += i.fat;
          });

          return (
            <div
              key={slot.key}
              className="p-5 rounded-2xl bg-surface-card border border-border"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-base text-text">
                    {slot.label}
                  </h3>
                  <span className="text-xs text-text-muted font-mono">
                    ({currentSlot.items.length} items)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="font-bold text-text">{slotKcal} kcal</span>
                  <span className="text-text-muted hidden sm:inline">|</span>
                  <span className="text-cyan-400 font-medium hidden sm:inline">{slotP}g P</span>
                  <span className="text-amber-400 font-medium hidden sm:inline">{slotC}g C</span>
                  <span className="text-rose-500 font-medium hidden sm:inline">{slotF}g F</span>
                </div>
              </div>

              {/* Items in Slot */}
              {currentSlot.items.length === 0 ? (
                <div className="py-4 text-center text-xs text-text-muted">
                  No items in {slot.label}. Use the search bar above to log food.
                </div>
              ) : (
                <div className="space-y-2">
                  {currentSlot.items.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between hover:border-border-strong transition-colors"
                    >
                      <div>
                        <div className="text-sm font-bold text-text">{item.name}</div>
                        <div className="flex items-center gap-3 text-[11px] text-text-muted mt-0.5">
                          <span>{item.grams}g</span>
                          {item.time && (
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" /> {item.time}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right font-mono text-xs">
                          <span className="font-bold text-text block">{item.calories} kcal</span>
                          <span className="text-[10px] text-text-muted">
                            {item.protein}P • {item.carbs}C • {item.fat}F
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveMealItem(slot.key, item.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-surface-hover transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Barcode Camera Modal Simulation */}
      {isBarcodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-surface border border-accent/40 rounded-2xl p-6 text-center shadow-2xl">
            <button
              onClick={() => {
                setIsBarcodeModalOpen(false);
                setActiveBarcodeFood(null);
              }}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-text"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 text-accent mb-2">
              <Camera className="w-5 h-5" />
              <h3 className="font-display font-extrabold text-lg text-text">
                Optical Barcode Scanner
              </h3>
            </div>
            <p className="text-xs text-text-muted mb-4">
              Position food packaging barcode in front of the lens.
            </p>

            {/* Viewport simulation */}
            <div className="relative w-full h-48 bg-black rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-accent/60 mb-4">
              <div className="absolute inset-x-8 top-1/2 h-0.5 bg-rose-500 animate-pulse shadow-[0_0_8px_red]" />
              <Barcode className="w-24 h-24 text-white/30" />
            </div>

            {/* Simulated instant barcodes */}
            <div className="text-left mb-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-2">
                Simulate Package Recognition:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateBarcodeScan('850012345678')}
                  className="p-2 rounded-lg bg-surface-card border border-border text-xs text-left hover:border-accent hover:text-accent font-mono"
                >
                  Whey Isolate (850012)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateBarcodeScan('030000010204')}
                  className="p-2 rounded-lg bg-surface-card border border-border text-xs text-left hover:border-accent hover:text-accent font-mono"
                >
                  Rolled Oats (030000)
                </button>
              </div>
            </div>

            {activeBarcodeFood && (
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/40 text-left mb-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent">Product Identified</span>
                  <Check className="w-4 h-4 text-accent" />
                </div>
                <div className="font-display font-extrabold text-sm text-text mt-1">
                  {activeBarcodeFood.name}
                </div>
                <div className="font-mono text-xs text-text-muted mt-0.5">
                  {activeBarcodeFood.calories} kcal • {activeBarcodeFood.protein}g P • {activeBarcodeFood.carbs}g C • {activeBarcodeFood.fat}g F
                </div>
              </div>
            )}

            <Button
              variant="primary"
              disabled={!activeBarcodeFood}
              onClick={confirmBarcodeAdd}
              className="w-full text-xs"
            >
              Log Recognized Food to {selectedSlot}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
