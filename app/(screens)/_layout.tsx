import React from "react";
import { Stack } from "expo-router";

const ScreenLayout = () => {
	return (
		<Stack>
			<Stack.Screen
				name="allah-names"
				options={{
					animation: "none",
					title: "99 Names of Allah",
					headerStyle: { backgroundColor: "#111827" },
					headerTintColor: "#fff",
				}}
			/>
			<Stack.Screen
				name="prayer-times"
				options={{ title: "Prayer Times" }}
			/>
			<Stack.Screen name="qibla" options={{ title: "Qibla" }} />
		</Stack>
	);
};

export default ScreenLayout;
