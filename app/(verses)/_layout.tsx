import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const VersesLayout = () => {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
		</Stack>
	);
};

export default VersesLayout;
