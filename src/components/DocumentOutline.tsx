import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface DocumentOutlineProps {
  blocks: TextBlock[];
  onNavigateToBlock: (blockId: string) => void;
}

export const DocumentOutline = ({ blocks, onNavigateToBlock }: DocumentOutlineProps) => {
  const structureBlocks = blocks.filter(block => 
    block.type === 'chapter' || block.type === 'section'
  );

  return (
    <Card className="w-64 h-fit sticky top-20">
      <CardHeader className="pb-2">
        <h3 className="font-semibold text-sm">Document Structure</h3>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-1">
          {structureBlocks.map((block) => (
            <div
              key={block.id}
              className={`cursor-pointer p-2 rounded text-sm hover:bg-muted transition-colors ${
                block.type === 'chapter' ? 'font-semibold text-primary' : 'ml-4 text-secondary'
              }`}
              onClick={() => onNavigateToBlock(block.id)}
            >
              {block.type === 'chapter' ? '📖' : '📑'} {block.content || 'Untitled'}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};