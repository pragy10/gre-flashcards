# Lexicon — Minimal GRE Flashcard Maker & Player

A clean, aesthetic, and distraction-free GRE vocabulary flashcard companion built with React, Tailwind CSS, and MongoDB Atlas.

## ✨ Features
- **Daily Sessions**: Track words organized by day (Day 1, Day 2, etc.) with custom focus themes.
- **Interactive 3D Player**: Card flipping, audio pronunciation, mnemonic memory hooks, and hotkey navigation (`Space`, `←`, `→`).
- **Spaced Practice Statuses**: Tag cards as *New*, *Still Learning*, or *Mastered*.
- **Dictionary Auto-Fill**: Automatically pull GRE definitions and synonyms via public dictionary API.
- **Dual Storage**: Works offline with `localStorage` and syncs seamlessly with **MongoDB Atlas** when deployed on Vercel.

---

## 🚀 Setting up MongoDB Atlas (Free Tier)

Follow these steps to get your database connection string:

1. **Create an Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register or log in.
2. **Create a Free Cluster**:
   - Click **"Create"** or **"Build a Database"**.
   - Choose the **M0 (Free)** tier.
   - Select your preferred cloud provider (AWS) and nearest region.
   - Click **"Create Deployment"**.
3. **Database User Security**:
   - In the Quickstart prompt, create a Username (e.g. `gre_user`) and a Password. **Save these credentials**.
   - Under **IP Access List**, choose **"Allow Access from Anywhere"** (`0.0.0.0/0`). This is necessary so Vercel's serverless functions can connect to MongoDB.
4. **Get the Connection String**:
   - Go to **Database** in the sidebar → click **"Connect"**.
   - Select **"Drivers"** (Node.js).
   - Copy your connection string, which will look like:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.
   - Append `/gre_flashcards` before the `?` query parameter:
     ```text
     mongodb+srv://gre_user:yourpassword@cluster0.xxxxx.mongodb.net/gre_flashcards?retryWrites=true&w=majority
     ```

---

## 🌐 Deploying to Vercel

1. Push your repository to GitHub / GitLab:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. In the **Environment Variables** section:
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/gre_flashcards?retryWrites=true&w=majority`
5. Click **"Deploy"**.

Vercel will automatically build the Vite frontend and host the serverless endpoint in `/api/days.js`.
