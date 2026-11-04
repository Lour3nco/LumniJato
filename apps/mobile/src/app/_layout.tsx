import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function LayoutRaiz() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(abas)" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
