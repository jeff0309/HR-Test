# Gemini React App

This is a modern React application integrated with Gemini AI, featuring a premium UI and automated CI/CD.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd gemini-react-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Create a `.env.local` file in the root directory and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Start development server:**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

## 🛠️ Scripts

- `npm run dev`: Start Vite development server
- `npm run build`: Build production-ready bundle
- `npm run preview`: Preview the production build locally
- `npm run lint`: Run TypeScript and ESLint checks
- `npm run format`: Format code with Prettier
- `npm run clean`: Remove the `dist` folder

## 📦 Deployment

This project is configured with **GitHub Actions** for automated deployment.

- **Trigger**: Every push to `main` or `master` branch.
- **Process**:
  1. Checks out code.
  2. Installs dependencies.
  3. Lints and builds the project.
  4. Deploys the `dist` folder to the `gh-pages` branch.

To enable deployment, ensure GitHub Pages is set to deploy from the `gh-pages` branch in your repository settings.

## 🏗️ Tech Stack

- **React 19**: Frontend framework
- **Vite 6**: Fast build tool and dev server
- **Tailwind CSS 4**: Modern styling
- **Motion**: Fluid animations
- **Lucide React**: Beautiful icons
- **Google Gemini API**: AI integration
