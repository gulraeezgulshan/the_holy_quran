import { View, Text, FlatList, Pressable, TextInput } from "react-native";
import React, { useState, useMemo, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import chapters from "../../data/chapters.json";
import { router } from "expo-router";
import { Chapter } from "../../types";
import { FontAwesome } from "@expo/vector-icons";
import debounce from "lodash/debounce";

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
			<Pressable
				onPress={() =>
					router.push({
						pathname: "/(chapters-info)/chapter-info",
						params: { chapterId: item.id },
					})
				}
				className="bg-gray-100 px-3 py-1 rounded-full"
			>
				<Text className="text-xs text-gray-600 font-medium">
					Chapter Info
				</Text>
			</Pressable>

			<View className="bg-gray-100 px-3 py-1 rounded-full">
				<Text className="text-xs text-gray-600 font-medium">
					{item.verses_count} verses
				</Text>
			</View>
		</View>

		<View className="flex-row justify-between items-center mb-2">
			<View className="flex-1">
				<Text className="text-lg text-gray-700 font-medium">
					{item.name_complex}
				</Text>
				<Text className="text-sm text-gray-500">
					{item.translated_name.name}
				</Text>
			</View>
			<Text className="text-2xl font-semibold text-gray-800 text-right ml-4">
				{item.name_arabic}
			</Text>
		</View>

		<View className="border-t border-gray-100 mt-2 pt-2">
			<Text className="text-xs text-gray-500 font-medium">
				Revealed in{" "}
				{item.revelation_place === "makkah" ? "Makkah" : "Madinah"}
			</Text>
		</View>
	</Pressable>
));

// Move SearchHeader outside of ChaptersScreen and memoize it
const SearchHeader = React.memo(
	({
		searchQuery,
		handleSearch,
		clearSearch,
	}: {
		searchQuery: string;
		handleSearch: (text: string) => void;
		clearSearch: () => void;
	}) => {
		const searchInputRef = React.useRef<TextInput>(null);

		return (
			<View className="mb-6">
				<View className="flex-row items-center bg-white rounded-lg px-4 py-2 border border-gray-200">
					<FontAwesome name="search" size={16} color="#6B7280" />
					<TextInput
						ref={searchInputRef}
						className="flex-1 ml-2 text-base text-gray-900"
						placeholder="Search chapters..."
						value={searchQuery}
						onChangeText={handleSearch}
						placeholderTextColor="#9CA3AF"
						autoCorrect={false}
						returnKeyType="search"
						clearButtonMode="while-editing"
						enablesReturnKeyAutomatically={true}
						keyboardType="default"
						onSubmitEditing={() => {}}
					/>
					{searchQuery ? (
						<Pressable
							onPress={() => {
								clearSearch();
								searchInputRef.current?.focus();
							}}
						>
							<FontAwesome
								name="times-circle"
								size={16}
								color="#6B7280"
							/>
						</Pressable>
					) : null}
				</View>
			</View>
		);
	}
);

const ChaptersScreen = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");

	// Create a debounced search function
	const debouncedSearch = useCallback(
		debounce((text: string) => {
			setDebouncedQuery(text);
		}, 300),
		[]
	);

	// Update filteredChapters to use debouncedQuery instead
	const filteredChapters = useMemo(() => {
		const mapChapter = (chapter: any) => ({
			...chapter,
			revelation_place: chapter.revelation_place.toLowerCase() as
				| "makkah"
				| "madinah",
			pages: [chapter.pages[0], chapter.pages[1]] as [number, number],
		});

		if (!debouncedQuery.trim()) {
			return chapters.chapters.map(mapChapter);
		}

		return chapters.chapters.map(mapChapter).filter((chapter) => {
			const searchLower = debouncedQuery.toLowerCase();
			return (
				chapter.name_simple.toLowerCase().includes(searchLower) ||
				chapter.translated_name.name
					.toLowerCase()
					.includes(searchLower) ||
				chapter.id.toString().includes(searchLower)
			);
		});
	}, [debouncedQuery]);

	const handleSearch = (text: string) => {
		setSearchQuery(text);
		debouncedSearch(text);
	};

	const clearSearch = () => {
		setSearchQuery("");
		setDebouncedQuery("");
	};

	// Memoize the renderItem function
	const renderItem = React.useCallback(
		({ item }: { item: Chapter }) => <ChapterItem item={item} />,
		[]
	);

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			<View className="px-4 bg-gray-50">
				<SearchHeader
					searchQuery={searchQuery}
					handleSearch={handleSearch}
					clearSearch={clearSearch}
				/>
			</View>
			<FlatList
				data={filteredChapters}
				renderItem={renderItem}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={{ padding: 16 }}
				removeClippedSubviews={true}
				maxToRenderPerBatch={10}
				windowSize={10}
				initialNumToRender={10}
				ListEmptyComponent={() => (
					<View className="flex-1 items-center justify-center py-8">
						<Text className="text-gray-600 text-center">
							No chapters found matching your search.
						</Text>
					</View>
				)}
			/>
		</SafeAreaView>
	);
};

export default ChaptersScreen;
