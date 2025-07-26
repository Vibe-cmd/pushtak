import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookCard } from "@/components/BookCard";
import { WritingEditor } from "@/components/WritingEditor";
import { Settings } from "@/components/Settings";
import { PostItNote } from "@/components/PostItNote";
import { BookOpen, Settings as SettingsIcon, Trash2, StickyNote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Book {
  title: string;
  lastModified: string;
}

const Index = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [customFont, setCustomFont] = useState('ReenieBeanie');
  const [showPostIt, setShowPostIt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBooks();
    // Load font and font size from localStorage
    const savedFont = localStorage.getItem('writeaid_font');
    const savedFontSize = localStorage.getItem('writeaid_font_size');
    if (savedFont) {
      setCustomFont(savedFont);
      document.documentElement.style.setProperty('--app-font-family', `'${savedFont}', cursive, sans-serif`);
    } else {
      setCustomFont('ReenieBeanie');
      document.documentElement.style.setProperty('--app-font-family', `'ReenieBeanie', cursive, sans-serif`);
    }
    if (savedFontSize) {
      document.documentElement.style.setProperty('--app-font-size', `${savedFontSize}px`);
    } else {
      document.documentElement.style.setProperty('--app-font-size', `20px`);
    }
  }, []);

  const loadBooks = () => {
    const savedBooks: Book[] = [];
    
    // Scan localStorage for writeaid books
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('writeaid_') && key !== 'writeaid_font') {
        const bookTitle = key.replace('writeaid_', '');
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            savedBooks.push({
              title: bookTitle,
              lastModified: parsed.timestamp || new Date().toISOString()
            });
          } catch (e) {
            // Skip invalid entries
          }
        }
      }
    }
    
    // Sort by last modified
    savedBooks.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    setBooks(savedBooks);
  };

  const createBook = (title: string) => {
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

    setBooks(prev => [newBook, ...prev]);
    setCurrentBook(title);
    
    toast({
      title: "Book created",
      description: `Started writing "${title}"`
    });
  };

  const openBook = (title: string) => {
    setCurrentBook(title);
  };

  const deleteBook = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem(`writeaid_${title}`);
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

  if (currentBook) {
    return (
      <WritingEditor
        bookTitle={currentBook}
        onBack={() => setCurrentBook(null)}
        customFont={customFont}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <BookOpen className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="w-full flex flex-col items-center">
                <h1
                  className="font-extrabold text-primary text-center"
                  style={{ fontSize: 'calc(var(--app-font-size) * 3.5)' }}
                >
                  pushtak
                </h1>
                <p
                  className="text-muted-foreground text-center"
                  style={{ fontSize: 'calc(var(--app-font-size) * 1.3)' }}
                >
                  Your AI writing companion
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
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
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 shadow-quirky"
              >
                <SettingsIcon className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {books.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <h2 style={{ fontSize: 'calc(var(--app-font-size) * 2)' }} className="font-bold text-primary mb-2">Welcome to pushtak</h2>
              <p style={{ fontSize: 'calc(var(--app-font-size) * 1.1)' }} className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start your creative journey. Create your first book and let AI help you craft amazing stories.
              </p>
            </div>
            <BookCard onCreateBook={createBook} />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 style={{ fontSize: 'calc(var(--app-font-size) * 2)' }} className="font-bold text-primary">Your Books</h2>
                <p style={{ fontSize: 'calc(var(--app-font-size) * 0.8)' }} className="text-muted-foreground">Continue writing or start a new project</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <BookCard onCreateBook={createBook} />
              
              {books.map((book) => (
                <Card
                  key={book.title}
                  className="cursor-pointer group hover:shadow-soft transition-all duration-300 border-quirky shadow-quirky hover:border-primary/60 bg-card/90"
                  onClick={() => openBook(book.title)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => deleteBook(book.title, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto w-auto hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <h3 className="font-semibold text-primary mb-2 line-clamp-2">
                      {book.title}
                    </h3>
                    
                    <p style={{ fontSize: 'calc(var(--app-font-size) * 0.7)' }} className="text-muted-foreground">
                      Last edited: {formatDate(book.lastModified)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
        <Settings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          customFont={customFont}
          onFontChange={setCustomFont}
        />

        <PostItNote
          isVisible={showPostIt}
          onClose={() => setShowPostIt(false)}
        />
    </div>
  );
};

export default Index;