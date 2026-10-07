Add-Type -AssemblyName System.Drawing
$sizes = @(192, 512)
foreach ($s in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap $s, $s
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    # Background squircle-like dark gradient
    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 11, 15, 25))
    $g.FillRectangle($bgBrush, 0, 0, $s, $s)

    # Outer circle
    $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 14, 165, 233)), ($s / 16)
    $g.DrawEllipse($pen, [float]($s * 0.12), [float]($s * 0.12), [float]($s * 0.76), [float]($s * 0.76))

    # Inner glow accent
    $innerBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(60, 99, 102, 241))
    $g.FillEllipse($innerBrush, [float]($s * 0.22), [float]($s * 0.22), [float]($s * 0.56), [float]($s * 0.56))

    # Checkmark
    $checkPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 56, 189, 248)), ($s / 12)
    $checkPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $checkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($checkPen, [float]($s * 0.32), [float]($s * 0.52), [float]($s * 0.46), [float]($s * 0.66))
    $g.DrawLine($checkPen, [float]($s * 0.46), [float]($s * 0.66), [float]($s * 0.72), [float]($s * 0.36))

    $outPath = Join-Path $PSScriptRoot "public\icon-$s.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}
Write-Host "Icons generated successfully!"
