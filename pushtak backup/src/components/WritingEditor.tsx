import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings, Bot, Download, Save, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WritingEditorProps {
  bookTitle: string;
  onBack: () => void;
  customFont?: string;
}

interface TextBlock {
  id: string;
  type: 'text' | 'chapter' | 'section' | 'pagebreak';
  content: string;
}

export const WritingEditor = ({ bookTitle, onBack, customFont }: WritingEditorProps) => {
  const [blocks, setBlocks] = useState<TextBlock[]>([
    { id: '1', type: 'text', content: '' }
  ]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save functionality
  useEffect(() => {
    const saveInterval = setInterval(() => {
      const saveData = { bookTitle, blocks, timestamp: new Date().toISOString() };
      localStorage.setItem(`writeaid_${bookTitle}`, JSON.stringify(saveData));
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [bookTitle, blocks]);

  // Load saved content
  useEffect(() => {
    const saved = localStorage.getItem(`writeaid_${bookTitle}`);
    if (saved) {
      const { blocks: savedBlocks } = JSON.parse(saved);
      setBlocks(savedBlocks || [{ id: '1', type: 'text', content: '' }]);
    }
  }, [bookTitle]);

  const addBlock = (type: 'text' | 'chapter' | 'section' | 'pagebreak', insertAfter?: string) => {
    const newBlock: TextBlock = {
      id: Date.now().toString(),
      type,
      content: type === 'pagebreak' ? '--- Page Break ---' : 
                type === 'chapter' ? 'Chapter Title' :
                type === 'section' ? 'Section Title' : ''
    };
    
    if (insertAfter) {
      const insertIndex = blocks.findIndex(block => block.id === insertAfter);
      if (insertIndex !== -1) {
        setBlocks(prev => [
          ...prev.slice(0, insertIndex + 1),
          newBlock,
          ...prev.slice(insertIndex + 1)
        ]);
        return;
      }
    }
    
    setBlocks(prev => [...prev, newBlock]);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, content } : block
    ));
  };

  const deleteBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(prev => prev.filter(block => block.id !== id));
    }
  };

  const getSelectedText = () => {
    if (!textareaRef.current) return '';
    const { selectionStart, selectionEnd, value } = textareaRef.current;
    return value.substring(selectionStart, selectionEnd);
  };

  const handleAiPrompt = () => {
    const selectedText = getSelectedText();
    if (!selectedText && !aiPrompt) {
      toast({
        title: "No text selected",
        description: "Please select some text or enter a custom prompt.",
        variant: "destructive"
      });
      return;
    }

    const promptText = selectedText 
      ? `Selected text: "${selectedText}"\n\nRequest: ${aiPrompt || "Please improve this text"}`
      : aiPrompt;

    const encodedPrompt = encodeURIComponent(`You are an AI co-writer for novels. ${promptText}`);
    window.open(`https://chat.openai.com/?prompt=${encodedPrompt}`, '_blank');
    setAiPrompt("");
    setShowAiPanel(false);
  };

  const exportContent = () => {
    const content = blocks.map(block => {
      switch (block.type) {
        case 'chapter':
          return `# ${block.content}\n\n`;
        case 'section':
          return `## ${block.content}\n\n`;
        case 'pagebreak':
          return '\n---\n\n';
        default:
          return `${block.content}\n\n`;
      }
    }).join('');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bookTitle}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `${bookTitle}.txt has been downloaded.`
    });
  };

  const saveManually = () => {
    const saveData = { bookTitle, blocks, timestamp: new Date().toISOString() };
    localStorage.setItem(`writeaid_${bookTitle}`, JSON.stringify(saveData));
    toast({
      title: "Saved",
      description: "Your work has been saved locally."
    });
  };

  const fontStyle = customFont ? { fontFamily: `"${customFont}", serif` } : {};

  return (
    <div className="min-h-screen bg-gradient-subtle" style={fontStyle}>
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onBack}>
                ← Back
              </Button>
              <h1 className="text-xl font-semibold text-primary">{bookTitle}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAiPanel(!showAiPanel)}
                className={showAiPanel ? "bg-primary text-primary-foreground" : ""}
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
              <Button variant="outline" size="sm" onClick={saveManually}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={exportContent}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Writing Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Block Type Controls */}
            <Card className="border-quirky shadow-quirky bg-card/80">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('text')}
                    className="shadow-quirky border-primary/40 hover:shadow-soft"
                  >
                    Text Block
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('chapter')}
                    className="shadow-quirky border-primary/40 hover:shadow-soft"
                  >
                    Chapter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('section')}
                    className="shadow-quirky border-primary/40 hover:shadow-soft"
                  >
                    Section
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('pagebreak')}
                    className="shadow-quirky border-primary/40 hover:shadow-soft"
                  >
                    Page Break
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Writing Blocks */}
            <div className="space-y-6">
              {blocks.map((block, index) => (
                <div key={block.id} className="group">
                  {block.type === 'pagebreak' ? (
                    <div className="flex items-center justify-center py-8">
                      <Separator className="flex-1" />
                      <span className="px-4 text-sm text-muted-foreground">Page Break</span>
                      <Separator className="flex-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBlock(block.id)}
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <Card className="border-quirky shadow-quirky hover:shadow-soft transition-all duration-300 bg-card/90">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            {block.type === 'chapter' && (
                              <div className="mb-4 flex items-center justify-between">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                  Chapter Title
                                </label>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addBlock('text', block.id)}
                                    className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                                    title="Add text block after"
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>
                            )}
                            {block.type === 'section' && (
                              <div className="mb-4 flex items-center justify-between">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                  Section Title
                                </label>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addBlock('text', block.id)}
                                    className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                                    title="Add text block after"
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>
                            )}
                            <Textarea
                              ref={textareaRef}
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, e.target.value)}
                              placeholder={
                                block.type === 'chapter' ? 'Enter chapter title...' :
                                block.type === 'section' ? 'Enter section title...' :
                                'Start writing...'
                              }
                              className={`border-none resize-none focus:ring-0 p-0 bg-transparent ${
                                block.type === 'chapter' ? 'text-2xl font-bold' :
                                block.type === 'section' ? 'text-xl font-semibold' :
                                'text-base'
                              }`}
                              rows={block.type === 'text' ? 8 : 2}
                              onFocus={() => setSelectedBlockId(block.id)}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            {block.type === 'text' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addBlock('text', block.id)}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Add text block after"
                                >
                                  +
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addBlock('section', block.id)}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                  title="Add section after"
                                >
                                  S
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addBlock('chapter', block.id)}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                  title="Add chapter after"
                                >
                                  C
                                </Button>
                              </>
                            )}
                            {blocks.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteBlock(block.id)}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                              >
                                ✕
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Panel */}
          {showAiPanel && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-quirky shadow-quirky bg-card/90">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Bot className="h-4 w-4" />
                      <span className="font-medium">AI Assistant</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Select text in your writing and use AI to enhance it.
                    </div>

                    <Textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g., Make this more emotional, fix grammar, add humor..."
                      className="min-h-[100px]"
                    />

                    <div className="space-y-2">
                      <Button
                        onClick={handleAiPrompt}
                        className="w-full"
                        disabled={!aiPrompt && !getSelectedText()}
                      >
                        Send to AI
                      </Button>
                      
                      <div className="grid grid-cols-1 gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAiPrompt("Make this more emotional and engaging")}
                        >
                          More Emotional
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAiPrompt("Correct grammar and improve clarity")}
                        >
                          Fix Grammar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAiPrompt("Add subtle humor to this scene")}
                        >
                          Add Humor
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAiPrompt("Help me with ideas for continuing this story")}
                        >
                          Story Ideas
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};