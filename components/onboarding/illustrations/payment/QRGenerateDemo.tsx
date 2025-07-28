import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import Svg, { Rect } from 'react-native-svg';
import { IllustrationProps } from '../../types';

interface QRPixel {
  x: number;
  y: number;
  filled: boolean;
  animationDelay: number;
}

const QRGenerateDemo: React.FC<IllustrationProps> = ({ 
  theme, 
  animated = true, 
  size = 280,
  onAnimationComplete 
}) => {
  const isDark = theme === 'dark';
  const [qrPixels, setQrPixels] = useState<QRPixel[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Animation values
  const glassOpacity = useSharedValue(0);
  const glassScale = useSharedValue(0.8);
  const buttonScale = useSharedValue(1);
  const qrContainerOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const pixelOpacities = useSharedValue<number[]>([]);

  const colors = {
    background: isDark ? '#1a202c' : '#f7fafc',
    glass: isDark ? 'rgba(45, 55, 72, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    glassBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    button: '#00d4aa',
    buttonText: '#ffffff',
    qrCode: isDark ? '#ffffff' : '#000000',
    text: isDark ? '#ffffff' : '#2d3748',
  };

  // Generate QR pattern
  const generateQRPattern = (): QRPixel[] => {
    const pixels: QRPixel[] = [];
    const gridSize = 21; // Standard QR code size
    let animationDelay = 0;
    
    // Generate a realistic QR pattern
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        let filled = false;
        
        // Corner detection squares
        if ((x < 7 && y < 7) || (x >= 14 && y < 7) || (x < 7 && y >= 14)) {
          filled = (x === 0 || x === 6 || y === 0 || y === 6) ||
                   (x >= 2 && x <= 4 && y >= 2 && y <= 4);
        }
        // Timing patterns
        else if (x === 6 || y === 6) {
          filled = true;
        }
        // Data pattern (pseudo-random for demo)
        else {
          filled = Math.random() > 0.5;
        }
        
        if (filled) {
          pixels.push({
            x,
            y,
            filled: true,
            animationDelay: animationDelay * 20, // 20ms between pixels
          });
          animationDelay++;
        }
      }
    }
    
    return pixels;
  };

  const startGeneration = () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    // Generate new QR pattern
    const newPixels = generateQRPattern();
    setQrPixels(newPixels);
    
    // Initialize pixel opacities
    pixelOpacities.value = new Array(newPixels.length).fill(0);
    
    // Show QR container
    qrContainerOpacity.value = withTiming(1, { duration: 300 });
    
    // Animate pixels one by one
    newPixels.forEach((pixel, index) => {
      const delay = pixel.animationDelay;
      
      setTimeout(() => {
        pixelOpacities.value = [...pixelOpacities.value];
        pixelOpacities.value[index] = 1;
      }, delay);
    });
    
    // Complete generation after all pixels are drawn
    const totalDuration = Math.max(...newPixels.map(p => p.animationDelay)) + 500;
    setTimeout(() => {
      setIsGenerating(false);
      onAnimationComplete?.();
    }, totalDuration);
  };

  useEffect(() => {
    if (!animated) {
      glassOpacity.value = 1;
      glassScale.value = 1;
      titleOpacity.value = 1;
      return;
    }

    // Initial animation sequence
    titleOpacity.value = withTiming(1, { duration: 600 });
    
    glassOpacity.value = withDelay(200, withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.quad) 
    }));
    
    glassScale.value = withDelay(200, withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.back(1.2)) 
    }));

    // Auto-start generation after glass appears
    setTimeout(() => {
      startGeneration();
    }, 1200);
    
  }, [animated, onAnimationComplete]);

  // Animated styles
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const glassAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glassOpacity.value,
    transform: [{ scale: glassScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const qrContainerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: qrContainerOpacity.value,
  }));

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: colors.background,
        width: size,
        height: size,
      }
    ]}>
      <Animated.Text style={[styles.title, { color: colors.text }, titleAnimatedStyle]}>
        Génération de QR
      </Animated.Text>

      {/* Glassmorphism interface */}
      <Animated.View style={[styles.glassContainer, glassAnimatedStyle]}>
        <BlurView
          intensity={isDark ? 40 : 60}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blurView}
        >
          <View style={[
            styles.glassContent,
            {
              backgroundColor: colors.glass,
              borderColor: colors.glassBorder,
            }
          ]}>
            
            {/* Generate button */}
            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity
                style={[styles.generateButton, { backgroundColor: colors.button }]}
                onPress={startGeneration}
                disabled={isGenerating}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                  {isGenerating ? 'Génération...' : 'Générer QR'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* QR Code display area */}
            <Animated.View style={[styles.qrContainer, qrContainerAnimatedStyle]}>
              <View style={styles.qrBackground}>
                <Svg width="120" height="120" viewBox="0 0 21 21">
                  {qrPixels.map((pixel, index) => (
                    <Animated.View key={`${pixel.x}-${pixel.y}`}>
                      <Rect
                        x={pixel.x}
                        y={pixel.y}
                        width="1"
                        height="1"
                        fill={colors.qrCode}
                        opacity={pixelOpacities.value[index] || 0}
                      />
                    </Animated.View>
                  ))}
                </Svg>
              </View>
            </Animated.View>

            {/* Status text */}
            <Text style={[styles.statusText, { color: colors.text }]}>
              {isGenerating 
                ? 'Construction pixel par pixel...' 
                : qrPixels.length > 0 
                  ? 'QR Code généré avec succès' 
                  : 'Appuyez pour générer un QR Code'
              }
            </Text>
          </View>
        </BlurView>
      </Animated.View>

      <Text style={[styles.subtitle, { color: colors.text }]}>
        Interface moderne avec effet glassmorphism
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.7,
  },
  glassContainer: {
    width: '90%',
    height: '70%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  blurView: {
    flex: 1,
  },
  glassContent: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderRadius: 20,
  },
  generateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  qrContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrBackground: {
    width: 120,
    height: 120,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
  },
});

export default QRGenerateDemo;

