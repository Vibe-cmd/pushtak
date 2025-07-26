import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Type, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFontSize } from "@/hooks/use-font-size";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  customFont: string;
  onFontChange: (font: string) => void;
}

export const Settings = ({ isOpen, onClose, customFont, onFontChange }: SettingsProps) => {
  const [customFontName, setCustomFontName] = useState<string | null>(null);
  const { toast } = useToast();
  const { fontSize, updateFontSize } = useFontSize();

  useEffect(() => {
    // Initialize any custom font if needed
    const savedFont = localStorage.getItem('pushtak_font');
    if (savedFont && savedFont !== 'ReenieBeanie') {
      setCustomFontName(savedFont);
    }
  }, []);

  const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.ttf')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a TTF font file.",
        variant: "destructive",
      });
      return;
    }
    try {
      const fontData = await file.arrayBuffer();
      const fontName = file.name.replace('.ttf', '').replace(/[^a-zA-Z0-9]/g, '');
      const fontFace = new FontFace(fontName, fontData);
      await fontFace.load();
      document.fonts.add(fontFace);
      setCustomFontName(fontName);
      onFontChange(fontName);
      document.documentElement.style.setProperty('--app-font-family', `'${fontName}', cursive, sans-serif`);
      localStorage.setItem('pushtak_font', fontName);
      toast({
        title: "Font Uploaded",
        description: `${file.name} has been successfully loaded.`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to load the font. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Number(e.target.value);
    updateFontSize(newSize);
  };

  const resetToDefault = () => {
    updateFontSize(20);
    setCustomFontName(null);
    onFontChange('ReenieBeanie');
    document.documentElement.style.setProperty('--app-font-family', `'ReenieBeanie', cursive, sans-serif`);
    localStorage.setItem('pushtak_font', 'ReenieBeanie');
    const fileInput = document.getElementById('font-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    toast({
      title: "Settings Reset",
      description: "Font settings have been reset to default.",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-quirky shadow-quirky bg-card/95 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Type className="h-5 w-5" />
            Settings
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Upload */}
          <div className="space-y-2">
            <Label htmlFor="font-upload">Upload Custom Font (TTF)</Label>
            <div className="flex items-center gap-2">
              <input
                id="font-upload"
                type="file"
                accept=".ttf"
                onChange={handleFontUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('font-upload')?.click()}
                className="flex-1"
              >
                Choose TTF File
              </Button>
            </div>
            {customFontName && (
              <p className="text-sm text-muted-foreground">
                Custom font loaded: {customFontName}
              </p>
            )}
          </div>
          {/* Font Size Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Font Size</Label>
              <span className="text-sm font-medium">{fontSize}px</span>
            </div>
            <input
              type="range"
              min={12}
              max={72}
              step={2}
              value={fontSize}
              onChange={handleFontSizeChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>12px</span>
              <span>72px</span>
            </div>
          </div>
          {/* Current Font Preview */}
          <div className="space-y-2">
            <Label>Current Font Preview</Label>
            <div 
              className="p-4 border rounded-md text-center"
              style={{ 
                fontFamily: customFont ? `'${customFont}', cursive, sans-serif` : 'ReenieBeanie, cursive, sans-serif',
                fontSize: `${fontSize}px`
              }}
            >
              The quick brown fox jumps over the lazy dog
            </div>
          </div>
          {/* Reset Button */}
          <Button 
            variant="outline" 
            onClick={resetToDefault}
            className="w-full"
          >
            Reset to Default
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
