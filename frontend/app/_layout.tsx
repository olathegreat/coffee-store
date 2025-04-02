import { useFonts } from 'expo-font';
// import "@/styles\\global.css";
// import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';


// import { CreateTripContext } from '@/context/CreateTripContext';
import { View } from 'react-native';
import { Colors } from '@/constants/Colors';
import {Provider} from 'react-redux'
import { store } from '@/utils/store';
import "../styles/global.css"



SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  const [loaded] = useFonts({
    'outfit': require('../assets/fonts/Outfit-Regular.ttf'),
    'outfit-bold': require('../assets/fonts/Outfit-Bold.ttf'),
    'outfit-medium': require('../assets/fonts/Outfit-Medium.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  

  return (
    <Provider store={store}>
    {/* <GluestackUIProvider mode="dark"> */}
        <View style={{ flex: 1, backgroundColor: '#0c0f14'}} className='font-outfit'>

        
       
          <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name='(tabs)' />
            
          </Stack>
          <StatusBar style="auto" />
     
        </View>
      {/* </GluestackUIProvider> */}
      </Provider>
  );
}