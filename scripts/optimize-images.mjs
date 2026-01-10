import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SLIDER_DIR = './public/images/slider';
const PRODUCTS_DIR = './public/images/products';

// Slider images - create mobile versions (640px width)
async function optimizeSliderImages() {
  console.log('Optimizing slider images...');

  const sliderFiles = fs.readdirSync(SLIDER_DIR).filter(f => f.endsWith('.webp') && !f.includes('-mobile'));

  for (const file of sliderFiles) {
    const inputPath = path.join(SLIDER_DIR, file);
    const outputName = file.replace('.webp', '-mobile.webp');
    const outputPath = path.join(SLIDER_DIR, outputName);

    // Skip if mobile version already exists
    if (fs.existsSync(outputPath)) {
      console.log(`  Skipping ${file} (mobile version exists)`);
      continue;
    }

    await sharp(inputPath)
      .resize(640, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const originalSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(outputPath).size;
    console.log(`  ${file}: ${(originalSize/1024).toFixed(1)}KB -> ${(newSize/1024).toFixed(1)}KB (mobile)`);
  }
}

// Product images - convert PNG to WebP
async function optimizeProductImages() {
  console.log('\nOptimizing product images...');

  const productFiles = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.png'));

  for (const file of productFiles) {
    const inputPath = path.join(PRODUCTS_DIR, file);
    const outputName = file.replace('.png', '.webp');
    const outputPath = path.join(PRODUCTS_DIR, outputName);

    // Skip if webp version already exists
    if (fs.existsSync(outputPath)) {
      console.log(`  Skipping ${file} (webp version exists)`);
      continue;
    }

    await sharp(inputPath)
      .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    const originalSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(outputPath).size;
    console.log(`  ${file}: ${(originalSize/1024).toFixed(1)}KB -> ${(newSize/1024).toFixed(1)}KB`);
  }
}

// Main
async function main() {
  try {
    await optimizeSliderImages();
    await optimizeProductImages();
    console.log('\nDone!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
