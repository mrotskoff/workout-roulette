# GitHub Repository Setup

This guide will help you create and push your Workout Roulette project to GitHub.

## Option 1: Using GitHub CLI (Recommended)

If you have GitHub CLI installed:

1. **Login to GitHub CLI** (if not already logged in):

   ```powershell
   gh auth login
   ```

2. **Run the setup script**:

   ```powershell
   .\setup-github.ps1
   ```

   Or specify a custom repository name:

   ```powershell
   .\setup-github.ps1 -RepoName "my-workout-app"
   ```

3. **Done!** Your repository will be created and pushed automatically.

### Installing GitHub CLI

If you don't have GitHub CLI installed:

**Windows (using winget):**

```powershell
winget install GitHub.cli
```

**Or download from:** https://cli.github.com/

## Option 2: Manual Setup

1. **Create a new repository on GitHub:**

   - Go to https://github.com/new
   - Repository name: `workout-roulette` (or your preferred name)
   - Description: "Mobile fitness app that generates randomized workouts"
   - Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)

2. **Add the remote and push:**

   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/workout-roulette.git
   git branch -M main
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your GitHub username.

## Option 3: Using GitHub Desktop

1. Install GitHub Desktop from https://desktop.github.com/
2. Open GitHub Desktop
3. File → Add Local Repository
4. Select the `workout-roulette` folder
5. Publish repository → Create on GitHub

## After Setup

Once your repository is on GitHub, you can:

- View it at: `https://github.com/YOUR_USERNAME/workout-roulette`
- Clone it on other machines: `git clone https://github.com/YOUR_USERNAME/workout-roulette.git`
- Set up GitHub Actions for CI/CD (optional)
- Add collaborators in repository settings

## VS Code Workspace

Open the project in VS Code using the workspace file:

- Double-click `workout_roulette.code-workspace`
- Or: File → Open Workspace from File → Select `workout_roulette.code-workspace`

The workspace includes:

- Root project folder
- Mobile App folder

All with optimized settings for development.
