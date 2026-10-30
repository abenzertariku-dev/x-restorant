'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Category, DishForm } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface AddDishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  itemForm: DishForm;
  setItemForm: React.Dispatch<React.SetStateAction<DishForm>>;
  onSubmit: (e: React.FormEvent) => void;
  editing?: boolean;
  busy?: boolean;
}

export function AddDishModal({
  open,
  onOpenChange,
  categories,
  itemForm,
  setItemForm,
  onSubmit,
  editing = false,
  busy = false,
}: AddDishModalProps) {
  const { getText } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Dish' : 'Add New Dish'}</DialogTitle>
          <DialogDescription>
            Bilingual menu content, ETB pricing, spice level, fasting flag and daily stock.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="my-5 space-y-3.5">
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
              Category
            </label>
            <select
              required
              value={itemForm.categoryId || categories[0]?._id || ''}
              onChange={(e) => setItemForm((prev) => ({ ...prev, categoryId: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-[#12131A] px-4 py-2.5 text-xs text-[#F8FAFC] outline-none focus:border-[#F59E0B]"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id} className="bg-[#171821]">
                  {c.icon} {getText(c.name)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                Name (English)
              </label>
              <Input
                required
                placeholder="e.g. Special Kitfo"
                value={itemForm.nameEn}
                onChange={(e) => setItemForm((prev) => ({ ...prev, nameEn: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                Name (አማርኛ)
              </label>
              <Input
                required
                placeholder="ለምሳሌ፡ ልዩ ክትፎ"
                value={itemForm.nameAm}
                onChange={(e) => setItemForm((prev) => ({ ...prev, nameAm: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                Price (ETB)
              </label>
              <Input
                required
                type="number"
                min={0}
                step="1"
                placeholder="e.g. 450"
                value={itemForm.price}
                onChange={(e) => setItemForm((prev) => ({ ...prev, price: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                Prep Time (minutes)
              </label>
              <Input
                type="number"
                min={1}
                max={180}
                placeholder="15"
                value={itemForm.prepTimeMinutes}
                onChange={(e) =>
                  setItemForm((prev) => ({ ...prev, prepTimeMinutes: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
              Image URL (Optional)
            </label>
            <Input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={itemForm.imageUrl}
              onChange={(e) => setItemForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                Description (English)
              </label>
              <Textarea
                placeholder="Freshly prepared with authentic herbs..."
                value={itemForm.descEn}
                onChange={(e) => setItemForm((prev) => ({ ...prev, descEn: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                Description (አማርኛ)
              </label>
              <Textarea
                placeholder="በባህላዊ ቅመሞች የተዘጋጀ..."
                value={itemForm.descAm}
                onChange={(e) => setItemForm((prev) => ({ ...prev, descAm: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#12131A] p-3 text-xs text-[#CBD5E1]">
            <label className="flex cursor-pointer items-center gap-2 font-bold">
              <input
                type="checkbox"
                checked={itemForm.isFasting}
                onChange={(e) =>
                  setItemForm((prev) => ({ ...prev, isFasting: e.target.checked }))
                }
                className="h-4 w-4 cursor-pointer accent-[#F59E0B]"
              />
              <span>የጾም / Vegan</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2 font-bold">
              <input
                type="checkbox"
                checked={itemForm.isAvailable}
                onChange={(e) =>
                  setItemForm((prev) => ({ ...prev, isAvailable: e.target.checked }))
                }
                className="h-4 w-4 cursor-pointer accent-emerald-500"
              />
              <span>In stock today</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase text-[#94A3B8]">Spice:</span>
              <select
                value={itemForm.spiceLevel}
                onChange={(e) =>
                  setItemForm((prev) => ({
                    ...prev,
                    spiceLevel: e.target.value as DishForm['spiceLevel'],
                  }))
                }
                className="rounded-lg border border-white/10 bg-[#171821] px-2 py-1 text-xs text-[#CBD5E1] outline-none focus:border-[#F59E0B]"
              >
                <option value="None">None</option>
                <option value="Mild">Mild</option>
                <option value="Medium">Medium</option>
                <option value="Spicy">Spicy</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button type="submit" className="flex-1" disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save Changes' : 'Save Dish to Catalog'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
