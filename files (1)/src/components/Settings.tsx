import { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Type, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  customFont: string;
  onFontChange: (font: string) => void;
}

export const Settings = ({ isOpen, onClose, customFont, onFontChange }: SettingsProps) => {
  const [fontInput, setFontInput] = useState(customFont);
  const [isLoading, setIsLoading] = useState(false);
  const [customFontFile, setCustomFontFile] = useState<string | null>(null);
  const [customFontName, setCustomFontName] = useState<string | null>(null);
  const [customFontSize, setCustomFontSize] = useState<number>(24);
  const { toast } = useToast();

  useEffect(() => {
    setFontInput(customFont);
    
    // Load custom font from localStorage if present
    const storedFont = localStorage.getItem('writeaid_custom_font');
    const storedFontName = localStorage.getItem('writeaid_custom_font_name');
    const storedFontSize = localStorage.getItem('writeaid_custom_font_size');
    
    if (storedFont && storedFontName) {
      injectCustomFont(storedFont, storedFontName);
      setCustomFontFile(storedFont);
      setCustomFontName(storedFontName);
    }
    
    if (storedFontSize) {
      setCustomFontSize(Number(storedFontSize));
      applyFontSize(Number(storedFontSize));
    }
  }, [customFont]);

  // Helper to inject a @font-face for a custom font
  const injectCustomFont = (dataUrl: string, fontName: string) => {
    const prev = document.getElementById('custom-uploaded-font');
    if (prev) prev.remove();
    
    const style = document.createElement('style');
    style.id = 'custom-uploaded-font';
    style.innerHTML = `@font-face { font-family: '${fontName}'; src: url('${dataUrl}'); font-display: swap; }`;
    document.head.appendChild(style);
  };

  // Helper to apply font size to content elements (excluding title)
  const applyFontSize = (size: number) => {
    let style = document.getElementById('custom-font-size-style') as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = 'custom-font-size-style';
      document.head.appendChild(style);
    }
    
    // Apply to content but exclude the main title
    style.innerHTML = `
      .writing-content h1, .writing-content h2, .writing-content h3, .writing-content h4, .writing-content h5, .writing-content h6,
      .writing-content p, .writing-content span, .writing-content label, 
      .writing-content input, .writing-content textarea, .writing-content button, 
      .writing-content li, .writing-content a, .writing-content blockquote, 
      .writing-content code, .writing-content pre, .writing-content th, .writing-content td {
        font-size: ${size}px !important;
      }
    `;
  };

  // Handle TTF file upload
  const handleFontUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.ttf')) {
      toast({ 
        title: 'Invalid file', 
        description: 'Please upload a .ttf file.', 
        variant: 'destructive' 
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const fontName = file.name.replace(/\W/g, '_').replace(/_ttf$/, '') + '_Custom';
      
      injectCustomFont(dataUrl, fontName);
      setCustomFontFile(dataUrl);
      setCustomFontName(fontName);
      onFontChange(fontName);
      
      localStorage.setItem('writeaid_custom_font', dataUrl);
      localStorage.setItem('writeaid_custom_font_name', fontName);
      localStorage.removeItem('writeaid_font'); // Remove Google font if set
      
      toast({ 
        title: 'Custom font applied', 
        description: `Applied your uploaded font: ${file.name}` 
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle font size change
  const handleFontSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const size = Number(e.target.value);
    setCustomFontSize(size);
    applyFontSize(size);
    localStorage.setItem('writeaid_custom_font_size', String(size));
  };

  // Remove custom font
  const resetCustomFont = () => {
    setCustomFontFile(null);
    setCustomFontName(null);
    
    const prev = document.getElementById('custom-uploaded-font');
    if (prev) prev.remove();
    
    const prevSize = document.getElementById('custom-font-size-style');
    if (prevSize) prevSize.remove();
    
    localStorage.removeItem('writeaid_custom_font');
    localStorage.removeItem('writeaid_custom_font_name');
    localStorage.removeItem('writeaid_custom_font_size');
    
    onFontChange('');
    setFontInput('');
    setCustomFontSize(24);
    
    toast({ 
      title: 'Custom font removed', 
      description: 'Reverted to default font.' 
    });
  };

  const loadGoogleFont = async (fontName: string) => {
    if (!fontName.trim()) return;

    setIsLoading(true);
    
    try {
      // Remove existing font link
      const existingLink = document.querySelector('#google-font-link');
      if (existingLink) {
        existingLink.remove();
      }

      // Create new font link with proper encoding
      const link = document.createElement('link');
      link.id = 'google-font-link';
      link.rel = 'stylesheet';
      const encodedFontName = fontName.replace(/\s+/g, '+');
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(encodedFontName)}:wght@400;500;600;700&display=swap`;
      
      // Add timeout for font loading
      const timeout = setTimeout(() => {
        setIsLoading(false);
        toast({
          title: "Font loading timeout",
          description: "Please check your internet connection and try again.",
          variant: "destructive"
        });
      }, 10000);

      link.onload = () => {
        clearTimeout(timeout);
        
        // Test font loading with improved validation
        const testElement = document.createElement('div');
        testElement.style.fontFamily = `"${fontName}", serif`;
        testElement.style.position = 'absolute';
        testElement.style.visibility = 'hidden';
        testElement.style.fontSize = '16px';
        testElement.textContent = 'Test Font Loading';
        document.body.appendChild(testElement);
        
        setTimeout(() => {
          const computedFont = window.getComputedStyle(testElement).fontFamily;
          document.body.removeChild(testElement);
          
          // Improved validation
          const normalizeFont = (font: string) => 
            font.toLowerCase()
                .replace(/['"]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
          
          const computedNormalized = normalizeFont(computedFont);
          const expectedNormalized = normalizeFont(fontName);
          
          const fontLoaded = computedNormalized.includes(expectedNormalized) || 
                           computedFont.includes(fontName) ||
                           (!computedNormalized.includes('serif') && 
                            !computedNormalized.includes('sans-serif') && 
                            !computedNormalized.includes('monospace'));
          
          if (fontLoaded) {
            onFontChange(fontName);
            localStorage.setItem('writeaid_font', fontName);
            localStorage.removeItem('writeaid_custom_font'); // Remove custom font if set
            localStorage.removeItem('writeaid_custom_font_name');
            setIsLoading(false);
            toast({
              title: "Font applied",
              description: `Successfully applied "${fontName}" font.`
            });
          } else {
            setIsLoading(false);
            toast({
              title: "Font not available",
              description: `"${fontName}" might not be available in Google Fonts. Try checking the exact name.`,
              variant: "destructive"
            });
          }
        }, 500);
      };

      link.onerror = () => {
        clearTimeout(timeout);
        setIsLoading(false);
        toast({
          title: "Font not found",
          description: "Please check the font name and try again.",
          variant: "destructive"
        });
      };

      document.head.appendChild(link);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error loading font",
        description: "An error occurred while loading the font.",
        variant: "destructive"
      });
    }
  };

  const handleApplyFont = () => {
    loadGoogleFont(fontInput);
  };

  const resetFont = () => {
    const existingLink = document.querySelector('#google-font-link');
    if (existingLink) {
      existingLink.remove();
    }
    onFontChange('');
    setFontInput('');
    localStorage.removeItem('writeaid_font');
    toast({
      title: "Font reset",
      description: "Reverted to default font."
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-quirky shadow-quirky bg-card/95 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
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
          {/* Google Fonts Section */}
          <div className="space-y-3">
            <Label htmlFor="font-input" className="text-sm font-medium">
              Google Fonts
            </Label>
            <div className="space-y-2">
              <Input
                id="font-input"
                value={fontInput}
                onChange={(e) => setFontInput(e.target.value)}
                placeholder="e.g., Open Sans, Playfair Display, Crimson Text"
                className="border-primary/30 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                Enter any Google Font name. Multi-word fonts like "Open Sans" are supported.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleApplyFont}
                disabled={!fontInput.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? "Applying..." : "Apply Font"}
              </Button>
              <Button
                variant="outline"
                onClick={resetFont}
                disabled={!customFont || !!customFontFile}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Custom TTF Upload Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Upload Custom TTF Font</Label>
            <input
              type="file"
              accept=".ttf"
              onChange={handleFontUpload}
              className="block w-full text-xs text-muted-foreground border border-primary/30 rounded p-2 bg-background"
            />
            {customFontFile && customFontName && (
              <div className="p-3 bg-secondary rounded-lg flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Custom font active</span>
                  <Button variant="outline" size="sm" onClick={resetCustomFont}>Remove</Button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Label htmlFor="custom-font-size" className="text-xs">Font Size</Label>
                  <input
                    id="custom-font-size"
                    type="range"
                    min={14}
                    max={64}
                    value={customFontSize}
                    onChange={handleFontSizeChange}
                    className="flex-1 mx-2"
                  />
                  <span className="text-xs w-8 text-right">{customFontSize}px</span>
                </div>
              </div>
            )}
          </div>

          {/* Font Preview */}
          {customFont && !customFontFile && (
            <div className="p-3 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Current font preview:</p>
              <p 
                className="text-base" 
                style={{ fontFamily: `"${customFont}", serif` }}
              >
                The quick brown fox jumps over the lazy dog.
              </p>
            </div>
          )}

          {/* Popular Fonts */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Popular Writing Fonts</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Crimson Text",
                "Lora", 
                "Merriweather",
                "Playfair Display",
                "Source Serif Pro",
                "Libre Baskerville",
                "Open Sans",
                "Roboto Slab"
              ].map((font) => (
                <Button
                  key={font}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFontInput(font);
                    loadGoogleFont(font);
                  }}
                  className="text-xs"
                  disabled={isLoading}
                >
                  {font}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};