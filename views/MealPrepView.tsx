import React, { useState } from 'react';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/Feedback';
import { ChefHat, ShoppingCart, Check, Calendar, Plus } from 'lucide-react';

export const MealPrepView: React.FC = () => {
  const [groceryItems, setGroceryItems] = useState([
    { name: 'Boneless Skinless Chicken Breast', qty: '2.5 kg', checked: false },
    { name: 'Organic Jasmine Rice', qty: '2 kg', checked: true },
    { name: 'Pasture-Raised Eggs', qty: '24 eggs', checked: true },
    { name: 'Wild Atlantic Salmon Fillets', qty: '1.2 kg', checked: false },
    { name: 'Rolled Oats & Chia Seeds', qty: '1 kg', checked: false },
    { name: 'Fresh Broccoli & Asparagus', qty: '1.5 kg', checked: false },
  ]);

  const toggleCheck = (idx: number) => {
    setGroceryItems(prev =>
      prev.map((item, i) => (i === idx ? { ...item, checked: !item.checked } : item))
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-normal">
      <div className="pb-2 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <StatusPill status="COMING SOON" />
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase">
              BATCH NUTRITION ENGINE
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text mt-1">
            Weekly Batch Meal Prep & Automated Grocery List
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Weekly Batch Schedule */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-accent" />
              <h3 className="font-display font-extrabold text-base text-text">
                Sunday Prep Protocol (4 Days Ahead)
              </h3>
            </div>

            <div className="space-y-3">
              {[
                { meal: 'Batch 1: Grilled Lemon Herb Chicken & Jasmine Rice', containers: '4 Meals (Mon–Thu Lunch)', macros: '680 kcal • 55g P • 82g C' },
                { meal: 'Batch 2: Air-Fried Salmon & Sweet Potato Mash', containers: '3 Meals (Mon–Wed Dinner)', macros: '620 kcal • 48g P • 60g C' },
                { meal: 'Batch 3: Overnight Protein Oats with Blueberries', containers: '5 Jars (Mon–Fri Breakfast)', macros: '510 kcal • 42g P • 65g C' },
              ].map((batch, i) => (
                <div key={i} className="p-4 rounded-xl bg-surface border border-border">
                  <div className="flex justify-between items-center text-sm font-bold text-text mb-1">
                    <span>{batch.meal}</span>
                    <span className="font-mono text-xs text-accent">{batch.containers}</span>
                  </div>
                  <span className="text-xs font-mono text-text-muted">{batch.macros}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Grocery List Generator */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-accent" />
                <h3 className="font-display font-extrabold text-base text-text">
                  Automated Grocery Checklist
                </h3>
              </div>
            </div>

            <div className="space-y-2">
              {groceryItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    item.checked
                      ? 'bg-surface/50 border-border/50 text-text-muted line-through'
                      : 'bg-surface border-border text-text hover:border-accent'
                  }`}
                >
                  <span className="text-xs font-medium">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-accent">{item.qty}</span>
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border ${
                        item.checked ? 'bg-accent border-accent text-on-accent' : 'border-border'
                      }`}
                    >
                      {item.checked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
