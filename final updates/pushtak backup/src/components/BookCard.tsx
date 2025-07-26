import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Plus, BookOpen } from "lucide-react";

interface BookCardProps {
  onCreateBook: (title: string) => void;
}

export const BookCard = ({ onCreateBook }: BookCardProps) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreateBook(title.trim());
      setTitle("");
      setShowForm(false);
    }
  };

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        variant="outline"
        size="lg"
        className="h-32 w-48 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all duration-300 hover:shadow-soft"
      >
        <div className="flex flex-col items-center gap-3">
          <Plus className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm font-medium">New Book</span>
        </div>
      </Button>
    );
  }

  return (
    <Card className="w-48 shadow-soft border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="h-4 w-4" />
          <span className="text-sm font-medium">New Book</span>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-0">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter book title..."
            className="border-primary/30 focus:border-primary"
            autoFocus
          />
        </CardContent>
        <CardFooter className="flex gap-2 pt-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowForm(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="flex-1"
            disabled={!title.trim()}
          >
            Create
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};