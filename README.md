

# Roast My Wallet

**Roast My Wallet** is an AI-powered analytics tool designed to gamify on-chain data analysis. By leveraging Large Language Models (LLMs) and real-time ledger data, the application transforms raw transaction history into natural language "roasts," creating a high-engagement, shareable layer on top of the Scroll ecosystem.

## 📄 Project Overview

Traditional block explorers (like Etherscan or Scrollscan) are essential for verification but lack the user engagement required for mass onboarding. "Roast My Wallet" solves this by parsing complex EVM data—gas usage, failed transactions, token swaps—and reinterpreting it through a humorous, social lens.

This project was built for the **Scroll Build, Vibe, Ship Hackathon (Dec 2025)** to demonstrate how AI and Blockchain data can combine to create viral social loops.

## 🏗 Technical Architecture

The application utilizes a serverless architecture to ensure scalability and privacy.

  * **Frontend:** Next.js 14 (App Router), React, Tailwind CSS.
  * **Animation Engine:** Framer Motion (for high-performance UI transitions).
  * **Data Layer:** Scrollscan API (fetches EVM transaction logs).
  * **Intelligence Layer:** OpenAI GPT-4o-mini (analyzes JSON-formatted transaction summaries).
  * **Deployment:** Vercel.

### Data Flow

1.  **Input:** User provides a wallet address (0x...). No wallet connection is required, preserving user security.
2.  **Ingestion:** The backend API (`/api/roast`) queries the Scrollscan API to retrieve the last `n` transactions.
3.  **Normalization:** Raw hex data is parsed into human-readable formats (ETH values, function names, gas costs).
4.  **Inference:** A structured prompt containing the transaction summary is sent to the LLM.
5.  **Output:** The LLM returns a context-aware analysis ("roast"), which is rendered on the frontend and prepared for social sharing.

## ⚡ Key Features

  * **Zero-Friction Onboarding:** Users do not need to connect a wallet or sign transactions. This lowers the barrier to entry significantly.
  * **Real-Time Scroll Analytics:** The app fetches live data from the Scroll Mainnet, ensuring the analysis is current.
  * **Privacy-First:** No user data is stored in a database. All analysis happens in-memory during the session.
  * **Viral Mechanics:** Integrated "Share on X" functionality generates deep-linked content to drive traffic back to the Scroll ecosystem.

## 🛠 Installation & Setup

To run this project locally:

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/roast-my-wallet.git
cd roast-my-wallet
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure Environment Variables**
Create a `.env.local` file in the root directory and add your API keys:

```env
OPENAI_API_KEY=your_openai_key
SCROLLSCAN_API_KEY=your_scrollscan_key
```

**4. Run the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🧩 Scroll Ecosystem Integration

This project directly utilizes the **Scroll zkEVM** data layer. Unlike generic roasters, this implementation is specifically tuned to recognize Scroll-specific behaviors, such as interactions with Scroll native bridges and dApps.

## 📜 License

Distributed under the MIT License.