import {
	View,
	Text,
	SafeAreaView,
	FlatList,
	Pressable,
	TextInput,
} from "react-native";
import React, { useState, useMemo, useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchVersesByChapter } from "../../query/verses";
import { Verse } from "../../types";
import VerseAudioPlayer from "../../components/verse-audio-player";
import { useStore } from "../../store";
import { FontAwesome } from "@expo/vector-icons";
import RecitorSelector from "../../components/recitor-selector";

const VersesScreen = () => {
	const { chapter, pages } = useLocalSearchParams();
	const [currentlyPlayingVerseKey, setCurrentlyPlayingVerseKey] = useState<
		string | null
	>(null);
	const [isAutoPlaying, setIsAutoPlaying] = useState(false);
	const [isRecitorModalVisible, setIsRecitorModalVisible] = useState(false);
	const { selectedRecitor } = useStore();
	const [searchQuery, setSearchQuery] = useState("");

	const {
		data: versesData,
		isLoading,
		error,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ["verses", chapter, selectedRecitor?.id],
		queryFn: ({ pageParam = 1 }) =>
			fetchVersesByChapter(
				chapter as string,
				pageParam,
				selectedRecitor?.id
			),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const totalPages = Math.ceil(
				lastPage.pagination.total_records / 10
			);
			const nextPage = allPages.length + 1;
			return nextPage <= totalPages ? nextPage : undefined;
		},
		enabled: !!chapter,
	});

	const loadMore = () => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	};

	const flattenedVerses = useMemo(() => {
		return versesData?.pages.flatMap((page) => page.verses) ?? [];
	}, [versesData]);

	const filteredVerses = useMemo(() => {
		if (!searchQuery.trim()) return flattenedVerses;

		return flattenedVerses.filter((verse) => {
			const translation = verse.words
				.map((word) => word.translation.text)
				.join(" ")
				.toLowerCase();
			const verseKey = verse.verse_key.toLowerCase();
			const query = searchQuery.toLowerCase();

			return translation.includes(query) || verseKey.includes(query);
		});
	}, [flattenedVerses, searchQuery]);

	console.log("Fetched verses data:", versesData);
	console.log("Full response:", versesData);
	console.log("Verses array:", versesData?.pages);
	if (versesData?.pages?.[0]?.verses?.[0]) {
		console.log("First verse structure:", {
			id: versesData.pages[0].verses[0].id,
			verse_number: versesData.pages[0].verses[0].verse_number,
			text_uthmani: versesData.pages[0].verses[0].text_uthmani,
			text_imlaei: versesData.pages[0].verses[0].text_imlaei,
		});
	}

	// Function to play next verse
	const playNextVerse = useCallback(
		(currentVerseKey: string | null) => {
			if (!currentVerseKey || !isAutoPlaying) return;

			const [currentChapter, currentVerse] = currentVerseKey.split(":");
			const nextVerseNumber = parseInt(currentVerse) + 1;
			const nextVerseKey = `${currentChapter}:${nextVerseNumber}`;

			// Check if next verse exists in our data
			const nextVerseExists = flattenedVerses.some(
				(v) => v.verse_key === nextVerseKey
			);
			if (nextVerseExists) {
				setCurrentlyPlayingVerseKey(nextVerseKey);
			} else {
				setIsAutoPlaying(false);
				setCurrentlyPlayingVerseKey(null);
			}
		},
		[flattenedVerses, isAutoPlaying]
	);

	const renderVerseItem = ({ item: verse }: { item: Verse }) => (
		<SafeAreaView
			className={`mb-6 p-5 bg-gray-800 rounded-xl shadow-lg border ${
				currentlyPlayingVerseKey === verse.verse_key
					? "border-emerald-500/30 bg-emerald-900/20"
					: "border-gray-700"
			}`}
		>
			<Text
				className={`text-2xl leading-10 font-medium mb-3 text-right ${
					currentlyPlayingVerseKey === verse.verse_key
						? "text-emerald-400"
						: "text-gray-100"
				}`}
				style={{ fontFamily: "me_quran-2" }}
			>
				{verse.text_uthmani}
			</Text>
			<Text className="text-base text-gray-300 mb-4 text-right">
				{verse.words.map((word) => word.translation.text).join(" ")}
			</Text>
			<View className="flex-row items-center justify-between">
				<View className="flex-row items-center">
					<Text className="text-sm text-gray-400">
						Verse {verse.verse_number}
					</Text>
					<Text className="text-gray-600 mx-2">•</Text>
					<Text className="text-sm text-gray-400">
						{verse.verse_key}
					</Text>
				</View>

				<VerseAudioPlayer
					audioUrl={`https://verses.quran.com/${verse.audio.url}`}
					verseKey={verse.verse_key}
					isCurrentlyPlaying={
						currentlyPlayingVerseKey === verse.verse_key
					}
					onPlaybackStatusChange={(isPlaying) => {
						if (isPlaying) {
							setIsAutoPlaying(true);
							setCurrentlyPlayingVerseKey(verse.verse_key);
						} else if (
							currentlyPlayingVerseKey === verse.verse_key
						) {
							// Only stop auto-playing if this verse is the current one
							setIsAutoPlaying(false);
							setCurrentlyPlayingVerseKey(null);
						}
					}}
					onPlaybackComplete={() => {
						if (isAutoPlaying) {
							playNextVerse(verse.verse_key);
						}
					}}
				/>
			</View>
		</SafeAreaView>
	);

	if (isLoading) {
		return (
			<SafeAreaView className="flex-1 bg-gray-900 mt-4">
				<View className="flex-1 items-center justify-center">
					<Text className="text-gray-300 text-lg">
						Loading verses...
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (error) {
		return (
			<SafeAreaView className="flex-1 bg-gray-900">
				<View className="flex-1 items-center justify-center p-4">
					<Text className="text-red-400 text-center">
						{(error as Error).message}
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-gray-900">
			<View className="px-4 bg-gray-900">
				<View className="mb-6">
					<Text className="text-2xl font-bold text-gray-100 mb-2">
						Chapter {chapter}
					</Text>
					<Text className="text-base text-gray-400">
						Page {pages}
					</Text>
					<View className="mt-4">
						<View className="flex-row items-center bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
							<FontAwesome
								name="search"
								size={16}
								color="#9CA3AF"
							/>
							<TextInput
								className="flex-1 ml-2 text-base text-gray-100"
								placeholder="Search verses..."
								value={searchQuery}
								onChangeText={setSearchQuery}
								placeholderTextColor="#6B7280"
							/>
							{searchQuery ? (
								<Pressable onPress={() => setSearchQuery("")}>
									<FontAwesome
										name="times-circle"
										size={16}
										color="#6B7280"
									/>
								</Pressable>
							) : null}
						</View>
					</View>
				</View>
			</View>
			<FlatList
				data={filteredVerses}
				renderItem={renderVerseItem}
				keyExtractor={(verse) => verse.id.toString()}
				contentContainerClassName="px-4 py-6"
				showsVerticalScrollIndicator={false}
				initialNumToRender={10}
				maxToRenderPerBatch={10}
				windowSize={5}
				onEndReached={loadMore}
				onEndReachedThreshold={0.5}
				ListFooterComponent={() =>
					isFetchingNextPage ? (
						<View className="py-4">
							<Text className="text-center text-gray-400">
								Loading more verses...
							</Text>
						</View>
					) : null
				}
				ListEmptyComponent={() => (
					<View className="flex-1 items-center justify-center py-8">
						<Text className="text-gray-400 text-center">
							No verses found matching your search.
						</Text>
					</View>
				)}
			/>
			<View className="absolute right-8 bottom-8 w-14 h-14">
				<Pressable
					className="h-14 w-14 bg-emerald-600 rounded-full items-center justify-center shadow-lg"
					onPress={() => {
						console.log("Opening modal");
						setIsRecitorModalVisible(true);
					}}
				>
					<FontAwesome name="microphone" size={24} color="white" />
				</Pressable>
				<RecitorSelector
					isVisible={isRecitorModalVisible}
					onClose={() => {
						console.log("Closing modal");
						setIsRecitorModalVisible(false);
					}}
					showButton={false}
				/>
			</View>
		</SafeAreaView>
	);
};

export default VersesScreen;
