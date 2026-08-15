# Smriti AI: Your Memory Companion

Build a complete modern AI-powered web application called:

SMRITI AI

Tagline:

"AI That Remembers What Matters."

Smriti AI is an intelligent multimodal memory companion designed to help people with memory difficulties and their caregivers.

The application should combine:

- Computer Vision

- Face Recognition

- Object Recognition

- Long-Term Memory

- Vector Search

- Conversational AI

- Caregiver Management

- Personalized Memory

IMPORTANT:

This project is inspired by the concept of AI-powered memory assistants, but the product must have its own branding, UI, architecture, and implementation.

Do NOT use the name "Masthishq" anywhere in the application.

==================================================

1. PRODUCT VISION

==================================================

Smriti AI should act as a personal memory companion.

The system should help a user:

1. Recognize familiar people.

2. Identify common objects.

3. Understand their surroundings.

4. Retrieve information about people and places.

5. Remember important personal information.

6. Search through stored memories.

7. Have a natural conversation with an AI assistant.

8. Allow trusted caregivers/family members to manage memories.

9. Maintain long-term personalized context.

Core concept:

SEE → UNDERSTAND → REMEMBER → CONNECT

Example:

A user points a camera at a person.

Camera

→ Face Detection

→ Face Recognition

→ Search Memory

→ Retrieve Person Information

→ AI understands context

→ Natural response

Example response:

"That's Rahul, your son. You last added him to your memories two months ago."

Another example:

User:

"Who is this?"

AI:

"That's Anita. She is your daughter and you added her as a family member."

==================================================

2. BRANDING

==================================================

Application name:

SMRITI AI

Tagline:

"AI That Remembers What Matters."

Brand personality:

- Warm

- Trustworthy

- Human

- Intelligent

- Calm

- Modern

- Accessible

- Premium

Do NOT make the interface look like a generic AI chatbot.

The product should feel like a combination of:

- AI assistant

- Memory journal

- Caregiver platform

- Computer vision application

Logo concept:

A minimal brain + memory/tree + human-care visual.

Use the provided Smriti AI logo if available.

Primary colors:

Deep Navy:

#172554

Indigo:

#4F46E5

Purple:

#7C3AED

Soft Blue:

#38BDF8

Teal:

#14B8A6

Background:

#F8FAFC

White:

#FFFFFF

Use gradients sparingly.

The interface should have rounded cards, subtle shadows, clean typography, generous spacing and a premium SaaS feel.

==================================================

3. TECHNOLOGY STACK

==================================================

Frontend:

- React

- TypeScript

- Vite

- Tailwind CSS

- shadcn/ui

- Lucide React icons

Backend / Database:

- Supabase

- PostgreSQL

- Supabase Authentication

- Supabase Storage

AI architecture:

Design the application so external AI APIs can be integrated easily.

AI capabilities:

- LLM

- Face recognition

- Object detection

- Embeddings

- Vector search

- Speech-to-text

- Text-to-speech

Use modular service files for AI integrations.

Do not hardcode API keys.

All secrets must be stored using environment variables.

==================================================

4. APPLICATION STRUCTURE

==================================================

Create these major sections:

Public:

- Landing Page

- Login

- Sign Up

- About

- Privacy

- Terms

Authenticated:

- Dashboard

- AI Companion

- Camera / Vision

- Memories

- People

- Places

- Objects

- Conversations

- Caregiver Dashboard

- Notifications

- Profile

- Settings

==================================================

5. LANDING PAGE

==================================================

Create a premium landing page.

Hero section:

SMRITI AI

"AI That Remembers What Matters."

Supporting text:

"An intelligent memory companion that helps you recognize people, understand your surroundings, and stay connected to the moments and information that matter."

Primary CTA:

"Get Started"

Secondary CTA:

"Explore Smriti AI"

Hero visual:

Show a modern AI memory interface.

Possible visual:

A person's face being recognized by an AI camera with memory cards appearing around them.

Example:

Camera

↓

Person detected

↓

"Rahul"

↓

"Son"

↓

"Last memory: Family dinner"

Add subtle animations.

==================================================

6. DASHBOARD

==================================================

After login, show a personalized dashboard.

Header:

Good morning, [User Name]

"How can Smriti help you today?"

Main action cards:

1. Ask Smriti

2. Scan Someone

3. Scan Object

4. Add Memory

Dashboard sections:

Today's Memories

Recent People

Recent Conversations

Important Memories

Caregiver Updates

Quick Actions

Show statistics:

Total Memories

Known People

Saved Places

AI Conversations

Example:

Memories

128

People

24

Places

12

Conversations

86

==================================================

7. AI COMPANION

==================================================

Create a conversational AI interface.

The user should be able to ask questions such as:

"Who is Rahul?"

"What did I do yesterday?"

"Where did I save my documents?"

"Who visited me last Sunday?"

"What is this object?"

"Tell me about this person."

"Show my family memories."

The interface should support:

- Text input

- Voice input

- Image upload

- Camera input

- AI response

- Conversation history

Chat design should feel warm and personal rather than like a developer chatbot.

AI responses should be concise and easy to understand.

Use memory context when generating answers.

==================================================

8. COMPUTER VISION / CAMERA PAGE

==================================================

Create a dedicated Vision page.

Title:

"See With Smriti"

Provide:

- Camera preview

- Upload image

- Capture image

- Analyze image button

Modes:

[ Recognize Person ]

[ Identify Object ]

[ Understand Scene ]

When an image is analyzed, display:

Detected person/object

Confidence

Relevant memory

Relationship

Previous information

AI explanation

Example:

--------------------------------

Person Recognized

Rahul Sharma

Relationship:

Son

Confidence:

96%

Memory:

"Rahul visited on July 20."

[ Ask Smriti About Rahul ]

--------------------------------

If a person is unknown:

"Unknown person detected."

Buttons:

[ Add Person ]

[ Ignore ]

==================================================

9. PEOPLE / MEMORY DATABASE

==================================================

Create a People page.

Each person should have:

- Name

- Profile photo

- Relationship

- Description

- Important information

- Tags

- Memories

- Last interaction

- Created date

Example:

Rahul Sharma

Son

"Works in software engineering."

Memories:

- Family dinner

- Birthday

- College graduation

Actions:

View Profile

Edit

Add Memory

Delete

==================================================

10. MEMORY SYSTEM

==================================================

This is one of the most important features.

Create a dedicated Memories page.

Memory types:

- Person

- Place

- Event

- Object

- Conversation

- Important Information

- Family

- Personal

Each memory should contain:

- Title

- Description

- Image

- Date

- Location

- Tags

- Related people

- Related objects

- Importance level

Importance:

Low

Medium

High

Critical

Example:

Memory:

"Family Dinner"

Date:

August 10, 2026

People:

Rahul

Anita

Mother

Description:

"Family dinner at home."

Tags:

family, dinner, home

==================================================

11. MEMORY SEARCH

==================================================

Create semantic memory search.

Search placeholder:

"Search your memories..."

Examples:

"family dinner"

"Rahul"

"birthday"

"hospital"

"last Sunday"

Results should appear as memory cards.

Use semantic/vector-search architecture rather than only simple keyword matching.

Design the database so embeddings can be stored for memories.

Possible future vector database:

Qdrant

The code should be modular enough to integrate Qdrant later.

==================================================

12. CAREGIVER DASHBOARD

==================================================

Create a separate caregiver interface.

Caregivers should be able to:

- View patient profile

- Add memories

- Edit memories

- Delete memories

- Add people

- Add important places

- Add important information

- View recent AI interactions

- View alerts

- Manage permissions

Dashboard sections:

Patient Overview

Recent Activity

Important Memories

People

Places

Alerts

Memory Management

==================================================

13. CAREGIVER PERMISSIONS

==================================================

Implement role-based access.

Roles:

USER

CAREGIVER

ADMIN

A user can invite a trusted caregiver.

Caregiver permissions:

VIEW_MEMORIES

ADD_MEMORIES

EDIT_MEMORIES

DELETE_MEMORIES

MANAGE_PEOPLE

VIEW_ACTIVITY

Allow granular permission management.

==================================================

14. AUTHENTICATION

==================================================

Use Supabase Auth.

Support:

- Email/password

- Google OAuth if available

- Logout

- Forgot password

- Password reset

User profile fields:

id

name

email

avatar

role

created_at

After signup, show onboarding.

==================================================

15. ONBOARDING

==================================================

Create a beautiful onboarding flow.

Step 1:

"Welcome to Smriti AI"

Step 2:

"What should Smriti help you remember?"

Options:

People

Places

Events

Important information

Daily activities

Step 3:

"Add people you frequently interact with."

Step 4:

"Add your first memory."

Step 5:

"Invite a trusted caregiver."

Allow skipping optional steps.

==================================================

16. DATABASE DESIGN

==================================================

Create Supabase PostgreSQL tables.

Users:

users

- id

- name

- email

- avatar_url

- role

- created_at

Profiles:

profiles

- id

- user_id

- date_of_birth

- preferences

- accessibility_settings

People:

people

- id

- owner_id

- name

- relationship

- description

- image_url

- created_at

Memories:

memories

- id

- owner_id

- title

- description

- memory_type

- image_url

- event_date

- location

- importance

- created_at

- updated_at

Memory People:

memory_people

- memory_id

- person_id

Places:

places

- id

- owner_id

- name

- description

- address

- image_url

- created_at

Objects:

objects

- id

- owner_id

- name

- description

- image_url

- created_at

Conversations:

conversations

- id

- owner_id

- title

- created_at

Messages:

messages

- id

- conversation_id

- role

- content

- image_url

- created_at

Caregivers:

caregivers

- id

- patient_id

- caregiver_id

- status

- created_at

Caregiver Permissions:

caregiver_permissions

- id

- caregiver_id

- permission

- enabled

Notifications:

notifications

- id

- user_id

- title

- message

- type

- read

- created_at

Memory Embeddings:

memory_embeddings

- id

- memory_id

- embedding

- created_at

==================================================

17. SECURITY

==================================================

This application deals with potentially sensitive personal information.

Implement strong privacy practices.

Use:

- Supabase Row Level Security

- User-specific data access

- Caregiver permission checks

- Secure storage

- Environment variables

- No API keys in frontend code

- Secure image URLs

- Authentication checks

Users should never be able to access another user's memories.

Caregivers should only access patients who explicitly granted permission.

==================================================

18. AI SERVICE ARCHITECTURE

==================================================

Create a modular AI service layer.

Example structure:

src/services/ai/

    llm.ts

    vision.ts

    embeddings.ts

    speech.ts

    memory.ts

Functions:

askAI()

analyzeImage()

recognizePerson()

detectObjects()

createEmbedding()

searchMemories()

generateMemoryContext()

transcribeAudio()

generateSpeech()

Do not tightly couple the UI to any single AI provider.

Use environment variables:

VITE_AI_API_KEY

and appropriate server-side secrets for sensitive APIs.

==================================================

19. AI MEMORY WORKFLOW

==================================================

When a new memory is created:

User creates memory

↓

Generate textual representation

↓

Generate embedding

↓

Store memory

↓

Store embedding

↓

Index for semantic search

When user asks:

"Who is Rahul?"

Workflow:

User question

↓

Generate query embedding

↓

Semantic memory search

↓

Retrieve relevant memories

↓

Build context

↓

Send context to LLM

↓

Generate response

↓

Display answer

Example:

Question:

"Who is Rahul?"

Retrieved:

Rahul Sharma

Relationship: Son

Memory: Family Dinner

Memory: Birthday

Memory: College Graduation

LLM:

"Rahul Sharma is your son. You have memories of him from your family dinner, his birthday and his graduation."

==================================================

20. VISION WORKFLOW

==================================================

Camera image

↓

Vision API

↓

Face/Object detection

↓

Generate embedding

↓

Compare with stored embeddings

↓

Find matching person/object

↓

Retrieve memories

↓

Generate contextual response

If match confidence is low:

Do not confidently identify the person.

Display:

"I couldn't confidently recognize this person."

Options:

[ Try Again ]

[ Add New Person ]

==================================================

21. VOICE ASSISTANT

==================================================

Add voice interaction.

Microphone button:

"Talk to Smriti"

Workflow:

Voice

↓

Speech-to-text

↓

AI

↓

Response

↓

Text-to-speech

Example:

User:

"Smriti, who is this?"

AI:

"That's Rahul, your son."

Provide play/pause controls.

==================================================

22. ACCESSIBILITY

==================================================

Accessibility is extremely important.

Support:

- Large text mode

- High contrast mode

- Large buttons

- Simple navigation

- Voice interaction

- Clear icons

- Screen-reader-friendly labels

- Keyboard navigation

Use simple language.

Avoid overly technical terminology in the patient-facing interface.

==================================================

23. RESPONSIVE DESIGN

==================================================

The application must work on:

Desktop

Tablet

Mobile

Mobile should feel like a real mobile application.

Navigation:

Desktop:

Sidebar

Mobile:

Bottom navigation

Main mobile tabs:

Home

Memories

Camera

Ask

Profile

==================================================

24. UI COMPONENTS

==================================================

Create reusable components:

Navbar

Sidebar

BottomNav

MemoryCard

PersonCard

PlaceCard

ObjectCard

ConversationCard

AIMessage

UserMessage

CameraScanner

MemoryModal

PersonModal

CaregiverCard

NotificationCard

StatsCard

SearchBar

VoiceButton

LoadingState

EmptyState

ErrorState

ConfirmationDialog

Use shadcn/ui wherever appropriate.

==================================================

25. ANIMATIONS

==================================================

Use subtle animations.

Examples:

Page transitions

Card hover

AI thinking animation

Camera scanning animation

Memory appearing animation

Voice pulse animation

Do NOT overuse animations.

The product should feel calm and trustworthy.

==================================================

26. DARK MODE

==================================================

Support dark mode.

Dark theme:

Background:

#0F172A

Cards:

#1E293B

Text:

#F8FAFC

Primary:

#818CF8

Teal:

#2DD4BF

==================================================

27. DEMO DATA

==================================================

Create realistic demo data so the application looks complete immediately.

Example people:

Rahul Sharma

Relationship: Son

Anita Sharma

Relationship: Daughter

Rajesh Kumar

Relationship: Friend

Example memories:

Family Dinner

Birthday Celebration

College Graduation

Morning Walk

Doctor Appointment

Example objects:

House Keys

Wallet

Medicine Box

Glasses

Example places:

Home

Park

Hospital

Temple

Make demo data clearly marked so it can be replaced with real user data.

==================================================

28. DASHBOARD ANALYTICS

==================================================

Caregiver dashboard should display:

Total Memories

People Recognized

Recent Interactions

Important Memories

AI Conversations

Use clean charts.

Possible charts:

Memory activity over time

Conversation frequency

Memory categories

Do not make the dashboard look like a business analytics product.

Keep it human-centered.

==================================================

29. NOTIFICATIONS

==================================================

Create notification system.

Examples:

"New memory added by Anita."

"Rahul was added to your people."

"Your caregiver updated an important memory."

"Smriti couldn't recognize a person."

Use notification badges.

==================================================

30. SETTINGS

==================================================

Settings sections:

Account

Privacy

Caregivers

Notifications

Accessibility

AI Preferences

Voice

Appearance

Security

Allow users to:

Change name

Change profile picture

Manage caregivers

Manage permissions

Export memories

Delete account

==================================================

31. PRIVACY & DATA CONTROL

==================================================

Create a privacy section explaining:

"Your memories belong to you."

Provide:

Export My Data

Delete Memory

Delete All Memories

Delete Account

Manage Caregivers

Make it clear that the application is not a replacement for professional medical care.

Include a visible disclaimer:

"Smriti AI is an assistive technology designed to support memory and everyday interactions. It is not a medical diagnosis or treatment system."

==================================================

32. FUTURE-READY FEATURES

==================================================

Structure the code so these can be added later:

- Qdrant vector database

- Advanced Face Recognition

- YOLO object detection

- Llama / GPT models

- Groq inference

- Wearable integration

- Smart glasses

- Fall detection

- Geofencing

- Emergency alerts

- Emotion detection

- Family memory sharing

- WhatsApp notifications

- Voice-first assistant

Do not implement unsafe medical diagnosis features.

==================================================

33. ERROR HANDLING

==================================================

Every API interaction must have:

Loading state

Success state

Error state

Retry button

If AI is unavailable:

"Smriti is temporarily unavailable. Please try again."

If camera permission is denied:

"Camera access is required for visual recognition."

Provide:

[Allow Camera]

[Upload Image Instead]

==================================================

34. EMPTY STATES

==================================================

Make empty states beautiful.

Example:

No memories:

"Your memory library is empty."

"Start by adding a person, place or special moment."

Button:

"+ Add Memory"

No people:

"Add the people who matter to you."

Button:

"+ Add Person"

==================================================

35. FINAL USER EXPERIENCE

==================================================

The complete application should feel like a real startup product, not a college CRUD application.

Prioritize:

1. Beautiful UI

2. Simple UX

3. Accessibility

4. Privacy

5. AI integration

6. Long-term memory

7. Caregiver experience

8. Responsive design

The key product loop should be:

SEE

↓

UNDERSTAND

↓

REMEMBER

↓

RETRIEVE

↓

CONNECT

==================================================

36. IMPORTANT IMPLEMENTATION RULE

==================================================

First create the complete frontend and Supabase architecture.

If external AI APIs are not configured, create realistic mock AI services so the entire application can still be demonstrated.

Clearly separate:

Demo Mode

Production AI Mode

Create a settings/environment mechanism to switch between them.

The application should run without crashing even if AI API keys are missing.

==================================================

37. FINAL BRANDING

==================================================

Use “SMRITI AI” consistently as the primary brand name throughout the application. Display the tagline “AI That Remembers What Matters.” prominently on the landing page and selectively in branding areas such as the footer, login page, and About page. Do NOT display the full tagline on every authenticated page, as this would create unnecessary repetition and visual clutter.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/85baa43b-fe66-4103-b6aa-35349d1cf543).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
