// components/client/ContentUpload.tsx

'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tooltip } from '@/components/ui/Tooltip';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Upload, File } from 'lucide-react';
import { insertContent } from '@/app/actions/data-actions';
import type { ContentData } from '@/app/actions/data-actions';

interface ContentUploadProps {
  userId: string;
  storeId: string;
  onSuccess?: () => void;
}

export function ContentUpload({ userId, storeId, onSuccess }: ContentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    start_date: '',
    end_date: '',
    recurrence_type: 'none' as 'none' | 'daily' | 'weekly' | 'monthly' | 'custom',
    recurrence_days: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create supabase client for storage operations (client-side only)
  const supabase = createClient();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi'],
      'audio/*': ['.mp3', '.wav', '.aac'],
    },
    multiple: true,
  });

  const getFileType = (file: File): 'image' | 'video' | 'music' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'music';
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `content/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('content')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('content')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      for (const file of files) {
        const fileUrl = await uploadFile(file);

        const contentData: ContentData = {
          store_id: storeId,
          user_id: userId,
          title: formData.title || file.name,
          type: getFileType(file),
          file_url: fileUrl,
          file_size: file.size,
          start_date: formData.start_date,
          end_date: formData.end_date,
          recurrence_type: formData.recurrence_type,
          recurrence_days: formData.recurrence_days.length > 0 ? formData.recurrence_days : null,
        };

        const result = await insertContent(contentData);

        if (!result.success) {
          throw new Error(result.error);
        }
      }

      setFiles([]);
      setFormData({
        title: '',
        start_date: '',
        end_date: '',
        recurrence_type: 'none',
        recurrence_days: [],
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecurrenceDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      recurrence_days: prev.recurrence_days.includes(day)
        ? prev.recurrence_days.filter(d => d !== day)
        : [...prev.recurrence_days, day]
    }));
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div>
                <p className="mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-gray-500">Images, videos, and audio files supported</p>
              </div>
            )}
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Selected Files:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <File className="w-4 h-4" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              ))}
            </div>
          )}

          <Input
            placeholder="Content Title (optional)"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Recurrence</label>
            <Tooltip content="Set how often this content should be displayed" variant="dark">
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.recurrence_type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  recurrence_type: e.target.value as any,
                  recurrence_days: []
                }))}
              >
                <option value="none">No Recurrence</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom Days</option>
              </select>
            </Tooltip>
          </div>

          {formData.recurrence_type === 'custom' && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Days</label>
              <Tooltip content="Choose specific days of the week for content display" variant="dark">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {weekDays.map(day => (
                  <label key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.recurrence_days.includes(day)}
                      onChange={() => handleRecurrenceDayToggle(day)}
                      className="rounded"
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
              </Tooltip>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Tooltip
            content={files.length === 0 ? "Please select files to upload" : "Upload your selected content"}
            variant="dark"
          >
            <Button type="submit" className="w-full" disabled={loading || files.length === 0}>
              {loading ? 'Uploading...' : 'Upload Content'}
            </Button>
          </Tooltip>
        </form>
      </CardContent>
    </Card>
  );
}
