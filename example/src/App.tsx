import * as React from 'react';

import { StyleSheet, View, Dimensions } from 'react-native';
import Image from '../../src/Image';

export default function App() {
  const { width, height } = Dimensions.get('window');
  return (
    <View style={styles.container}>
      <Image
        loadingIndicatorStyle={{
          backgroundStrokeColor: 'rgba(255, 255, 255, 0.5)',
          strokeColor: '#FFFFFF',
          strokeWidth: 3,
          size: 300,
        }}
        style={{ width: width * 0.7, height: height * 0.5 }}
        uri={
          'https://media.istockphoto.com/photos/autumn-morning-at-the-cathedral-picture-id621235832?k=20&m=621235832&s=612x612&w=0&h=M072MpUXno496zSC7RmDv1Qy_JnFZ3pdFVw7zayYOEw='
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
