# Project Odyssey: Transcript to Task Graph

An intelligent full-stack application that transforms unstructured meeting transcripts into actionable, visual task dependency graphs using LLMs and graph theory.

## 🚀 Problem Statement
Project management often fails at the transition from "meeting" to "execution." Valuable context about task priorities and dependencies is buried in long transcripts. This project automates that extraction, ensuring that teams can immediately visualize their critical path and identify bottleneck cycles.

## 🏗️ Architecture
The system follows a classic decoupled architecture with an asynchronous processing layer:
- **Frontend**: Next.js (App Router) + React Flow for interactive graph visualization.
- **Backend**: Node.js + Express + Prisma (SQLite).
- **Processing**: Async job queuing for LLM calls to prevent API timeouts and support polling.
- **Database**: SQLite manages transcripts, task items, and job statuses.

## 🧠 LLM Prompt Strategy
The system uses a "Strict Schema Extraction" prompt. Key strategies:
- **Output Enforcement**: Only valid JSON is accepted.
- **Actionable Descriptions**: Tasks are constrained to concise, verb-first sentences.
- **Priority Scaling**: Maps qualitative discussion to a numeric 1–5 scale.
- **Dependency Awareness**: Explicitly instructs the LLM to link tasks by ID only if they exist in the same context.

## 🛠️ Core Logic

### Dependency Sanitization
LLMs occasionally hallucinate IDs in the `dependencies` array. Our `sanitizeDependencies` utility:
1. Builds a set of all valid task IDs extracted.
2. Filters out any dependency ID not present in that set.
3. Logs a warning to the user for every removed reference.

### Cycle Detection (Kahn’s Algorithm)
To prevent "deadlock" schedules, we use Kahn's Algorithm for Topological Sorting:
- **Detection**: If the graph cannot be sorted, a cycle exists.
- **Isolation**: Nodes remaining with an in-degree > 0 after sorting are identified as cyclic.
- **Status Flagging**: Tasks in a cycle are marked as `blocked` in the database and visually flagged in the UI.

## 📋 Project Odyssey Example
When processing the "Project Odyssey" transcript:
1. **Idempotency**: Transcript is hashed to check if we've already processed this exact meeting.
2. **Extraction**: LLM identifies "Fix Stripe Bug" (Priority 1) as the primary root.
3. **Linking**: "Regression Test" and "Press Screenshots" are linked as children of the Stripe bug.
4. **Validation**: The system ensures no circular logic (e.g., David reviewing David's work).
5. **Visualization**: The Graph rendered in the browser shows the Stripe bug as a green entry point for the entire path.

## 🚦 Setup and Run

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend Setup
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run database migrations
npx prisma migrate dev --name init

# Start server
npm run dev
```
The backend runs on `http://localhost:3000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend runs on `http://localhost:3001`.

### 3. Testing
```bash
# Run all tests (Integration + Units)
npm test
```

## 🧪 Key Files
- `src/utils/graph.ts`: Kahn's algorithm implementation.
- `src/utils/sanitizer.ts`: Dependency cleanup logic.
- `src/services/job.service.ts`: Async orchestration and background processing.
- `frontend/components/GraphView.tsx`: React Flow visualization component.
