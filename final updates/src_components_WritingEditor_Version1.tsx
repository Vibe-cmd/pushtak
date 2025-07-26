// Add to imports
import { PostItNote } from "@/components/PostItNote";
import { StickyNote } from "lucide-react";

// Add to state variables (around line 27)
const [showPostIt, setShowPostIt] = useState(false);

// Add to header buttons (around line 175, after the AI Assistant button)
<Button
  variant="outline"
  size="sm"
  onClick={() => setShowPostIt(!showPostIt)}
  className="flex items-center gap-2 shadow-quirky"
>
  <StickyNote className="h-4 w-4" />
  Notes
</Button>

// Add before the closing div of the component (around line 370)
<PostItNote
  isVisible={showPostIt}
  onClose={() => setShowPostIt(false)}
/>