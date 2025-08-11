const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Icon sizes required for iOS
const icons = [
  {name: 'icon-20@2x.png', size: 40},
  {name: 'icon-20@3x.png', size: 60},
  {name: 'icon-29@2x.png', size: 58},
  {name: 'icon-29@3x.png', size: 87},
  {name: 'icon-40@2x.png', size: 80},
  {name: 'icon-40@3x.png', size: 120},
  {name: 'icon-60@2x.png', size: 120},
  {name: 'icon-60@3x.png', size: 180},
  {name: 'icon-1024.png', size: 1024},
];

const inputSvg = path.join(__dirname, 'src/assets/ios_icon.svg');
const outputDir = path.join(
  __dirname,
  'ios/Grace/Images.xcassets/AppIcon.appiconset',
);

// Create SVG with black background and green heart
const svgContent = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#000000" />
  <path fill="#AEEA00" d="M512 824C500.6 824 489.4 820.2 479.8 812.8C374.6 733.8 305.6 674.2 255.4 617.6C201 555.8 180 498.6 180 435.4C180 376.2 201.4 325.6 239.4 289.6C277.4 253.6 328.2 232.8 384.6 232.8C428.2 232.8 468.2 247 503 274.8C508.6 279 514 283.4 519.2 288.4C524.4 283.4 529.8 279 535.4 274.8C570.2 247 610.2 232.8 653.8 232.8C710.2 232.8 761 253.6 799 289.6C837 325.6 858.4 376.2 858.4 435.4C858.4 498.6 837.4 555.8 783 617.4C732.8 674.2 664.2 733.6 559.4 812.4C549.8 820 538.6 824 527.2 824H512Z" />
</svg>
`;

const tempSvgPath = path.join(__dirname, 'temp-icon.svg');
fs.writeFileSync(tempSvgPath, svgContent);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, {recursive: true});
}

// Generate all required icon sizes
async function generateIcons() {
  try {
    const svgBuffer = fs.readFileSync(tempSvgPath);

    for (const icon of icons) {
      const outputPath = path.join(outputDir, icon.name);
      await sharp(svgBuffer)
        .resize(icon.size, icon.size)
        .png()
        .toFile(outputPath);

      console.log(`Generated ${icon.name} (${icon.size}x${icon.size})`);
    }

    console.log('All iOS icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  } finally {
    // Clean up temporary SVG file
    if (fs.existsSync(tempSvgPath)) {
      fs.unlinkSync(tempSvgPath);
    }
  }
}

generateIcons();
