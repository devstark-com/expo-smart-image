import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import BlurImage from './BlurImage';
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import React from 'react';
import {
  Dimensions,
  ImageSourcePropType,
  ImageURISource,
  Animated as RNAnimated,
  View,
} from 'react-native';
import type { DownloadOptions } from './CacheManager';

interface LoadingIndicatorStyle {
  backgroundStrokeColor: string;
  strokeColor: string;
  strokeWidth: number;
  size: number;
}

interface ImageProps {
  style?: AdditionalImageStyle;
  loadingIndicatorStyle?: LoadingIndicatorStyle;
  defaultSource?: ImageURISource | number;
  preview?: ImageSourcePropType;
  options?: DownloadOptions;
  uri: string;
  transitionDuration?: number;
  tint?: 'dark' | 'light';
  intensity?: RNAnimated.Value;
  enableZoom?: boolean;
  enableLoadingIndicator?: boolean;
  onError?: (error: { nativeEvent: { error: Error } }) => void;
}
interface AdditionalImageStyle {
  width?: number;
  height?: number;
}
const Image = ({
  uri,
  preview,
  enableZoom,
  enableLoadingIndicator,
  loadingIndicatorStyle,
  style,
  transitionDuration,
  intensity,
  tint,
}: ImageProps) => {
  const { width, height } = Dimensions.get('window');
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  if (enableZoom === undefined) {
    enableZoom = true;
  }
  if (enableLoadingIndicator === undefined) {
    enableLoadingIndicator = true;
  }
  const loadingIndicatorCX = style?.width ? style?.width : undefined;
  const loadingIndicatorCY = style?.height ? style?.height : undefined;
  const AnimatedImage = Animated.createAnimatedComponent(BlurImage);
  const pinchHandler =
    useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
      onActive: (event) => {
        'worklet';
        scale.value = event.scale;
        focalX.value = event.focalX;
        focalY.value = event.focalY;
      },
      onEnd: () => {
        'worklet';
        scale.value = withTiming(1);
      },
    });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: focalX.value },
        { translateY: focalY.value },
        { translateX: -width / 2 },
        { translateY: -height / 2 },
        { scale: scale.value },
        { translateX: -focalX.value },
        { translateY: -focalY.value },
        { translateX: width / 2 },
        { translateY: height / 2 },
      ],
    };
  });

  const focalPointStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: focalX.value }, { translateY: focalY.value }],
    };
  });

  if (!enableZoom) {
    return (
      <View {...{ style }}>
        <BlurImage
          style={{
            width: style?.width ? style?.width : undefined,
            height: style?.height ? style?.height : undefined,
          }}
          uri={uri}
          preview={preview}
          enableLoadingIndicator={enableLoadingIndicator}
          loadingIndicatorStyle={loadingIndicatorStyle}
          loadingIndicatorCX={loadingIndicatorCX}
          loadingIndicatorCY={loadingIndicatorCY}
          transitionDuration={transitionDuration}
          intensity={intensity}
          tint={tint}
        />
      </View>
    );
  } else {
    return (
      <GestureHandlerRootView {...{ style }}>
        <PinchGestureHandler onGestureEvent={pinchHandler}>
          <Animated.View style={{ flex: 1 }}>
            <AnimatedImage
              style={[
                {
                  width: style?.width ? style?.width : undefined,
                  height: style?.height ? style?.height : undefined,
                },
                rStyle,
              ]}
              uri={uri}
              preview={preview}
              enableLoadingIndicator={enableLoadingIndicator}
              loadingIndicatorStyle={loadingIndicatorStyle}
              loadingIndicatorCX={loadingIndicatorCX}
              loadingIndicatorCY={loadingIndicatorCY}
              transitionDuration={transitionDuration}
              intensity={intensity}
              tint={tint}
              onError={() => {}}
            />
            <Animated.View style={[focalPointStyle]} />
          </Animated.View>
        </PinchGestureHandler>
      </GestureHandlerRootView>
    );
  }
};
export default Image;
