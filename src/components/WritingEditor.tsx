import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings, Bot, Download, Save, Type, ChevronDown, ChevronRight, StickyNote, FileText, BookOpen, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PostItNote } from "@/components/PostItNote";
import { DocumentOutline } from "@/components/DocumentOutline";

interface WritingEditorProps {
  bookTitle: string;
  onBack: () => void;
  customFont?: string;
}

interface TextBlock {
  id: string;
  type: 'text' | 'chapter' | 'section' | 'pagebreak';
  content: string;
  parentId?: string; // For hierarchical structure
  isCollapsed?: boolean;
  metadata?: {
    chapterNumber?: number;
    sectionNumber?: number;
    parentChapter?: string;
    wordCount?: number;
    tags?: string[];
    notes?: string;
    level?: number; // Nesting level
  };
}

export const WritingEditor = ({ bookTitle, onBack, customFont }: WritingEditorProps) => {
  const [blocks, setBlocks] = useState<TextBlock[]>([
    { id: '1', type: 'text', content: '', isCollapsed: false }
  ]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showPostIt, setShowPostIt] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [collapsedBlocks, setCollapsedBlocks] = useState<Set<string>>(new Set());
  
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save functionality
  useEffect(() => {
    const saveInterval = setInterval(() => {
      const saveData = { 
        bookTitle, 
        blocks, 
        collapsedBlocks: Array.from(collapsedBlocks),
        timestamp: new Date().toISOString() 
      };
      localStorage.setItem(`pushtak_${bookTitle}`, JSON.stringify(saveData));
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [bookTitle, blocks, collapsedBlocks]);

  // Load saved content
  useEffect(() => {
    const saved = localStorage.getItem(`pushtak_${bookTitle}`);
    if (saved) {
      const { blocks: savedBlocks, collapsedBlocks: savedCollapsed } = JSON.parse(saved);
      setBlocks(savedBlocks || [{ id: '1', type: 'text', content: '', isCollapsed: false }]);
      setCollapsedBlocks(new Set(savedCollapsed || []));
    }
  }, [bookTitle]);

  // Get word count
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Get hierarchical structure
  const getBlockHierarchy = () => {
    const hierarchy: { [key: string]: TextBlock[] } = {};
    let currentChapter: string | null = null;
    let currentSection: string | null = null;

    blocks.forEach(block => {
      if (block.type === 'chapter') {
        currentChapter = block.id;
        currentSection = null;
        hierarchy[block.id] = [];
      } else if (block.type === 'section') {
        currentSection = block.id;
        hierarchy[block.id] = [];
        if (currentChapter) {
          hierarchy[currentChapter].push(block);
        }
      } else if (block.type === 'text') {
        const parentId = currentSection || currentChapter;
        if (parentId) {
          hierarchy[parentId].push(block);
        }
      }
    });

    return hierarchy;
  };

  // Check if block should be visible based on hierarchy
  const isBlockVisible = (block: TextBlock) => {
    let currentChapter: string | null = null;
    let currentSection: string | null = null;

    for (const b of blocks) {
      if (b === block) {
        // Check if any parent is collapsed
        if (currentSection && collapsedBlocks.has(currentSection)) return false;
        if (currentChapter && collapsedBlocks.has(currentChapter)) return false;
        return true;
      }
      
      if (b.type === 'chapter') {
        currentChapter = b.id;
        currentSection = null;
      } else if (b.type === 'section') {
        currentSection = b.id;
      }
    }
    return true;
  };

  // Get parent info for a block
  const getBlockParent = (blockId: string) => {
    let currentChapter: TextBlock | null = null;
    let currentSection: TextBlock | null = null;

    for (const block of blocks) {
      if (block.id === blockId) {
        return { chapter: currentChapter, section: currentSection };
      }
      
      if (block.type === 'chapter') {
        currentChapter = block;
        currentSection = null;
      } else if (block.type === 'section') {
        currentSection = block;
      }
    }
    return { chapter: null, section: null };
  };

  // Toggle collapse state
  const toggleCollapse = (blockId: string) => {
    setCollapsedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  };

  const addBlock = (type: 'text' | 'chapter' | 'section' | 'pagebreak', insertAfter?: string) => {
    const newBlock: TextBlock = {
      id: Date.now().toString(),
      type,
      content: type === 'pagebreak' ? '--- Page Break ---' : 
                type === 'chapter' ? 'Chapter Title' :
                type === 'section' ? 'Section Title' : '',
      isCollapsed: false
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
          return `\n# ${block.content}\n`;
        case 'section':
          return `\n## ${block.content}\n`;
        case 'pagebreak':
          return '\n---\n';
        default:
          return `${block.content}\n`;
      }
    }).join('');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bookTitle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Your book has been exported successfully.",
    });
  };

  const fontStyle = customFont ? { fontFamily: `"${customFont}", serif` } : {};

  return (
    <div className="min-h-screen bg-gradient-subtle" style={fontStyle}>
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
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
                onClick={() => setShowOutline(!showOutline)}
                className="flex items-center gap-2 shadow-quirky"
              >
                <FileText className="h-4 w-4" />
                Outline
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPostIt(!showPostIt)}
                className="flex items-center gap-2 shadow-quirky"
              >
                <StickyNote className="h-4 w-4" />
                Notes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAiPanel(!showAiPanel)}
                className={showAiPanel ? "bg-primary text-primary-foreground" : ""}
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportContent}
                className="flex items-center gap-2 shadow-quirky"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Document Outline Sidebar */}
          {showOutline && (
            <div className="w-80 flex-shrink-0">
              <DocumentOutline 
                blocks={blocks}
                collapsedBlocks={collapsedBlocks}
                onNavigateToBlock={(blockId) => {
                  const element = document.getElementById(`block-${blockId}`);
                  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                onToggleCollapse={toggleCollapse}
              />
            </div>
          )}

          {/* Writing Area */}
          <div className="flex-1 max-w-4xl">
            {/* AI Panel */}
            {showAiPanel && (
              <Card className="mb-6 border-quirky shadow-quirky bg-accent/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-primary">AI Writing Assistant</h3>
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Describe what you need help with... (or select text first)"
                      className="flex-1"
                      rows={2}
                    />
                    <Button onClick={handleAiPrompt} className="self-end">
                      Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Block Controls */}
            <Card className="mb-6 border-quirky shadow-quirky bg-card/90">
              <CardContent className="p-4">
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('text')}
                    className="shadow-quirky border-primary/40 hover:shadow-soft"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Text Block
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('chapter')}
                    className="shadow-quirky border-primary/40 hover:shadow-soft"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Chapter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock('section')}
                    className="shadow-quirky border-primary/40 hover:shadow-soft"
                  >
                    <Hash className="h-4 w-4 mr-2" />
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
            <div className="space-y-4">
              {blocks.map((block, index) => {
                const isVisible = isBlockVisible(block);
                const isCollapsed = collapsedBlocks.has(block.id);
                const parent = getBlockParent(block.id);
                const wordCount = block.type === 'text' ? getWordCount(block.content) : 0;

                if (!isVisible) return null;

                return (
                  <div key={block.id} id={`block-${block.id}`} className="group">
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
                      <Card className={`border-quirky shadow-quirky hover:shadow-soft transition-all duration-300 bg-card/90 ${
                        block.type === 'chapter' ? 'border-l-4 border-l-primary ml-0' : 
                        block.type === 'section' ? 'border-l-4 border-l-secondary ml-4' : 
                        'ml-8 border-l-2 border-l-muted'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              {/* Header for Chapter/Section */}
                              {(block.type === 'chapter' || block.type === 'section') && (
                                <div className="mb-4 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleCollapse(block.id)}
                                      className="h-6 w-6 p-0 hover:bg-muted"
                                    >
                                      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </Button>
                                    <label className={`text-sm font-medium flex items-center gap-2 ${
                                      block.type === 'chapter' ? 'text-primary' : 'text-secondary'
                                    }`}>
                                      {block.type === 'chapter' ? <BookOpen className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
                                      {block.type === 'chapter' ? 'Chapter' : 'Section'} Title
                                    </label>
                                  </div>
                                </div>
                              )}

                              {/* Parent context indicator for text blocks */}
                              {block.type === 'text' && (parent.chapter || parent.section) && (
                                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                                  {parent.chapter && (
                                    <span className="flex items-center gap-1">
                                      <BookOpen className="h-3 w-3" />
                                      {parent.chapter.content || 'Untitled Chapter'}
                                    </span>
                                  )}
                                  {parent.section && (
                                    <span className="flex items-center gap-1">
                                      <Hash className="h-3 w-3" />
                                      {parent.section.content || 'Untitled Section'}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Content Area */}
                              {!isCollapsed && (
                                <>
                                  <Textarea
                                    ref={block.id === selectedBlockId ? textareaRef : undefined}
                                    value={block.content}
                                    onChange={(e) => updateBlock(block.id, e.target.value)}
                                    placeholder={
                                      block.type === 'chapter' ? 'Enter chapter title...' :
                                      block.type === 'section' ? 'Enter section title...' :
                                      'Start writing...'
                                    }
                                    className={`border-none resize-none focus:ring-0 p-0 bg-transparent ${
                                      block.type === 'chapter' ? 'text-2xl font-bold text-primary' :
                                      block.type === 'section' ? 'text-xl font-semibold text-secondary' :
                                      'text-base'
                                    }`}
                                    rows={block.type === 'text' ? 8 : 2}
                                    onFocus={() => setSelectedBlockId(block.id)}
                                  />

                                  {/* Word count for text blocks */}
                                  {block.type === 'text' && wordCount > 0 && (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                      {wordCount} words
                                    </div>
                                  )}
                                </>
                              )}

                              {/* Collapsed indicator */}
                              {isCollapsed && (
                                <div className="text-sm text-muted-foreground italic">
                                  Content collapsed... ({block.content.slice(0, 50)}{block.content.length > 50 ? '...' : ''})
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-1">
                              {block.type === 'text' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleCollapse(block.id)}
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Toggle collapse"
                                  >
                                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                  </Button>
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
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* PostIt Note Component */}
      <PostItNote
        isVisible={showPostIt}
        onClose={() => setShowPostIt(false)}
      />
    </div>
  );
};