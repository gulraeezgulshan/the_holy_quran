import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";

export default function App() {
	return (
		<View className="flex-1 bg-white items-center justify-center gap-4">
			<Text>Welcome to Quran App</Text>
			<Pressable
				onPress={() => router.push("/(tabs)/chapters")}
				className="bg-blue-500 p-2 rounded-md"
			>
				<Text>Go to Chapters</Text>
			</Pressable>
			<StatusBar style="auto" />
		</View>
	);
}
