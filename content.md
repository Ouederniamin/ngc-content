# NextGen Coding - Content Structure & Database Schema

> **Complete technical documentation of the educational content hierarchy, database models, and navigation system.**

---

## Table of Contents

1. [Overview](#overview)
2. [Content Hierarchy](#content-hierarchy)
3. [Entity Descriptions](#entity-descriptions)
   - [SkillPath](#1-skillpath)
   - [Unit](#2-unit)
   - [Module](#3-module)
   - [Lesson](#4-lesson)
   - [LessonExercise](#5-lessonexercise)
   - [LessonInstruction](#6-lessoninstruction)
   - [InstructionAnswer](#7-instructionanswer)
   - [Quiz](#8-quiz)
   - [QuizQuestion](#9-quizquestion)
   - [QuizAnswer](#10-quizanswer)
   - [Project](#11-project)
   - [ProjectTask](#12-projecttask)
   - [TaskInstruction & TaskInstructionAnswer](#13-taskinstruction--taskinstructionanswer)
4. [Progress Tracking System](#progress-tracking-system)
5. [Linear Navigation System](#linear-navigation-system)
6. [Navigation Flow](#navigation-flow)
7. [URL Patterns](#url-patterns)
8. [Code Types Supported](#code-types-supported)
9. [Progress Calculation Formulas](#progress-calculation-formulas)
10. [Platform Statistics](#platform-statistics)

---

## Overview

NextGen Coding is a gamified, AI-powered educational platform for teaching programming. The content is organized in a hierarchical structure designed for progressive learning, with multiple content types (lessons, quizzes, projects) to reinforce concepts through hands-on practice.

### Key Features

- **Multi-language Support**: English, French, and Tunisian Arabic
- **Gamification**: XP points, streaks, leaderboards, and achievements
- **AI Assistant (Nexie)**: Context-aware coding help
- **Code Editor**: Browser-based editor supporting HTML, CSS, JavaScript, and Python
- **Real-time Validation**: Instant feedback on code submissions

---

## Content Hierarchy

```
SkillPath (e.g., "First Steps in Web Dev", "Intro To Programming")
│
├── Unit (e.g., "HTML Basics", "CSS Fundamentals")
│   │
│   ├── Module (e.g., "Getting Started with HTML", "Your First Tags")
│   │   │
│   │   ├── Lesson (theory + exercises)
│   │   │   │
│   │   │   ├── LessonExercise (hands-on coding exercise)
│   │   │   │   │
│   │   │   │   └── LessonInstruction (step-by-step task)
│   │   │   │       │
│   │   │   │       └── InstructionAnswer (correct solution)
│   │   │   │
│   │   │   └── LessonExercise 2, 3, etc.
│   │   │
│   │   ├── Quiz (multiple choice questions)
│   │   │   │
│   │   │   └── QuizQuestion
│   │   │       │
│   │   │       └── QuizAnswer (options with isCorrect flag)
│   │   │
│   │   └── Project (capstone project with tasks)
│   │       │
│   │       └── ProjectTask
│   │           │
│   │           └── TaskInstruction
│   │               │
│   │               └── TaskInstructionAnswer
│   │
│   └── Module 2, 3, etc.
│
└── Unit 2, 3, etc.
```

### Visual Representation

```
┌─────────────────────────────────────────────────────────────┐
│                        SKILLPATH                            │
│  (Complete learning path - e.g., "Web Development Basics")  │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │  UNIT 1  │        │  UNIT 2  │        │  UNIT 3  │
    │  HTML    │        │   CSS    │        │    JS    │
    └──────────┘        └──────────┘        └──────────┘
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
┌──────┐ ┌──────┐ ┌──────┐
│MODULE│ │MODULE│ │MODULE│
│  1   │ │  2   │ │  3   │
└──────┘ └──────┘ └──────┘
    │
    ├── Lesson → Exercises → Instructions → Answers
    ├── Quiz → Questions → Answers
    └── Project → Tasks → Instructions → Answers
```

---

## Entity Descriptions

### 1. SkillPath

The top-level container representing a complete learning path. Users enroll in SkillPaths to track their progress.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key (auto-increment) |
| `title` | String | English title |
| `titleTn` | String? | Tunisian Arabic title |
| `titleFr` | String? | French title |
| `description` | String? | Course description (English) |
| `descriptionTn` | String? | Course description (Tunisian Arabic) |
| `descriptionFr` | String? | Course description (French) |
| `imageUrl` | String? | Cover image URL |
| `xpPoints` | Int? | Total XP awarded for completion |
| `route` | Json? | Pre-calculated navigation path |
| `isPublished` | Boolean | Whether visible to users |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationships:**
- `units` → One-to-Many with Unit
- `navigation` → One-to-One with SkillPathNavigation
- `skillPathProgress` → One-to-Many with SkillPathProgress

**Example SkillPaths:**

| ID | Title | Units | Modules | Navigation Items |
|----|-------|-------|---------|------------------|
| 1 | First Steps in Web Dev | 6 | 36 | 738 |
| 2 | Intro To Programming | 2 | 16 | 233 |

---

### 2. Unit

A major section within a SkillPath, grouping related modules by topic.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `title` | String | Unit title (e.g., "HTML Fundamentals") |
| `titleTn` | String? | Tunisian Arabic title |
| `titleFr` | String? | French title |
| `description` | String? | Unit description |
| `position` | Int | Order within skillpath (1-based) |
| `skillPathId` | Int | Foreign key to parent SkillPath |
| `nextUnitId` | Int? | Pre-calculated next unit ID |
| `previousUnitId` | Int? | Pre-calculated previous unit ID |
| `isPublished` | Boolean | Whether visible to users |

**Relationships:**
- `skillPath` → Many-to-One with SkillPath
- `modules` → One-to-Many with Module
- `unitProgress` → One-to-Many with UnitProgress

---

### 3. Module

A focused learning topic containing a mix of lessons, quizzes, and/or projects. This is the core learning unit.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `title` | String | Module title |
| `titleTn` | String? | Tunisian Arabic title |
| `titleFr` | String? | French title |
| `description` | String? | Module description |
| `position` | Int | Order within unit |
| `unitId` | Int | Foreign key to parent Unit |
| `nextModuleId` | Int? | Pre-calculated next module ID |
| `previousModuleId` | Int? | Pre-calculated previous module ID |
| `isPublished` | Boolean | Whether visible to users |

**Relationships:**
- `unit` → Many-to-One with Unit
- `lessons` → One-to-Many with Lesson
- `quizzes` → One-to-Many with Quiz
- `projects` → One-to-Many with Project
- `moduleProgress` → One-to-Many with ModuleProgress

> **Note:** A module can contain ANY combination of lessons, quizzes, and projects. Content is sorted by `position` to determine the learning order.

---

### 4. Lesson

A learning unit with theoretical content (notion) and hands-on exercises.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `title` | String | Lesson title |
| `titleTn` | String? | Tunisian Arabic title |
| `titleFr` | String? | French title |
| `notionId` | String? | Notion page ID for theory content |
| `notionHtml` | String? | Cached HTML from Notion |
| `position` | Int | Order within module |
| `moduleId` | Int | Foreign key to parent Module |
| `nextMicroModuleId` | Int? | Next lesson/quiz/project ID |
| `previousMicroModuleId` | Int? | Previous lesson/quiz/project ID |
| `isPublished` | Boolean | Whether visible to users |

**Relationships:**
- `module` → Many-to-One with Module
- `lessonExercises` → One-to-Many with LessonExercise
- `lessonProgress` → One-to-Many with LessonProgress

---

### 5. LessonExercise

A coding exercise within a lesson where users write and test code.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `title` | String | Exercise title |
| `titleTn` | String? | Tunisian Arabic title |
| `titleFr` | String? | French title |
| `position` | Int | Order within lesson |
| `lessonId` | Int | Foreign key to parent Lesson |
| `nextExerciseId` | Int? | Pre-calculated next exercise ID |
| `previousExerciseId` | Int? | Pre-calculated previous exercise ID |
| `codeType` | String | Code language type (see [Code Types](#code-types-supported)) |
| `initialHTMLCode` | String? | Starter HTML code (pre-filled in editor) |
| `initialCSSCode` | String? | Starter CSS code |
| `initialJSCode` | String? | Starter JavaScript code |
| `initialPythonCode` | String? | Starter Python code |
| `isPublished` | Boolean | Whether visible to users |

**Relationships:**
- `lesson` → Many-to-One with Lesson
- `lessonInstructions` → One-to-Many with LessonInstruction
- `exerciseProgress` → One-to-Many with ExerciseProgress

---

### 6. LessonInstruction

A single step/task within an exercise that the user must complete. Each instruction has specific requirements and validates against expected answers.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `title` | String | Instruction title (short description) |
| `titleTn` | String? | Tunisian Arabic title |
| `titleFr` | String? | French title |
| `body` | String? | Detailed instruction (Markdown/HTML) |
| `bodyTn` | String? | Tunisian Arabic body |
| `bodyFr` | String? | French body |
| `position` | Int | Order within exercise |
| `exerciseId` | Int | Foreign key to parent LessonExercise |

**Relationships:**
- `lessonExercise` → Many-to-One with LessonExercise
- `instructionAnswers` → One-to-Many with InstructionAnswer
- `instructionProgress` → One-to-Many with InstructionProgress

**Example:**
```json
{
  "title": "Add a heading",
  "body": "Create an `<h1>` element with the text **'Hello World'**",
  "position": 1
}
```

---

### 7. InstructionAnswer

The correct code solution(s) for validating user submissions. Multiple answers can exist for flexible validation.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `htmlAnswer` | String? | Expected HTML code |
| `cssAnswer` | String? | Expected CSS code |
| `jsAnswer` | String? | Expected JavaScript code |
| `pythonAnswer` | String? | Expected Python code |
| `instructionId` | Int | Foreign key to parent LessonInstruction |

**Relationships:**
- `lessonInstruction` → Many-to-One with LessonInstruction

**Validation Logic:**
- Code is normalized (whitespace, formatting standardized)
- Comparison is done on normalized versions
- Multiple correct answers can be defined

---

### 8. Quiz

Multiple-choice assessment within a module to test knowledge retention.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `title` | String | Quiz title |
| `titleTn` | String? | Tunisian Arabic title |
| `titleFr` | String? | French title |
| `description` | String? | Quiz description |
| `position` | Int | Order within module |
| `moduleId` | Int | Foreign key to parent Module |
| `isPublished` | Boolean | Whether visible to users |

**Relationships:**
- `module` → Many-to-One with Module
- `quizQuestions` → One-to-Many with QuizQuestion
- `quizProgress` → One-to-Many with QuizProgress

---

### 9. QuizQuestion

A single question in a quiz.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `question` | String | Question text |
| `questionTn` | String? | Tunisian Arabic question |
| `questionFr` | String? | French question |
| `explanation` | String? | Explanation shown after answering |
| `position` | Int | Order within quiz |
| `quizId` | Int | Foreign key to parent Quiz |

**Relationships:**
- `quiz` → Many-to-One with Quiz
- `quizAnswers` → One-to-Many with QuizAnswer

---

### 10. QuizAnswer

An answer option for a quiz question.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `answer` | String | Answer text |
| `answerTn` | String? | Tunisian Arabic answer |
| `answerFr` | String? | French answer |
| `isCorrect` | Boolean | Whether this is the correct answer |
| `questionId` | Int | Foreign key to parent QuizQuestion |

**Relationships:**
- `quizQuestion` → Many-to-One with QuizQuestion

---

### 11. Project

A capstone project with multiple tasks, designed to apply learned concepts.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `title` | String | Project title |
| `titleTn` | String? | Tunisian Arabic title |
| `titleFr` | String? | French title |
| `description` | String? | Project description |
| `notionId` | String? | Notion page ID for project brief |
| `notionHtml` | String? | Cached HTML from Notion |
| `position` | Int | Order within module |
| `moduleId` | Int | Foreign key to parent Module |
| `isPublished` | Boolean | Whether visible to users |

**Relationships:**
- `module` → Many-to-One with Module
- `projectTasks` → One-to-Many with ProjectTask
- `projectProgress` → One-to-Many with ProjectProgress

---

### 12. ProjectTask

A task within a project (similar structure to LessonExercise).

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `title` | String | Task title |
| `titleTn` | String? | Tunisian Arabic title |
| `titleFr` | String? | French title |
| `description` | String? | Task description |
| `notionId` | String? | Notion page ID for task details |
| `notionHtml` | String? | Cached HTML from Notion |
| `position` | Int | Order within project |
| `projectId` | Int | Foreign key to parent Project |
| `nextTaskId` | Int? | Pre-calculated next task ID |
| `previousTaskId` | Int? | Pre-calculated previous task ID |
| `taskType` | String | Type of task (CODE, IMAGE, etc.) |
| `codeType` | String? | Code language type |
| `initialHTMLCode` | String? | Starter HTML code |
| `initialCSSCode` | String? | Starter CSS code |
| `initialJSCode` | String? | Starter JavaScript code |
| `initialPythonCode` | String? | Starter Python code |
| `isPublished` | Boolean | Whether visible to users |

**Relationships:**
- `project` → Many-to-One with Project
- `taskInstructions` → One-to-Many with TaskInstruction
- `taskProgress` → One-to-Many with TaskProgress

---

### 13. TaskInstruction & TaskInstructionAnswer

Same structure as LessonInstruction and InstructionAnswer, but for project tasks.

**TaskInstruction:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `title` | String | Instruction title |
| `body` | String? | Detailed instruction |
| `position` | Int | Order within task |
| `taskId` | Int | Foreign key to parent ProjectTask |

**TaskInstructionAnswer:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `htmlAnswer` | String? | Expected HTML code |
| `cssAnswer` | String? | Expected CSS code |
| `jsAnswer` | String? | Expected JavaScript code |
| `pythonAnswer` | String? | Expected Python code |
| `taskInstructionId` | Int | Foreign key to parent TaskInstruction |

---

## Progress Tracking System

### User Progress Models

The platform tracks granular progress at every level of the content hierarchy.

| Table | Tracks | Unique Key | Key Fields |
|-------|--------|------------|------------|
| `SkillPathProgress` | SkillPath completion | (userId, skillPathId) | progress (%), isCompleted |
| `UnitProgress` | Unit completion | (userId, unitId) | progress (%), isCompleted |
| `ModuleProgress` | Module completion | (userId, moduleId) | progress (%), isCompleted |
| `LessonProgress` | Lesson completion | (userId, lessonId) | progress (%), isCompleted |
| `ExerciseProgress` | Exercise state & code | (userId, exerciseId) | userHTMLCode, userCSSCode, userJSCode, userPythonCode, progress (%), isCompleted |
| `InstructionProgress` | Instruction completion | (userId, instructionId) | isCompleted, userCode |
| `QuizProgress` | Quiz completion | (userId, quizId) | score, progress (%), isCompleted |
| `ProjectProgress` | Project completion | (userId, projectId) | progress (%), isCompleted |
| `TaskProgress` | Task completion | (userId, projectTaskId) | progress (%), isCompleted |
| `TaskInstructionProgress` | Task instruction completion | (userId, taskInstructionId) | isCompleted |

### Progress Model Structure

```prisma
model SkillPathProgress {
  id          Int       @id @default(autoincrement())
  userId      String
  skillPathId Int
  isCompleted Boolean   @default(false)
  progress    Float     @default(0.0)  // 0-100 percentage
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user        User      @relation(...)
  skillPath   SkillPath @relation(...)

  @@unique([userId, skillPathId])
}
```

---

## Linear Navigation System

To optimize navigation performance, we implemented a pre-calculated linear navigation path.

### Why Linear Navigation?

**Before (O(n) lookups):**
- Each "Next" click required traversing the hierarchy
- Multiple database queries to find next item
- Complex logic to handle finish screens

**After (O(1) lookups):**
- Single array lookup: `path[currentIndex + 1]`
- No additional database queries
- Simple, predictable navigation

### SkillPathNavigation Table

Stores the complete ordered navigation path for instant lookups.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `skillPathId` | Int | Foreign key to SkillPath (unique) |
| `path` | Json | Ordered array of all navigation items |
| `totalItems` | Int | Total count of items in path |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

### Path Item Structure

Each item in the `path` array contains:

```typescript
interface NavigationItem {
  index: number;           // Position in array (0-based)
  type: NavigationType;    // Item type (see below)
  itemId: number;          // ID of the actual item
  lessonId?: number;       // Parent lesson ID (for exercises)
  moduleId: number;        // Parent module ID
  unitId: number;          // Parent unit ID
  skillPathId: number;     // Parent skillpath ID
  title: string;           // Display title
  url: string;             // Full URL path
}

type NavigationType = 
  | 'exercise'        // LessonExercise
  | 'lesson-finish'   // Lesson completion screen
  | 'quiz'            // Quiz
  | 'task'            // ProjectTask
  | 'project-finish'  // Project completion screen
  | 'module-finish'   // Module completion screen
  | 'unit-finish'     // Unit completion screen
  | 'skillpath-finish'; // SkillPath completion screen
```

### Example Path Array

```json
[
  {
    "index": 0,
    "type": "exercise",
    "itemId": 1,
    "lessonId": 1,
    "moduleId": 1,
    "unitId": 1,
    "skillPathId": 1,
    "title": "Create your first heading",
    "url": "/en/skill-paths/1/units/1/modules/1/lessons/1/exercise/1"
  },
  {
    "index": 1,
    "type": "exercise",
    "itemId": 2,
    "lessonId": 1,
    "moduleId": 1,
    "unitId": 1,
    "skillPathId": 1,
    "title": "Add a paragraph",
    "url": "/en/skill-paths/1/units/1/modules/1/lessons/1/exercise/2"
  },
  {
    "index": 2,
    "type": "lesson-finish",
    "itemId": 1,
    "lessonId": 1,
    "moduleId": 1,
    "unitId": 1,
    "skillPathId": 1,
    "title": "Lesson Complete",
    "url": "/en/skill-paths/1/units/1/modules/1/lessons/1/finish"
  },
  // ... more items
  {
    "index": 737,
    "type": "skillpath-finish",
    "itemId": 1,
    "moduleId": 36,
    "unitId": 6,
    "skillPathId": 1,
    "title": "SkillPath Complete",
    "url": "/en/skill-paths/1/finish"
  }
]
```

### UserNavigationProgress Table

Tracks each user's current position in the linear path.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key |
| `userId` | String | Foreign key to User |
| `skillPathId` | Int | Foreign key to SkillPath |
| `currentIndex` | Int | Current position in path array |
| `completedIndex` | Int | Last completed index (-1 if none) |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Unique Constraint:** `@@unique([userId, skillPathId])`

### Navigation Operations

```javascript
// Get current item (O(1))
const currentItem = path[userProgress.currentIndex];

// Get next item (O(1))
const nextItem = path[userProgress.currentIndex + 1];

// Calculate progress percentage
const progress = ((completedIndex + 1) / totalItems) * 100;

// Move to next
userProgress.completedIndex = userProgress.currentIndex;
userProgress.currentIndex += 1;
```

---

## Navigation Flow

### Exercise Completion Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER COMPLETES CODE                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDATE AGAINST ANSWER                       │
│   - Normalize user code (whitespace, formatting)                 │
│   - Compare with InstructionAnswer                               │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
        ┌──────────┐                    ┌──────────┐
        │ CORRECT  │                    │  WRONG   │
        └──────────┘                    └──────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│ Mark instruction done   │       │ Show error + hints      │
│ Update InstructionProgress│     │ Increment timesWrong    │
└─────────────────────────┘       │ Show Nexie if 3+ wrong  │
              │                   └─────────────────────────┘
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ALL INSTRUCTIONS COMPLETE?                      │
└─────────────────────────────────────────────────────────────────┘
              │
      ┌───────┴───────┐
      ▼               ▼
    [NO]            [YES]
      │               │
      ▼               ▼
┌──────────┐   ┌─────────────────────────┐
│ Show next│   │ Enable "Next" button    │
│instruction│   │ Show confetti 🎉        │
└──────────┘   └─────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER CLICKS "NEXT"                            │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              progressToNext(skillPathId)                         │
│   1. Update userNavigationProgress.currentIndex++                │
│   2. Update userNavigationProgress.completedIndex                │
│   3. Update legacy progress tables (background)                  │
│   4. Return path[currentIndex].url                               │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                 NAVIGATE TO NEXT URL                             │
│   (exercise, quiz, project task, or finish screen)               │
└─────────────────────────────────────────────────────────────────┘
```

### Resume Learning Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  USER CLICKS "RESUME"                            │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              getResumeUrl(skillPathId)                           │
│   1. Get userNavigationProgress for user + skillpath             │
│   2. Get skillPathNavigation.path                                │
│   3. Return path[currentIndex].url                               │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│            NAVIGATE TO CURRENT POSITION                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## URL Patterns

All content URLs follow a consistent hierarchical pattern:

### Exercise URL
```
/[locale]/skill-paths/[skillPathId]/units/[unitId]/modules/[moduleId]/lessons/[lessonId]/exercise/[exerciseId]
```

**Example:**
```
/en/skill-paths/1/units/1/modules/1/lessons/1/exercise/5
```

### Lesson Finish URL
```
/[locale]/skill-paths/[skillPathId]/units/[unitId]/modules/[moduleId]/lessons/[lessonId]/finish
```

### Quiz URL
```
/[locale]/skill-paths/[skillPathId]/units/[unitId]/modules/[moduleId]/quizzes/[quizId]
```

### Project Task URL
```
/[locale]/skill-paths/[skillPathId]/units/[unitId]/modules/[moduleId]/projects/[projectId]/task/[taskId]
```

### Project Finish URL
```
/[locale]/skill-paths/[skillPathId]/units/[unitId]/modules/[moduleId]/projects/[projectId]/finish
```

### Module Finish URL
```
/[locale]/skill-paths/[skillPathId]/units/[unitId]/modules/[moduleId]/finish
```

### Unit Finish URL
```
/[locale]/skill-paths/[skillPathId]/units/[unitId]/finish
```

### SkillPath Finish URL
```
/[locale]/skill-paths/[skillPathId]/finish
```

### Enrolled/Syllabus URLs
```
/[locale]/enrolled/skillPath/[skillPathId]
/[locale]/enrolled/skillPath/[skillPathId]/unit/[unitId]
/[locale]/enrolled/skillPath/[skillPathId]/unit/[unitId]/module/[moduleId]
```

---

## Code Types Supported

The platform supports multiple programming languages and combinations:

| Code Type | Description | Languages Used |
|-----------|-------------|----------------|
| `html` | HTML only | HTML |
| `css` | CSS only | CSS |
| `html-css` | HTML + CSS combined | HTML, CSS |
| `html-js` | HTML + JavaScript | HTML, JavaScript |
| `html-css-js` | Full web stack | HTML, CSS, JavaScript |
| `javascript` | JavaScript only | JavaScript |
| `python` | Python only | Python |

### Code Editor Features

- **Syntax highlighting** for all languages
- **Auto-completion** suggestions
- **Real-time preview** for HTML/CSS
- **Console output** for JavaScript/Python
- **Error highlighting** with line numbers

---

## Progress Calculation Formulas

Progress is calculated at each level of the hierarchy:

### Instruction Level
```
instructionProgress = isCompleted ? 100 : 0
```

### Exercise Level
```
exerciseProgress = (completedInstructions / totalInstructions) * 100
```

### Lesson Level
```
lessonProgress = (completedExercises / totalExercises) * 100
```

### Module Level
```
// Count all micro-modules (lessons, quizzes, projects)
totalMicroModules = lessons.length + quizzes.length + projects.length
completedMicroModules = completedLessons + completedQuizzes + completedProjects
moduleProgress = (completedMicroModules / totalMicroModules) * 100
```

### Unit Level
```
unitProgress = (completedModules / totalModules) * 100
```

### SkillPath Level
```
// Based on completed modules across ALL units
totalModules = sum(unit.modules.length for unit in skillPath.units)
completedModules = count(ModuleProgress where isCompleted = true)
skillPathProgress = (completedModules / totalModules) * 100
```

### Navigation-Based Progress
```
// Using linear navigation (preferred method)
navigationProgress = ((completedIndex + 1) / totalItems) * 100
```

---

## Platform Statistics

### Current Content Stats

| SkillPath | Units | Modules | Lessons | Projects | Total Nav Items |
|-----------|-------|---------|---------|----------|-----------------|
| First Steps in Web Dev | 6 | 36 | 95 | 11 | 738 |
| Intro To Programming | 2 | 16 | 24 | 3 | 233 |

### User Statistics

| Metric | Count |
|--------|-------|
| Total Users | ~12,000 |
| Total Enrollments | ~19,500 |
| Active Users (30 days) | ~2,500 |
| Completed Modules | ~4,300 |
| Unique Users with Progress | ~1,500 |

---

## Appendix: Database Diagram

```
┌──────────────────┐       ┌──────────────────┐
│    SkillPath     │───────│ SkillPathProgress│
│                  │       │  userId          │
│  id              │       │  skillPathId     │
│  title           │       │  progress        │
│  units[]         │       │  isCompleted     │
│  navigation      │       └──────────────────┘
└────────┬─────────┘
         │ 1:N
         ▼
┌──────────────────┐       ┌──────────────────┐
│      Unit        │───────│   UnitProgress   │
│                  │       │  userId          │
│  id              │       │  unitId          │
│  skillPathId     │       │  progress        │
│  modules[]       │       │  isCompleted     │
└────────┬─────────┘       └──────────────────┘
         │ 1:N
         ▼
┌──────────────────┐       ┌──────────────────┐
│     Module       │───────│  ModuleProgress  │
│                  │       │  userId          │
│  id              │       │  moduleId        │
│  unitId          │       │  progress        │
│  lessons[]       │       │  isCompleted     │
│  quizzes[]       │       └──────────────────┘
│  projects[]      │
└────────┬─────────┘
         │
    ┌────┴────┬──────────────┐
    ▼         ▼              ▼
┌────────┐ ┌────────┐ ┌──────────┐
│ Lesson │ │  Quiz  │ │ Project  │
│        │ │        │ │          │
│exercises│ │questions│ │  tasks   │
└────┬───┘ └────┬───┘ └────┬─────┘
     │          │          │
     ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Exercise │ │ Question │ │   Task   │
│          │ │          │ │          │
│instructions│ │ answers │ │instructions│
└────┬─────┘ └──────────┘ └────┬─────┘
     │                          │
     ▼                          ▼
┌──────────────┐         ┌──────────────┐
│ Instruction  │         │TaskInstruction│
│              │         │              │
│  answers[]   │         │  answers[]   │
└──────────────┘         └──────────────┘
```

---

## Related Documentation

- [Development Setup](./development-setup.md)
- [Authentication System](./01-authentication/README.md)
- [Progress Tracking](./08-progress-tracking/README.md)
- [Performance Analysis](./performance.md)
- [API Routes](./api-routes/README.md)

---

*Last updated: December 2024*
