import { Stack } from "expo-router";

export default function GamesLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="dice" />
			<Stack.Screen name="hamburger" />
			<Stack.Screen name="hamburger-builder" />
			<Stack.Screen name="hamburger-checkout" />
			<Stack.Screen name="hamburger-success" />
		</Stack>
	);
}
