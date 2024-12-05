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

const RevelationBadge = React.memo(({ order }: { order: number }) => (
	<View className="bg-emerald-900/30 px-3 py-1 rounded-full">
		<Text className="text-xs text-emerald-400 font-medium">
			Revelation #{order}
		</Text>
	</View>
));
RevelationBadge.displayName = "RevelationBadge";

const VerseCountBadge = React.memo(({ count }: { count: number }) => (
	<View className="bg-gray-800 px-3 py-1 rounded-full">
		<Text className="text-xs text-gray-400 font-medium">
			{count} verses
		</Text>
	</View>
));
VerseCountBadge.displayName = "VerseCountBadge";

const MemoizedText = React.memo(
	({
		children,
		className,
	}: {
		children: React.ReactNode;
		className: string;
	}) => <Text className={className}>{children}</Text>
);
MemoizedText.displayName = "MemoizedText";

const ChapterHeader = React.memo(
	({
		revelationOrder,
		versesCount,
	}: {
		revelationOrder: number;
		versesCount: number;
	}) => (
		<View className="flex-row justify-between items-center mb-2">
			<RevelationBadge order={revelationOrder} />
			<VerseCountBadge count={versesCount} />
		</View>
	)
);
ChapterHeader.displayName = "ChapterHeader";

const ChapterContent = React.memo(
	({
		nameComplex,
		translatedName,
		id,
		nameArabic,
	}: {
		nameComplex: string;
		translatedName: string;
		id: number;
		nameArabic: string;
	}) => (
		<View className="flex-row justify-between items-center mb-2">
			<View className="flex-1">
				<MemoizedText className="text-lg text-gray-200 font-medium">
					{nameComplex}
				</MemoizedText>
				<MemoizedText className="text-sm text-gray-400">
					{translatedName}
				</MemoizedText>
			</View>

			<View className="rounded-sm items-center justify-center">
				<MemoizedText className="text-3xl text-emerald-400 font-medium">
					{id}
				</MemoizedText>
			</View>

			<MemoizedText className="text-2xl flex-1 font-semibold text-gray-100 text-right">
				{nameArabic}
			</MemoizedText>
		</View>
	)
);
ChapterContent.displayName = "ChapterContent";

const ChapterFooter = React.memo(
	({
		revelationPlace,
		onInfoPress,
	}: {
		revelationPlace: string;
		onInfoPress: () => void;
	}) => (
		<View className="border-t border-gray-700 mt-2 pt-2 flex-row justify-between items-center">
			<MemoizedText className="text-xs text-gray-400 font-medium">
				Revealed in{" "}
				{revelationPlace === "makkah" ? "Makkah" : "Madinah"}
			</MemoizedText>

			<Pressable
				onPress={onInfoPress}
				className="bg-gray-700 px-3 py-1 rounded-full"
			>
				<MemoizedText className="text-xs text-emerald-400 font-medium">
					Chapter Info
				</MemoizedText>
			</Pressable>
		</View>
	)
);
ChapterFooter.displayName = "ChapterFooter";

const ChapterItem = React.memo(
	({ item }: { item: Chapter }) => {
		const handleChapterPress = useCallback(() => {
			router.push({
				pathname: "/(verses)",
				params: {
					chapter: item.id,
					pages: item.pages,
					nameArabic: item.name_arabic,
					revelationPlace: item.revelation_place,
					versesCount: item.verses_count,
				},
			});
		}, [item.id, item.pages]);

		const handleInfoPress = useCallback(() => {
			router.push({
				pathname: "/(chapters-info)/chapter-info",
				params: { chapterId: item.id },
			});
		}, [item.id]);

		return (
			<Pressable
				onPress={handleChapterPress}
				className="bg-gray-800 rounded-xl p-4 mb-3 shadow-lg"
			>
				<ChapterHeader
					revelationOrder={item.revelation_order}
					versesCount={item.verses_count}
				/>
				<ChapterContent
					nameComplex={item.name_complex}
					translatedName={item.translated_name.name}
					id={item.id}
					nameArabic={item.name_arabic}
				/>
				<ChapterFooter
					revelationPlace={item.revelation_place}
					onInfoPress={handleInfoPress}
				/>
			</Pressable>
		);
	},
	(prevProps, nextProps) => prevProps.item.id === nextProps.item.id
);
ChapterItem.displayName = "ChapterItem";

type SortOption = {
	label: string;
	key: "id" | "name_simple" | "revelation_order";
	direction: "asc" | "desc";
};

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
SortModal.displayName = "SortModal";

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
			<View className="mb-2 mt-4">
				<View className="flex-row items-center gap-2">
					<View className="flex-1 flex-row items-center bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
						<FontAwesome name="search" size={16} color="#9CA3AF" />
						<TextInput
							ref={searchInputRef}
							className="flex-1 ml-2 text-base text-gray-100"
							placeholder="Search by name, number or translation"
							value={searchQuery}
							onChangeText={handleSearch}
							placeholderTextColor="#6B7280"
							autoCorrect={false}
							returnKeyType="search"
							clearButtonMode="while-editing"
							enablesReturnKeyAutomatically={true}
							keyboardType="default"
							onSubmitEditing={() => {}}
						/>
						{searchQuery ? (
							<Pressable onPress={clearSearch}>
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
						className="bg-gray-800 min-h-12 min-w-12 items-center justify-center rounded-lg border border-gray-700"
					>
						<FontAwesome
							name="sort-amount-asc"
							size={20}
							color="#9CA3AF"
						/>
					</Pressable>
				</View>
			</View>
		);
	}
);
SearchHeader.displayName = "SearchHeader";

const ChaptersScreen = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [isSortModalVisible, setIsSortModalVisible] = useState(false);
	const [selectedSort, setSelectedSort] = useState<SortOption>({
		label: "Chapter Number (1-114)",
		key: "id",
		direction: "asc",
	});

	const debouncedSearch = useCallback(
		debounce((text: string) => {
			setDebouncedQuery(text);
		}, 300),
		[]
	);

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

	const ITEM_HEIGHT = 160;
	const getItemLayout = useCallback(
		(data: any, index: number) => ({
			length: ITEM_HEIGHT,
			offset: ITEM_HEIGHT * index,
			index,
		}),
		[]
	);

	const ListEmptyComponent = useCallback(
		() => (
			<View className="flex-1 items-center justify-center py-8">
				<MemoizedText className="text-gray-600 text-center">
					No chapters found matching your search.
				</MemoizedText>
			</View>
		),
		[]
	);

	const renderItem = useCallback(
		({ item }: { item: Chapter }) => <ChapterItem item={item} />,
		[]
	);

	return (
		<SafeAreaView className="flex-1 bg-gray-900">
			<View className="px-4 bg-gray-900">
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
				keyExtractor={useCallback(
					(item: Chapter) => item.id.toString(),
					[]
				)}
				contentContainerStyle={{ padding: 16 }}
				removeClippedSubviews={true}
				maxToRenderPerBatch={3}
				windowSize={3}
				initialNumToRender={5}
				updateCellsBatchingPeriod={75}
				getItemLayout={getItemLayout}
				maintainVisibleContentPosition={{
					minIndexForVisible: 0,
				}}
				ListEmptyComponent={ListEmptyComponent}
				showsVerticalScrollIndicator={false}
				onEndReachedThreshold={0.5}
				scrollEventThrottle={16}
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
