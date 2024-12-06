import {
	View,
	Text,
	SafeAreaView,
	FlatList,
	Pressable,
	TextInput,
	Modal,
} from "react-native";
import React, { useState, useMemo, useCallback, useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchVersesByChapter } from "../../query/verses";
import { Verse } from "../../types";
import { useStore } from "../../store";
import { FontAwesome } from "@expo/vector-icons";
import RecitorSelector from "../../components/recitor-selector";
import VerseItem from "../../components/verse-item";
import VerseAudioPlayer from "../../components/verse-audio-player";

const VersesScreen = () => {
	const { chapter, pages, nameArabic, revelationPlace, versesCount } =
		useLocalSearchParams();
	const [currentlyPlayingVerseKey, setCurrentlyPlayingVerseKey] = useState<
		string | null
	>(null);
	const [isAutoPlaying, setIsAutoPlaying] = useState(false);
	const [isRecitorModalVisible, setIsRecitorModalVisible] = useState(false);
	const { selectedRecitor } = useStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [globalPlayerVisible, setGlobalPlayerVisible] = useState(false);
	const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);
	const shouldAutoPlay = React.useRef(false);
	const flatListRef = useRef<FlatList>(null);

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

	const scrollToVerse = useCallback(
		(verseKey: string) => {
			const verseIndex = filteredVerses.findIndex(
				(v) => v.verse_key === verseKey
			);
			if (verseIndex !== -1) {
				flatListRef.current?.scrollToIndex({
					index: verseIndex,
					animated: true,
					viewPosition: 0.3,
				});
			}
		},
		[filteredVerses]
	);

	const playNextVerse = useCallback(
		(currentVerseKey: string | null) => {
			if (!currentVerseKey || !isAutoPlaying) return;

			const [currentChapter, currentVerse] = currentVerseKey.split(":");
			const nextVerseNumber = parseInt(currentVerse) + 1;
			const nextVerseKey = `${currentChapter}:${nextVerseNumber}`;

			const nextVerse = flattenedVerses.find(
				(v) => v.verse_key === nextVerseKey
			);
			if (nextVerse) {
				shouldAutoPlay.current = true;
				setTimeout(() => {
					setCurrentVerse(nextVerse);
					setCurrentlyPlayingVerseKey(nextVerseKey);
					setIsAutoPlaying(true);
					scrollToVerse(nextVerseKey);
				}, 500);
			} else {
				shouldAutoPlay.current = false;
				setIsAutoPlaying(false);
				setCurrentlyPlayingVerseKey(null);
				setCurrentVerse(null);
				setGlobalPlayerVisible(false);
			}
		},
		[flattenedVerses, isAutoPlaying, scrollToVerse]
	);

	const VerseItemWithModal = React.memo(
		({
			verse,
			currentlyPlayingVerseKey,
			isAutoPlaying,
			onPlaybackStatusChange,
			onPlaybackComplete,
		}: {
			verse: Verse;
			currentlyPlayingVerseKey: string | null;
			isAutoPlaying: boolean;
			onPlaybackStatusChange: (isPlaying: boolean) => void;
			onPlaybackComplete: () => void;
		}) => {
			const [isOptionsModalVisible, setIsOptionsModalVisible] =
				useState(false);
			const [isPlaying, setIsPlaying] = useState(false);

			const audioUrl = verse.audio?.url
				? `https://verses.quran.com/${verse.audio.url}`
				: null;

			const handlePlaybackStatusChange = (isPlaying: boolean) => {
				setIsPlaying(isPlaying);
				onPlaybackStatusChange(isPlaying);
			};

			return (
				<View>
					<Pressable
						className="absolute top-2 left-2 w-12 h-12 rounded-full items-center justify-center z-10"
						onPress={() => setIsOptionsModalVisible(true)}
					>
						<FontAwesome name="ellipsis-v" size={16} color="#fff" />
					</Pressable>
					<VerseItem
						verse={verse}
						currentlyPlayingVerseKey={currentlyPlayingVerseKey}
						isAutoPlaying={isAutoPlaying}
						onPlaybackStatusChange={onPlaybackStatusChange}
						onPlaybackComplete={onPlaybackComplete}
						hidePlayer={true}
					/>
					<Modal
						visible={isOptionsModalVisible}
						transparent={true}
						animationType="fade"
						onRequestClose={() => setIsOptionsModalVisible(false)}
					>
						<Pressable
							className="flex-1 bg-black/60"
							onPress={() => setIsOptionsModalVisible(false)}
						>
							<View className="flex-1 justify-center items-center">
								<View className="bg-gray-800/95 rounded-2xl p-6 w-[85%] backdrop-blur-xl border border-gray-700">
									<Text className="text-emerald-50 text-lg font-semibold mb-4">
										Verse {verse.verse_key}
									</Text>
									<View className="flex-row flex-wrap justify-between">
										<Pressable
											className="items-center w-[30%] mb-4"
											onPress={() => {
												setIsOptionsModalVisible(false);
												setCurrentVerse(verse);
												setGlobalPlayerVisible(true);
												setCurrentlyPlayingVerseKey(
													verse.verse_key
												);
												setIsAutoPlaying(true);
											}}
										>
											<View className="w-12 h-12 bg-emerald-500/20 rounded-full items-center justify-center mb-2">
												<FontAwesome
													name="play"
													size={20}
													color="#6ee7b7"
												/>
											</View>
											<Text className="text-emerald-100 text-sm">
												Play
											</Text>
										</Pressable>

										<Pressable
											className="items-center w-[30%] mb-4"
											onPress={() => {
												/* Bookmark logic */
											}}
										>
											<View className="w-12 h-12 bg-emerald-500/20 rounded-full items-center justify-center mb-2">
												<FontAwesome
													name="bookmark"
													size={20}
													color="#6ee7b7"
												/>
											</View>
											<Text className="text-emerald-100 text-sm">
												Bookmark
											</Text>
										</Pressable>

										<Pressable
											className="items-center w-[30%] mb-4"
											onPress={() => {
												/* Share logic */
											}}
										>
											<View className="w-12 h-12 bg-emerald-500/20 rounded-full items-center justify-center mb-2">
												<FontAwesome
													name="share"
													size={20}
													color="#6ee7b7"
												/>
											</View>
											<Text className="text-emerald-100 text-sm">
												Share
											</Text>
										</Pressable>

										<Pressable
											className="items-center w-[30%]"
											onPress={() => {
												/* Notes logic */
											}}
										>
											<View className="w-12 h-12 bg-emerald-500/20 rounded-full items-center justify-center mb-2">
												<FontAwesome
													name="sticky-note"
													size={20}
													color="#6ee7b7"
												/>
											</View>
											<Text className="text-emerald-100 text-sm">
												Notes
											</Text>
										</Pressable>
									</View>
								</View>
							</View>
						</Pressable>
					</Modal>
				</View>
			);
		}
	);

	VerseItemWithModal.displayName = "VerseItemWithModal";

	const renderVerseItem = ({ item: verse }: { item: Verse }) => (
		<VerseItemWithModal
			verse={verse}
			currentlyPlayingVerseKey={currentlyPlayingVerseKey}
			isAutoPlaying={isAutoPlaying}
			onPlaybackStatusChange={(isPlaying) => {
				if (isPlaying) {
					setIsAutoPlaying(true);
					setCurrentlyPlayingVerseKey(verse.verse_key);
				} else if (currentlyPlayingVerseKey === verse.verse_key) {
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
				<View className="mb-3 bg-emerald-900/80 rounded-xl p-4 shadow-lg">
					<View className="flex-row justify-between items-center mb-3">
						<View className="flex-1">
							<Text className="text-base font-medium text-emerald-200">
								Chapter {chapter}
							</Text>
							<View className="flex-row items-center mt-1">
								<Text className="text-base text-emerald-100/80">
									{revelationPlace} • {versesCount} verses
								</Text>
							</View>
						</View>
						<Text
							className="text-5xl font-bold text-emerald-50 text-right"
							style={{
								fontFamily: "arabic",
								lineHeight: 65,
								paddingVertical: 5,
							}}
						>
							{nameArabic}
						</Text>
					</View>
					<View className="mt-4">
						<View className="flex-row items-center bg-emerald-950/50 rounded-lg px-4 py-2 border border-emerald-800">
							<FontAwesome
								name="search"
								size={16}
								color="#6EE7B7"
							/>
							<TextInput
								className="flex-1 ml-2 text-base text-emerald-50"
								placeholder="Search verses..."
								value={searchQuery}
								onChangeText={setSearchQuery}
								placeholderTextColor="#065F46"
							/>
							{searchQuery ? (
								<Pressable onPress={() => setSearchQuery("")}>
									<FontAwesome
										name="times-circle"
										size={16}
										color="#065F46"
									/>
								</Pressable>
							) : null}
						</View>
					</View>
				</View>
			</View>
			<FlatList
				ref={flatListRef}
				data={filteredVerses}
				renderItem={renderVerseItem}
				keyExtractor={(verse) => verse.id.toString()}
				contentContainerClassName="px-4 py-6 pb-32"
				showsVerticalScrollIndicator={false}
				ItemSeparatorComponent={() => (
					<View className="h-4 bg-gray-900" />
				)}
				onScrollToIndexFailed={(info) => {
					setTimeout(() => {
						if (currentlyPlayingVerseKey) {
							scrollToVerse(currentlyPlayingVerseKey);
						}
					}, 500);
				}}
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
			{globalPlayerVisible && currentVerse && (
				<View className="absolute bottom-0 left-0 right-0 bg-gray-800 p-4 border-t border-gray-700 shadow-lg">
					<View className="items-center justify-between flex-row">
						<View className="flex-1">
							<VerseAudioPlayer
								key={currentVerse.verse_key}
								audioUrl={`https://verses.quran.com/${currentVerse.audio?.url}`}
								verseKey={currentVerse.verse_key}
								isCurrentlyPlaying={
									shouldAutoPlay.current || isAutoPlaying
								}
								onPlaybackStatusChange={(isPlaying) => {
									if (isPlaying) {
										shouldAutoPlay.current = false;
										scrollToVerse(currentVerse.verse_key);
									}
									if (!shouldAutoPlay.current) {
										if (!isPlaying) {
											if (
												currentlyPlayingVerseKey ===
												currentVerse.verse_key
											) {
												setIsAutoPlaying(false);
												setCurrentlyPlayingVerseKey(
													null
												);
											}
										} else {
											setCurrentlyPlayingVerseKey(
												currentVerse.verse_key
											);
											setIsAutoPlaying(true);
										}
									}
								}}
								onPlaybackComplete={() => {
									if (isAutoPlaying) {
										playNextVerse(currentVerse.verse_key);
									}
								}}
								onNext={() => {
									playNextVerse(currentVerse.verse_key);
								}}
								onPrevious={() => {
									const [currentChapter, currentVerseNumber] =
										currentVerse.verse_key.split(":");
									const previousVerseNumber =
										parseInt(currentVerseNumber) - 1;
									const previousVerseKey = `${currentChapter}:${previousVerseNumber}`;

									const previousVerse = flattenedVerses.find(
										(v) => v.verse_key === previousVerseKey
									);
									if (previousVerse) {
										setCurrentVerse(previousVerse);
										setCurrentlyPlayingVerseKey(
											previousVerseKey
										);
										setIsAutoPlaying(true);
										scrollToVerse(previousVerseKey);
									}
								}}
							/>
						</View>

						<View className="flex-row items-center gap-4">
							<Pressable
								className="h-14 w-14 bg-emerald-600 rounded-full items-center justify-center shadow-lg"
								onPress={() => setIsRecitorModalVisible(true)}
							>
								<FontAwesome
									name="microphone"
									size={24}
									color="white"
								/>
							</Pressable>
							<Pressable
								onPress={() => {
									setGlobalPlayerVisible(false);
									setCurrentVerse(null);
									setIsAutoPlaying(false);
									setCurrentlyPlayingVerseKey(null);
								}}
							>
								<FontAwesome
									name="times"
									size={20}
									color="#9CA3AF"
								/>
							</Pressable>
						</View>
					</View>
					<RecitorSelector
						isVisible={isRecitorModalVisible}
						onClose={() => setIsRecitorModalVisible(false)}
						showButton={false}
					/>
				</View>
			)}
		</SafeAreaView>
	);
};

export default VersesScreen;
