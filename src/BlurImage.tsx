import * as _ from 'lodash';
import * as React from 'react';
import {
  Image as RNImage,
  Animated,
  StyleSheet,
  View,
  Platform,
  ImageStyle,
  ImageURISource,
  ImageSourcePropType,
  StyleProp,
} from 'react-native';
import { BlurView } from 'expo-blur';
import CacheManager, { DownloadOptions } from './CacheManager';
import Svg, { Circle } from 'react-native-svg';

interface LoadingIndicatorStyle {
  backgroundStrokeColor: string;
  strokeColor: string;
  strokeWidth: number;
  size: number;
}

interface ImageProps {
  style?: ImageStyle;
  defaultSource?: ImageURISource | number;
  preview?: ImageSourcePropType;
  options?: DownloadOptions;
  uri: string | undefined;
  enableLoadingIndicator: boolean;
  loadingIndicatorStyle?: LoadingIndicatorStyle;
  transitionDuration?: number;
  tint?: 'dark' | 'light' | string;
  onError: (error: { nativeEvent: { error: unknown } }) => void;
  intensity?: Animated.Value;
  loadingIndicatorCX: number;
  loadingIndicatorCY: number;
}

interface ImageState {
  uri: string | undefined;
  loadProgress: number;
}

interface downloadProgress {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
}

export default class BlurImage extends React.Component<ImageProps, ImageState> {
  mounted = true;

  static defaultProps = {
    transitionDuration: 300,
    tint: 'dark',
    onError: () => {},
  };

  state = {
    uri: undefined,
    intensity: new Animated.Value(100),
    loadProgress: 0,
  };

  componentDidMount() {
    this.load(this.props);
  }

  componentDidUpdate(prevProps: ImageProps, prevState: ImageState) {
    const { preview, transitionDuration, uri: newURI } = this.props;
    const { uri, intensity } = this.state;
    if (newURI !== prevProps.uri) {
      this.load(this.props);
    } else if (uri && preview && prevState.uri === undefined) {
      //Consider to use reanimated instead
      Animated.timing(intensity, {
        duration: transitionDuration,
        toValue: 0,
        useNativeDriver: Platform.OS === 'android',
      }).start();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async load({ uri, options = {}, onError }: ImageProps): Promise<void> {
    const callback = (downloadProgress: downloadProgress) => {
      const progress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite;
      this.setState({ loadProgress: progress });
    };
    if (uri) {
      try {
        const path = await CacheManager.get(uri, options).getPath(callback);
        if (this.mounted) {
          if (path) {
            this.setState({ uri: path });
          } else {
            onError({
              nativeEvent: { error: new Error('Could not load image') },
            });
          }
        }
      } catch (error: unknown) {
        onError({ nativeEvent: { error } });
      }
    }
  }

  render() {
    const {
      preview,
      style,
      defaultSource,
      tint,
      enableLoadingIndicator,
      loadingIndicatorStyle,
      loadingIndicatorCX,
      loadingIndicatorCY,
      ...otherProps
    } = this.props;
    const { uri, intensity } = this.state;
    const isImageReady = !!uri;
    const opacity = intensity.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 0.5],
    });
    const flattenedStyle = StyleSheet.flatten(style);
    const computedStyle: StyleProp<ImageStyle> = [
      StyleSheet.absoluteFill,
      _.transform(
        _.pickBy(
          flattenedStyle,
          (_val, key) => propsToCopy.indexOf(key) !== -1
        ),
        (result, value: any, key) =>
          Object.assign(result, {
            [key]: value - (flattenedStyle.borderWidth || 0),
          })
      ),
    ];
    const backgroundStrokeColor = 'rgba(255, 255, 255, 0.5)';
    const strokeColor = 'black';
    const CIRCLE_LENGTH = loadingIndicatorStyle?.size
      ? loadingIndicatorStyle.size
      : 300;
    const R = CIRCLE_LENGTH / (2 * Math.PI);
    return (
      <View {...{ style }}>
        {!!defaultSource && !isImageReady && (
          <RNImage
            source={defaultSource}
            style={computedStyle}
            {...otherProps}
          />
        )}

        {!!preview && (
          <RNImage
            source={preview}
            style={computedStyle}
            blurRadius={Platform.OS === 'android' ? 0.5 : 0}
            {...otherProps}
          />
        )}
        {isImageReady && (
          <RNImage source={{ uri }} style={computedStyle} {...otherProps} />
        )}
        {!!preview && Platform.OS === 'ios' && (
          <AnimatedBlurView
            style={computedStyle}
            {...{
              backgroundColor: tint === 'dark' ? black : white,
              opacity,
              intensity,
            }}
          >
            {!isImageReady && enableLoadingIndicator && (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Svg>
                  <Circle
                    cx={loadingIndicatorCX / 2}
                    cy={loadingIndicatorCY / 2}
                    r={R}
                    stroke={
                      loadingIndicatorStyle?.backgroundStrokeColor
                        ? loadingIndicatorStyle.backgroundStrokeColor
                        : backgroundStrokeColor
                    }
                    strokeWidth={
                      loadingIndicatorStyle?.strokeWidth
                        ? loadingIndicatorStyle.strokeWidth
                        : 3
                    }
                  />
                  <Circle
                    cx={loadingIndicatorCX / 2}
                    cy={loadingIndicatorCY / 2}
                    r={R}
                    stroke={
                      loadingIndicatorStyle?.strokeColor
                        ? loadingIndicatorStyle.strokeColor
                        : strokeColor
                    }
                    strokeWidth={
                      loadingIndicatorStyle?.strokeWidth
                        ? loadingIndicatorStyle.strokeWidth
                        : 3
                    }
                    strokeDasharray={CIRCLE_LENGTH}
                    strokeDashoffset={
                      CIRCLE_LENGTH * (1 - this.state.loadProgress)
                    }
                  />
                </Svg>
              </View>
            )}
          </AnimatedBlurView>
        )}
        {!!preview && Platform.OS === 'android' && (
          <Animated.View
            style={[
              computedStyle,
              { backgroundColor: tint === 'dark' ? black : white, opacity },
            ]}
          >
            {!isImageReady && enableLoadingIndicator && (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Svg>
                  <Circle
                    cx={loadingIndicatorCX / 2}
                    cy={loadingIndicatorCY / 2}
                    r={R}
                    stroke={
                      loadingIndicatorStyle?.backgroundStrokeColor
                        ? loadingIndicatorStyle.backgroundStrokeColor
                        : backgroundStrokeColor
                    }
                    strokeWidth={
                      loadingIndicatorStyle?.strokeWidth
                        ? loadingIndicatorStyle.strokeWidth
                        : 3
                    }
                  />
                  <Circle
                    cx={loadingIndicatorCX / 2}
                    cy={loadingIndicatorCY / 2}
                    r={R}
                    stroke={
                      loadingIndicatorStyle?.strokeColor
                        ? loadingIndicatorStyle.strokeColor
                        : strokeColor
                    }
                    strokeWidth={
                      loadingIndicatorStyle?.strokeWidth
                        ? loadingIndicatorStyle.strokeWidth
                        : 3
                    }
                    strokeDasharray={CIRCLE_LENGTH}
                    strokeDashoffset={
                      CIRCLE_LENGTH * (1 - this.state.loadProgress)
                    }
                  />
                </Svg>
              </View>
            )}
          </Animated.View>
        )}
      </View>
    );
  }
}

const black = 'black';
const white = 'white';
const propsToCopy = [
  'borderRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
];
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
