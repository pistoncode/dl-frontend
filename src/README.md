# Frontend Architecture

## 🏗️ Architecture Overview

This project follows industry-standard practices with a **feature-based architecture** that separates concerns cleanly and scales efficiently.

## 📁 Directory Structure

```
src/
├── features/              # Feature modules (business logic)
│   └── onboarding/       # Onboarding feature
│       ├── components/   # Feature-specific components
│       ├── screens/      # Screen components
│       ├── services/     # Business logic & API calls
│       ├── hooks/        # Feature-specific hooks
│       ├── types/        # Feature-specific types
│       ├── utils/        # Feature utilities
│       ├── OnboardingContext.tsx
│       └── index.ts      # Feature exports
├── shared/               # Shared across features
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Basic UI (buttons, inputs)
│   │   ├── forms/       # Form components
│   │   └── layout/      # Layout components
│   ├── hooks/           # Shared React hooks
│   ├── utils/           # Utility functions
│   ├── types/           # Global types
│   └── constants/       # App constants
├── core/                # Core application functionality
│   ├── api/            # API client configuration
│   ├── storage/        # Local storage management
│   ├── theme/          # Theme and styling
│   └── config/         # App configuration
└── index.ts            # Main exports
```

## 🎯 Key Principles

### 1. **Feature-Based Organization**
- Each major feature is self-contained in its own directory
- Features export their public API through index files
- Features can only import from `shared/` and `core/`

### 2. **Clear Separation of Concerns**
- **`/app`**: Routing only (Expo Router files)
- **`/src/features`**: Business logic and feature-specific UI
- **`/src/shared`**: Components used across multiple features
- **`/src/core`**: Core app functionality (API, storage, config)

### 3. **Import Hierarchy**
```
features/ → shared/ → core/
    ↑        ↑        ↑
  Feature   Shared   Core
  code    components functionality
```

## 🔧 Import Patterns

### Path Aliases (configured in tsconfig.json)
```typescript
import { Button } from '@shared/components/ui';
import { OnboardingProvider } from '@features/onboarding';
import { API_CONFIG } from '@core/config';
```

### Feature Exports
```typescript
// features/onboarding/index.ts
export { PersonalInfoScreen } from './screens';
export { OnboardingProvider } from './OnboardingContext';
export type { OnboardingData } from './types';
```

### Route Files (Expo Router)
```typescript
// app/onboarding/personal-info.tsx
export { PersonalInfoScreen as default } from '@features/onboarding/screens';
```

## 📦 Adding New Features

### 1. Create Feature Directory
```bash
src/features/new-feature/
├── components/
├── screens/
├── services/
├── hooks/
├── types/
├── utils/
└── index.ts
```

### 2. Create Feature Index
```typescript
// src/features/new-feature/index.ts
export * from './screens';
export * from './components';
export * from './types';
```

### 3. Add Route Files
```typescript
// app/new-feature/screen-name.tsx
export { ScreenComponent as default } from '@features/new-feature/screens';
```

## 🎨 Component Guidelines

### Shared Components
- Used by 2+ features
- Generic and configurable
- Located in `src/shared/components/`

### Feature Components
- Specific to one feature
- Located in feature's `components/` directory
- Can import shared components

### Component Structure
```typescript
/**
 * Component documentation
 */
interface ComponentProps {
  // Props with JSDoc comments
}

const Component: React.FC<ComponentProps> = () => {
  // Component implementation
};

export default Component;
```

## 🔄 State Management

### Feature State
- Managed within feature boundaries
- Use React Context for feature-wide state
- Example: `OnboardingContext` for onboarding flow

### Global State
- Managed in `src/core/`
- Use for app-wide concerns (user auth, theme, etc.)

## 📱 Routing Strategy

### Expo Router (`/app`)
- Contains only routing files
- Imports and re-exports from features
- Keeps routing separate from business logic

### Navigation Logic
- Navigation logic stays in screens/components
- Use `expo-router` hooks for navigation

## 🧪 Testing Strategy

### Test Location
```
src/features/feature-name/
├── components/
│   ├── Component.tsx
│   └── Component.test.tsx
├── services/
│   ├── service.ts
│   └── service.test.tsx
```

### Test Types
- Unit tests for utilities and services
- Component tests for UI logic
- Integration tests for feature flows

## 📊 Benefits of This Architecture

### ✅ **Scalability**
- Easy to add new features
- Clear patterns for growth
- Parallel development possible

### ✅ **Maintainability**
- Easy to find and modify code
- Clear dependencies
- Consistent patterns

### ✅ **Team Collaboration**
- Clear ownership boundaries
- Reduced merge conflicts
- Easy onboarding for new developers

### ✅ **Code Reusability**
- Shared components prevent duplication
- Feature isolation enables reuse
- Clear public APIs

## 🚨 Anti-Patterns to Avoid

### ❌ **Don't**
- Import features from other features
- Put business logic in route files
- Create circular dependencies
- Mix UI and business logic in same file
- Use relative imports for distant files

### ✅ **Do**
- Use path aliases for clean imports
- Keep features independent
- Export through index files
- Separate UI from business logic
- Document component APIs

## 🔧 Tools & Configuration

### TypeScript
- Strict mode enabled
- Path aliases configured
- Comprehensive type coverage

### ESLint
- Import order rules
- Path alias enforcement
- Feature boundary rules

### File Naming Conventions
- PascalCase for components: `ComponentName.tsx`
- camelCase for utilities: `utilityFunction.ts`
- kebab-case for route files: `screen-name.tsx`

## 📚 Resources

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)

---

This architecture provides a solid foundation for building scalable React Native applications while maintaining clean code and developer experience.