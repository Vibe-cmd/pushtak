// Enhanced TextBlock interface
interface TextBlock {
  id: string;
  type: 'text' | 'chapter' | 'section' | 'pagebreak';
  content: string;
  metadata?: {
    chapterNumber?: number;
    sectionNumber?: number;
    parentChapter?: string;
    wordCount?: number;
    tags?: string[];
    notes?: string;
  };
  level?: number; // For nested sections
}

// Add word counting function
const getWordCount = (text: string) => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Enhanced block rendering with better structure
const renderBlock = (block: TextBlock, index: number) => {
  const isChapter = block.type === 'chapter';
  const isSection = block.type === 'section';
  const wordCount = block.type === 'text' ? getWordCount(block.content) : 0;

  return (
    <div key={block.id} className="group">
      {block.type === 'pagebreak' ? (
        // ... existing pagebreak code
      ) : (
        <Card className={`border-quirky shadow-quirky hover:shadow-soft transition-all duration-300 bg-card/90 ${
          isChapter ? 'border-l-4 border-l-primary' : 
          isSection ? 'border-l-4 border-l-secondary' : ''
        }`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                {/* Chapter/Section Header with numbering */}
                {(isChapter || isSection) && (
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className={`text-sm font-medium text-muted-foreground flex items-center gap-2 ${
                        isChapter ? 'text-primary' : 'text-secondary'
                      }`}>
                        {isChapter ? '📖' : '📑'} 
                        {isChapter ? 'Chapter' : 'Section'} 
                        {block.metadata?.chapterNumber && ` ${block.metadata.chapterNumber}`}
                        {block.metadata?.sectionNumber && ` ${block.metadata.sectionNumber}`}
                        Title
                      </label>
                      {/* Auto-numbering toggle */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAutoNumbering(block.id)}
                        className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                        title="Toggle auto-numbering"
                      >
                        #
                      </Button>
                    </div>
                  </div>
                )}

                <Textarea
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, e.target.value)}
                  placeholder={
                    isChapter ? 'Enter chapter title...' :
                    isSection ? 'Enter section title...' :
                    'Start writing...'
                  }
                  className={`border-none resize-none focus:ring-0 p-0 bg-transparent ${
                    isChapter ? 'text-2xl font-bold text-primary' :
                    isSection ? 'text-xl font-semibold text-secondary' :
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

                {/* Block metadata */}
                {block.metadata?.notes && (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                    📝 {block.metadata.notes}
                  </div>
                )}
              </div>

              {/* Enhanced action buttons */}
              <div className="flex flex-col gap-1">
                {/* Existing buttons plus new ones */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addBlockMetadata(block.id)}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Add notes/metadata"
                >
                  📝
                </Button>
                {/* ... other existing buttons */}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};