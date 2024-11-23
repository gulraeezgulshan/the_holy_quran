import {
	View,
	Text,
	FlatList,
	Pressable,
	ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { chapters } from "../../data/chapters.json";
import { fetchChapterAudio } from "../../query/verses";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import RecitorSelector from "../../components/recitor-selector";
import { useStore } from "../../store";

type DownloadProgress = {
	[key: string]: number;
};

type PlaybackStatus = {
	[key: number]: {
		isPlaying: boolean;
		position: number;
		duration: number;
	};
};

type DownloadState = {
	[key: string]: "idle" | "downloading" | "error";
};

type LoadingState = {
	[key: number]: boolean;
};

const ListenQuranScreen = () => {
	const queryClient = useQueryClient();
	const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>(
		{}
	);
	const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>({});
	const [sound, setSound] = useState<Audio.Sound | null>(null);
	const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(
		null
	);
	const [downloadState, setDownloadState] = useState<DownloadState>({});
	const [isLoading, setIsLoading] = useState<LoadingState>({});
	const [isRecitorModalVisible, setIsRecitorModalVisible] = useState(false);
	const { selectedRecitor } = useStore();

	// Query for checking if files exist
	const chapterQueries = useQueries({
		queries: chapters.map((chapter) => ({
			queryKey: ["chapterFile", chapter.id, selectedRecitor?.id],
			queryFn: async () => {
				const filePath =
					FileSystem.documentDirectory +
					`chapter_${chapter.id}_recitor_${
						selectedRecitor?.id || "1"
					}.mp3`;
				const fileInfo = await FileSystem.getInfoAsync(filePath);
				return { exists: fileInfo.exists, chapterId: chapter.id };
			},
		})),
	});

	const getStorageKey = (chapterId: number) => {
		return `${chapterId}_${selectedRecitor?.id || "1"}`;
	};

	const handleDownload = async (chapterId: number) => {
		const storageKey = getStorageKey(chapterId);

		if (downloadState[storageKey] === "downloading") {
			console.log("Download already in progress");
			return;
		}

		try {
			setDownloadState((prev) => ({
				...prev,
				[storageKey]: "downloading",
			}));
			setDownloadProgress((prev) => ({
				...prev,
				[storageKey]: 0,
			}));

			const audioData = await fetchChapterAudio(
				chapterId.toString(),
				selectedRecitor?.id.toString() || "1"
			);

			if (!audioData?.audio_file) {
				throw new Error("No audio file data received");
			}

			const { audio_url, file_size } = audioData.audio_file;

			console.log("Starting download:", { audio_url, file_size });

			const callback = (
				downloadProgress: FileSystem.DownloadProgressData
			) => {
				const progress = downloadProgress.totalBytesWritten / file_size;
				console.log("Download progress:", progress);
				setDownloadProgress((prev) => ({
					...prev,
					[storageKey]: progress,
				}));
			};

			const downloadResumable = FileSystem.createDownloadResumable(
				audio_url,
				FileSystem.documentDirectory +
					`chapter_${chapterId}_recitor_${
						selectedRecitor?.id || "1"
					}.mp3`,
				{},
				callback
			);

			const result = await downloadResumable.downloadAsync();
			console.log("Download completed:", result);

			// Invalidate the file existence query after download
			await queryClient.invalidateQueries({
				queryKey: ["chapterFile", chapterId, selectedRecitor?.id],
			});
		} catch (error) {
			console.error("Download error:", error);
			setDownloadState((prev) => ({
				...prev,
				[storageKey]: "error",
			}));
			// Clear progress on error
			setDownloadProgress((prev) => {
				const newProgress = { ...prev };
				delete newProgress[storageKey];
				return newProgress;
			});
		}
	};

	const handlePlayback = async (chapterId: number) => {
		try {
			// Set loading state
			setIsLoading((prev) => ({ ...prev, [chapterId]: true }));

			// If clicking the same chapter that's currently playing
			if (currentlyPlaying === chapterId && sound) {
				const status = await sound.getStatusAsync();
				if (status.isLoaded) {
					if (status.isPlaying) {
						await sound.pauseAsync();
					} else {
						await sound.playAsync();
					}
				}
				setIsLoading((prev) => ({ ...prev, [chapterId]: false }));
				return;
			}

			// Stop and unload current audio if playing something else
			if (sound) {
				await sound.stopAsync();
				await sound.unloadAsync();
				setSound(null);
				// Clear the playback status for the previous chapter
				if (currentlyPlaying) {
					setPlaybackStatus((prev) => {
						const newStatus = { ...prev };
						delete newStatus[currentlyPlaying];
						return newStatus;
					});
				}
			}

			// Start playing the new chapter
			const audioUri =
				FileSystem.documentDirectory +
				`chapter_${chapterId}_recitor_${
					selectedRecitor?.id || "1"
				}.mp3`;
			const { sound: newSound } = await Audio.Sound.createAsync(
				{ uri: audioUri },
				{ shouldPlay: true },
				(status) => {
					if (status.isLoaded) {
						setPlaybackStatus((prev) => ({
							...prev,
							[chapterId]: {
								isPlaying: status.isPlaying,
								position: status.positionMillis,
								duration: status.durationMillis || 0,
							},
						}));
					}
				}
			);

			setSound(newSound);
			setCurrentlyPlaying(chapterId);
		} catch (error) {
			console.error("Playback error:", error);
		} finally {
			setIsLoading((prev) => ({ ...prev, [chapterId]: false }));
		}
	};

	const renderChapterCard = ({ item }: { item: (typeof chapters)[0] }) => {
		const fileQuery = chapterQueries.find(
			(q) => q.data?.chapterId === item.id
		);
		const isDownloaded = fileQuery?.data?.exists;
		const storageKey = getStorageKey(item.id);

		return (
			<View className="flex-row justify-between items-center bg-white p-4 rounded-xl mb-3 shadow-sm">
				<View className="flex-1">
					<Text className="text-xl font-semibold mb-1">
						{item.name_arabic}
					</Text>
					<Text className="text-base mb-0.5">{item.name_simple}</Text>
					<Text className="text-sm text-gray-500">
						{item.translated_name.name}
					</Text>
				</View>
				{isDownloaded ? (
					<View>
						<Pressable
							onPress={() => handlePlayback(item.id)}
							disabled={isLoading[item.id]}
							className={`px-4 py-2 rounded-lg ${
								isLoading[item.id]
									? "bg-green-400"
									: "bg-green-500"
							}`}
						>
							{isLoading[item.id] ? (
								<ActivityIndicator size="small" color="white" />
							) : (
								<Ionicons
									name={
										currentlyPlaying === item.id &&
										playbackStatus[item.id]?.isPlaying
											? "pause"
											: "play"
									}
									size={24}
									color="white"
								/>
							)}
						</Pressable>
						{playbackStatus[item.id] && (
							<View className="w-full mt-2">
								<View className="h-1 bg-gray-200 rounded-full">
									<View
										className="h-1 bg-green-500 rounded-full"
										style={{
											width: `${
												(playbackStatus[item.id]
													.position /
													playbackStatus[item.id]
														.duration) *
												100
											}%`,
										}}
									/>
								</View>
							</View>
						)}
					</View>
				) : (
					<Pressable
						onPress={() => handleDownload(item.id)}
						disabled={downloadState[storageKey] === "downloading"}
						className={`px-4 py-2 rounded-lg ${
							downloadState[storageKey] === "downloading"
								? "bg-gray-400"
								: downloadState[storageKey] === "error"
								? "bg-red-500"
								: "bg-blue-500"
						}`}
					>
						<Text className="text-white font-medium">
							{downloadState[storageKey] === "downloading"
								? downloadProgress[storageKey]
									? `${Math.round(
											downloadProgress[storageKey] * 100
									  )}%`
									: "Starting..."
								: downloadState[storageKey] === "error"
								? "Retry"
								: "Download"}
						</Text>
					</Pressable>
				)}
			</View>
		);
	};

	useEffect(() => {
		return sound
			? () => {
					sound.unloadAsync();
			  }
			: undefined;
	}, [sound]);

	useEffect(() => {
		// Stop current playback when recitor changes
		if (sound) {
			sound.stopAsync();
			sound.unloadAsync();
			setSound(null);
			setCurrentlyPlaying(null);
		}
		// Invalidate all chapter file queries when recitor changes
		queryClient.invalidateQueries({ queryKey: ["chapterFile"] });
		// Clear download states and progress when recitor changes
		setDownloadState({});
		setDownloadProgress({});
	}, [selectedRecitor]);

	return (
		<View className="flex-1">
			<FlatList
				data={chapters}
				renderItem={renderChapterCard}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={{ padding: 16 }}
				className="bg-gray-50"
			/>

			<View className="absolute right-8 bottom-8 w-14 h-14 ">
				<RecitorSelector
					isVisible={isRecitorModalVisible}
					onClose={() =>
						setIsRecitorModalVisible(!isRecitorModalVisible)
					}
				/>
			</View>
		</View>
	);
};

export default ListenQuranScreen;
