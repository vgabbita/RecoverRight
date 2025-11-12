'use client';

import { useState } from 'react';
import { DailyReflectionInput } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PAIN_LOCATIONS } from '@/lib/constants';
import { X } from 'lucide-react';

interface DailyReflectionFormProps {
  onSubmit: (data: DailyReflectionInput) => void;
  isSubmitting?: boolean;
}

export default function DailyReflectionForm({ onSubmit, isSubmitting }: DailyReflectionFormProps) {
  const [formData, setFormData] = useState<DailyReflectionInput>({
    reflection_text: '',
    pain_location_tags: [],
    pain_severity_level: 1,
    energy_level: 5,
    soreness_level: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addPainLocation = (location: string) => {
    if (!formData.pain_location_tags.includes(location)) {
      setFormData({
        ...formData,
        pain_location_tags: [...formData.pain_location_tags, location],
      });
    }
  };

  const removePainLocation = (location: string) => {
    setFormData({
      ...formData,
      pain_location_tags: formData.pain_location_tags.filter(l => l !== location),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Recovery Check-In</CardTitle>
          <CardDescription>
            Share how you're feeling today to receive personalized recovery guidance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reflection Text */}
          <div className="space-y-2">
            <Label htmlFor="reflection">How does your body feel today?</Label>
            <Textarea
              id="reflection"
              placeholder="Describe any soreness, fatigue, or how you're recovering from yesterday's workout..."
              value={formData.reflection_text}
              onChange={(e) => setFormData({ ...formData, reflection_text: e.target.value })}
              className="min-h-[120px]"
              required
            />
          </div>

          {/* Pain Locations */}
          <div className="space-y-2">
            <Label>Pain Locations (if any)</Label>
            <Select onValueChange={addPainLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select areas with pain or discomfort" />
              </SelectTrigger>
              <SelectContent>
                {PAIN_LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.pain_location_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.pain_location_tags.map((location) => (
                  <div
                    key={location}
                    className="flex items-center gap-1 bg-gray-100 rounded-md px-3 py-1 text-sm"
                  >
                    {location}
                    <button
                      type="button"
                      onClick={() => removePainLocation(location)}
                      className="ml-1 hover:text-danger"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pain Severity */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Pain Severity</Label>
              <span className="text-sm font-medium text-text-primary">
                {formData.pain_severity_level}/10
              </span>
            </div>
            <Slider
              value={[formData.pain_severity_level]}
              onValueChange={([value]) => setFormData({ ...formData, pain_severity_level: value })}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Minimal</span>
              <span>Severe</span>
            </div>
          </div>

          {/* Energy Level */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Energy Level</Label>
              <span className="text-sm font-medium text-text-primary">
                {formData.energy_level}/10
              </span>
            </div>
            <Slider
              value={[formData.energy_level]}
              onValueChange={([value]) => setFormData({ ...formData, energy_level: value })}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Exhausted</span>
              <span>Energized</span>
            </div>
          </div>

          {/* Soreness Level */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Soreness Level</Label>
              <span className="text-sm font-medium text-text-primary">
                {formData.soreness_level}/10
              </span>
            </div>
            <Slider
              value={[formData.soreness_level]}
              onValueChange={([value]) => setFormData({ ...formData, soreness_level: value })}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-text-secondary">
              <span>None</span>
              <span>Very Sore</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !formData.reflection_text}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Check-In'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
