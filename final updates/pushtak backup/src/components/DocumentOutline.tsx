import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, Hash, ChevronDown, ChevronRight, EyeOff, Eye } from "lucide-react";

interface TextBlock {
  id: string;
  type: 'text' | 'chapter' | 'section' | 'pagebreak';
  content: string;
  parentId?: string;
  isCollapsed?: boolean;
  metadata?: {
    chapterNumber?: number;
    sectionNumber?: number;
    parentChapter?: string;
    wordCount?: number;
    tags?: string[];
    notes?: string;
    level?: number;
  };
}

interface DocumentOutlineProps {
  blocks: TextBlock[];
  collapsedBlocks: Set<string>;
  onNavigateToBlock: (blockId: string) => void;
  onToggleCollapse: (blockId: string) => void;
}

interface OutlineStructure {
  id: string;
  type: 'chapter' | 'section' | 'text';
  content: string;
  wordCount: number;
  sections?: OutlineStructure[];
  textBlocks?: OutlineStructure[];
}

export const DocumentOutline = ({ 
  blocks, 
  collapsedBlocks, 
  onNavigateToBlock, 
  onToggleCollapse 
}: DocumentOutlineProps) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const getOutlineStructure = (): OutlineStructure[] => {
    const structure: OutlineStructure[] = [];
    let currentChapter: OutlineStructure | null = null;
    let currentSection: OutlineStructure | null = null;

    blocks.forEach(block => {
      // Skip pagebreak blocks in outline
      if (block.type === 'pagebreak') {
        return;
      }

      if (block.type === 'chapter') {
        currentChapter = {
          id: block.id,
          type: 'chapter',
          content: block.content,
          sections: [],
          textBlocks: [],
          wordCount: 0
        };
        currentSection = null;
        structure.push(currentChapter);
      } else if (block.type === 'section') {
        currentSection = {
          id: block.id,
          type: 'section',
          content: block.content,
          textBlocks: [],
          wordCount: 0
        };
        if (currentChapter) {
          currentChapter.sections!.push(currentSection);
        } else {
          structure.push(currentSection);
        }
      } else if (block.type === 'text') {
        const wordCount = block.content.trim().split(/\s+/).filter(word => word.length > 0).length;
        const textBlock: OutlineStructure = {
          id: block.id,
          type: 'text',
          content: block.content,
          wordCount: wordCount
        };

        if (currentSection) {
          currentSection.textBlocks!.push(textBlock);
          currentSection.wordCount += wordCount;
          if (currentChapter) {
            currentChapter.wordCount += wordCount;
          }
        } else if (currentChapter) {
          currentChapter.textBlocks!.push(textBlock);
          currentChapter.wordCount += wordCount;
        } else {
          structure.push(textBlock);
        }
      }
    });

    return structure;
  };

  const structure = getOutlineStructure();
  const totalWords = structure.reduce((total, item) => total + item.wordCount, 0);

  if (isMinimized) {
    return (
      <Card className="w-12 border-quirky shadow-quirky">
        <CardContent className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(false)}
            className="h-8 w-8 p-0"
            title="Show outline"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-quirky shadow-quirky bg-card/95 backdrop-blur-sm sticky top-24">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Document Structure</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-6 w-6 p-0"
            title="Minimize outline"
          >
            <EyeOff className="h-3 w-3" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          {totalWords} total words
        </div>
      </CardHeader>
      
      <CardContent className="p-3 overflow-y-auto max-h-96">
        <div className="space-y-1">
          {structure.length === 0 ? (
            <div className="text-xs text-muted-foreground p-2">
              No content yet. Start writing to see the document structure.
            </div>
          ) : (
            structure.map((item) => (
              <OutlineItem
                key={item.id}
                item={item}
                level={0}
                collapsedBlocks={collapsedBlocks}
                onNavigateToBlock={onNavigateToBlock}
                onToggleCollapse={onToggleCollapse}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface OutlineItemProps {
  item: OutlineStructure;
  level: number;
  collapsedBlocks: Set<string>;
  onNavigateToBlock: (blockId: string) => void;
  onToggleCollapse: (blockId: string) => void;
}

const OutlineItem = ({ 
  item, 
  level, 
  collapsedBlocks, 
  onNavigateToBlock, 
  onToggleCollapse 
}: OutlineItemProps) => {
  const hasChildren = (item.sections && item.sections.length > 0) || (item.textBlocks && item.textBlocks.length > 0);
  const isCollapsed = collapsedBlocks.has(item.id);

  const getIcon = () => {
    switch (item.type) {
      case 'chapter':
        return <BookOpen className="h-3 w-3 text-primary" />;
      case 'section':
        return <Hash className="h-3 w-3 text-secondary" />;
      case 'text':
        return <FileText className="h-3 w-3 text-muted-foreground" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getTextColor = () => {
    switch (item.type) {
      case 'chapter':
        return 'text-primary font-semibold';
      case 'section':
        return 'text-secondary font-medium';
      case 'text':
        return 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  };

  const displayContent = item.content.trim() || `Untitled ${item.type}`;
  const truncatedContent = displayContent.length > 30 ? displayContent.slice(0, 30) + '...' : displayContent;

  return (
    <div>
      <div
        className={`flex items-center gap-2 p-2 rounded text-xs hover:bg-muted cursor-pointer transition-colors ${getTextColor()}`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onNavigateToBlock(item.id)}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(item.id);
            }}
            className="h-4 w-4 p-0 hover:bg-muted-foreground/20"
          >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        )}
        
        {!hasChildren && <div className="w-4" />}
        
        {getIcon()}
        
        <span className="flex-1 truncate" title={displayContent}>
          {truncatedContent}
        </span>
        
        {item.wordCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {item.wordCount}w
          </span>
        )}
      </div>

      {/* Render children if not collapsed */}
      {hasChildren && !isCollapsed && (
        <div>
          {/* Sections */}
          {item.sections?.map((section) => (
            <OutlineItem
              key={section.id}
              item={section}
              level={level + 1}
              collapsedBlocks={collapsedBlocks}
              onNavigateToBlock={onNavigateToBlock}
              onToggleCollapse={onToggleCollapse}
            />
          ))}
          
          {/* Text blocks */}
          {item.textBlocks?.map((textBlock) => (
            <OutlineItem
              key={textBlock.id}
              item={textBlock}
              level={level + 1}
              collapsedBlocks={collapsedBlocks}
              onNavigateToBlock={onNavigateToBlock}
              onToggleCollapse={onToggleCollapse}
            />
          ))}
        </div>
      )}
    </div>
  );
};