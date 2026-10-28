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
import { Category } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface AddDishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  itemForm: {
    nameEn: string;
    nameAm: string;
    descEn: string;
    descAm: string;
    price: string;
    categoryId: string;
    spiceLevel: string;
    isFasting: boolean;
    imageUrl: string;
  };
  setItemForm: React.Dispatch<
    React.SetStateAction<{
      nameEn: string;
      nameAm: string;
      descEn: string;
      descAm: string;
      price: string;
      categoryId: string;
      spiceLevel: string;
      isFasting: boolean;
      imageUrl: string;
    }>
  >;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddDishModal({
  open,
  onOpenChange,
  categories,
  itemForm,
  setItemForm,
  onSubmit,
}: AddDishModalProps) {
  const { getText } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Add New Dish</DialogTitle>
          <DialogDescription>
            Create a dish item in your restaurant catalog with pricing and photos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="my-5 space-y-3.5">
          {/* Category Selector */}
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
              Target Category
            </label>
            <select
              value={itemForm.categoryId || categories[0]?._id}
              onChange={(e) =>
                setItemForm({ ...itemForm, categoryId: e.target.value })
              }
              className="w-full rounded-xl border border-white/10 bg-[#12131A] px-4 py-2.5 text-xs text-[#F8FAFC] outline-none focus:border-[#F59E0B]"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id} className="bg-[#171821]">
                  {c.icon} {getText(c.name)}
                </option>
              ))}
            </select>
          </div>

          {/* Dual Names */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                Name (English)
              </label>
              <Input
                required
                placeholder="e.g. Special Kitfo"
                value={itemForm.nameEn}
                onChange={(e) =>
                  setItemForm({ ...itemForm, nameEn: e.target.value })
                }
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
                onChange={(e) =>
                  setItemForm({ ...itemForm, nameAm: e.target.value })
                }
              />
            </div>
          </div>

          {/* Price & Image URL */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                Price (ETB)
              </label>
              <Input
                required
                type="number"
                placeholder="e.g. 450"
                value={itemForm.price}
                onChange={(e) =>
                  setItemForm({ ...itemForm, price: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                Image URL (Optional)
              </label>
              <Input
                type="url"
                placeholder="https://..."
                value={itemForm.imageUrl}
                onChange={(e) =>
                  setItemForm({ ...itemForm, imageUrl: e.target.value })
                }
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
              Description
            </label>
            <Textarea
              placeholder="Freshly prepared with authentic herbs and traditional butter..."
              value={itemForm.descEn}
              onChange={(e) =>
                setItemForm({ ...itemForm, descEn: e.target.value })
              }
              rows={2}
            />
          </div>

          {/* Dietary & Spice Level */}
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#12131A] p-3 text-xs text-[#CBD5E1]">
            <label className="flex items-center gap-2 font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={itemForm.isFasting}
                onChange={(e) =>
                  setItemForm({ ...itemForm, isFasting: e.target.checked })
                }
                className="accent-[#F59E0B] h-4 w-4 rounded cursor-pointer"
              />
              <span>የጾም (Vegan Fasting)</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase text-[#94A3B8]">
                Spice:
              </span>
              <select
                value={itemForm.spiceLevel}
                onChange={(e) =>
                  setItemForm({ ...itemForm, spiceLevel: e.target.value })
                }
                className="rounded-lg border border-white/10 bg-[#171821] px-2 py-1 text-xs text-[#CBD5E1] outline-none focus:border-[#F59E0B]"
              >
                <option value="None">No Spice</option>
                <option value="Mild">Mild</option>
                <option value="Medium">Medium</option>
                <option value="Spicy">Spicy</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2.5 pt-2">
            <Button type="submit" className="flex-1">
              Save Dish to Catalog
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
