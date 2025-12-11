# Roast My Wallet

**Roast My Wallet** is an AI-powered cross-chain analytics application designed to interpret blockchain transaction data through a natural language interface. By leveraging Large Language Models (LLMs) and real-time ledger data, the application transforms raw technical metrics into personalized, humorous critiques ("roasts"), creating a high-engagement layer on top of standard block exploration.

This project was developed for the **Scroll Build, Vibe, Ship Hackathon (December 2025)** to demonstrate the integration of AI agents with multi-chain data sources, specifically focusing on user behavior across Scroll L2, Solana, and cross-chain infrastructure.

## Project Overview

Current blockchain explorers (such as Etherscan or Solscan) provide necessary verification data but often lack the accessibility required for broader user engagement. "Roast My Wallet" addresses this limitation by parsing complex EVM and SVM data—including gas efficiency, transaction failure rates, and token swapping behavior—and reinterpreting it through a social, interactive lens.

## Problem Statement

  * **Data Accessibility:** Raw transaction hashes and hex data provide limited context to average users regarding their trading performance.
  * **Ecosystem Silos:** Users often operate within specific chain ecosystems (e.g., only Ethereum or only Solana) without visibility into comparative performance or cross-chain opportunities.
  * **Bridge Opacity:** Cross-chain activity is frequently opaque, making it difficult to assess a user's interoperability habits or reliance on specific infrastructure.

## Solution Architecture

The application utilizes an intelligent analysis engine that performs the following functions:

1.  **Chain Identity Detection:** Automatically discriminates between EVM-compatible addresses (Scroll) and SVM-compatible addresses (Solana).
2.  **Infrastructure Analysis:** Integrates with the **deBridge API** to query cross-chain transaction history, determining the frequency and recency of interoperability events.
3.  **Behavioral Inference:** Aggregates data points such as failed transactions, gas expenditure, and contract interactions to generate a context-aware profile of the wallet owner.

## Technical Implementation

### Backend Architecture

  * **Scroll Analysis:** Utilizes the **Scrollscan API** to parse Layer 2 metrics, identifying specific function calls (e.g., `depositETH`) to assess gas efficiency and bridge usage.
  * **Solana Analysis:** Connects to **Solana RPC** nodes via the `@solana/web3.js` library to retrieve transaction signatures, analyzing failure rates and network congestion impact.
  * **Bridge Integration (deBridge):** Queries the **deSwap API** (`/dln/order/orders`) to retrieve the user's cross-chain order history. The system calculates the "Bridge Age" (time elapsed since the last cross-chain swap) to assess ecosystem mobility.

### Frontend Implementation

  * **Framework:** Built on Next.js 14 (App Router) and React for server-side rendering and static site generation.
  * **Styling:** Implements Tailwind CSS for a responsive, high-contrast user interface.
  * **State Management:** Uses React hooks for managing asynchronous data fetching and UI states.
  * **Social Integration:** Features native deep-linking for social media sharing, driving organic traffic back to the application.

## Key Features

  * **Multi-Chain Compatibility:** Supports input validation and analysis for both Ethereum-based (Scroll) and Solana wallet addresses.
  * **Bridge Utilization Analysis:** Specifically identifies and comments on the usage of cross-chain infrastructure, distinguishing between active users and those isolated on a single chain.
  * **Privacy-Preserving Design:** Operates without requiring wallet connection or signature requests. All analysis is performed via public ledger data, ensuring user security.
  * **Real-Time Data Feed:** Displays a live ticker of analyzed wallets and their respective outputs, demonstrating platform activity.

## Installation and Setup

To deploy this project locally, follow these steps:

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
Create a `.env.local` file in the root directory and add the required API credentials:

```env
OPENAI_API_KEY=your_openai_key
SCROLLSCAN_API_KEY=your_scrollscan_key
```

**4. Run the development server**

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

## Ecosystem Integrations

  * **Scroll:** Serves as the primary analysis layer for assessing Layer 2 cost-efficiency and ecosystem participation.
  * **deBridge:** Utilized to verify cross-chain intent and analyze liquidity movement between networks.
  * **Solana:** Integrated to provide comparative analysis against high-throughput monolithic chains.

## License

Distributed under the MIT License.