# PowerShell script to create and push to GitHub repository
# Usage: .\setup-github.ps1 [repository-name]

param(
    [string]$RepoName = "workout-roulette"
)

Write-Host "Setting up GitHub repository for Workout Roulette..." -ForegroundColor Cyan

# Check if GitHub CLI is installed
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue

if ($ghInstalled) {
    Write-Host "GitHub CLI detected. Creating repository..." -ForegroundColor Green
    
    # Check if user is logged in
    $ghAuth = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Please login to GitHub CLI first:" -ForegroundColor Yellow
        Write-Host "  gh auth login" -ForegroundColor Yellow
        exit 1
    }
    
    # Create repository on GitHub
    Write-Host "Creating repository '$RepoName' on GitHub..." -ForegroundColor Cyan
    gh repo create $RepoName --public --source=. --remote=origin --push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nRepository created and pushed successfully!" -ForegroundColor Green
        Write-Host "View your repo at: https://github.com/$(gh api user --jq .login)/$RepoName" -ForegroundColor Cyan
    } else {
        Write-Host "Failed to create repository. Please check the error above." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "GitHub CLI not found. Using manual setup..." -ForegroundColor Yellow
    Write-Host "`nPlease follow these steps:" -ForegroundColor Cyan
    Write-Host "1. Go to https://github.com/new" -ForegroundColor White
    Write-Host "2. Create a new repository named: $RepoName" -ForegroundColor White
    Write-Host "3. DO NOT initialize with README, .gitignore, or license" -ForegroundColor White
    Write-Host "4. Copy the repository URL" -ForegroundColor White
    Write-Host "5. Run these commands:" -ForegroundColor White
    Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/$RepoName.git" -ForegroundColor Gray
    Write-Host "   git branch -M main" -ForegroundColor Gray
    Write-Host "   git push -u origin main" -ForegroundColor Gray
    Write-Host "`nOr install GitHub CLI for easier setup:" -ForegroundColor Yellow
    Write-Host "   winget install GitHub.cli" -ForegroundColor Gray
}

