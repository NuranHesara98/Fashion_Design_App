# PowerShell script to create Azure deployment package

# Create a directory for the package
$packageDir = "azure-portal-deploy"

# Create a zip file from the directory
Write-Host "Creating deployment package..."
Compress-Archive -Path "$packageDir\*" -DestinationPath "azure-portal-package.zip" -Force

Write-Host "Deployment package created: azure-portal-package.zip"
Write-Host "You can now upload this package directly to the Azure Portal."
