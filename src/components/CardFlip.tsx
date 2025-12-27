import React, { useEffect, useRef, useState } from 'react';

import { Animated, Platform, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import { CardImage } from './CardImage';

interface Props {
  deckId: string;
  cardId: string | null;
  isReversed?: boolean;
  onFlip?: () => void;
  style?: ViewStyle;
  width?: number;
  height?: number;
}

export const CardFlip: React.FC<Props> = ({
  deckId,
  cardId,
  isReversed = false,
  onFlip,
  style,
  width = 200,
  height = 340,
}) => {
  // Flip: 0 (Back) to 180 (Front)
  const flipAnim = useRef(new Animated.Value(0)).current;
  // Scale: Subtle pop effect when flipping
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [isFlipped, setIsFlipped] = useState(!!cardId);

  useEffect(() => {
    const shouldBeFlipped = !!cardId;

    // Trigger the sequence: Scale Up -> Rotate -> Scale Down
    Animated.parallel([
      Animated.spring(flipAnim, {
        toValue: shouldBeFlipped ? 180 : 0,
        friction: 7,
        tension: 15,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setIsFlipped(shouldBeFlipped);
    });
  }, [cardId]);

  // Front Interpolation
  const frontAnimatedStyle = {
    transform: [
      { perspective: 1000 },
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 180],
          outputRange: ['180deg', '360deg'],
        }),
      },
      { rotateZ: isReversed ? '180deg' : '0deg' },
      { scale: scaleAnim },
    ],
    opacity: flipAnim.interpolate({
      inputRange: [89, 90],
      outputRange: [0, 1],
    }),
  };

  // Back Interpolation
  const backAnimatedStyle = {
    transform: [
      { perspective: 1000 },
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 180],
          outputRange: ['0deg', '180deg'],
        }),
      },
      { scale: scaleAnim },
    ],
    opacity: flipAnim.interpolate({
      inputRange: [89, 90],
      outputRange: [1, 0],
    }),
  };

  // Dynamic Shadow based on Flip Angle
  const shadowOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [0.3, 0.6, 0.3], // Higher shadow in mid-air
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onFlip}
      disabled={!!cardId}
      style={[style, { width, height }]}
    >
      <Animated.View style={[styles.container, { shadowOpacity: shadowOpacity }]}>
        {/* BACK FACE */}
        <Animated.View
          style={[styles.cardFace, backAnimatedStyle, { zIndex: isFlipped ? 1 : 2 }]}
          pointerEvents={isFlipped ? 'none' : 'auto'}
        >
          <CardImage deckId={deckId} style={styles.image} />
          {/* Subtle "Light Glint" during flip */}
          <Animated.View
            style={[
              styles.glint,
              {
                opacity: flipAnim.interpolate({
                  inputRange: [0, 90, 180],
                  outputRange: [0, 0.2, 0],
                }),
              },
            ]}
          />
        </Animated.View>

        {/* FRONT FACE */}
        <Animated.View
          style={[styles.cardFace, frontAnimatedStyle, { zIndex: isFlipped ? 2 : 1 }]}
          pointerEvents={isFlipped ? 'auto' : 'none'}
        >
          <CardImage deckId={deckId} cardId={cardId || undefined} style={styles.image} />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Base shadow config
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 15,
    elevation: 10,
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    // Required for Android z-index quirks
    ...Platform.select({
      android: {
        backgroundColor: 'transparent',
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  glint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF',
    borderRadius: 14,
  },
});
