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
    const savedData = localStorage.getItem('pushtak_postit');
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
    localStorage.setItem('pushtak_postit', JSON.stringify(saveData));
  }, [notes, checklistItems, position]);

  const addChecklistItem = () => {
    if (newItemText.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: newItemText.trim(),
        checked: false
      };
      setChecklistItems(prev => [...prev, newItem]);
      setNewItemText("");
    }
  };

  const removeChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const updateChecklistItem = (id: string, newText: string) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id ? { ...item, text: newText } : item
    ));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === noteRef.current || (e.target as Element).closest('.drag-handle')) {
      setIsDragging(true);
      const rect = noteRef.current!.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - 300, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 400, e.clientY - dragOffset.y));
        setPosition({ x: newX, y: newY });
      }
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

  if (!isVisible) return null;

  const completedCount = checklistItems.filter(item => item.checked).length;
  const totalCount = checklistItems.length;

  return (
    <div
      ref={noteRef}
      className="fixed z-50 w-80 select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: isMinimized ? 'scale(0.8)' : 'scale(1)',
        transformOrigin: 'top left',
        transition: 'transform 0.2s ease-in-out'
      }}
      onMouseDown={handleMouseDown}
    >
      <Card className="bg-yellow-100 border-yellow-300 shadow-lg border-2" style={{ backgroundColor: '#fef3c7' }}>
        <CardHeader className="pb-2 drag-handle cursor-move">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-yellow-600" />
              <span className="font-semibold text-sm text-yellow-800">Quick Notes</span>
              {totalCount > 0 && (
                <span className="text-xs text-yellow-600">
                  ({completedCount}/{totalCount})
                </span>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-yellow-600 hover:bg-yellow-200"
              >
                {isMinimized ? <Plus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 text-yellow-600 hover:bg-yellow-200"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="space-y-3">
            {/* Notes section */}
            <div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down your thoughts, ideas, character notes..."
                className="bg-yellow-50 border-yellow-200 text-yellow-900 placeholder:text-yellow-500 resize-none"
                rows={4}
              />
            </div>

            {/* Checklist section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-yellow-800">Quick Checklist</h4>
              
              {/* Add new item */}
              <div className="flex gap-2">
                <Input
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Add todo item..."
                  className="bg-yellow-50 border-yellow-200 text-yellow-900 placeholder:text-yellow-500 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                />
                <Button
                  onClick={addChecklistItem}
                  size="sm"
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-200"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Checklist items */}
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={() => toggleChecklistItem(item.id)}
                      className="border-yellow-400"
                    />
                    <Input
                      value={item.text}
                      onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                      className={`bg-transparent border-none text-sm p-0 h-auto focus:ring-0 ${
                        item.checked ? 'line-through text-yellow-600' : 'text-yellow-900'
                      }`}
                    />
                    <Button
                      onClick={() => removeChecklistItem(item.id)}
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 text-yellow-600 hover:bg-yellow-200"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Character/Plot tracker */}
            <div className="pt-2 border-t border-yellow-200">
              <div className="text-xs text-yellow-600 space-y-1">
                <div>💡 <strong>Tip:</strong> Use this for character names, plot points, or research notes</div>
                <div>📝 Everything saves automatically</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
