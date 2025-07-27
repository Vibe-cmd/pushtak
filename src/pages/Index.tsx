import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, BookOpen, Plus, Trash2, Settings as SettingsIcon, StickyNote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFontSize } from "@/hooks/use-font-size";
import { WritingEditor } from "@/components/WritingEditor";
import { Settings as SettingsModal } from "@/components/Settings";
import { PostItNote } from "@/components/PostItNote";

interface Book {
  title: string;
  lastModified: string;
}

const Index = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<string | null>(null);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [customFont, setCustomFont] = useState("");
  const [showPostIt, setShowPostIt] = useState(false);
  const { toast } = useToast();
  const { fontSize } = useFontSize();

  // Load books and settings on mount
  useEffect(() => {
    // One-time cleanup of any leftover development data
    const hasRunCleanup = localStorage.getItem('pushtak_cleanup_complete');
    if (!hasRunCleanup) {
      // Clear any existing book data that might be from development
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('pushtak_') && 
            key !== 'pushtak_font' && 
            key !== 'pushtak_custom_font' && 
            key !== 'pushtak_custom_font_name' &&
            key !== 'pushtak_custom_font_size' &&
            key !== 'pushtak_font_size' &&
            key !== 'pushtak_postit' &&
            key !== 'pushtak_cleanup_complete') {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      localStorage.setItem('pushtak_cleanup_complete', 'true');
    }

    loadBooks();
    const savedFont = localStorage.getItem('pushtak_font');
    if (savedFont) {
      setCustomFont(savedFont);
      loadGoogleFont(savedFont);
    }
  }, []);

  const loadBooks = () => {
    const savedBooks: Book[] = [];
    
    try {
      // Scan localStorage for pushtak books
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('pushtak_') && 
            key !== 'pushtak_font' && 
            key !== 'pushtak_custom_font' && 
            key !== 'pushtak_custom_font_name' &&
            key !== 'pushtak_custom_font_size' &&
            key !== 'pushtak_font_size' &&
            key !== 'pushtak_postit' &&
            key !== 'pushtak_cleanup_complete') {
          const bookTitle = key.replace('pushtak_', '');
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              savedBooks.push({
                title: bookTitle,
                lastModified: parsed.timestamp || new Date().toISOString()
              });
            } catch (e) {
              console.warn(`Skipping invalid book data for ${bookTitle}:`, e);
              // Remove corrupted data
              localStorage.removeItem(key);
            }
          }
        }
      }
      
      // Sort by last modified
      savedBooks.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
      setBooks(savedBooks);
    } catch (error) {
      console.warn('Error loading books:', error);
      setBooks([]);
    }
  };

  const loadGoogleFont = (fontName: string) => {
    if (!fontName) return;
    
    const link = document.createElement('link');
    link.id = 'google-font-link';
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName.replace(/\s+/g, '+'))}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  };

  const createBook = (title: string) => {
    if (!title.trim()) {
      toast({
        title: "Invalid title",
        description: "Please enter a book title.",
        variant: "destructive"
      });
      return;
    }

    if (books.find(book => book.title === title)) {
      toast({
        title: "Book exists",
        description: "A book with this title already exists.",
        variant: "destructive"
      });
      return;
    }

    const newBook: Book = {
      title,
      lastModified: new Date().toISOString()
    };

    // Immediately save the book to localStorage with initial empty content
    const initialBookData = {
      bookTitle: title,
      blocks: [{ id: '1', type: 'text', content: '', isCollapsed: false }],
      collapsedBlocks: [],
      timestamp: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(`pushtak_${title}`, JSON.stringify(initialBookData));
      
      setBooks(prev => [newBook, ...prev]);
      setCurrentBook(title);
      setNewBookTitle("");
      
      toast({
        title: "Book created",
        description: `Started writing "${title}"`
      });
    } catch (error) {
      console.error('Error creating book:', error);
      toast({
        title: "Error creating book",
        description: "Unable to save the book. Please check your browser storage.",
        variant: "destructive"
      });
    }
  };

  const openBook = (title: string) => {
    setCurrentBook(title);
  };

  const deleteBook = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem(`pushtak_${title}`);
    setBooks(prev => prev.filter(book => book.title !== title));
    
    toast({
      title: "Book deleted",
      description: `"${title}" has been removed.`
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fontStyle = customFont ? { fontFamily: `"${customFont}", serif` } : {};

  if (currentBook) {
    return (
      <div className="writing-content">
        <WritingEditor
          bookTitle={currentBook}
          onBack={() => setCurrentBook(null)}
          customFont={customFont}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle" style={{ 
      ...fontStyle, 
      fontSize: `${fontSize}px`
    }}>
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center relative">
            {/* Centered title with logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/favicon.ico" 
                alt="Pushtak Logo" 
                className="h-12 w-12" 
              />
              <h1 className="app-title text-primary">
                Pushtak
              </h1>
            </div>
            
            {/* Settings buttons positioned absolutely on the right */}
            <div className="absolute right-0 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPostIt(!showPostIt)}
                className="shadow-quirky border-primary/40 hover:shadow-soft"
              >
                <StickyNote className="h-4 w-4 mr-2" />
                Notes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="shadow-quirky border-primary/40 hover:shadow-soft"
              >
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Create New Book */}
        <Card className="mb-8 border-quirky shadow-quirky bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Plus className="h-5 w-5" />
              Start Writing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
                placeholder="Enter your book title..."
                className="flex-1 border-primary/30 focus:border-primary"
                onKeyPress={(e) => e.key === 'Enter' && createBook(newBookTitle)}
              />
              <Button 
                onClick={() => createBook(newBookTitle)}
                className="shadow-quirky hover:shadow-soft"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Create Book
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card 
              key={book.title}
              className="border-quirky shadow-quirky hover:shadow-soft transition-all duration-300 cursor-pointer bg-card/90 group"
              onClick={() => openBook(book.title)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <BookOpen className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => deleteBook(book.title, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 text-primary group-hover:text-primary/80 transition-colors">
                  {book.title}
                </h3>
                
                <p className="text-sm text-muted-foreground">
                  Last edited: {formatDate(book.lastModified)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {books.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No books yet</h3>
            <p className="text-muted-foreground">Create your first book to get started!</p>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        customFont={customFont}
        onFontChange={setCustomFont}
      />

      {/* PostIt Note */}
      <PostItNote
        isVisible={showPostIt}
        onClose={() => setShowPostIt(false)}
      />
    </div>
  );
};

export default Index;