# deploy_backend.ps1
# Automates backend deployment to EC2

$Server = "65.0.195.149"
$User = "ec2-user"
$Key = "C:\Users\ajayp\Downloads\host\dev_ec2"
$LocalPath = "c:\myrush-Main-folder\unified-backend\*" 
$RemotePath = "/home/ec2-user/myrush-backend/"

Write-Host "🚀 Starting Backend Deployment..."
Write-Host "Target: $User@$Server"

# 1. Check if Key exists
if (-not (Test-Path $Key)) {
    Write-Error "❌ Key file not found at $Key. Please check the path."
    exit 1
}

# 2. Upload Code
Write-Host "`n📦 Uploading code..."
# Create remote directory
ssh -i $Key -o StrictHostKeyChecking=no $User@$Server "mkdir -p $RemotePath"

# standard scp
scp -i $Key -r $LocalPath "$User@$Server`:$RemotePath"

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ SCP Upload Failed"
    exit 1
}
Write-Host "✅ Code uploaded."

# 3. Restart Server
Write-Host "`n🔄 Restarting Backend Service..."

# CMD string constructed with single quotes to avoid PowerShell parsing of special chars
$RestartCmd = 'cd {0}; python3 -m venv venv; source venv/bin/activate; pip install -r requirements.txt; pkill -f uvicorn; nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &' -f $RemotePath

Write-Host "Executing remote command..."
ssh -i $Key -o StrictHostKeyChecking=no $User@$Server $RestartCmd

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Remote Restart Failed (Exit Code: $LASTEXITCODE)"
    exit 1
}

Write-Host "`n✅ Backend Deployed and Restarted Successfully!"
Write-Host "Check health: http://$Server/api/user/health"
