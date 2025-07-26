import { useState, useEffect } from "react";
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
  const { toast } = useToast();

  useEffect(() => {
    setFontInput(customFont);
  }, [customFont]);

  const loadGoogleFont = async (fontName: string) => {
    if (!fontName.trim()) return;

    setIsLoading(true);
    
    try {
      // Remove existing font link if any
      const existingLink = document.querySelector('#custom-font-link');
      if (existingLink) {
        existingLink.remove();
      }

      // Create new font link with timeout
      const link = document.createElement('link');
      link.id = 'custom-font-link';
      link.rel = 'stylesheet';
      // Fix: Properly encode font name for Google Fonts URL
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
        // Improved font validation logic
        const testElement = document.createElement('div');
        testElement.style.fontFamily = `"${fontName}", serif`;
        testElement.style.position = 'absolute';
        testElement.style.visibility = 'hidden';
        testElement.style.fontSize = '16px';
        testElement.textContent = 'Test Font Loading';
        document.body.appendChild(testElement);
        
        // Wait a moment for font to load
        setTimeout(() => {
          const computedFont = window.getComputedStyle(testElement).fontFamily;
          document.body.removeChild(testElement);
          
          // Improved validation: normalize both strings for comparison
          const normalizeFont = (font: string) => 
            font.toLowerCase()
                .replace(/['"]/g, '') // Remove quotes
                .replace(/\s+/g, ' ')  // Normalize spaces
                .trim();
          
          const computedNormalized = normalizeFont(computedFont);
          const expectedNormalized = normalizeFont(fontName);
          
          // Check if the font loaded successfully by comparing normalized names
          // Also check if it's not falling back to generic fonts
          const fontLoaded = computedNormalized.includes(expectedNormalized) || 
                           computedFont.includes(fontName) ||
                           (!computedNormalized.includes('serif') && 
                            !computedNormalized.includes('sans-serif') && 
                            !computedNormalized.includes('monospace'));
          
          if (fontLoaded) {
            onFontChange(fontName);
            localStorage.setItem('writeaid_font', fontName);
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
        }, 500); // Give font time to load
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
    const existingLink = document.querySelector('#custom-font-link');
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
          <div className="space-y-3">
            <Label htmlFor="font-input" className="text-sm font-medium">
              Custom Font (Google Fonts)
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
                disabled={!customFont}
              >
                Reset
              </Button>
            </div>
          </div>

          {customFont && (
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