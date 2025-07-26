import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus, StickyNote, X } from "lucide-react";

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface PostItNoteProps {
  isVisible: boolean;
  onClose: () => void;
}

export const PostItNote = ({ isVisible, onClose }: PostItNoteProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [notes, setNotes] = useState("");
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  
  const noteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('writeaid_postit');
    if (savedData) {
      const { notes: savedNotes, checklistItems: savedItems, position: savedPosition } = JSON.parse(savedData);
      setNotes(savedNotes || "");
      setChecklistItems(savedItems || []);
      if (savedPosition) {
        setPosition(savedPosition);
      }
    }
  }, []);

  useEffect(() => {
    const saveData = {
      notes,
      checklistItems,
      position
    };
    localStorage.setItem('writeaid_postit', JSON.stringify(saveData));
  }, [notes, checklistItems, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMinimized) return;
    setIsDragging(true);
    const rect = noteRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - 300;
      const maxY = window.innerHeight - 200;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const addChecklistItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText,
      checked: false
    };
    
    setChecklistItems(prev => [...prev, newItem]);
    setNewItemText("");
  };

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const removeChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id));
  };

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <div
        className="fixed z-50 cursor-pointer"
        style={{ left: position.x, top: position.y }}
        onClick={() => setIsMinimized(false)}
      >
        <div className="bg-accent p-3 rounded-lg shadow-quirky border-quirky hover:scale-105 transition-all duration-200">
          <StickyNote className="h-6 w-6 text-accent-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={noteRef}
      className="fixed z-50 w-80"
      style={{ left: position.x, top: position.y }}
    >
      <Card className="border-quirky shadow-quirky bg-secondary/95 backdrop-blur-sm">
        <CardHeader 
          className="pb-2 cursor-move bg-accent rounded-t-lg"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-accent-foreground">
              <StickyNote className="h-4 w-4" />
              <span className="text-sm font-medium">Notes & Tracking</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0 hover:bg-accent-foreground/10"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 hover:bg-accent-foreground/10"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Notes Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Quick Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Character details, plot ideas, reminders..."
              className="min-h-[80px] border-primary/30 focus:border-primary bg-card"
              rows={3}
            />
          </div>

          {/* Checklist Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-card-foreground">Tracking Checklist</label>
            
            {/* Add new item */}
            <div className="flex gap-2">
              <Input
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Add character, event, etc..."
                className="flex-1 border-primary/30 focus:border-primary bg-card"
                onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
              />
              <Button
                onClick={addChecklistItem}
                size="sm"
                className="px-3 shadow-quirky"
                disabled={!newItemText.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Checklist items */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleChecklistItem(item.id)}
                    className="border-primary/50"
                  />
                  <span 
                    className={`flex-1 text-sm ${
                      item.checked 
                        ? 'line-through text-muted-foreground' 
                        : 'text-card-foreground'
                    }`}
                  >
                    {item.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeChecklistItem(item.id)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
