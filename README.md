# expo-smart-image

React Native Image Cache, Progressive Loading, Zoom, Loading Indicator based on Expo

## Installation
This package has a peer dependency with React, React Native, and Expo.
```sh
npm install expo-smart-image
```

## Usage

```js
import { Image } from "expo-smart-image";
```
### Props
| Props                  | Default |              Options |
|------------------------|:-------:|---------------------:|
| tint                   |  dark   | light, dark, default |
| transitionDuration     |   300   |         custom in ms |
| enableLoadingIndicator |  true   |          true, false |
| enableZoom             |  true   |          true, false |

### Options for loading indicator:
```js
 loadingIndicatorStyle={{
          backgroundStrokeColor: 'rgba(255, 255, 255, 0.5)',
          strokeColor: '#FFFFFF',
          strokeWidth: 3,
          size: 300,
        }}
```
### CacheManager

Get the local image from a remote URI

```js
import {CacheManager} from "react-native-expo-image-cache";

const {uri} = this.props;
const path = await CacheManager.get(uri).getPath();
// if path is undefined, the image download has failed
```

You can also clear the local cache:

```js
import {CacheManager} from "react-native-expo-image-cache";

await CacheManager.clearCache();
```
## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
