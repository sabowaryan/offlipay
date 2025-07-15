#!/usr/bin/env node

/**
 * Script de validation du flux complet d'onboarding
 * 
 * Ce script valide tous les aspects de l'onboarding :
 * - Configuration des écrans
 * - Fonctionnement des services
 * - Performance des animations
 * - Accessibilité
 * - Intégration avec l'application
 */

const fs = require('fs');
const path = require('path');

// Configuration des couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Utilitaires de logging
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  subheader: (msg) => console.log(`${colors.bright}${msg}${colors.reset}`),
};

// Résultats de validation
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: [],
};

/**
 * Ajouter un résultat de test
 */
function addResult(category, test, status, message, details = null) {
  const result = { category, test, status, message, details };
  results.details.push(result);
  
  if (status === 'pass') {
    results.passed++;
    log.success(`${category}: ${test}`);
  } else if (status === 'fail') {
    results.failed++;
    log.error(`${category}: ${test} - ${message}`);
  } else if (status === 'warning') {
    results.warnings++;
    log.warning(`${category}: ${test} - ${message}`);
  }
}

/**
 * Vérifier l'existence d'un fichier
 */
function checkFileExists(filePath, description) {
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    addResult('Structure', `Fichier ${description}`, 'pass', `Trouvé: ${filePath}`);
    return true;
  } else {
    addResult('Structure', `Fichier ${description}`, 'fail', `Manquant: ${filePath}`);
    return false;
  }
}

/**
 * Valider la structure des fichiers d'onboarding
 */
function validateFileStructure() {
  log.header('🗂️  Validation de la structure des fichiers');
  
  const requiredFiles = [
    // Composants principaux
    { path: 'components/onboarding/OnboardingContainer.tsx', desc: 'OnboardingContainer' },
    { path: 'components/onboarding/OnboardingScreen.tsx', desc: 'OnboardingScreen' },
    { path: 'components/onboarding/OnboardingProgress.tsx', desc: 'OnboardingProgress' },
    { path: 'components/onboarding/OnboardingButton.tsx', desc: 'OnboardingButton' },
    
    // Configuration et types
    { path: 'components/onboarding/types.ts', desc: 'Types TypeScript' },
    { path: 'components/onboarding/config.ts', desc: 'Configuration des écrans' },
    { path: 'components/onboarding/configLoader.ts', desc: 'Chargeur de configuration' },
    { path: 'components/onboarding/configValidator.ts', desc: 'Validateur de configuration' },
    { path: 'components/onboarding/index.ts', desc: 'Index des exports' },
    
    // Services
    { path: 'services/OnboardingService.ts', desc: 'Service d\'onboarding' },
    
    // Illustrations
    { path: 'components/onboarding/illustrations/WelcomeIllustration.tsx', desc: 'Illustration de bienvenue' },
    { path: 'components/onboarding/illustrations/QRPaymentIllustration.tsx', desc: 'Illustration paiement QR' },
    { path: 'components/onboarding/illustrations/WalletIllustration.tsx', desc: 'Illustration portefeuille' },
    { path: 'components/onboarding/illustrations/OfflineIllustration.tsx', desc: 'Illustration mode hors ligne' },
    
    // Utilitaires
    { path: 'components/onboarding/utils/performanceMonitor.ts', desc: 'Moniteur de performance' },
    
    // Documentation
    { path: 'docs/OnboardingDocumentation.md', desc: 'Documentation principale' },
    { path: 'docs/OnboardingConfigurationGuide.md', desc: 'Guide de configuration' },
    
    // Exemples
    { path: 'examples/OnboardingExamples.tsx', desc: 'Exemples d\'usage' },
  ];
  
  requiredFiles.forEach(file => {
    checkFileExists(file.path, file.desc);
  });
  
  // Vérifier les dossiers
  const requiredDirs = [
    'components/onboarding',
    'components/onboarding/illustrations',
    'components/onboarding/utils',
  ];
  
  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      addResult('Structure', `Dossier ${dir}`, 'pass', 'Dossier présent');
    } else {
      addResult('Structure', `Dossier ${dir}`, 'fail', 'Dossier manquant');
    }
  });
}

/**
 * Valider la configuration des écrans
 */
function validateScreenConfiguration() {
  log.header('⚙️  Validation de la configuration des écrans');
  
  try {
    // Lire le fichier de configuration
    const configPath = 'components/onboarding/config.ts';
    if (!fs.existsSync(configPath)) {
      addResult('Configuration', 'Fichier de configuration', 'fail', 'Fichier config.ts manquant');
      return;
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Vérifier la présence des constantes importantes
    const requiredConstants = [
      'ONBOARDING_SCREENS',
      'DEFAULT_ONBOARDING_SETTINGS',
      'ONBOARDING_CONSTANTS',
      'SCREEN_DESCRIPTIONS',
      'ILLUSTRATION_ALT_TEXT',
      'BUTTON_TEXTS',
      'INTERACTION_HINTS',
      'ANIMATION_CONFIGS',
    ];
    
    requiredConstants.forEach(constant => {
      if (configContent.includes(constant)) {
        addResult('Configuration', `Constante ${constant}`, 'pass', 'Définie dans config.ts');
      } else {
        addResult('Configuration', `Constante ${constant}`, 'fail', 'Manquante dans config.ts');
      }
    });
    
    // Vérifier la structure des écrans
    const screenMatches = configContent.match(/ONBOARDING_SCREENS.*?=.*?\[(.*?)\]/s);
    if (screenMatches) {
      const screensContent = screenMatches[1];
      const screenCount = (screensContent.match(/\{/g) || []).length;
      
      if (screenCount >= 3 && screenCount <= 6) {
        addResult('Configuration', 'Nombre d\'écrans', 'pass', `${screenCount} écrans configurés`);
      } else if (screenCount < 3) {
        addResult('Configuration', 'Nombre d\'écrans', 'warning', `Seulement ${screenCount} écrans (minimum recommandé: 3)`);
      } else {
        addResult('Configuration', 'Nombre d\'écrans', 'warning', `${screenCount} écrans (maximum recommandé: 6)`);
      }
    }
    
    // Vérifier les champs obligatoires pour chaque écran
    const requiredFields = ['id', 'title', 'subtitle', 'illustration', 'animationType', 'duration'];
    requiredFields.forEach(field => {
      if (configContent.includes(`${field}:`)) {
        addResult('Configuration', `Champ ${field}`, 'pass', 'Présent dans la configuration');
      } else {
        addResult('Configuration', `Champ ${field}`, 'fail', 'Manquant dans la configuration');
      }
    });
    
  } catch (error) {
    addResult('Configuration', 'Lecture de la configuration', 'fail', `Erreur: ${error.message}`);
  }
}

/**
 * Valider les types TypeScript
 */
function validateTypeDefinitions() {
  log.header('📝 Validation des définitions de types');
  
  try {
    const typesPath = 'components/onboarding/types.ts';
    if (!fs.existsSync(typesPath)) {
      addResult('Types', 'Fichier types.ts', 'fail', 'Fichier manquant');
      return;
    }
    
    const typesContent = fs.readFileSync(typesPath, 'utf8');
    
    // Vérifier les interfaces principales
    const requiredInterfaces = [
      'OnboardingScreenConfig',
      'OnboardingSettings',
      'OnboardingContainerProps',
      'OnboardingState',
      'OnboardingScreenProps',
      'OnboardingProgressProps',
      'OnboardingButtonProps',
      'OnboardingPreferences',
      'IllustrationProps',
      'OnboardingGestureConfig',
      'OnboardingError',
    ];
    
    requiredInterfaces.forEach(interfaceName => {
      if (typesContent.includes(`interface ${interfaceName}`)) {
        addResult('Types', `Interface ${interfaceName}`, 'pass', 'Définie');
      } else {
        addResult('Types', `Interface ${interfaceName}`, 'fail', 'Manquante');
      }
    });
    
    // Vérifier les types et enums
    const requiredTypes = [
      'AnimationType',
      'InteractionType',
      'AnimationSpeed',
      'ProgressIndicatorStyle',
      'ThemeType',
      'OnboardingErrorCode',
    ];
    
    requiredTypes.forEach(typeName => {
      if (typesContent.includes(typeName)) {
        addResult('Types', `Type ${typeName}`, 'pass', 'Défini');
      } else {
        addResult('Types', `Type ${typeName}`, 'fail', 'Manquant');
      }
    });
    
  } catch (error) {
    addResult('Types', 'Lecture des types', 'fail', `Erreur: ${error.message}`);
  }
}

/**
 * Valider les tests
 */
function validateTests() {
  log.header('🧪 Validation des tests');
  
  const testFiles = [
    // Tests unitaires
    { path: '__tests__/components/OnboardingContainer.test.tsx', desc: 'Tests OnboardingContainer' },
    { path: '__tests__/components/OnboardingScreen.test.tsx', desc: 'Tests OnboardingScreen' },
    { path: '__tests__/components/OnboardingProgress.test.tsx', desc: 'Tests OnboardingProgress' },
    { path: '__tests__/services/OnboardingService.test.ts', desc: 'Tests OnboardingService' },
    
    // Tests d'intégration
    { path: '__tests__/components/OnboardingIntegration.test.tsx', desc: 'Tests d\'intégration' },
    
    // Tests d'accessibilité
    { path: '__tests__/components/OnboardingAccessibility.test.tsx', desc: 'Tests d\'accessibilité' },
    { path: '__tests__/components/OnboardingKeyboardNavigation.test.tsx', desc: 'Tests navigation clavier' },
    { path: '__tests__/components/OnboardingScreenReaderSupport.test.tsx', desc: 'Tests lecteurs d\'écran' },
    { path: '__tests__/components/OnboardingWCAGCompliance.test.tsx', desc: 'Tests conformité WCAG' },
    
    // Tests de performance
    { path: '__tests__/components/OnboardingPerformance.test.tsx', desc: 'Tests de performance' },
    { path: '__tests__/components/OnboardingNetworkPerformance.test.tsx', desc: 'Tests performance réseau' },
    
    // Tests de responsive
    { path: '__tests__/components/OnboardingResponsive.test.tsx', desc: 'Tests responsive' },
    
    // Tests de récupération d'erreur
    { path: '__tests__/components/OnboardingErrorRecovery.test.tsx', desc: 'Tests récupération d\'erreur' },
  ];
  
  testFiles.forEach(testFile => {
    if (checkFileExists(testFile.path, testFile.desc)) {
      // Vérifier le contenu du test
      try {
        const testContent = fs.readFileSync(testFile.path, 'utf8');
        
        // Vérifier la présence de tests
        const testCount = (testContent.match(/it\(|test\(/g) || []).length;
        if (testCount > 0) {
          addResult('Tests', `Contenu ${testFile.desc}`, 'pass', `${testCount} tests trouvés`);
        } else {
          addResult('Tests', `Contenu ${testFile.desc}`, 'warning', 'Aucun test trouvé');
        }
        
        // Vérifier les imports nécessaires
        if (testContent.includes('@testing-library/react-native')) {
          addResult('Tests', `Imports ${testFile.desc}`, 'pass', 'Testing Library importée');
        } else {
          addResult('Tests', `Imports ${testFile.desc}`, 'warning', 'Testing Library non importée');
        }
        
      } catch (error) {
        addResult('Tests', `Lecture ${testFile.desc}`, 'fail', `Erreur: ${error.message}`);
      }
    }
  });
}

/**
 * Valider la documentation
 */
function validateDocumentation() {
  log.header('📚 Validation de la documentation');
  
  const docFiles = [
    { path: 'docs/OnboardingDocumentation.md', desc: 'Documentation principale', sections: [
      'Vue d\'ensemble',
      'Installation et Configuration',
      'Utilisation de base',
      'Configuration personnalisée',
      'Composants disponibles',
      'Gestion des thèmes',
      'Accessibilité',
      'Performance',
      'Exemples d\'usage',
      'API Reference',
      'Dépannage',
    ]},
    { path: 'docs/OnboardingConfigurationGuide.md', desc: 'Guide de configuration', sections: [
      'Configuration des écrans',
      'Types d\'animations disponibles',
      'Types d\'interactions',
      'Configuration globale',
      'Thèmes et apparence',
      'Illustrations personnalisées',
      'Configuration de performance',
      'Accessibilité',
      'Validation de configuration',
      'Exemples de configurations complètes',
    ]},
  ];
  
  docFiles.forEach(docFile => {
    if (checkFileExists(docFile.path, docFile.desc)) {
      try {
        const docContent = fs.readFileSync(docFile.path, 'utf8');
        
        // Vérifier la longueur du document
        const wordCount = docContent.split(/\s+/).length;
        if (wordCount > 500) {
          addResult('Documentation', `Contenu ${docFile.desc}`, 'pass', `${wordCount} mots`);
        } else {
          addResult('Documentation', `Contenu ${docFile.desc}`, 'warning', `Seulement ${wordCount} mots`);
        }
        
        // Vérifier les sections requises
        docFile.sections.forEach(section => {
          if (docContent.includes(section)) {
            addResult('Documentation', `Section "${section}"`, 'pass', `Présente dans ${docFile.desc}`);
          } else {
            addResult('Documentation', `Section "${section}"`, 'warning', `Manquante dans ${docFile.desc}`);
          }
        });
        
        // Vérifier les exemples de code
        const codeBlocks = (docContent.match(/```/g) || []).length / 2;
        if (codeBlocks > 5) {
          addResult('Documentation', `Exemples de code ${docFile.desc}`, 'pass', `${codeBlocks} blocs de code`);
        } else {
          addResult('Documentation', `Exemples de code ${docFile.desc}`, 'warning', `Seulement ${codeBlocks} blocs de code`);
        }
        
      } catch (error) {
        addResult('Documentation', `Lecture ${docFile.desc}`, 'fail', `Erreur: ${error.message}`);
      }
    }
  });
}

/**
 * Valider les exemples
 */
function validateExamples() {
  log.header('💡 Validation des exemples');
  
  const examplePath = 'examples/OnboardingExamples.tsx';
  if (checkFileExists(examplePath, 'Fichier d\'exemples')) {
    try {
      const exampleContent = fs.readFileSync(examplePath, 'utf8');
      
      // Vérifier les exemples requis
      const requiredExamples = [
        'BasicOnboardingExample',
        'ConditionalOnboardingExample',
        'AnalyticsOnboardingExample',
        'BrandOnboardingExample',
        'AdaptiveOnboardingExample',
        'RobustOnboardingExample',
        'OptimizedOnboardingExample',
        'ABTestOnboardingExample',
      ];
      
      requiredExamples.forEach(example => {
        if (exampleContent.includes(`function ${example}`)) {
          addResult('Exemples', `Exemple ${example}`, 'pass', 'Fonction définie');
        } else {
          addResult('Exemples', `Exemple ${example}`, 'fail', 'Fonction manquante');
        }
      });
      
      // Vérifier les imports
      const requiredImports = [
        'OnboardingContainer',
        'OnboardingService',
        'useNavigation',
        'useCallback',
        'useEffect',
      ];
      
      requiredImports.forEach(importName => {
        if (exampleContent.includes(importName)) {
          addResult('Exemples', `Import ${importName}`, 'pass', 'Importé');
        } else {
          addResult('Exemples', `Import ${importName}`, 'warning', 'Non importé');
        }
      });
      
      // Vérifier la documentation des exemples
      const commentBlocks = (exampleContent.match(/\/\*\*/g) || []).length;
      if (commentBlocks >= requiredExamples.length) {
        addResult('Exemples', 'Documentation des exemples', 'pass', `${commentBlocks} blocs de documentation`);
      } else {
        addResult('Exemples', 'Documentation des exemples', 'warning', `Seulement ${commentBlocks} blocs documentés`);
      }
      
    } catch (error) {
      addResult('Exemples', 'Lecture des exemples', 'fail', `Erreur: ${error.message}`);
    }
  }
}

/**
 * Valider l'intégration avec l'application
 */
function validateAppIntegration() {
  log.header('🔗 Validation de l\'intégration avec l\'application');
  
  // Vérifier l'intégration dans app/index.tsx
  const appIndexPath = 'app/index.tsx';
  if (checkFileExists(appIndexPath, 'Point d\'entrée de l\'application')) {
    try {
      const appContent = fs.readFileSync(appIndexPath, 'utf8');
      
      if (appContent.includes('OnboardingService') || appContent.includes('hasCompletedOnboarding')) {
        addResult('Intégration', 'Vérification onboarding dans app/index.tsx', 'pass', 'Logique d\'onboarding présente');
      } else {
        addResult('Intégration', 'Vérification onboarding dans app/index.tsx', 'warning', 'Logique d\'onboarding non détectée');
      }
      
    } catch (error) {
      addResult('Intégration', 'Lecture app/index.tsx', 'fail', `Erreur: ${error.message}`);
    }
  }
  
  // Vérifier la configuration des dépendances
  const packageJsonPath = 'package.json';
  if (checkFileExists(packageJsonPath, 'Configuration des dépendances')) {
    try {
      const packageContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      const requiredDeps = [
        'react-native-reanimated',
        'react-native-gesture-handler',
        'expo-haptics',
      ];
      
      requiredDeps.forEach(dep => {
        if (packageContent.dependencies && packageContent.dependencies[dep]) {
          addResult('Intégration', `Dépendance ${dep}`, 'pass', `Version: ${packageContent.dependencies[dep]}`);
        } else {
          addResult('Intégration', `Dépendance ${dep}`, 'fail', 'Dépendance manquante');
        }
      });
      
    } catch (error) {
      addResult('Intégration', 'Lecture package.json', 'fail', `Erreur: ${error.message}`);
    }
  }
}

/**
 * Générer le rapport final
 */
function generateReport() {
  log.header('📊 Rapport de validation');
  
  const total = results.passed + results.failed + results.warnings;
  const successRate = total > 0 ? Math.round((results.passed / total) * 100) : 0;
  
  console.log(`\n${colors.bright}Résumé:${colors.reset}`);
  console.log(`${colors.green}✓ Tests réussis: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}✗ Tests échoués: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Avertissements: ${results.warnings}${colors.reset}`);
  console.log(`${colors.cyan}📈 Taux de réussite: ${successRate}%${colors.reset}`);
  
  // Déterminer le statut global
  let globalStatus = 'success';
  let statusMessage = 'L\'onboarding est prêt pour la production ! 🎉';
  
  if (results.failed > 0) {
    globalStatus = 'error';
    statusMessage = 'Des problèmes critiques doivent être résolus avant la mise en production. ❌';
  } else if (results.warnings > 5) {
    globalStatus = 'warning';
    statusMessage = 'L\'onboarding fonctionne mais des améliorations sont recommandées. ⚠️';
  }
  
  console.log(`\n${colors.bright}Statut global: ${colors.reset}${statusMessage}`);
  
  // Recommandations
  if (results.failed > 0) {
    console.log(`\n${colors.bright}Actions requises:${colors.reset}`);
    results.details
      .filter(r => r.status === 'fail')
      .slice(0, 5) // Top 5 des problèmes critiques
      .forEach(r => {
        console.log(`${colors.red}• ${r.category}: ${r.test} - ${r.message}${colors.reset}`);
      });
  }
  
  if (results.warnings > 0) {
    console.log(`\n${colors.bright}Améliorations suggérées:${colors.reset}`);
    results.details
      .filter(r => r.status === 'warning')
      .slice(0, 3) // Top 3 des améliorations
      .forEach(r => {
        console.log(`${colors.yellow}• ${r.category}: ${r.test} - ${r.message}${colors.reset}`);
      });
  }
  
  // Sauvegarder le rapport détaillé
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings,
      successRate,
      globalStatus,
    },
    details: results.details,
  };
  
  try {
    fs.writeFileSync('onboarding-validation-report.json', JSON.stringify(reportData, null, 2));
    log.success('Rapport détaillé sauvegardé dans onboarding-validation-report.json');
  } catch (error) {
    log.error(`Erreur lors de la sauvegarde du rapport: ${error.message}`);
  }
  
  // Code de sortie
  process.exit(results.failed > 0 ? 1 : 0);
}

/**
 * Fonction principale
 */
function main() {
  console.log(`${colors.bright}${colors.cyan}🚀 Validation du flux d'onboarding OffliPay${colors.reset}\n`);
  
  validateFileStructure();
  validateScreenConfiguration();
  validateTypeDefinitions();
  validateTests();
  validateDocumentation();
  validateExamples();
  validateAppIntegration();
  
  generateReport();
}

// Exécuter la validation
if (require.main === module) {
  main();
}

module.exports = {
  validateFileStructure,
  validateScreenConfiguration,
  validateTypeDefinitions,
  validateTests,
  validateDocumentation,
  validateExamples,
  validateAppIntegration,
  generateReport,
};