# Elara - Secure Women's Support Network Platform

## Overview

Elara is a React Native mobile application designed as a secure women's support network for users aged 18-35. It prioritizes safety, values-based connections, and real-world interactions over superficial matching. Key features include verified profiles, values-based matching, location-based discovery, real-time chat (mocked), and a unique "Buddy System" for safe returns home called "Caminhadas Elara." The app also integrates emergency contacts and encourages public meetups. Elara aims to foster genuine connections within a safe and empathetic environment, differentiating itself from generic social apps by focusing on purpose-driven interactions and robust safety mechanisms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React Native with Expo SDK 54, utilizing React Navigation v7 for nested stack navigators within a 5-tab bottom navigation (Discover, Map, Walk Together, Connections, Profile). UI is built with custom-themed components, supporting light/dark modes and animations via Reanimated v4. Gesture handling is managed by React Native Gesture Handler.
**State Management**: React Context API (`AuthContext`, `MatchesContext`) handles global state for authentication, user profiles, matches, and walk requests.
**Design System**: A consistent design system is implemented with a primary violet/purple color palette (#9B7DFF), defined in `constants/theme.ts`. The palette includes violet gradients, teal accent for safety features, and coral accent for warmth. See `design_guidelines.md` for complete documentation.
**Authentication & User Management**: Multi-provider authentication (Apple, Google, Email/password) is supported. User session and profile data are persisted using AsyncStorage. A multi-step onboarding flow collects profile information, values, hobbies, and emergency contacts.
**Location Services**: `expo-location` provides foreground and optional background location access, with user controls for range filters and privacy-focused messaging.
**Real-time Features**: Currently, real-time features like chat and walk requests are mocked using context-based data, with architecture prepared for future WebSocket and push notification integration.
**Navigation**: A 5-tab bottom navigation with a central Floating Action Button (FAB) for the "Walk Together" feature. Each tab uses a stack navigator for deep navigation.
**Safety Features**:
- **Emergency Contacts System**: Users must provide at least one emergency contact, integrated via `expo-contacts`.
- **Caminhadas Elara (Walk Together)**: A premium "Buddy System" feature allowing users to create or join verified group walks with real-time route sharing to trusted contacts, safety notes, and participant tracking. Features modular components:
  - `WalkSegmentedControl`: Tab switching between "Perto de mim" (nearby) and "Minhas caminhadas" (my walks)
  - `WalkFiltersChips`: Quick filter chips (Hoje, Fim de semana, Ate 3 km, Introvertidas, Pet-friendly, Sem alcool)
  - `WalkCard`: Enhanced cards with trust indicators (trust score, completed meetups), verified badges, distance/duration display, and filterable tags (12 WalkTag options)
  - `SafetyBanner`: Prominent safety information for upcoming walks
  - `LocationPermissionCard`: Permission request UI when location access is denied
- **Modo Segurança (Safety Mode)**: Accessible from chat, this feature allows users to share their path with emergency contacts before a meetup, provides real-time tracking, and enables post-meetup safety check-ins with feedback flags.
- **Emotional Compatibility Map**: Provides human-readable insights into shared values and preferences.
**Blue Ocean Strategy Features**:
- **Purpose-Based Invite System**: Replaces generic messaging with intentional invites (e.g., "first-coffee", "walk"), including curated location suggestions.
- **Message Limits**: Enforces a limit of 10 messages before an invite is required, encouraging real-world meetups.
- **Emoji Support in Chat**: Integrated emoji picker with 6 categories (Smileys, Hearts, Gestures, Nature, Food, Activities) for expressive messaging.
- **Trust Indicators**: Visual badges (verified, reliability score, completed meetups) build confidence among users.
**Platform-Specific Adaptations**: Includes iOS-specific blur effects and haptic feedback, Android's edge-to-edge layout, and web fallbacks for various functionalities, ensuring a native feel across platforms.

## Recent Changes (December 2025)

### Identity Verification System
- **Verification Onboarding Step**: Added identity verification as the final onboarding step after emergency contacts. Users can verify their identity with a selfie capture using expo-camera.
- **Verification Flow**: Intro screen explaining benefits → Camera permission request → Selfie capture with face guide → Confirmation with pending status → Skip option for later verification.
- **AuthContext Updates**: Added `VerificationStatus` type ("unverified" | "pending" | "verified" | "rejected"), `verificationStatus`, `verificationPhotoUrl`, and `verificationDate` fields to UserProfile.
- **Pending Review**: Photos are set to "pending" status for manual review (not auto-verified for security).
- **Web Fallback**: On web platform, shows message directing users to Expo Go for camera access.
- **Camera UI**: Full-screen camera view with face guide oval, capture button, and instructional text.

### Privacy & Profile Management
- **Hide Profile Option**: Added `profileHidden` field to UserProfile with toggle in ProfileScreen under "Privacidade e Seguranca" section.
- **Design System Removed**: Removed the Design System showcase link from Profile tab (was for development only).

### UI/UX Enhancements
- **Profile Detail Modal in Discover**: Tapping on user cards opens an expandable modal showing full profile (bio, values, hobbies, compatibility insights, phase of life) with "Conectar" and "Passar" actions.
- **ProfileScreen Rewrite**: Now displays actual user profile data (avatar, name, values, hobbies, statistics, privacy settings, emergency contacts).
- **Chat Header Enhancement**: Shows user avatar with initials and verified badge in the navigation header for better context.
- **MapScreen Fix**: Nearby users now populate correctly on mobile. The `refreshNearbyUsers()` is called on component mount and when location sharing state changes.

### Documentation
- **App Summary for Monetization**: Created `ELARA_APP_SUMMARY.md` with comprehensive feature overview, target audience, monetization opportunities, and revenue projections for business planning.

### Internationalization (i18n)
- **Multi-Language Support**: Added comprehensive i18n system supporting 14 languages for international reach.
- **Supported Languages**: Portuguese (PT), Brazilian Portuguese (PT-BR), English (EN), Spanish (ES), Latin American Spanish (ES-LATAM), Italian (IT), French (FR), German (DE), Russian (RU), Ukrainian (UK), Chinese (ZH), Japanese (JA), Arabic (AR), Hindi (HI).
- **Infrastructure**: i18next + react-i18next + expo-localization for translation management and device locale detection.
- **LanguageContext**: Global context for managing language state with AsyncStorage persistence.
- **LanguageSelector Component**: Modal component in Profile settings allowing users to switch languages.
- **Translation Files**: Located in `localization/locales/` with separate JSON files per language.
- **Portuguese Spelling Corrections**: All Portuguese text follows proper European Portuguese orthography.

## External Dependencies

### Core Framework & Navigation
- **expo** (v54)
- **react-native** (v0.81.5)
- **@react-navigation/native** (v7)
- **@react-navigation/bottom-tabs** (v7)
- **@react-navigation/native-stack** (v7)

### UI & Animations
- **react-native-reanimated** (v4.1)
- **react-native-gesture-handler** (v2.28)
- **expo-blur**
- **expo-glass-effect**
- **@expo/vector-icons**
- **expo-haptics**
- **expo-symbols**

### Device APIs & Platform Features
- **expo-location** (v19)
- **expo-contacts** (v15)
- **expo-camera** (for identity verification selfie capture)
- **@react-native-async-storage/async-storage** (v2.2)
- **expo-image** (v3)
- **react-native-keyboard-controller** (v1.18)
- **react-native-safe-area-context** (v5.6)

### Development & Tooling
- **TypeScript** (~19.1)
- **ESLint** (v9)
- **babel-plugin-module-resolver**
- **Prettier** (v3.6)

### Internationalization
- **i18next** (v25)
- **react-i18next** (v15)
- **expo-localization** (v16)

### Deployment
- **Expo Go**
- **Replit integration** (for environment variables)