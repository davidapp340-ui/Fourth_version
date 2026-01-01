# Exercise System Flow Diagram

## Complete Data Flow: Database → Component

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                 │
│  Table: exercises                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ id: fc51f0b7-d912-4ae9-b12c-f50b8c4fc932                 │  │
│  │ animation_id: "palming_v1"  ◄─── KEY LINKING FIELD       │  │
│  │ icon_id: "ball_icon_v1"                                   │  │
│  │ title_en: "Palming Exercise"                              │  │
│  │ title_he: "תרגיל כפות ידיים"                             │  │
│  │ description_en: "Rub your hands..."                       │  │
│  │ description_he: "שפשפו את כפות..."                        │  │
│  │ audio_path_en: "exercise-audio/palming_en.mp3"           │  │
│  │ audio_path_he: "exercise-audio/palming_he.mp3"           │  │
│  │ status: "active"                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Query via Supabase
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                 │
│  File: lib/exercises.ts                                          │
│                                                                   │
│  const exercise = await getExerciseById(id);                    │
│  // Returns typed Exercise object with animation_id             │
│                                                                   │
│  const localized = getLocalizedExercise(exercise, 'en');       │
│  // Returns: { title, description, audioUrl }                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Pass exercise.animation_id
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   COMPONENT REGISTRY                             │
│  File: components/exercises/ExerciseRegistry.tsx                 │
│                                                                   │
│  ExerciseRegistry = {                                           │
│    "palming_v1": PalmingAnimationComponent,  ◄─── MAPPED HERE   │
│    "ball_tracking_v1": BallTrackingComponent,                   │
│    // ... more exercises                                         │
│  }                                                               │
│                                                                   │
│  function getExerciseComponent(animationId: string) {           │
│    return ExerciseRegistry[animationId] || PlaceholderComponent;│
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Returns Component
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RENDERER                                      │
│  <ExerciseAnimationRenderer animationId="palming_v1" />         │
│                                                                   │
│  Renders the actual animation component                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Displays
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ANIMATION COMPONENT                             │
│  File: components/exercises/PalmingAnimation.tsx (TO BE CREATED)│
│                                                                   │
│  function PalmingAnimation() {                                  │
│    // Animated hands rubbing and covering eyes                  │
│    return <View>...</View>                                      │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Usage Example

```typescript
// 1. Fetch exercise from database
import { getExerciseById } from '@/lib/exercises';
const exercise = await getExerciseById('fc51f0b7-...');

// exercise.animation_id === "palming_v1"

// 2. Render animation using animation_id
import { ExerciseAnimationRenderer } from '@/components/exercises/ExerciseRegistry';

<ExerciseAnimationRenderer
  animationId={exercise.animation_id}
  onComplete={() => console.log('Done!')}
/>
```

## Key Linking Mechanism

The `animation_id` field is the **bridge** between database and code:

1. **Database stores**: `animation_id: "palming_v1"` (string)
2. **Registry maps**: `"palming_v1"` → `PalmingAnimationComponent` (React component)
3. **Renderer uses**: The animation_id to look up and render the correct component

## Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Database Table | ✅ Complete | exercises table with palming_v1 record |
| TypeScript Types | ✅ Complete | Full type safety in database.types.ts |
| Service Layer | ✅ Complete | lib/exercises.ts with all CRUD functions |
| Component Registry | ✅ Complete | Infrastructure ready to map IDs to components |
| Renderer Component | ✅ Complete | ExerciseAnimationRenderer ready to use |
| Palming Animation (RN) | ⏳ Pending | Need to create React Native version |
| Web Preview | ✅ Provided | palming_preview.tsx (reference only) |

## Next Action Required

**Create React Native Animation Component:**

```typescript
// components/exercises/PalmingAnimation.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Ellipse, Path } from 'react-native-svg';

export default function PalmingAnimation({ onComplete }: { onComplete?: () => void }) {
  // Convert web preview logic to React Native
  // Use react-native-reanimated for animations
  // Use react-native-svg for graphics

  return (
    <View style={styles.container}>
      {/* Animation here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

**Then register it:**

```typescript
// In components/exercises/ExerciseRegistry.tsx
import PalmingAnimation from './PalmingAnimation';

export const ExerciseRegistry = {
  'palming_v1': PalmingAnimation,
};
```

That's it! The system will automatically use this component when rendering exercises with `animation_id: "palming_v1"`.
