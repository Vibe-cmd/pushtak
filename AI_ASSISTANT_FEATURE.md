# AI Assistant Prompts Feature

## Overview
The AI Assistant now includes a comprehensive prompt selection system that allows writers to choose from predefined writing assistance categories instead of typing custom prompts every time.

## How to Use

### 1. Access the AI Assistant
- Click the "AI Assistant" button in the WritingEditor toolbar
- The AI panel will expand with the new prompt selection interface

### 2. Select a Prompt Category
Choose from five main categories:
- **Genres**: Romance, Science Fiction, Fantasy, Thriller, Mystery, Horror, Historical Fiction, Young Adult
- **Writing Styles**: Descriptive, Minimalist, First-Person Narrative, Poetic, Dialogue-Heavy, Stream of Consciousness
- **Tones and Emotions**: Humorous, Emotional Depth, Intense, Dark, Light-Hearted, Suspenseful, Inspirational
- **Grammar**: Proofreading, Sentence Structure, Punctuation, Consistency
- **Vocabulary**: Enhance Word Choice, Synonyms and Variety, Technical Terms, Idiomatic Expressions

### 3. Select a Specific Prompt
Once you choose a category, the second dropdown will populate with specific prompts for that category.

### 4. Preview Your Selection
The selected prompt will appear in a preview box, showing you exactly what instructions will be sent to the AI.

### 5. Add Optional Instructions
Use the text area to add any additional specific instructions or context.

### 6. Generate Your Request
Click the "Generate" button to open ChatGPT with your selected prompt and content.

## Workflow Examples

### Example 1: Genre-Specific Enhancement
1. Select "Genres" → "Romance"
2. Select text from your writing
3. Click Generate
4. The AI receives: "You are an experienced book writer with practical expertise in romance novels... [your selected text]"

### Example 2: Grammar Check
1. Select "Grammar" → "Proofreading"
2. Select the text you want checked
3. Click Generate
4. The AI receives the proofreading prompt with your text

### Example 3: Style Enhancement
1. Select "Writing Styles" → "Descriptive"
2. Select a passage that needs more vivid imagery
3. Add custom instruction: "Focus on sensory details"
4. Click Generate

## Features

- **Smart Text Replacement**: Selected text automatically replaces the "[User's content here]" placeholder in prompts
- **Fallback Support**: If no predefined prompt is selected, the system falls back to the original custom prompt functionality
- **Visual Indicators**: Clear indicators show when a prompt is selected
- **Easy Reset**: One-click clear button to reset all selections
- **Responsive Design**: Works seamlessly on all screen sizes

## Technical Implementation

The prompts are stored in `src/lib/prompts.ts` and are loaded from the original `prompts.txt` JSON structure. The system provides:

- Type-safe prompt selection
- Efficient prompt retrieval
- Modular architecture for easy prompt updates
- Integration with existing AI assistant workflow

## Benefits

1. **Consistency**: Ensures consistent prompt quality across writing sessions
2. **Efficiency**: Eliminates need to remember or retype complex prompts
3. **Discovery**: Helps writers discover new types of assistance they might not have considered
4. **Professional Quality**: Each prompt is crafted by writing experts for specific use cases
5. **Time Saving**: Reduces setup time for AI assistance requests
