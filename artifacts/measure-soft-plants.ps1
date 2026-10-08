Add-Type -AssemblyName System.Drawing
foreach ($plantName in @('grass', 'fern', 'shrub')) {
  $plantPath = Join-Path $PSScriptRoot "../src/assets/woodland-plants/soft-pixel-v2/$plantName.png"
  $plantBitmap = [System.Drawing.Bitmap]::new($plantPath)
  $plantRect = [System.Drawing.Rectangle]::new(0, 0, $plantBitmap.Width, $plantBitmap.Height)
  $plantData = $plantBitmap.LockBits($plantRect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $plantBytes = [byte[]]::new($plantData.Stride * $plantBitmap.Height)
    [System.Runtime.InteropServices.Marshal]::Copy($plantData.Scan0, $plantBytes, 0, $plantBytes.Length)
    $plantMinX = $plantBitmap.Width; $plantMaxX = -1
    $plantMinY = $plantBitmap.Height; $plantMaxY = -1
    for ($plantY = 0; $plantY -lt $plantBitmap.Height; $plantY++) {
      for ($plantX = 0; $plantX -lt $plantBitmap.Width; $plantX++) {
        if ($plantBytes[$plantY * $plantData.Stride + $plantX * 4 + 3] -ge 16) {
          $plantMinX = [Math]::Min($plantMinX, $plantX); $plantMaxX = [Math]::Max($plantMaxX, $plantX)
          $plantMinY = [Math]::Min($plantMinY, $plantY); $plantMaxY = [Math]::Max($plantMaxY, $plantY)
        }
      }
    }
    $plantGeometry = [ordered]@{
      canvasWidth = $plantBitmap.Width; canvasHeight = $plantBitmap.Height
      alphaThreshold = 16
      bounds = [ordered]@{ x=$plantMinX; y=$plantMinY; width=($plantMaxX-$plantMinX+1); height=($plantMaxY-$plantMinY+1) }
      groundAnchor = [ordered]@{ x=[int](($plantMinX+$plantMaxX)/2); y=($plantMaxY+1) }
    }
    $plantGeometry | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $PSScriptRoot "../src/assets/woodland-plants/soft-pixel-v2/$plantName.json") -Encoding utf8
    Write-Output "$plantName : $($plantGeometry | ConvertTo-Json -Depth 4 -Compress)"
  } finally {
    $plantBitmap.UnlockBits($plantData)
    $plantBitmap.Dispose()
  }
}
