# PowerShell script to prepare Azure deployment package

# Create deployment directory
$deployDir = "azure-deploy"
if (Test-Path $deployDir) {
    Remove-Item -Path $deployDir -Recurse -Force
}
New-Item -Path $deployDir -ItemType Directory

# Copy files to deployment directory
Copy-Item -Path "azure-app.js" -Destination "$deployDir\"
Copy-Item -Path "azure-package.json" -Destination "$deployDir\package.json"
Copy-Item -Path "azure-web.config" -Destination "$deployDir\web.config"

# Create zip file
Compress-Archive -Path "$deployDir\*" -DestinationPath "azure-deploy.zip" -Force

Write-Host "Deployment package created: azure-deploy.zip"
Write-Host "Instructions:"
Write-Host "1. Go to Azure Portal: https://portal.azure.com"
Write-Host "2. Navigate to your App Service: dressme-backend-h5dtc6gcgjbzfkax"
Write-Host "3. Click on 'Deployment Center'"
Write-Host "4. Select 'Manual deployment' and 'ZIP Deploy'"
Write-Host "5. Upload the azure-deploy.zip file"
Write-Host "6. After deployment, go to Configuration and set startup command to: node azure-app.js"
