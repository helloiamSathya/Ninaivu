import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LOGO_PATHS, LOGO_VIEWBOX } from './logo/logoPaths';
import { COLORS, FONT } from './theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const DASH = 1200; // longer than any glyph outline, so the stroke starts fully hidden
const DRAW_MS = 1100;
const STAGGER_MS = 110;
const FILL_MS = 450;
const HOLD_MS = 500;

/** Opening animation: each letter is drawn as a thin line, then fills in, then the app starts. */
export default function Splash({ onDone }: { onDone: () => void }) {
  const draw = useRef(LOGO_PATHS.map(() => new Animated.Value(0))).current;
  const fill = useRef(new Animated.Value(0)).current;
  const tagline = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.stagger(
        STAGGER_MS,
        draw.map((v) => Animated.timing(v, { toValue: 1, duration: DRAW_MS, easing: Easing.out(Easing.cubic), useNativeDriver: false })),
      ),
      Animated.parallel([
        Animated.timing(fill, { toValue: 1, duration: FILL_MS, useNativeDriver: false }),
        Animated.timing(tagline, { toValue: 1, duration: FILL_MS, useNativeDriver: false }),
      ]),
      Animated.delay(HOLD_MS),
    ]).start(({ finished }) => finished && onDone());
  }, [draw, fill, tagline, onDone]);

  const fillColor = fill.interpolate({ inputRange: [0, 1], outputRange: ['rgba(242,243,217,0)', COLORS.onDeep] });

  return (
    <View style={styles.wrap}>
      <Svg width={300} height={300 * (LOGO_VIEWBOX.height / LOGO_VIEWBOX.width)} viewBox={`0 0 ${LOGO_VIEWBOX.width} ${LOGO_VIEWBOX.height}`}>
        {LOGO_PATHS.map((p, i) => (
          <AnimatedPath
            key={i}
            d={p.d}
            stroke={COLORS.onDeep}
            strokeWidth={1.2}
            strokeLinejoin="round"
            fill={fillColor as unknown as string}
            strokeDasharray={`${DASH} ${DASH}`}
            strokeDashoffset={draw[i].interpolate({ inputRange: [0, 1], outputRange: [DASH, 0] }) as unknown as number}
          />
        ))}
      </Svg>
      <Animated.View style={{ opacity: tagline }}>
        <Text style={styles.tagline}>Every photo has a day.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.deep, alignItems: 'center', justifyContent: 'center', gap: 20 },
  tagline: { fontFamily: FONT, fontSize: 16, color: COLORS.onDeepMuted },
});
