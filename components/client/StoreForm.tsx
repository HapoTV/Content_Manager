'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createStore } from '@/app/actions/stores';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface StoreFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function StoreForm({ userId, onSuccess }: StoreFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    brand_company: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createStore(userId, {
        name: formData.name,
        brand_company: formData.brand_company,
        address: formData.address,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Store Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Store Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
            <Input
              placeholder="Brand/Company"
              value={formData.brand_company}
              onChange={(e) => handleChange('brand_company', e.target.value)}
              required
            />
          </div>
          <Input
            placeholder="Address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              step="any"
              placeholder="Latitude (optional)"
              value={formData.latitude}
              onChange={(e) => handleChange('latitude', e.target.value)}
            />
            <Input
              type="number"
              step="any"
              placeholder="Longitude (optional)"
              value={formData.longitude}
              onChange={(e) => handleChange('longitude', e.target.value)}
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save Store Details'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
