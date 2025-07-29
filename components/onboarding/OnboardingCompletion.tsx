import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { CheckCircle, Sparkles, Star } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const OnboardingCompletion = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const sparkleAnims = useRef(
    Array.from({ length: 8 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(0),
      rotate: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Animation principale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation des particules avec délai
    setTimeout(() => {
      sparkleAnims.forEach((anim, index) => {
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: -50 - Math.random() * 100,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: 360,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Répéter l'animation
          anim.opacity.setValue(0);
          anim.translateY.setValue(0);
          anim.rotate.setValue(0);
        });
      });
    }, 500);

    // Animation continue des particules
    const sparkleInterval = setInterval(() => {
      sparkleAnims.forEach((anim) => {
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: -50 - Math.random() * 100,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: 360,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          anim.opacity.setValue(0);
          anim.translateY.setValue(0);
          anim.rotate.setValue(0);
        });
      });
    }, 3000);

    return () => clearInterval(sparkleInterval);
  }, []);

  const getSparklePosition = (index: number) => {
    const angle = (index * 45) * (Math.PI / 180);
    const radius = 120;
    return {
      left: width / 2 + Math.cos(angle) * radius - 12,
      top: height / 2 + Math.sin(angle) * radius - 12,
    };
  };

  return (
    <View style={styles.container}>
      {/* Particules animées */}
      {sparkleAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.sparkle,
            getSparklePosition(index),
            {
              opacity: anim.opacity,
              transform: [
                { translateY: anim.translateY },
                {
                  rotate: anim.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          {index % 3 === 0 ? (
            <Sparkles size={24} color="#FFD700" />
          ) : index % 3 === 1 ? (
            <Star size={20} color="#FF6B6B" fill="#FF6B6B" />
          ) : (
            <Star size={16} color="#4ECDC4" fill="#4ECDC4" />
          )}
        </Animated.View>
      ))}

      {/* Contenu principal */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <CheckCircle size={80} color="#4CAF50" fill="#E8F5E8" />
        </View>

        <Text style={styles.title}>Félicitations !</Text>
        <Text style={styles.subtitle}>
          Votre onboarding est terminé.{'\n'}
          Vous êtes maintenant prêt à utiliser OffliPay !
        </Text>

        <View style={styles.celebrationContainer}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationText}>Bienvenue dans l'aventure !</Text>
          <Text style={styles.celebrationEmoji}>🚀</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 30,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2E7D32',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666666',
    lineHeight: 26,
    marginBottom: 40,
  },
  celebrationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  celebrationEmoji: {
    fontSize: 24,
    marginHorizontal: 8,
  },
  celebrationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginHorizontal: 12,
  },
  sparkle: {
    position: 'absolute',
    zIndex: 1,
  },
});

export default OnboardingCompletion;


