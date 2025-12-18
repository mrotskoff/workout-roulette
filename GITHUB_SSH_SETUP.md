# GitHub SSH Setup - No Passphrase on Every Push

This guide helps you set up SSH authentication for GitHub on Windows so you don't have to enter your passphrase on every push.

## Option 1: SSH Agent with Windows Credential Manager (Recommended)

### Step 1: Start SSH Agent Service

Open PowerShell as Administrator and run:

```powershell
# Set SSH agent service to start automatically
Get-Service ssh-agent | Set-Service -StartupType Automatic
Start-Service ssh-agent
```

### Step 2: Add Your SSH Key to the Agent

```powershell
# Add your SSH key (replace with your key path if different)
ssh-add ~/.ssh/id_ed25519

# Or if you're using RSA:
# ssh-add ~/.ssh/id_rsa
```

You'll be prompted for your passphrase once. After this, the key will be stored in the agent.

### Step 3: Verify It's Working

```powershell
# Check that your key is loaded
ssh-add -l

# Test GitHub connection
ssh -T git@github.com
```

### Step 4: Make It Persistent (Optional)

To ensure the key is added automatically when you restart your computer, you can create a PowerShell script:

1. Create a file: `C:\Users\YOUR_USERNAME\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`
2. Add this content:

```powershell
# Auto-start SSH agent and add key
if (Get-Service ssh-agent -ErrorAction SilentlyContinue) {
    if ((Get-Service ssh-agent).Status -ne 'Running') {
        Start-Service ssh-agent
    }
    # Add your key (adjust path if needed)
    ssh-add ~/.ssh/id_ed25519 2>$null
}
```

## Option 2: Git Credential Manager (HTTPS Alternative)

If you prefer using HTTPS instead of SSH:

### Step 1: Switch Remote to HTTPS

```powershell
# Check current remote
git remote -v

# Change to HTTPS (replace with your username/repo)
git remote set-url origin https://github.com/YOUR_USERNAME/workout_roulette.git
```

### Step 2: Use Git Credential Manager

Git Credential Manager (comes with Git for Windows) will securely store your credentials:

```powershell
# Configure Git to use credential manager
git config --global credential.helper manager-core
```

On your first push, you'll be prompted to authenticate via browser, and it will be saved securely.

## Option 3: SSH Config with Keychain (Advanced)

Create or edit `~/.ssh/config`:

```
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    AddKeysToAgent yes
    UseKeychain yes
```

**Note:** `UseKeychain` is macOS-specific. On Windows, use Option 1 (SSH Agent).

## Troubleshooting

### SSH Agent Not Starting

```powershell
# Check if service exists
Get-Service ssh-agent

# If it doesn't exist, you may need to install OpenSSH
# Run PowerShell as Administrator:
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

### Key Not Persisting After Restart

1. Make sure SSH agent service is set to Automatic startup (see Step 1)
2. Add the key to your PowerShell profile (see Step 4 of Option 1)

### Still Being Asked for Passphrase

1. Verify key is loaded: `ssh-add -l`
2. Check your SSH key path matches what's in `~/.ssh/config`
3. Make sure you're using the correct remote URL (should start with `git@github.com:`)

## Verify Your Setup

After setup, test it:

```powershell
# Should not prompt for passphrase
git push

# Should show your key
ssh-add -l
```

## Security Notes

- Your passphrase is stored in memory (RAM) by SSH agent, not on disk
- The key is only accessible while the SSH agent is running
- If you lock your computer, the key remains in memory (secure)
- For maximum security, you can manually remove keys: `ssh-add -D`

## Quick Reference

```powershell
# Start SSH agent
Start-Service ssh-agent

# Add key (one-time passphrase entry)
ssh-add ~/.ssh/id_ed25519

# List loaded keys
ssh-add -l

# Remove all keys
ssh-add -D

# Test GitHub connection
ssh -T git@github.com
```
