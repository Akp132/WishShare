'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Gift, Palette } from 'lucide-react';

interface CreateWishlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    isPublic?: boolean;
    color?: string;
  }) => void;
}

const colors = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
];

export default function CreateWishlistDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateWishlistDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit({
        name,
        description: description || undefined,
        isPublic,
        color: selectedColor,
      });

      // Reset form
      setName('');
      setDescription('');
      setIsPublic(false);
      setSelectedColor(colors[0]);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white/90 backdrop-blur-sm border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-blue-600" />
            <span>Create New Wishlist</span>
          </DialogTitle>
          <DialogDescription>
            Create a new wishlist to share with friends and family.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Wishlist Name</Label>
            <Input
              id="name"
              placeholder="e.g., Birthday Wishlist"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-white/50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a description for your wishlist..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-white/50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Choose Color</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public" className="text-sm">
              Make this wishlist public
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? 'Creating...' : 'Create Wishlist'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}