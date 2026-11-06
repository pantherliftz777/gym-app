import React, { useState } from 'react';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Inputs';
import { Package, Plus, Trash2, Utensils } from 'lucide-react';

export const MyFoodsView: React.FC<{ showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void }> = ({
  showToast,
}) => {
  const [customFoods, setCustomFoods] = useState([
    { id: 'cf1', name: 'Signature Post-Workout Whey Sludge', calories: 480, protein: 52, carbs: 45, fat: 8, servingGrams: 300 },
    { id: 'cf2', name: 'Egg White Turkey Scramble', calories: 290, protein: 42, carbs: 4, fat: 6, servingGrams: 250 },
  ]);

  const [name, setName] = useState('');
  const [servingGrams, setServingGrams] = useState(100);
  const [protein, setProtein] = useState(25);
  const [carbs, setCarbs] = useState(30);
  const [fat, setFat] = useState(5);

  const calculatedCalories = protein * 4 + carbs * 4 + fat * 9;

  const handleCreateFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newFood = {
      id: 'cf_' + Date.now(),
      name,
      servingGrams,
      protein,
      carbs,
      fat,
      calories: calculatedCalories,
    };
    setCustomFoods([newFood, ...customFoods]);
    setName('');
    showToast(`Custom recipe "${name}" saved to personal database.`, 'success');
  };

  const handleRemove = (id: string) => {
    setCustomFoods(customFoods.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-normal">
      <div className="pb-2 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text">
            My Custom Foods & Recipe Creator
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Build bespoke culinary items, custom protein blends, and homemade recipe macros.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Creator Form */}
        <div className="lg:col-span-5">
          <Card className="p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-text flex items-center gap-2">
              <Plus className="w-5 h-5 text-accent" />
              Create Custom Food Recipe
            </h3>

            <form onSubmit={handleCreateFood} className="space-y-4">
              <Input
                label="Food / Recipe Name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Grandma's High-Protein Lentil Bowl"
                required
              />

              <Input
                label="Serving Size (grams)"
                type="number"
                value={servingGrams}
                onChange={e => setServingGrams(Number(e.target.value))}
                required
              />

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Protein (g)"
                  type="number"
                  value={protein}
                  onChange={e => setProtein(Number(e.target.value))}
                />
                <Input
                  label="Carbs (g)"
                  type="number"
                  value={carbs}
                  onChange={e => setCarbs(Number(e.target.value))}
                />
                <Input
                  label="Fat (g)"
                  type="number"
                  value={fat}
                  onChange={e => setFat(Number(e.target.value))}
                />
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between font-mono text-xs">
                <span className="text-text-muted">Calculated Calories:</span>
                <span className="font-bold text-accent text-sm">{calculatedCalories} kcal</span>
              </div>

              <Button type="submit" variant="primary" className="w-full text-xs">
                Save to My Foods
              </Button>
            </form>
          </Card>
        </div>

        {/* Saved List */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="font-display font-bold text-base text-text">
            Saved Custom Foods ({customFoods.length})
          </h3>

          {customFoods.map(food => (
            <div
              key={food.id}
              className="p-4 rounded-xl bg-surface-card border border-border flex items-center justify-between"
            >
              <div>
                <h4 className="font-display font-bold text-sm text-text">{food.name}</h4>
                <div className="text-xs text-text-muted font-mono mt-0.5">
                  {food.servingGrams}g serving • {food.calories} kcal
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs font-mono text-right">
                  <span className="text-cyan-400 font-bold">{food.protein}g P</span> •{' '}
                  <span className="text-amber-400 font-bold">{food.carbs}g C</span> •{' '}
                  <span className="text-rose-500 font-bold">{food.fat}g F</span>
                </div>
                <button
                  onClick={() => handleRemove(food.id)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-surface-hover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
