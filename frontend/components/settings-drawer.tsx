"use client";

import { useSettings } from "@/components/providers";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SettingsDrawer() {
  const {
    arabicFont,
    setArabicFont,
    arabicFontSize,
    setArabicFontSize,
    translationFontSize,
    setTranslationFontSize,
  } = useSettings();

  return (
    <div className="flex flex-col gap-8 py-4">

      <div className="flex flex-col gap-4 px-6">
        <div className="space-y-2">
          <Label>Arabic Font</Label>
          <Select
            value={arabicFont}
            onValueChange={(value: any) => setArabicFont(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="font-scheherazade">Me Quran</SelectItem>
              <SelectItem value="font-lateef">Al Mushaf</SelectItem>
              <SelectItem value="font-amiri">Amiri Quran</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Arabic Font Size</Label>
            <span className="text-sm font-medium">{arabicFontSize}px</span>
          </div>
          <Slider
            value={[arabicFontSize]}
            min={16}
            max={64}
            step={2}
            onValueChange={(val) => setArabicFontSize(val[0])}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Translation Font Size</Label>
            <span className="text-sm font-medium">{translationFontSize}px</span>
          </div>
          <Slider
            value={[translationFontSize]}
            min={12}
            max={32}
            step={1}
            onValueChange={(val) => setTranslationFontSize(val[0])}
          />
        </div>
      </div>
    </div>
  );
}


