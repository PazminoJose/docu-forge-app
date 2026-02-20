$targetTriple = (rustc -vV | Select-String "host").ToString().Split()[1]
$sourceDir = "src-backend/dist/python_backend"
$destDir = "src-tauri/binaries"
$sidecarName = "python_backend-$targetTriple.exe"

# 2. Limpiar binarios antiguos para evitar conflictos
if (Test-Path $destDir) { Remove-Item -Recurse -Force "$destDir\*" }
else { New-Item -ItemType Directory -Path $destDir }

# 3. Copiar TODO el contenido (librerías, DLLs, carpetas internas)
Copy-Item -Path "$sourceDir\*" -Destination $destDir -Recurse

# 4. Renombrar SOLO el ejecutable principal al formato que Tauri exige
Rename-Item -Path "$destDir\python_backend.exe" -NewName $sidecarName

Write-Host "✅ Sidecar estructurado correctamente en $destDir" -ForegroundColor Green