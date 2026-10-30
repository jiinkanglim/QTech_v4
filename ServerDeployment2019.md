# Windows Server 2019 Standard Deployment Guide

This document provides a tailored, step-by-step production deployment guide for running the **QTech Status** application on **Windows Server 2019 Standard** (IIS 10.0 Version 1809).

---

## 1. Architecture Overview

```text
[ Client Browser ] 
       │ (Port 80 HTTP / Port 443 HTTPS - TLS 1.2)
       ▼
[ IIS 10.0 (v1809) + URL Rewrite 2.1 + ARR 3.0 Reverse Proxy ]
       │ (Port 3000 HTTP Reverse Proxy)
       ▼
[ Node.js Windows Service (dist/server.cjs) via NSSM ]
  ├── /api/*          -> Express API routes (Gemini AI Proxy, Health checks)
  └── Static Assets   -> Serves compiled Vue 3 SPA with HTML5 History fallback
```

The production deployment consists of:
1. **Frontend**: Compiled Vue 3 static client assets located in `dist/`.
2. **Backend**: Self-contained Node.js Express server bundled into `dist/server.cjs` via `esbuild`.
3. **Process Manager**: **NSSM** (Non-Sucking Service Manager) hosting Node.js as a persistent Windows Background Service on port `3000` (`127.0.0.1`).
4. **Web Server / Reverse Proxy**: **IIS 10.0** handling public traffic on ports `80` & `443`, managing SSL certificates, and rewriting requests to the internal Node service.

---

## 2. Windows Server 2019 Specific Prerequisites

Windows Server 2019 requires a few prerequisite checks before installing modern web tooling:

### Step A: Ensure TLS 1.2 is Enabled in PowerShell
Windows Server 2019 PowerShell 5.1 sessions may default to older TLS protocols when downloading files from the internet. Run this at the start of your PowerShell session:
```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13
```

### Step B: Install Visual C++ Redistributable (x64)
Node.js LTS and IIS extensions require the Visual C++ runtime.
1. Download **Visual C++ 2015–2022 Redistributable (x64)**: [Microsoft Visual C++ x64](https://aka.ms/vs/17/release/vc_redist.x64.exe)
2. Run `vc_redist.x64.exe` as Administrator to complete installation.

### Step C: Install Node.js LTS (v20.x or v22.x)
1. Download the **Node.js LTS MSI installer** from [nodejs.org](https://nodejs.org).
2. Run the installer and ensure **"Add to PATH"** is selected.
3. Open **PowerShell (Administrator)** and verify:
   ```powershell
   node -v
   npm -v
   ```

---

## 3. IIS Web Server & Reverse Proxy Setup

### Step A: Install IIS 10.0 Web Server Role
1. Open **Server Manager** $\rightarrow$ Click **Manage** $\rightarrow$ **Add Roles and Features**.
2. Select **Role-based or feature-based installation** $\rightarrow$ Select local server.
3. Under **Server Roles**, check **Web Server (IIS)**.
4. Under **Role Services**, verify the following are selected:
   - **Common HTTP Features**: Default Document, Directory Browsing, HTTP Errors, Static Content, HTTP Redirection.
   - **Application Development**: WebSocket Protocol, .NET Extensibility 4.7, CGI, ISAPI Extensions, ISAPI Filters.
   - **Management Tools**: IIS Management Console.
5. Click **Next** $\rightarrow$ **Install**.

---

### Step B: Install IIS Modules (URL Rewrite & ARR)
IIS 10.0 on Windows Server 2019 requires these two official Microsoft extensions installed in this exact sequence:

1. **Microsoft URL Rewrite Module 2.1 (x64)**:
   - Download: [Microsoft URL Rewrite 2.1 x64](https://www.iis.net/downloads/microsoft/url-rewrite)
   - Run the MSI installer to completion.

2. **Microsoft Application Request Routing (ARR) 3.0 (x64)**:
   - Download: [Microsoft ARR 3.0 x64](https://www.iis.net/downloads/microsoft/application-request-routing)
   - Run the MSI installer to completion.

---

### Step C: Enable ARR Reverse Proxy Mode
1. Open **IIS Manager** (`inetmgr`).
2. Select the root **Server Node** in the left Connections pane.
3. In the center pane, double-click **Application Request Routing Cache**.
4. In the right-hand Actions panel, click **Server Proxy Settings...**
5. Check **Enable proxy**.
6. Set **HTTP Version** to `Pass through`.
7. **Uncheck** `Reverse rewrite host in response headers`.
8. Click **Apply** in the top-right Actions panel.

---

## 4. Application Deployment & Production Build

### Step A: Create Application Folders
Run in PowerShell (Admin):
```powershell
New-Item -ItemType Directory -Force -Path "C:\inetpub\apps\qtech-status"
New-Item -ItemType Directory -Force -Path "C:\inetpub\apps\qtech-status\logs"
```

### Step B: Copy Project Source Files
Transfer the application repository files to `C:\inetpub\apps\qtech-status`.

### Step C: Install Dependencies and Build
In PowerShell (Admin):
```powershell
cd C:\inetpub\apps\qtech-status

# 1. Install npm packages
npm ci
# Note: If npm ci reports a lockfile discrepancy, run 'npm install' instead.

# 2. Build the Vue 3 client and the bundled Express server
$env:NODE_ENV="production"
npm run build
```

Verify that the build generated:
- `C:\inetpub\apps\qtech-status\dist\index.html` (Client entry)
- `C:\inetpub\apps\qtech-status\dist\server.cjs` (Server CommonJS bundle)

---

## 5. Configure Windows Background Service via NSSM

**NSSM** (Non-Sucking Service Manager) is recommended on Windows Server 2019 to run Node.js as an auto-recovering background service.

### Step A: Download & Place NSSM
1. Download NSSM from [nssm.cc/download](https://nssm.cc/download).
2. Extract and copy `win64\nssm.exe` to `C:\Tools\nssm\nssm.exe`.

### Step B: Register and Configure the Service
Run the following script in **PowerShell as Administrator**:

```powershell
$NodePath = (Get-Command node).Source
$AppDir   = "C:\inetpub\apps\qtech-status"
$EntryJS  = "C:\inetpub\apps\qtech-status\dist\server.cjs"
$NssmExe  = "C:\Tools\nssm\nssm.exe"

# 1. Install the Windows Service
& $NssmExe install QTechStatusService "$NodePath" "$EntryJS"

# 2. Set App Directory
& $NssmExe set QTechStatusService AppDirectory "$AppDir"

# 3. Configure Environment Variables (formatted with newline breaks)
$EnvVars = @(
    "NODE_ENV=production",
    "PORT=3000"
)
& $NssmExe set QTechStatusService AppEnvironmentExtra ($EnvVars -join "`n")

# 4. Configure Standard Output and Error Logs with 10MB Rotation
& $NssmExe set QTechStatusService AppStdout "$AppDir\logs\service-stdout.log"
& $NssmExe set QTechStatusService AppStderr "$AppDir\logs\service-stderr.log"
& $NssmExe set QTechStatusService AppRotateFiles 1
& $NssmExe set QTechStatusService AppRotateBytes 10485760

# 5. Set Automatic Start on Boot & Launch Service
& $NssmExe set QTechStatusService Start SERVICE_AUTO_START
& $NssmExe start QTechStatusService
```

### Step C: Verify Node Service
```powershell
Get-Service QTechStatusService
Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/health"
# Expected response: @{status=ok}
```

---

## 6. Configure IIS Web Site & `web.config` Proxy

### Step A: Configure Default Web Site & Domain Host Binding
1. In **IIS Manager** (`inetmgr`), verify **Default Web Site** points to `C:\inetpub\wwwroot`.
2. **CRITICAL - Configure Host Name Binding for SSL**:
   By default, IIS binds port 80 to `*:80` with an **empty** host name. Let's Encrypt tools (`win-acme`) require your domain name configured in the host binding to automatically detect your site.
   
   **Via PowerShell (Admin)**:
   ```powershell
   # Replace qtech.yourdomain.com with your actual public FQDN:
   Set-WebBinding -Name "Default Web Site" -BindingInformation "*:80:" -PropertyName "HostHeader" -Value "qtech.yourdomain.com"
   ```
   
   **Or via IIS Manager GUI**:
   - In IIS Manager, select **Default Web Site**.
   - In the right-hand **Actions** pane, click **Bindings...**.
   - Select the `http` binding on port `80` $\rightarrow$ click **Edit...**.
   - In the **Host name** field, type your domain (e.g. `qtech.yourdomain.com`).
   - Click **OK**, then click **Close**.

### Step B: Create `C:\inetpub\wwwroot\web.config`
Create or update `C:\inetpub\wwwroot\web.config` with the following configuration.

> **Important**: This configuration is clean and avoids `<serverVariables>` or schema-dependent tags which cause **HTTP 500.50** errors in IIS when unwhitelisted.

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
        <requestLimits maxAllowedContentLength="52428800" /> <!-- 50MB max body size -->
      </requestFiltering>
    </security>

    <!-- Pass-through error responses so custom Express and API errors reach the client -->
    <httpErrors existingResponse="PassThrough" />
  </system.webServer>
</configuration>
```

---

## 7. Windows Defender Firewall Configuration

Allow inbound HTTP (Port 80) and HTTPS (Port 443) traffic in PowerShell (Admin):

```powershell
New-NetFirewallRule -DisplayName "IIS Web Server (HTTP Port 80)" `
                    -Direction Inbound `
                    -LocalPort 80 `
                    -Protocol TCP `
                    -Action Allow `
                    -Profile Any

New-NetFirewallRule -DisplayName "IIS Web Server (HTTPS Port 443)" `
                    -Direction Inbound `
                    -LocalPort 443 `
                    -Protocol TCP `
                    -Action Allow `
                    -Profile Any
```

---

## 8. SSL / TLS Certificate Setup (HTTPS on Windows Server 2019)

> **Important Note on Domain Types**:
> - **Public Internet Domain** (e.g. `status.yourcompany.com` registered on public DNS with port 80 open to the world): Use **Method A (Let's Encrypt / win-acme)**.
> - **Internal / Intranet / Private Network** (e.g. internal hostnames like `qtech.sdcvwdq01.com`, `.local`, `.corp`, or access via VPN/LAN only): Let's Encrypt **will fail with `NXDOMAIN`** because Let's Encrypt servers on the public Internet cannot resolve internal DNS. Use **Method B (Self-Signed Certificate)** or **Method C (Corporate Active Directory CA)** instead!

---

### Method A: Automated Free SSL via Let's Encrypt (`win-acme`)
*(For servers with a public registered domain and public DNS `A` records)*

1. Download the latest `win-acme` release from [win-acme.com](https://www.win-acme.com), extract to `C:\Tools\win-acme\`, and run `wacs.exe` as Administrator.
2. Ensure you have pre-configured the domain binding in IIS:
   ```powershell
   Set-WebBinding -Name "Default Web Site" -BindingInformation "*:80:" -PropertyName "HostHeader" -Value "your-public-domain.com"
   ```
3. Run `wacs.exe`, select `N`: **Create certificate (default settings)**, pick your site, and enter your notification email.

> **Common Let's Encrypt Errors**:
> - *"No websites with host bindings have been configured in IIS"*: Run the `Set-WebBinding` command above first, or choose `M` (Manual input) in `wacs.exe`.
> - *"DNS problem: NXDOMAIN looking up A for..."*: This means the domain does not exist on public Internet DNS. If this is an internal/intranet server, switch to **Method B** below immediately.

---

### Method B: Self-Signed Certificate for Internal / Intranet Servers (Recommended for Internal Networks)

If your server uses an internal domain (e.g. `qtech.sdcvwdq01.com`, `sdcvwdq01`), private IP, or intranet without public DNS records, create a 5-year Self-Signed certificate in IIS directly using PowerShell:

Run in **PowerShell (Administrator)**:

```powershell
# 1. Generate a 5-year Self-Signed Certificate for your internal domain & hostname
$DnsNames = @("qtech.sdcvwdq01.com", "sdcvwdq01", "localhost", "127.0.0.1")
$Cert = New-SelfSignedCertificate -DnsName $DnsNames `
                                  -CertStoreLocation "cert:\LocalMachine\My" `
                                  -NotAfter (Get-Date).AddYears(5) `
                                  -FriendlyName "QTech Status Internal SSL"

# 2. Add HTTPS Binding on Port 443 to the Default Web Site (if not already present)
$ExistingBinding = Get-WebBinding -Name "Default Web Site" -Protocol "https"
if (-not $ExistingBinding) {
    New-WebBinding -Name "Default Web Site" -IPAddress "*" -Port 443 -Protocol "https"
}

# 3. Attach the Certificate to the Port 443 HTTPS Binding
$Binding = Get-WebBinding -Name "Default Web Site" -Protocol "https"
$Binding.AddSslCertificate($Cert.GetCertHashString(), "My")

# 4. Restart IIS to apply
iisreset
```

Once executed:
- Your server is now accessible via **`https://qtech.sdcvwdq01.com/`** or **`https://sdcvwdq01/`**!
- If client browsers show a *"Your connection is not private"* warning (expected with self-signed certificates), click **Advanced** $\rightarrow$ **Proceed**, or export the public certificate and deploy it via Active Directory Group Policy to trusted enterprise root authorities.

---

### Method C: Enterprise Active Directory Certificate Services (AD CS) or Custom `.pfx`
1. Request a web server certificate from your internal corporate CA.
2. In **IIS Manager** $\rightarrow$ Select the root Server node $\rightarrow$ Open **Server Certificates**.
3. Click **Import...** in the right-hand panel $\rightarrow$ Select your `.pfx` file and enter your password.
4. Select **Default Web Site** $\rightarrow$ Click **Bindings...** in the Actions pane.
5. Select or Add `https` port `443` $\rightarrow$ Select the imported certificate $\rightarrow$ Click **OK**.

---

## 9. Updating & Publishing a New Version (Deploying Code Changes)

Whenever you make changes to frontend source files (Vue components in `src/`, theme/styling, page templates) or backend logic (`server.ts`), follow these steps to compile and publish the update to production on Windows Server 2019.

### Step-by-Step Publishing Workflow

#### Step 1: Transfer or Pull Updated Source Code
Navigate to your application root in PowerShell (Admin):
```powershell
cd C:\inetpub\apps\qtech-status
```
- **If using Git**:
  ```powershell
  git pull origin main
  ```
- **If transferring files manually (ZIP / Remote Copy)**:
  Copy the updated files over the existing directory `C:\inetpub\apps\qtech-status`.

#### Step 2: Stop the Background Service Temporarily
Windows locks active binary files (such as `dist/server.cjs`) when Node.js is actively executing them. Stop the service first before rebuilding:
```powershell
Stop-Service -Name QTechStatusService
# Or with NSSM:
# C:\Tools\nssm\nssm.exe stop QTechStatusService
```
*(Note: IIS remains running and returns a brief pending state without dropping any ARR proxy rules).*

#### Step 3: Install Any New Dependencies (If `package.json` changed)
```powershell
npm install --omit=dev
```

#### Step 4: Recompile Production Bundles
Run the production build:
```powershell
$env:NODE_ENV="production"
npm run build
```
This runs:
- `vite build`: Recompiles all Vue 3 templates, scripts, and CSS into `dist/` with auto-hashed asset file names (preventing browser caching bugs).
- `esbuild`: Bundles `server.ts` into a single CommonJS `dist/server.cjs`.

#### Step 5: Start the Service
```powershell
Start-Service -Name QTechStatusService
# Or with NSSM:
# C:\Tools\nssm\nssm.exe start QTechStatusService
```

#### Step 6: Verify and Refresh
1. Verify the service is running and healthy:
   ```powershell
   Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/health"
   # Expected response: @{status=ok}
   ```
2. In client browsers, press **`Ctrl + F5`** (or **`Cmd + Shift + R`**) to perform a hard reload and load the newly compiled assets.

---

### Automated One-Click Update Script (`update.ps1`)

You can run `update.ps1` from the root of `C:\inetpub\apps\qtech-status\update.ps1`:

```powershell
# ==============================================================================
# QTech Status - Automated Publish & Update Script (Windows Server 2019)
# Location: C:\inetpub\apps\qtech-status\update.ps1
# ==============================================================================
$ErrorActionPreference = "Stop"
$AppDir = "C:\inetpub\apps\qtech-status"
$ServiceName = "QTechStatusService"

Write-Host ">>> [1/5] Navigating to $AppDir..." -ForegroundColor Cyan
Set-Location $AppDir

# Uncomment if using Git:
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

To run this update at any time:
```powershell
cd C:\inetpub\apps\qtech-status
.\update.ps1
```

---

## 10. Troubleshooting & Maintenance for Windows Server 2019

### Common Service Management Commands
```powershell
# Restart the Node Application
C:\Tools\nssm\nssm.exe restart QTechStatusService

# Stop / Start Service
C:\Tools\nssm\nssm.exe stop QTechStatusService
C:\Tools\nssm\nssm.exe start QTechStatusService

# Tail Live Logs in PowerShell
Get-Content -Path "C:\inetpub\apps\qtech-status\logs\service-stdout.log" -Tail 30 -Wait
Get-Content -Path "C:\inetpub\apps\qtech-status\logs\service-stderr.log" -Tail 30 -Wait

# Restart IIS Web Server
iisreset
```

### Windows Server 2019 Troubleshooting Matrix

| Issue | Root Cause | Solution |
|---|---|---|
| **`DNS problem: NXDOMAIN looking up A for <domain>` in win-acme** | The domain is internal/intranet-only, or no public DNS `A` record exists for it on the public Internet | Let's Encrypt requires a public internet domain. **For internal/private servers**, use **Method B (PowerShell Self-Signed Certificate)** or **Method C (Enterprise AD CS)** instead. |
| **`No websites with host bindings have been configured in IIS` in win-acme** | The IIS site binding has an empty Host name (`*:80:`) | Run `Set-WebBinding -Name "Default Web Site" -BindingInformation "*:80:" -PropertyName "HostHeader" -Value "your-domain.com"` in PowerShell, then re-run `wacs.exe`. Alternatively, choose `Manual input` in win-acme. |
| **win-acme HTTP-01 challenge fails (404 Not Found)** | URL Rewrite is proxying `/.well-known/acme-challenge/` to Node.js | Verify `web.config` contains the `AcmeChallenge` rule with `<action type="None" />` or condition negating `^/\.well-known/acme-challenge`. |
| **HTTP 502.3 / 502.4 Bad Gateway** | Node service is stopped or ARR proxy is disabled | 1. Run `Get-Service QTechStatusService` and ensure status is `Running`.<br>2. Run `Invoke-RestMethod http://127.0.0.1:3000/api/health`.<br>3. Open IIS Manager $\rightarrow$ Application Request Routing Cache $\rightarrow$ Server Proxy Settings $\rightarrow$ Check **Enable proxy**. |
| **HTTP 500.19 Internal Server Error** | Missing URL Rewrite module | Download and install **Microsoft URL Rewrite 2.1 (x64)**, then run `iisreset`. |
| **PowerShell Download / Invoke-WebRequest Fails** | TLS 1.2 not active in PowerShell session | Run `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12` before executing download commands. |
| **Node.js fails to launch (`VCRUNTIME140.dll missing`)** | Visual C++ Redistributable missing | Install the **Visual C++ 2015–2022 Redistributable (x64)** and restart the server. |
| **Data Not Persisting** | Permissions issue on `data/` folder | Ensure IIS and the user running `QTechStatusService` have Read/Write permissions to `C:\inetpub\apps\qtech-status\data`. |

---

## 11. Deployment Verification Checklist

- [ ] **Visual C++ 2015-2022 x64 Runtime Installed**: Confirmed via installed programs.
- [ ] **Host Binding Configured in IIS**: Site binding has the domain name populated.
- [ ] **Node.js Service Health**: `Invoke-RestMethod http://127.0.0.1:3000/api/health` returns `{"status":"ok","storage":"file-system"}`.
- [ ] **IIS Reverse Proxy Response**: Browsing `http://<SERVER-IP-OR-DOMAIN>/` loads the QTech Status Dashboard.
- [ ] **SSL / HTTPS Active**: Browsing `https://<SERVER-DOMAIN>/` validates with TLS 1.2.
- [ ] **Data Persistence Check**: Adding or editing a project or weekly update writes an individual `.json` file to `data/projects/<id>/`.
- [ ] **System Reboot Test**: Restarting Windows Server 2019 automatically starts both `QTechStatusService` and IIS.
