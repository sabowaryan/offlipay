const fs = require('fs');
const path = require('path');

// Configuration des icônes pour différents plateformes
const iconConfig = {
  ios: {
    source: './assets/images/AppIcons/Assets.xcassets/AppIcon.appiconset/',
    destination: './ios/OffliPay/Images.xcassets/AppIcon.appiconset/'
  },
  android: {
    source: './assets/images/AppIcons/android/',
    destination: './android/app/src/main/res/'
  }
};

// Fonction pour copier les icônes
function copyIcons(platform) {
  const config = iconConfig[platform];
  
  if (!fs.existsSync(config.source)) {
    console.error(`Source directory not found: ${config.source}`);
    return;
  }

  // Créer le dossier de destination s'il n'existe pas
  if (!fs.existsSync(config.destination)) {
    fs.mkdirSync(config.destination, { recursive: true });
  }

  // Copier les icônes
  if (platform === 'ios') {
    // Copier tout le dossier AppIcon.appiconset
    copyDirectory(config.source, config.destination);
  } else if (platform === 'android') {
    // Copier les dossiers mipmap
    const mipmapDirs = ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'];
    mipmapDirs.forEach(dir => {
      const sourceDir = path.join(config.source, dir);
      const destDir = path.join(config.destination, dir);
      if (fs.existsSync(sourceDir)) {
        copyDirectory(sourceDir, destDir);
      }
    });
  }

  console.log(`✅ Icons copied for ${platform}`);
}

// Fonction utilitaire pour copier un dossier
function copyDirectory(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const files = fs.readdirSync(source);
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

// Exécuter le script
const platform = process.argv[2];
if (platform && ['ios', 'android'].includes(platform)) {
  copyIcons(platform);
} else {
  console.log('Usage: node setup-icons.js [ios|android]');
  console.log('Or run both: node setup-icons.js ios && node setup-icons.js android');
} 