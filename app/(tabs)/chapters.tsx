import {
	View,
	Text,
	FlatList,
	Pressable,
	TextInput,
	Modal,
} from "react-native";
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
			<View className="bg-emerald-100 px-3 py-1 rounded-full">
				<Text className="text-xs text-emerald-700 font-medium">
					Revelation #{item.revelation_order}
				</Text>
			</View>

			<View className="bg-gray-100 px-3 py-1 rounded-full">
				<Text className="text-xs text-gray-600 font-medium">
					{item.verses_count} verses
				</Text>
			</View>
		</View>

		<View className="flex-row justify-between items-center mb-2">
			<View className="flex-1 ">
				<Text className="text-lg text-gray-700 font-medium">
					{item.name_complex}
				</Text>
				<Text className="text-sm text-gray-500">
					{item.translated_name.name}
				</Text>
			</View>

			<View className=" rounded-sm items-center justify-center">
				<Text className="text-3xl text-gray-700 font-medium">
					{item.id}
				</Text>
			</View>

			<Text className="text-2xl flex-1 font-semibold  text-gray-800 text-right">
				{item.name_arabic}
			</Text>
		</View>

		<View className="border-t border-gray-100 mt-2 pt-2 flex-row justify-between items-center">
			<Text className="text-xs text-gray-500 font-medium">
				Revealed in{" "}
				{item.revelation_place === "makkah" ? "Makkah" : "Madinah"}
			</Text>

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
		</View>
	</Pressable>
));

// Add new type for sort options
type SortOption = {
	label: string;
	key: "id" | "name_simple" | "revelation_order";
	direction: "asc" | "desc";
};

// Add new component for sort modal
const SortModal = React.memo(
	({
		visible,
		onClose,
		selectedSort,
		onSelectSort,
	}: {
		visible: boolean;
		onClose: () => void;
		selectedSort: SortOption;
		onSelectSort: (option: SortOption) => void;
	}) => {
		const sortOptions: SortOption[] = [
			{ label: "Chapter Number (1-114)", key: "id", direction: "asc" },
			{ label: "Chapter Number (114-1)", key: "id", direction: "desc" },
			{
				label: "Chapter Name (A-Z)",
				key: "name_simple",
				direction: "asc",
			},
			{
				label: "Chapter Name (Z-A)",
				key: "name_simple",
				direction: "desc",
			},
			{
				label: "Revelation Order (First-Last)",
				key: "revelation_order",
				direction: "asc",
			},
			{
				label: "Revelation Order (Last-First)",
				key: "revelation_order",
				direction: "desc",
			},
		];

		return (
			<Modal
				visible={visible}
				transparent={true}
				animationType="slide"
				onRequestClose={onClose}
			>
				<View className="flex-1 justify-end bg-black/50">
					<View className="bg-white rounded-t-xl">
						<View className="p-4 border-b border-gray-200">
							<Text className="text-lg font-semibold text-center">
								Sort Chapters
							</Text>
						</View>
						{sortOptions.map((option) => (
							<Pressable
								key={`${option.key}-${option.direction}`}
								onPress={() => {
									onSelectSort(option);
									onClose();
								}}
								className={`p-4 border-b border-gray-100 flex-row justify-between items-center
								${
									selectedSort.key === option.key &&
									selectedSort.direction === option.direction
										? "bg-gray-50"
										: ""
								}`}
							>
								<Text className="text-base text-gray-700">
									{option.label}
								</Text>
								{selectedSort.key === option.key &&
									selectedSort.direction ===
										option.direction && (
										<FontAwesome
											name="check"
											size={16}
											color="#10B981"
										/>
									)}
							</Pressable>
						))}
						<Pressable onPress={onClose} className="p-4 bg-gray-50">
							<Text className="text-center text-base font-medium text-gray-700">
								Cancel
							</Text>
						</Pressable>
					</View>
				</View>
			</Modal>
		);
	}
);

// Update SearchHeader to include sort button
const SearchHeader = React.memo(
	({
		searchQuery,
		handleSearch,
		clearSearch,
		onSortPress,
	}: {
		searchQuery: string;
		handleSearch: (text: string) => void;
		clearSearch: () => void;
		onSortPress: () => void;
	}) => {
		const searchInputRef = React.useRef<TextInput>(null);

		return (
			<View className="mb-2">
				<View className="flex-row items-center gap-2">
					<View className="flex-1 flex-row items-center bg-white rounded-lg px-4 py-2 border border-gray-200">
						<FontAwesome name="search" size={16} color="#6B7280" />
						<TextInput
							ref={searchInputRef}
							className="flex-1 ml-2 text-base text-gray-900"
							placeholder="Search by name, number or translation"
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
					<Pressable
						onPress={onSortPress}
						className="bg-white min-h-12 min-w-12 items-center justify-center rounded-lg border border-gray-200"
					>
						<FontAwesome
							name="sort-amount-asc"
							size={20}
							color="#6B7280"
						/>
					</Pressable>
				</View>
			</View>
		);
	}
);

const ChaptersScreen = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [isSortModalVisible, setIsSortModalVisible] = useState(false);
	const [selectedSort, setSelectedSort] = useState<SortOption>({
		label: "Chapter Number (1-114)",
		key: "id",
		direction: "asc",
	});

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

		let results = chapters.chapters.map(mapChapter);

		if (debouncedQuery.trim()) {
			results = results.filter((chapter) => {
				const searchLower = debouncedQuery.toLowerCase();
				return (
					chapter.name_simple.toLowerCase().includes(searchLower) ||
					chapter.translated_name.name
						.toLowerCase()
						.includes(searchLower) ||
					chapter.id.toString().includes(searchLower)
				);
			});
		}

		// Apply sorting
		return results.sort((a, b) => {
			const multiplier = selectedSort.direction === "asc" ? 1 : -1;
			return (
				(a[selectedSort.key] > b[selectedSort.key] ? 1 : -1) *
				multiplier
			);
		});
	}, [debouncedQuery, selectedSort]);

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
					onSortPress={() => setIsSortModalVisible(true)}
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
			<SortModal
				visible={isSortModalVisible}
				onClose={() => setIsSortModalVisible(false)}
				selectedSort={selectedSort}
				onSelectSort={setSelectedSort}
			/>
		</SafeAreaView>
	);
};

export default ChaptersScreen;
