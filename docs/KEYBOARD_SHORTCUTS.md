# Deenify - Keyboard Shortcuts (Planned Feature)

## Overview
This document outlines the keyboard shortcuts that can be implemented in a future iteration to enhance power user experience and accessibility.

## Global Shortcuts

### Navigation (Alt + Key)
- `Alt + D` - Go to Dashboard
- `Alt + Q` - Go to Quran page
- `Alt + H` - Go to Dhikr (Heart) Circle
- `Alt + K` - Go to Khatm page
- `Alt + C` - Go to Courses
- `Alt + Z` - Go to Zakat Calculator
- `Alt + A` - Go to AI Assistant
- `Alt + T` - Go to Achievements (Trophy)

### Actions
- `Space` - Increment Dhikr counter (when on Dhikr page)
- `R` - Reset Dhikr counter (when on Dhikr page)
- `Ctrl + K` or `Cmd + K` - Open quick search/command palette
- `Escape` - Close modals/dialogs
- `?` - Show keyboard shortcuts help

## Page-Specific Shortcuts

### Quran Page
- `P` - Play/Pause audio
- `N` - Next Surah
- `B` - Previous Surah (Back)
- `↑/↓` - Scroll through Surah list
- `Enter` - Select highlighted Surah

### Dhikr Page
- `Space` - Increment counter
- `Backspace` - Decrement counter
- `R` - Reset counter
- `G` - Set goal

### Dashboard
- `1-9` - Quick navigate to sections

### AI Assistant
- `Ctrl + Enter` or `Cmd + Enter` - Send message
- `Ctrl + L` or `Cmd + L` - Clear conversation

## Implementation Notes

### Technology Stack
```typescript
// Using react-hotkeys-hook
import { useHotkeys } from 'react-hotkeys-hook';

// Example implementation
export function DhikrPage() {
  const increment = () => { /* ... */ };
  
  useHotkeys('space', (e) => {
    e.preventDefault();
    increment();
  }, { enabled: true });
  
  // ...
}
```

### Accessibility Considerations
- All shortcuts should be disabled when typing in input fields
- Visual indicator when shortcut is available
- Tooltip showing available shortcuts on hover
- Help modal accessible via `?` key
- Support for screen readers

### Settings Integration
- User preference to enable/disable shortcuts
- Custom keybinding configuration
- Visual cheatsheet in settings page

## Future Enhancements
- Command palette (Cmd+K) for fuzzy search
- Vim-style navigation for advanced users
- Mobile gesture equivalents
- Context-aware shortcuts

## Package Recommendations
- `react-hotkeys-hook` - React hooks for keyboard shortcuts
- `cmdk` - Command palette component
- `hotkeys-js` - Vanilla JS alternative

## Priority Classification
- **High Priority:**
  - Space for Dhikr increment
  - Global navigation shortcuts
  - ESC for closing modals

- **Medium Priority:**
  - Quran audio controls
  - Quick search command palette
  - Help modal

- **Low Priority:**
  - Custom keybindings
  - Vim-style navigation
  - Advanced power user features

---

*Note: This is a planned feature for future implementation. Current iteration focused on core functionality and data persistence.*
