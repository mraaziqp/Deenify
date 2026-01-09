# **App Name**: Deenify

## Core Features:

- Revert Slow-Drip Logic: Implement a milestone-based system that gradually introduces Islamic concepts to new reverts, unlocking features based on progress. Hides Fiqh debates and finance initially.
- Dhikr Circle Distributed Counters: Implement sharding for the Dhikr counter to handle high volumes of users. The app writes to a random shard, and an aggregate sum is displayed with optimistic updates.
- AI Safety with RAG: Implement Retrieval-Augmented Generation (RAG) to ensure the AI only answers from approved Islamic texts. Includes a 'Fatwa Firewall' to avoid complex rulings. The assistant is implemented as a tool the end-user will interact with.
- User Profile: Allow users to create and manage their profiles, including their name, joinedAt date, madhab (optional), and fluencyLevel.
- Content Library: Provide a content library with various Islamic resources, categorized by type (course, daily ayah) and difficulty (beginner, advanced).
- Quran Khatm Tracking: Implement a system for users to participate in Quran Khatm circles, tracking the juz status (open, claimed, completed). Uses Firestore transactions for safety and includes a timeout feature.
- Ask About Islam AI Feature: Provide an AI-powered assistant that answers questions about Islam based on the Quran and Sahih Hadith, adhering to strict guidelines and safety measures.
- Deep Zakat & Purification Calculator: A calculator for Zakat that takes into account gold, silver, cash, stocks (active vs passive), crypto, and debts. Includes a separate tab for impure income.
- Halal Stock Screener: A tool that screens stocks to ensure that they comply with Islamic principles. It will check business activity and financial ratios (debt < 33%).
- Wasiya (Will) Generator: A tool that generates a legally valid Islamic will based on the Fara'id Algorithm.

## Style Guidelines:

- Primary color: Saturated teal (#008080) for a calming and trustworthy feel, suggesting growth and peace.
- Background color: Light teal (#E0F8F8), a desaturated version of the primary color to maintain visual consistency without being overwhelming.
- Accent color: Blue (#4682B4), an analogous color to teal, offering a cool and harmonious contrast to highlight important elements.
- Body and headline font: 'PT Sans', a humanist sans-serif that combines a modern look and a little warmth or personality.
- Use clear and modern icons to represent different features and categories within the app.
- Maintain a clean and organized layout, ensuring ease of navigation and a user-friendly experience.
- Incorporate subtle animations and transitions to enhance user engagement and provide visual feedback.