# Elara - App Summary for Monetization Strategy

## Overview
Elara is a safety-first social connection platform exclusively for women aged 18-35. The app prioritizes verified connections, real-world meetups, and personal safety over superficial matching algorithms.

## Target Audience
- Women aged 18-35
- Focus segments: students, expatriates, new mothers, professionals, women in life transitions
- Geographic focus: Portugal (Portuguese language)

## Core Value Proposition
- **Safety-First Design**: Every feature built around user safety
- **Verified Community**: Identity verification creates trust
- **Purpose-Driven Connections**: Not dating - genuine friendships and support networks
- **Real-World Focus**: Encourages actual meetups over endless chatting

---

## Feature Overview

### 1. Onboarding & Profile Creation
- Multi-step onboarding collecting: name, age, bio, photo
- Intent selection (multiple choice): new friends, support network, networking, activities
- Social energy indicator: introvert, ambivert, extrovert
- Values selection (up to 5): authenticity, growth, creativity, wellness, etc.
- Hobbies selection (up to 8): yoga, travel, art, reading, etc.
- Lifestyle preferences
- Meeting preferences: daytime preference, group vs 1-on-1
- Boundaries and frequency preferences
- Phase of life: student, expat, mother, professional, etc.
- **Emergency contacts** (required): at least 1 contact with phone number
- **Identity verification** (optional): selfie capture with pending review status

### 2. Discovery System (Discover Tab)
- Swipe-based or card-based user discovery
- Compatibility scoring based on shared values and hobbies
- Profile detail modal with full bio, values, hobbies, compatibility insights
- "Connect" and "Pass" actions
- Distance display when location enabled
- Verified badge display for verified users
- Trust score indicator

### 3. Map Discovery (Map Tab)
- Interactive map showing nearby verified women
- Real-time location sharing (optional, privacy-controlled)
- Distance-based filtering
- User markers with profile preview callouts
- Connect directly from map
- Privacy controls: users control when their location is shared

### 4. Walk Together / Buddy System (Premium Feature - "Caminhadas Elara")
- Create or join verified group walks
- Walk types: casual stroll, exercise, exploration, after-work
- Filtering: nearby, my walks, today, weekend, distance, personality type, pet-friendly, alcohol-free
- **Walk Cards** with trust indicators:
  - Host trust score
  - Completed meetups count
  - Verified badge
  - Duration and distance
  - Participant count/limit
- Safety features:
  - Share route with emergency contacts
  - Real-time tracking during walks
  - Safety notes from host
  - Post-walk check-in

### 5. Connections & Chat (Connections Tab)
- Accepted connections list
- Chat functionality with message history
- **Message Limit System**: 10 messages max before invite required
- **Purpose-Based Invite System**:
  - "First coffee" invite
  - "Walk together" invite
  - "Study/work session" invite
  - "Event buddy" invite
- Invite includes proposed date and location suggestions
- Emoji picker (6 categories)
- Chat header with avatar and verified badge

### 6. Safety Mode / Meetup Tracking
- Accessible from chat before meetups
- Share current path with emergency contacts
- Real-time location tracking during meetup
- Post-meetup safety check-in
- Safety flag system: OK, uncomfortable, alert
- Automatic notifications to emergency contacts if needed

### 7. Profile Management (Profile Tab)
- View/edit profile information
- Privacy settings:
  - Location sharing toggle
  - Anonymous data sharing toggle
  - **Profile visibility toggle** (hide profile)
- Emergency contacts management
- Trust score display
- Statistics: meetups completed, check-ins, emergency contacts count
- Verification status display

---

## User Trust & Verification System

### Verification Levels
1. **Unverified**: Basic profile, no selfie verification
2. **Pending**: Selfie submitted, awaiting review
3. **Verified**: Identity confirmed, verified badge displayed

### Trust Indicators
- Trust score percentage (based on behavior)
- Completed meetups count
- Reliability score
- Verified badge (shield icon)
- Time since last active

---

## Behavioral Design Elements

### Message Limits
- 10 messages maximum before requiring an invite
- Encourages real-world meetups over endless chatting
- Reduces ghosting and superficial connections

### Purpose-Based Invites
- Replaces generic "let's meet" with specific intentions
- Pre-defined invite types with location suggestions
- Reduces anxiety around first meetups

### Safety-First Architecture
- Emergency contacts required during onboarding
- Optional but encouraged identity verification
- Real-time tracking for meetups
- Post-meetup feedback system

---

## Monetization Opportunities

### Freemium Features (Currently Free)
- Basic profile creation and onboarding
- Discovery and matching
- Basic chat (with message limits)
- Map discovery (nearby users)
- Emergency contacts

### Premium Tier Candidates ("Elara Premium" or "Elara+")
1. **Walk Together / Buddy System**
   - Create unlimited walks
   - Advanced safety features (real-time tracking)
   - Route sharing with emergency contacts

2. **Enhanced Discovery**
   - See who viewed your profile
   - Advanced filters (specific values, phases of life)
   - Priority in discovery feed
   - Unlimited "rewind" on passed profiles

3. **Messaging Upgrades**
   - Unlimited messages (bypass 10-message limit)
   - Message read receipts
   - Priority message delivery

4. **Safety Premium**
   - Enhanced meetup tracking features
   - Priority emergency response
   - Extended location history
   - Safety report access

5. **Verification Fast-Track**
   - Priority verification review
   - Re-verification (if profile changes)

### One-Time Purchases
- Profile boosts (appear at top of discovery)
- Super-connects (priority connection requests)
- Extended walk slots (host more participants)

### Subscription Tiers
- **Free**: Basic features with limits
- **Elara+** (~€4.99/month): Remove limits, basic premium
- **Elara Premium** (~€9.99/month): All features + Walk Together + Safety Premium
- **Annual Plans**: Discounted yearly subscriptions

---

## Technical Architecture

### Frontend Stack
- React Native with Expo SDK 54
- React Navigation v7 (nested navigators)
- TypeScript
- React Native Reanimated v4 (animations)
- React Native Gesture Handler

### State Management
- React Context API (AuthContext, MatchesContext)
- AsyncStorage for persistence

### Native Features Used
- expo-location (foreground location)
- expo-camera (identity verification selfie)
- expo-contacts (emergency contacts integration)
- expo-haptics (tactile feedback)
- react-native-maps (map display)

### Design System
- Primary color: Violet/Purple (#9B7DFF)
- Accent Teal: Safety features (#2FD6C5)
- Accent Coral: Warmth/Connection (#F26B7A)
- iOS 26 Liquid Glass design language
- Light/Dark mode support

---

## Key Differentiators

1. **Safety-First, Not Dating**: Clear positioning as friendship/support platform
2. **Verification Required Experiences**: Walk Together requires verified participants
3. **Message Limits**: Forces real-world interaction
4. **Emergency Integration**: Built-in safety net
5. **Purpose Invites**: Reduces meetup anxiety
6. **Women-Only**: Safe space by design
7. **Life Phase Matching**: Connect with women in similar situations

---

## Metrics to Track for Monetization

### Engagement Metrics
- Daily/Monthly Active Users
- Messages sent per user
- Invites sent/accepted ratio
- Walk Together participation rate
- Verification completion rate

### Conversion Metrics
- Free to Premium conversion rate
- Feature usage before conversion
- Churn rate by tier
- Feature-specific upgrade triggers

### Safety Metrics
- Safety check-in completion rate
- Emergency contact activation rate
- Meetup tracking usage
- Safety flag frequency

---

## Revenue Projections Considerations

### Market Size
- Women 18-35 in Portugal: ~1.2M
- Target penetration: 5-10% awareness, 10-20% conversion to active users
- Premium conversion target: 5-15% of active users

### Pricing Strategy Options
- Competitive with: Bumble BFF, Hey! VINA, Peanut
- Local purchasing power consideration for Portugal market
- Bundle safety features (not paywall basic safety)

---

## Summary for AI-Assisted Strategy

When developing monetization strategy, consider:
1. Safety features should remain accessible (core brand value)
2. Premium should enhance, not restrict, the social experience
3. Walk Together has high perceived value as premium feature
4. Verification fast-track appeals to safety-conscious users
5. Message limits create natural upgrade motivation
6. Portuguese market may prefer lower price points with annual discounts
