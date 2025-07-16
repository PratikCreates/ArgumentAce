# ArgumentAce: Your AI Debate Coach

**Track Submission:** Track B: Live Simulated Mock Debates

## 1. Project Overview & Inspiration

In a world filled with information and diverse opinions, the ability to articulate a clear, persuasive argument is more valuable than ever. Yet, practicing for a debate, a business negotiation, or even a difficult conversation is incredibly hard. Finding a willing, unbiased sparring partner is a challenge, and professional coaching is often expensive and inaccessible.

We were inspired by the idea of democratizing debate coaching. With the recent advancements in Large Language Models (LLMs), we saw an opportunity to create **ArgumentAce**, an AI-powered sparring partner designed to help you build rock-solid arguments and master the art of persuasion.

ArgumentAce is an integrated AI system that simulates full debate rounds, from preparation to judgment, providing a complete training ground for debaters of all levels.

## 2. Core Features & Hackathon Requirements

This project was built to directly address the challenge for **Track B: Live Simulated Mock Debates**. Here's a breakdown of how we met the key requirements.

---

### Requirement 1: Case Prep

> **Challenge:** Develop an AI tool that helps debaters prepare cohesive cases for given motions.

ArgumentAce provides a **Case Preparation** feature powered by the `researchTopicFlow`. When a user inputs a topic, the AI assistant generates a structured brief containing:
*   **Arguments For (Pro Points):** 2-3 distinct, strong arguments in favor of the motion.
*   **Arguments Against (Con Points):** 2-3 distinct, strong arguments against the motion.
*   **Key Facts & Statistics:** 1-2 important and verifiable facts that are highly relevant to the debate.

This directly assists with the initial brainstorming and structuring phase of debate preparation, fulfilling the **Case Preparation Quality (5%)** evaluation criterion.

---

### Requirement 2: Debating

> **Challenge:** Create AI debaters with adjustable skill levels that deliver structured speeches and respond appropriately.

This is the core of the ArgumentAce experience.
*   **Adjustable Skill Levels:** The user can set the AI opponent's skill to **Beginner, Intermediate, or Advanced**. This setting is passed to our Genkit flows (`generateArgumentFlow` and `generateCounterArgumentFlow`) and directly influences the complexity, vocabulary, and reasoning style of the AI's arguments. This addresses the **Skill Level Differentiation (15%)** criterion.
*   **Structured Speeches & Responses:** The AI doesn't just give one-line answers. It generates multi-paragraph arguments (`generateArgumentFlow`) and counter-arguments (`generateCounterArgumentFlow`) that are coherent and directly engage with the user's points. The system maintains context by feeding the entire debate history into the prompt for the AI opponent. This addresses the **AI Debate Speech Quality (15%)** and **Interactivity (5%)** criteria.
*   **Text-to-Speech (TTS) for AI Delivery:** To better simulate a real debate environment, the AI's responses are converted to speech using Gemini's TTS model. Users can play the AI's argument aloud, adding a new layer of immersion.

---

### Requirement 3: Points of Information (POIs)

> **Challenge:** Implement AI capability to offer Points of Information during human speeches.

We've implemented a **virtual POI simulation** to address the **Interactivity (5%)** criterion.
*   While the user is writing their argument, they can click a "Challenge me with a POI" button.
*   Our `generatePoiFlow` analyzes the user's in-progress argument and generates a relevant, challenging question from the opponent's perspective.
*   The user can then type their response to the POI. This response is appended to their main argument, simulating how a speaker would handle a POI within their speech.
*   This feature encourages users to think on their feet and defend their arguments against interruptions, a key skill in parliamentary debate formats.

---

### Requirement 4: Adjudicators

> **Challenge:** Develop an AI judge capable of evaluating the debate and generating detailed, constructive feedback.

The **AI Jury Verdict** is a standout feature designed to meet the **Judging Quality And Feedback Relevance (15%)** criterion. After a few exchanges, the user can request a verdict from our `judgeDebateFlow`.

#### Adjudication Algorithm & Methodology

To ensure the judging is analytical and transparent, we've designed our AI judge to follow a specific "quasi-mathematical" algorithm:

1.  **Identify Key Clashes:** The AI first identifies the 2-4 main points of contention where both sides directly engaged.
2.  **Analyze Each Clash:** For each clash, it determines a winner ('user', 'ai', or 'tie') and provides a justification.
3.  **Assign a Score:** It assigns a score from **-5 (decisive win for AI) to +5 (decisive win for User)** for each clash. A score of 0 represents a tie.
4.  **Calculate Final Score:** The scores from all clashes are summed to produce a final score.
5.  **Declare Winner & Provide Feedback:** The final score determines the overall winner. The AI then provides qualitative feedback, including strengths and weaknesses for both the user and the AI, based on its clash analysis.

This reductionist approach makes the AI's decision-making process clear and accessible, directly addressing the hackathon's requirement for a transparent evaluation methodology. The UI then presents this verdict in a structured and easy-to-digest format.

---

### Requirement 5: User Interface & Experience

> **Challenge:** Provide a system with an intuitive UI for setting up sessions and reviewing feedback.

We built ArgumentAce with a clean, two-panel layout using **ShadCN UI** and **Tailwind CSS**.
*   **Left Panel (Input):** Contains controls for setting the topic, skill level, generating arguments, and writing your own responses.
*   **Right Panel (Output):** Displays the live debate log, real-time feedback, research points, and the final jury verdict.
*   **Session Management:** Users can save their debate sessions to local storage, review them in a "Past Sessions" dialog, and load them back to continue practicing.
*   **Sharing & PDF Download:** Sessions can be shared via a public link, and any debate can be downloaded as a well-formatted PDF for offline review.

This addresses the **User Interface (10%)** criterion.

## 3. Tech Stack & Architecture

ArgumentAce is built on a modern, robust, and AI-native tech stack:

*   **Framework:** **Next.js (App Router)** provides a powerful foundation with Server Components and a flexible file-based routing system.
*   **Language:** **TypeScript** ensures type safety and a more maintainable codebase.
*   **AI Integration:** **Genkit**, an open-source framework from Google, was the core of our AI backend. It allowed us to structure our interactions with LLMs into organized, testable "flows." We used **Google's Gemini 2.0 Flash model** for all generative tasks and the **Gemini TTS model** for speech synthesis.
    *   `generateArgumentFlow`: Creates initial arguments.
    *   `generateCounterArgumentFlow`: Powers the AI opponent's responses.
    *   `generatePoiFlow`: Simulates offering a Point of Information.
    *   `analyzeArgumentFlow`: Provides real-time feedback on fallacies and techniques.
    *   `judgeDebateFlow`: Acts as the impartial, analytical jury.
    *   `researchTopicFlow`: Generates case preparation materials.
    *   `textToSpeechFlow`: Converts AI responses to audio.
*   **UI/UX:** We used **ShadCN UI** for its beautiful, accessible, and highly composable set of components, styled with **Tailwind CSS**.
*   **State Management:** Client-side state is managed with React Hooks (`useState`, `useEffect`), and debate sessions are persisted in the browser using a custom `useLocalStorage` hook.
*   **Backend Stub:** The session sharing service (`sharingService.ts`) is currently an in-memory stub.

## 4. Challenges & Learnings

1.  **Prompt Engineering for Nuance:** Crafting prompts that could provide fair, unbiased, and *quantitative* jury feedback was a significant challenge. It required many iterations to get the AI to follow the "clash-based" scoring system reliably.
2.  **Client-Side PDF Generation:** We learned that generating a well-structured, multi-page PDF on the client-side is far more complex than simply taking a screenshot. We had to build a custom generator using `jspdf` that manually places every element to ensure a clean, professional output.
3.  **State Management Complexity:** Juggling the state for the debate topic, user input, debate log, AI-generated arguments, real-time feedback, and the final jury verdict across multiple components required very deliberate state management to prevent race conditions.

## 5. Future Work (Acknowledging Unmet Requirements)

While we are proud of the prototype, we have a clear vision for what's next, which aligns with some of the more advanced hackathon requirements:

*   **Speech-to-Text Integration:** The next major step is to implement real-time transcription to allow users to speak their arguments, which would address the **Transcription Accuracy (20%)** criterion. This would also enable a more fluid POI system.
*   **Support for Specific Debate Formats (AP/BP):** We plan to add modes for different formats, with specific speaker roles (e.g., Prime Minister, Whip) and timing constraints.
*   **Persistent User Accounts:** We will replace the stubbed sharing service and `localStorage` with a full backend using **Firebase Firestore** to allow users to save sessions to the cloud.
