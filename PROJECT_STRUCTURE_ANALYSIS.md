# Frontend Project Structure Analysis

## 🔍 Current Structure Overview

### Issues Identified

1. **Duplicate Files & Folders**
   - Onboarding files exist in multiple locations:
     - `/src/screens/onboarding/`
     - `/src/onboarding/screens/`
     - `/app/onboarding/`
   - Components duplicated in:
     - `/src/components/`
     - `/src/onboarding/components/`
   - Services duplicated in:
     - `/src/services/`
     - `/src/onboarding/services/`

2. **Mixed Architecture Patterns**
   - Using both Expo Router (`/app` directory) and traditional React Navigation (`/src`)
   - Unclear separation between routing and business logic
   - Two different component folders (`/components` and `/src/components`)

3. **Inconsistent Organization**
   - Some features organized by type (components, services, screens)
   - Onboarding organized by feature
   - No clear pattern for where new features should go

## 📊 Industry Best Practices Comparison

### ✅ What Industry Does

1. **Feature-Based Architecture (Recommended for Scale)**
```
src/
├── features/           # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── onboarding/
│   └── leagues/
├── shared/            # Shared across features
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── core/              # Core app functionality
│   ├── api/
│   ├── navigation/
│   └── storage/
└── app/              # Expo Router (routing only)
```

2. **Domain-Driven Design**
```
src/
├── domains/          # Business domains
│   ├── user/
│   ├── sport/
│   └── league/
├── infrastructure/   # Technical concerns
│   ├── api/
│   ├── database/
│   └── navigation/
└── presentation/     # UI layer
    ├── components/
    └── screens/
```

3. **Atomic Design Pattern**
```
src/
├── components/
│   ├── atoms/       # Buttons, inputs
│   ├── molecules/   # Form groups
│   ├── organisms/   # Headers, cards
│   ├── templates/   # Page layouts
│   └── pages/       # Full screens
```

## 🚨 Critical Issues in Current Structure

1. **File Duplication** - Same files in multiple locations causing confusion
2. **No Clear Boundaries** - Unclear where feature code should live
3. **Mixed Routing Patterns** - Both `/app` and `/src/screens` handling screens
4. **Import Path Confusion** - Difficult to know which file to import
5. **Scalability Issues** - Hard to add new features without creating more chaos

## 🎯 Recommended Improvements

### Immediate Actions (Priority 1)

1. **Remove Duplicates**
```bash
# Delete duplicate files
- /src/screens/onboarding/* (keep /src/onboarding/screens/*)
- /src/services/*Questionnaire.ts (keep /src/onboarding/services/*)
- /src/components/{SportButton,NumberInput,etc} (keep shared ones only)
- /src/contexts/OnboardingContext.tsx (keep /src/onboarding/OnboardingContext.tsx)
```

2. **Consolidate Routing**
```
app/                    # Expo Router - routing ONLY
├── (auth)/            # Auth routes
├── (tabs)/            # Tab navigation
├── onboarding/        # Onboarding routes (import from src/features)
└── _layout.tsx

src/features/          # Business logic & UI
├── onboarding/
├── auth/
└── leagues/
```

3. **Establish Clear Patterns**
```typescript
// app/onboarding/personal-info.tsx
export { PersonalInfoScreen as default } from '@/features/onboarding/screens';

// All business logic in src/features
```

### Recommended Final Structure

```
frontend/
├── app/                      # Expo Router (routing only)
│   ├── (auth)/              # Auth group
│   ├── (tabs)/              # Main app tabs
│   ├── onboarding/          # Onboarding flow
│   └── _layout.tsx
├── src/
│   ├── features/            # Feature modules
│   │   ├── onboarding/
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── auth/
│   │   ├── leagues/
│   │   ├── matches/
│   │   └── profile/
│   ├── shared/              # Shared across features
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/         # Basic UI (buttons, inputs)
│   │   │   ├── forms/      # Form components
│   │   │   └── layout/     # Layout components
│   │   ├── hooks/          # Shared hooks
│   │   ├── utils/          # Shared utilities
│   │   ├── types/          # Global types
│   │   └── constants/      # App constants
│   ├── core/               # Core functionality
│   │   ├── api/           # API client & config
│   │   ├── storage/       # Local storage
│   │   ├── theme/         # Theme & styling
│   │   └── config/        # App configuration
│   └── assets/            # Images, fonts, etc.
├── package.json
└── tsconfig.json
```

## 📋 Migration Plan

### Phase 1: Clean Up Duplicates (Immediate)
```bash
# 1. Remove duplicate onboarding files
rm -rf src/screens/onboarding
rm -rf src/services/*Questionnaire.ts
rm -rf src/contexts/OnboardingContext.tsx

# 2. Remove duplicate components
rm src/components/SportButton.tsx
rm src/components/NumberInput.tsx
rm src/components/OptionButton.tsx
rm src/components/QuestionContainer.tsx
```

### Phase 2: Reorganize Structure (1-2 days)
1. Create `/src/features` directory
2. Move onboarding module to `/src/features/onboarding`
3. Create `/src/shared` for truly shared components
4. Update all imports

### Phase 3: Configure Path Aliases (Quick)
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"],
      "@core/*": ["./src/core/*"]
    }
  }
}
```

### Phase 4: Update Expo Router Files
```typescript
// app/onboarding/personal-info.tsx
export { PersonalInfoScreen as default } from '@features/onboarding';
```

## 🎯 Benefits of Recommended Structure

1. **Clear Separation of Concerns**
   - Routing in `/app`
   - Business logic in `/src/features`
   - Shared code in `/src/shared`

2. **Scalability**
   - Easy to add new features
   - Clear patterns for growth
   - No file conflicts

3. **Developer Experience**
   - Clear import paths
   - Easy to find files
   - Consistent patterns

4. **Maintainability**
   - Feature isolation
   - Clear dependencies
   - Easy testing

5. **Team Collaboration**
   - Clear ownership boundaries
   - Reduced merge conflicts
   - Parallel development

## 🚀 Quick Wins

1. **Delete all duplicate files** (5 minutes)
2. **Move `/components` to `/src/shared/components`** (10 minutes)
3. **Update imports to use path aliases** (30 minutes)
4. **Document the new structure** (Done with this file!)

## 📚 Additional Recommendations

1. **Add ESLint Rules**
```javascript
// Enforce import order and boundaries
{
  "rules": {
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal"],
      "pathGroups": [{
        "pattern": "@features/**",
        "group": "internal"
      }]
    }]
  }
}
```

2. **Create Feature Templates**
```bash
# Script to create new feature
npm run create:feature leagues
# Creates: src/features/leagues with all subdirectories
```

3. **Add Architecture Decision Records (ADRs)**
   - Document why structure decisions were made
   - Track architecture evolution
   - Help new developers understand patterns

## ⚠️ Current Anti-Patterns to Avoid

1. ❌ Mixing routing logic with business logic
2. ❌ Duplicating files across directories
3. ❌ Deep nesting (avoid > 4 levels)
4. ❌ Circular dependencies between features
5. ❌ Storing UI components in service directories

## ✅ Patterns to Follow

1. ✅ One source of truth for each file
2. ✅ Clear feature boundaries
3. ✅ Shared code in shared directory
4. ✅ Routing separate from logic
5. ✅ Consistent naming conventions

---

## Summary

The current structure has significant issues with duplication and mixed patterns. Moving to a feature-based architecture with clear separation between routing (`/app`) and business logic (`/src/features`) will greatly improve maintainability and scalability. The immediate priority should be removing duplicates and establishing clear patterns for the team to follow.