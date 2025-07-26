import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Upload, RotateCcw, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsProps {
  onFontChange: (fontFamily: string) => void;
  onFontSizeChange: (fontSize: number) => void;
  currentFont: string;
  currentFontSize: number;
}

export const Settings = ({ onFontChange, onFontSizeChange, currentFont, currentFontSize }: SettingsProps) => {
  const [fontSize, setFontSize] = useState(currentFontSize);
  const [customFontName, setCustomFontName] = useState<string | null>(null);
  const { toast } = useToast();

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
      
      // Create a new font face
      const fontFace = new FontFace(fontName, fontData);
      
      await fontFace.load();
      document.fonts.add(fontFace);
      
      setCustomFontName(fontName);
      onFontChange(fontName);
      
      toast({
        title: "Font Uploaded",
        description: `${file.name} has been successfully loaded.`,
      });
    } catch (error) {
      console.error('Failed to load font:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to load the font. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    onFontSizeChange(newSize);
  };

  const resetToDefault = () => {
    setFontSize(16);
    setCustomFontName(null);
    onFontChange('ReenieBeanie');
    onFontSizeChange(16);
    
    // Clear file input
    const fileInput = document.getElementById('font-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    
    toast({
      title: "Settings Reset",
      description: "Font settings have been reset to default.",
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          Font Settings
        </CardTitle>
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
              <Upload className="h-4 w-4 mr-2" />
              Choose TTF File
            </Button>
          </div>
          {customFontName && (
            <p className="text-sm text-muted-foreground">
              Custom font loaded: {customFontName}
            </p>
          )}
        </div>

        <Separator />

        {/* Font Size Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Font Size</Label>
            <span className="text-sm font-medium">{fontSize}px</span>
          </div>
          <Slider
            value={[fontSize]}
            onValueChange={handleFontSizeChange}
            max={72}
            min={12}
            step={2}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>12px</span>
            <span>72px</span>
          </div>
        </div>

        <Separator />

        {/* Current Font Display */}
        <div className="space-y-2">
          <Label>Current Font Preview</Label>
          <div 
            className="p-4 border rounded-md text-center"
            style={{ 
              fontFamily: currentFont === 'ReenieBeanie' ? 'ReenieBeanie, cursive' : currentFont,
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
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Default
        </Button>
      </CardContent>
    </Card>
  );
};