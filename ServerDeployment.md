# Windows Server 2022 Deployment Guide

This document details the complete step-by-step procedure for deploying the **QTech Status** application to a production machine running **Windows Server 2022 Standard**.

---

## 1. Overview of Deployment Architecture

The production build generates:
- `dist/` — Compiled Vue 3 static assets and production client bundles.
- `dist/server.cjs` — Self-contained CommonJS Node.js Express backend server bundled via `esbuild`.

In this production architecture:
1. The **Node.js Express backend** runs as a persistent **Windows Background Service** via **NSSM** (listening on internal port `3000` at `127.0.0.1`).
2. **Internet Information Services (IIS)** acts as the front-facing Reverse Proxy handling ports `80` (HTTP) and `443` (HTTPS), managing SSL/TLS termination, request forwarding, and security filtering.

```text
[ Client Browser ] 
       │ (Port 80 / 443 HTTPS)
       ▼
[ IIS Web Server + URL Rewrite & ARR Proxy ]
       │ (Port 3000 HTTP Reverse Proxy)
       ▼
[ Node.js Windows Service (dist/server.cjs) ]
  ├── /api/*          -> Express API routes (Gemini AI Proxy, Health checks)
  └── Static Assets   -> Serves dist/ Vue 3 SPA with history mode fallback
```

---

## 2. Server Roles & Prerequisites Setup

### Step A: Install Node.js LTS
1. Log in to your Windows Server 2022 instance via Remote Desktop (RDP).
2. Download and run the **Node.js LTS Installer (v20.x or v22.x)** from [nodejs.org](https://nodejs.org).
3. In the installer wizard, ensure **"Add to PATH"** is enabled.
4. Open **PowerShell as Administrator** and verify the installation:
   ```powershell
   node -v
   npm -v
   ```
   *(Expected output: Node `v20.x.x`+ and npm `v10.x.x`+)*

---

### Step B: Install IIS Web Server Role
1. Open **Server Manager** $\rightarrow$ Click **Manage** $\rightarrow$ **Add Roles and Features**.
2. Select **Role-based or feature-based installation** $\rightarrow$ Select your local server.
3. Under **Server Roles**, check **Web Server (IIS)**.
4. Under **Role Services**, ensure the following required modules are selected:
   - **Common HTTP Features**: Default Document, Directory Browsing, HTTP Errors, Static Content, HTTP Redirection.
   - **Application Development**: WebSocket Protocol, .NET Extensibility, CGI.
   - **Management Tools**: IIS Management Console.
5. Click **Next** $\rightarrow$ **Install**.

---

### Step C: Install IIS Reverse Proxy Extensions (Required)
IIS requires two official Microsoft extensions to function as an HTTP/HTTPS reverse proxy:

1. **Microsoft URL Rewrite Module 2.1**:
   - Download the x64 installer: [Microsoft URL Rewrite 2.1](https://www.iis.net/downloads/microsoft/url-rewrite)
   - Run the installer and finish the setup.
2. **Microsoft Application Request Routing (ARR) 3.0**:
   - Download the x64 installer: [Microsoft ARR 3.0](https://www.iis.net/downloads/microsoft/application-request-routing)
   - Run the installer and finish the setup.

---

### Step D: Enable ARR Reverse Proxy in IIS
1. Open **Internet Information Services (IIS) Manager** (`inetmgr`).
2. In the left-hand **Connections** tree, select the top-level **Server Node**.
3. In the middle pane, double-click **Application Request Routing Cache**.
4. In the right-hand **Actions** panel, click **Server Proxy Settings...**
5. Check the box for **Enable proxy**.
6. Under **Proxy Type**, leave **HTTP Version** as `Pass through` and ensure **Reverse rewrite host in response headers** is **unchecked**.
7. Click **Apply** in the top-right Actions panel.

---

## 3. Application Setup & Production Build

### Step A: Create Application Directory
Open PowerShell as Administrator:
```powershell
New-Item -ItemType Directory -Force -Path "C:\inetpub\apps\qtech-status"
New-Item -ItemType Directory -Force -Path "C:\inetpub\apps\qtech-status\logs"
```

### Step B: Deploy Source Files
Transfer the repository files to `C:\inetpub\apps\qtech-status` via Git, CI/CD pipeline, or ZIP archive.

### Step C: Install Dependencies & Build Bundle
In PowerShell (Admin):
```powershell
cd C:\inetpub\apps\qtech-status

# 1. Install production and build dependencies
npm ci
# Note: If npm ci fails due to lockfile discrepancy, run: npm install

# 2. Compile Vue 3 frontend and bundle the Express server into dist/server.cjs
$env:NODE_ENV="production"
npm run build
```

Verify that the `dist/` directory contains:
- `dist/index.html` and compiled assets (`dist/assets/*.js`, `dist/assets/*.css`).
- `dist/server.cjs` and `dist/server.cjs.map` (Express backend bundle).

---

## 4. Register Node.js as a Windows Service (NSSM)

Using **NSSM (Non-Sucking Service Manager)** ensures the Node application runs as a background service, starts automatically on system boot, and restarts immediately if the process terminates unexpectedly.

### Step A: Install NSSM
1. Download **NSSM** from [nssm.cc](https://nssm.cc/download).
2. Extract the archive and copy `nssm-x.xx\win64\nssm.exe` to `C:\Tools\nssm\nssm.exe`.

### Step B: Configure and Start the Service
Run the following commands in PowerShell as Administrator:

```powershell
$NodePath = (Get-Command node).Source
$AppDir   = "C:\inetpub\apps\qtech-status"
$EntryJS  = "C:\inetpub\apps\qtech-status\dist\server.cjs"
$NssmExe  = "C:\Tools\nssm\nssm.exe"

# 1. Install the Service
& $NssmExe install QTechStatusService "$NodePath" "$EntryJS"

# 2. Set Working Directory
& $NssmExe set QTechStatusService AppDirectory "$AppDir"

# 3. Configure Environment Variables (Newline-separated)
$EnvVars = @(
    "NODE_ENV=production",
    "PORT=3000"
)
& $NssmExe set QTechStatusService AppEnvironmentExtra ($EnvVars -join "`n")

# 4. Configure Standard Output and Error Logs
& $NssmExe set QTechStatusService AppStdout "$AppDir\logs\service-stdout.log"
& $NssmExe set QTechStatusService AppStderr "$AppDir\logs\service-stderr.log"
& $NssmExe set QTechStatusService AppRotateFiles 1
& $NssmExe set QTechStatusService AppRotateBytes 10485760 # 10MB per log file

# 5. Set Startup Type to Automatic and Start Service
& $NssmExe set QTechStatusService Start SERVICE_AUTO_START
& $NssmExe start QTechStatusService
```

### Step C: Verify Node Service Status
```powershell
# Check service status
Get-Service QTechStatusService

# Test local Node health check endpoint
Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/health"
# Expected response: @{status=ok}
```

---

## 5. Configure IIS Web Site & Reverse Proxy Rules

### Step A: Configure Website & Domain Host Binding
1. Open **IIS Manager** (`inetmgr`).
2. Under **Sites**, select **Default Web Site** (or create a new site pointed to `C:\inetpub\wwwroot`).
3. Ensure the physical path points to `C:\inetpub\wwwroot`.
4. **Configure Host Name Binding for SSL**:
   Let's Encrypt tools (`win-acme`) require the domain name configured on the port 80 binding to automatically detect your site.
   - Run in PowerShell (Admin):
     ```powershell
     Set-WebBinding -Name "Default Web Site" -BindingInformation "*:80:" -PropertyName "HostHeader" -Value "your-domain.com"
     ```
   - *Or in IIS Manager*: Select **Default Web Site** $\rightarrow$ Click **Bindings...** in the Actions pane $\rightarrow$ Edit the `http` port 80 binding $\rightarrow$ Enter your domain in **Host name** $\rightarrow$ Click **OK**.

### Step B: Create `web.config` Reverse Proxy File
Create or replace `C:\inetpub\wwwroot\web.config` with the following configuration. It includes an explicit bypass for `/.well-known/acme-challenge/` and avoids `<serverVariables>` or schema-dependent tags which cause **HTTP 500.50** errors in IIS when unwhitelisted.

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- 1. ACME Challenge rule: Let IIS serve Let's Encrypt validation files directly -->
        <rule name="AcmeChallenge" stopProcessing="true">
          <match url="^\.well-known/acme-challenge/.*" />
          <action type="None" />
        </rule>

        <!-- 2. Node.js Reverse Proxy Rule -->
        <rule name="QTechStatus_ReverseProxy" stopProcessing="true">
          <match url="(.*)" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_URI}" pattern="^/\.well-known/acme-challenge" negate="true" />
          </conditions>
          <action type="Rewrite" url="http://127.0.0.1:3000/{R:1}" />
        </rule>
      </rules>
    </rewrite>

    <!-- Request Filtering and Security -->
    <security>
      <requestFiltering allowDoubleEscaping="true">
        <requestLimits maxAllowedContentLength="52428800" /> <!-- 50MB max upload -->
      </requestFiltering>
    </security>

    <!-- Disable IIS standard error pages so custom Express/API errors are preserved -->
    <httpErrors existingResponse="PassThrough" />
  </system.webServer>
</configuration>
```

---

## 6. Configure Windows Defender Firewall Rules

Allow inbound traffic on port `80` (HTTP) and port `443` (HTTPS). Run in PowerShell (Admin):

```powershell
# Open HTTP Port 80
New-NetFirewallRule -DisplayName "IIS Web Server (HTTP Port 80)" `
                    -Direction Inbound `
                    -LocalPort 80 `
                    -Protocol TCP `
                    -Action Allow `
                    -Profile Any

# Open HTTPS Port 443
New-NetFirewallRule -DisplayName "IIS Web Server (HTTPS Port 443)" `
                    -Direction Inbound `
                    -LocalPort 443 `
                    -Protocol TCP `
                    -Action Allow `
                    -Profile Any
```

---

## 7. SSL/TLS Certificate Setup (HTTPS)

> **Important Note on Domain Types**:
> - **Public Internet Domain** (e.g. `status.yourcompany.com` registered with public DNS and port 80 open to the internet): Use **Option 1 (Let's Encrypt / win-acme)**.
> - **Internal / Intranet / Private Network** (e.g. internal hostnames like `qtech.sdcvwdq01.com`, `.local`, or access via LAN/VPN only): Let's Encrypt **will fail with `NXDOMAIN`** because public CA servers cannot resolve private DNS. Use **Option 2 (Self-Signed Certificate)** or **Option 3 (Enterprise Active Directory CA)** instead!

### Option 1: Free Automated Certificate via Let's Encrypt (win-acme)
*(For publicly accessible domains only)*

1. Download **win-acme** from [win-acme.com](https://www.win-acme.com).
2. Extract the files and run `wacs.exe` as Administrator.

> **Note**: If you see *"No websites with host bindings have been configured in IIS"*, set your domain in IIS binding first via `Set-WebBinding -Name "Default Web Site" -BindingInformation "*:80:" -PropertyName "HostHeader" -Value "your-domain.com"`, or choose `M` (Manual input) in `wacs.exe`.

3. Choose:
   - `N`: Create certificate (default settings)
   - Select your IIS Site (e.g., `Default Web Site (your-domain.com)`)
   - Confirm bindings and enter your notification email for renewals.
4. `win-acme` will automatically validate via HTTP-01, install the certificate, bind it to port 443 in IIS, and register a daily Windows Task to renew it automatically.

### Option 2: Self-Signed Certificate for Internal / Intranet Servers (Recommended for Internal Networks)

For internal intranet servers (e.g. `qtech.sdcvwdq01.com`, `sdcvwdq01`), generate a 5-year Self-Signed Certificate directly in PowerShell:

```powershell
# 1. Generate a 5-year Self-Signed Certificate
$DnsNames = @("qtech.sdcvwdq01.com", "sdcvwdq01", "localhost", "127.0.0.1")
$Cert = New-SelfSignedCertificate -DnsName $DnsNames `
                                  -CertStoreLocation "cert:\LocalMachine\My" `
                                  -NotAfter (Get-Date).AddYears(5) `
                                  -FriendlyName "QTech Status Internal SSL"

# 2. Add HTTPS Binding on Port 443 to Default Web Site (if not already present)
$ExistingBinding = Get-WebBinding -Name "Default Web Site" -Protocol "https"
if (-not $ExistingBinding) {
    New-WebBinding -Name "Default Web Site" -IPAddress "*" -Port 443 -Protocol "https"
}

# 3. Attach Certificate to Port 443 HTTPS Binding
$Binding = Get-WebBinding -Name "Default Web Site" -Protocol "https"
$Binding.AddSslCertificate($Cert.GetCertHashString(), "My")

# 4. Restart IIS
iisreset
```

### Option 3: Enterprise / Custom PFX Certificate (Active Directory CA)
1. Open **IIS Manager** $\rightarrow$ Select the Server node $\rightarrow$ Open **Server Certificates**.
2. Click **Import...** in the Actions panel $\rightarrow$ Select your `.pfx` certificate file and enter the password.
3. Select your website $\rightarrow$ Click **Bindings...** in the Actions pane.
4. Click **Add...** $\rightarrow$ Type: `https`, Port: `443`, Select the imported SSL Certificate $\rightarrow$ Click **OK**.

---

## 8. Updating & Publishing a New Version (Deploying Code Changes)

Whenever you update source files (e.g. Vue components in `src/`, CSS/theme adjustments, page layouts, or backend routes in `server.ts`), follow this standard procedure to compile and publish the changes to production.

### Step-by-Step Publishing Workflow

#### Step 1: Transfer or Pull the Updated Code
Navigate to your application directory on Windows Server:
```powershell
cd C:\inetpub\apps\qtech-status
```
- **If using Git**:
  ```powershell
  git pull origin main
  ```
- **If manually deploying via ZIP / File Transfer**:
  Extract or copy the modified files into `C:\inetpub\apps\qtech-status`, overwriting previous versions. (Keep `logs/` and your environment settings intact).

#### Step 2: Stop the Service Temporarily (Prevents File Locks)
On Windows, the running Node.js service can lock `dist/server.cjs` from being overwritten during the build step. Stop the service before rebuilding:
```powershell
Stop-Service QTechStatusService
# Or using NSSM:
# C:\Tools\nssm\nssm.exe stop QTechStatusService
```
*(Note: IIS remains running, so client connections won't drop — they will receive a momentary retry state for just a few seconds while the service restarts).*

#### Step 3: Install Any New Dependencies (If `package.json` changed)
```powershell
npm install --omit=dev
# Or if package-lock.json is synchronized:
# npm ci
```

#### Step 4: Recompile Client & Server Production Bundles
Run the production build:
```powershell
$env:NODE_ENV="production"
npm run build
```
This triggers:
1. `vite build` — Recompiles all Vue 3 frontend components, pages, styles, and assets into `dist/` with cache-busting asset hashes.
2. `esbuild` — Bundles `server.ts` and Express proxy routes into `dist/server.cjs`.

#### Step 5: Restart the Windows Service
Restart the background service with the new build:
```powershell
Start-Service QTechStatusService
# Or using NSSM:
# C:\Tools\nssm\nssm.exe start QTechStatusService
```

#### Step 6: Verify Deployment & Cache Refresh
1. **Check Service Health**:
   ```powershell
   Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/health"
   # Output should be: @{status=ok}
   ```
2. **Hard Refresh in Browser**:
   Open the website in your browser and press **`Ctrl + F5`** (or **`Cmd + Shift + R`** on macOS) to ensure your browser fetches the new static bundle rather than a locally cached version.

---

### Automated One-Click Update Script (`update.ps1`)

To make future updates instantaneous, you can use the included `update.ps1` script (or create one in `C:\inetpub\apps\qtech-status\update.ps1`):

```powershell
# ==============================================================================
# QTech Status - Automated Publish & Update Script
# Location: C:\inetpub\apps\qtech-status\update.ps1
# ==============================================================================
$ErrorActionPreference = "Stop"
$AppDir = "C:\inetpub\apps\qtech-status"
$ServiceName = "QTechStatusService"

Write-Host ">>> [1/5] Navigating to $AppDir..." -ForegroundColor Cyan
Set-Location $AppDir

# Uncomment if using Git for deployments:
# Write-Host ">>> Pulling latest source code from Git..." -ForegroundColor Cyan
# git pull

Write-Host ">>> [2/5] Stopping $ServiceName to prevent Windows file locking..." -ForegroundColor Cyan
Stop-Service -Name $ServiceName -ErrorAction SilentlyContinue

Write-Host ">>> [3/5] Installing dependencies..." -ForegroundColor Cyan
npm install --no-audit

Write-Host ">>> [4/5] Recompiling client & server bundles (npm run build)..." -ForegroundColor Cyan
$env:NODE_ENV = "production"
npm run build

Write-Host ">>> [5/5] Starting $ServiceName..." -ForegroundColor Cyan
Start-Service -Name $ServiceName

Start-Sleep -Seconds 2
$health = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/health"
if ($health.status -eq "ok") {
    Write-Host "`n✔ Successfully deployed and published new version!" -ForegroundColor Green
    Write-Host "Remember to press Ctrl + F5 in your browser to bust client cache.`n" -ForegroundColor Yellow
} else {
    Write-Host "`n⚠ Warning: Service started but health check response was unexpected." -ForegroundColor Red
}
```

To run the one-click update at any time in **PowerShell as Administrator**:
```powershell
cd C:\inetpub\apps\qtech-status
.\update.ps1
```

---

## 9. Operational Maintenance & Troubleshooting Guide

### Useful Service Management Commands
```powershell
# Restart the Node Application
C:\Tools\nssm\nssm.exe restart QTechStatusService

# Stop the Service
C:\Tools\nssm\nssm.exe stop QTechStatusService

# View Live Application Logs
Get-Content -Path "C:\inetpub\apps\qtech-status\logs\service-stdout.log" -Tail 50 -Wait
Get-Content -Path "C:\inetpub\apps\qtech-status\logs\service-stderr.log" -Tail 50 -Wait

# Restart IIS
iisreset
```

### Common Issues & Solutions

| Symptom | Probable Cause | Resolution |
|---|---|---|
| **`DNS problem: NXDOMAIN looking up A for <domain>` in win-acme** | The domain is internal/intranet-only, or no public DNS `A` record exists for it on the public Internet | Let's Encrypt requires a public internet domain. **For internal/private servers**, use **Option 2 (PowerShell Self-Signed Certificate)** or **Option 3 (Enterprise AD CS)** instead. |
| **`No websites with host bindings have been configured in IIS` in win-acme** | The IIS site binding has an empty Host name (`*:80:`) | Run `Set-WebBinding -Name "Default Web Site" -BindingInformation "*:80:" -PropertyName "HostHeader" -Value "your-domain.com"` in PowerShell, then re-run `wacs.exe`. |
| **HTTP 502.3 / 502.4 Bad Gateway** | Node.js backend is stopped or ARR Proxy is disabled | 1. Check `Get-Service QTechStatusService`.<br>2. Test `Invoke-RestMethod http://127.0.0.1:3000/api/health`.<br>3. Verify **Enable proxy** is checked in IIS Application Request Routing. |
| **HTTP 500.19 Internal Server Error** | URL Rewrite module not installed | Install the **Microsoft URL Rewrite 2.1** module and restart IIS via `iisreset`. |
| **API Requests Return 404** | Rewrite rule in `web.config` is misconfigured | Ensure `web.config` contains `<match url="(.*)" />` with action `http://127.0.0.1:3000/{R:1}`. |
| **Data Not Persisting** | Permissions issue on `data/` folder | Ensure IIS and the user running `QTechStatusService` have Read/Write permissions to `C:\inetpub\apps\qtech-status\data`. |

---

## 10. Final Verification Checklist

- [ ] **Internal Node Service Check**: `Invoke-RestMethod http://127.0.0.1:3000/api/health` returns `{"status":"ok","storage":"file-system"}`.
- [ ] **Public HTTP Check**: Accessing `http://<YOUR-SERVER-IP-OR-DOMAIN>/` loads the QTech Status Dashboard.
- [ ] **Public HTTPS Check**: Accessing `https://<YOUR-SERVER-DOMAIN>/` loads with a valid SSL certificate.
- [ ] **Data Persistence Check**: Adding or editing a project or weekly update writes an individual `.json` file to `data/projects/<id>/`.
- [ ] **Server Reboot Resilience**: Performing a test reboot of Windows Server automatically starts both `QTechStatusService` and `W3SVC` (IIS).
