import { View, Text, FlatList, Pressable } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import chapters from "../../data/chapters.json";
import { router } from "expo-router";
import { Chapter } from "../../types";

// Extract ChapterItem into a separate memoized component
const ChapterItem = React.memo(({ item }: { item: Chapter }) => (
	<Pressable
		onPress={() =>
			router.push({
				pathname: "/(verses)",
				params: { chapter: item.id, pages: item.pages },
			})
		}
		className="bg-white rounded-xl p-4 mb-3 shadow-sm"
	>
		<View className="flex-row justify-between items-center mb-2">
			<Text className="text-2xl font-semibold text-gray-800 text-right">
				{item.name_arabic}
			</Text>
			<View className="bg-gray-100 px-3 py-1 rounded-full">
				<Text className="text-xs text-gray-600 font-medium">
					{item.verses_count} verses
				</Text>
			</View>
		</View>

		<Text className="text-lg text-gray-700 font-medium mb-1">
			{item.name_complex}
		</Text>
		<Text className="text-sm text-gray-500 mb-2">
			{item.translated_name.name}
		</Text>

		<View className="border-t border-gray-100 mt-2 pt-2">
			<Text className="text-xs text-gray-500 font-medium">
				Revealed in{" "}
				{item.revelation_place.charAt(0).toUpperCase() +
					item.revelation_place.slice(1)}
			</Text>
		</View>
	</Pressable>
));

const ChaptersScreen = () => {
	// Memoize the renderItem function
	const renderItem = React.useCallback(
		({ item }: { item: Chapter }) => <ChapterItem item={item} />,
		[]
	);

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			<FlatList
				data={chapters.chapters}
				renderItem={renderItem}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={{ padding: 16 }}
				removeClippedSubviews={true}
				maxToRenderPerBatch={10}
				windowSize={10}
				initialNumToRender={10}
			/>
		</SafeAreaView>
	);
};

export default ChaptersScreen;
