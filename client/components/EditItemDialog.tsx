'use client';

import { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { Item } from '@/lib/types';

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
  onSubmit: (itemId: string, data: {
    name?: string;
    description?: string;
    imageUrl?: string;
    price?: number;
    currency?: string;
    url?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'available' | 'claimed' | 'purchased';
  }) => Promise<void>;
}

export default function EditItemDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
}: EditItemDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [url, setUrl] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'available' | 'claimed' | 'purchased'>('available');
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setDescription(item.description || '');
      setImageUrl(item.imageUrl || '');
      setPrice(item.price ? String(item.price) : '');
      setCurrency(item.currency || 'USD');
      setUrl(item.url || '');
      setPriority(item.priority || 'medium');
      setStatus(item.status || 'available');
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    
    setIsLoading(true);

    try {
      await onSubmit(item._id, {
        name,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        price: price ? parseFloat(price) : undefined,
        currency,
        url: url || undefined,
        priority,
        status,
      });

      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white/90 backdrop-blur-sm border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="w-5 h-5 text-blue-600" />
            <span>Edit Item</span>
          </DialogTitle>
          <DialogDescription>
            Update the details and preferences for this item.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Item Name *</Label>
            <Input
              id="edit-name"
              placeholder="e.g., iPhone 15 Pro"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-white/50 border-gray-300 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Add any specific details or preferences..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-white/50 border-gray-300 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-white/50 border-gray-300 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="bg-white/50 border-gray-300 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-url">Product URL</Label>
            <Input
              id="edit-url"
              type="url"
              placeholder="https://example.com/product"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-white/50 border-gray-300 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-imageUrl">Image URL</Label>
            <Input
              id="edit-imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="bg-white/50 border-gray-300 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                <SelectTrigger className="bg-white/50 border-gray-300 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={(value: 'available' | 'claimed' | 'purchased') => setStatus(value)}>
                <SelectTrigger className="bg-white/50 border-gray-300 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                  <SelectItem value="purchased">Purchased</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              {isLoading ? 'Updating...' : 'Update Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
