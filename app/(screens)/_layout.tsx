import React from "react";
import { Stack } from "expo-router";

const ScreenLayout = () => {
	return (
		<Stack>
			<Stack.Screen
				name="allah-names"
				options={{
					title: "99 Names of Allah",
					headerStyle: { backgroundColor: "#111827" },
					headerTintColor: "#fff",
				}}
			/>
		</Stack>
	);
};

export default ScreenLayout;
