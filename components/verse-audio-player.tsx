import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";

interface VerseAudioPlayerProps {
	audioUrl: string;
	verseKey: string;
	isCurrentlyPlaying: boolean;
	onPlaybackStatusChange: (isPlaying: boolean) => void;
	onPlaybackComplete: () => void;
	onNext: () => void;
	onPrevious: () => void;
}

const VerseAudioPlayer = ({
	audioUrl,
	verseKey,
	isCurrentlyPlaying,
	onPlaybackStatusChange,
	onPlaybackComplete,
	onNext,
	onPrevious,
}: VerseAudioPlayerProps) => {
	const [sound, setSound] = useState<Audio.Sound | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isLooping, setIsLooping] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const ERROR_DISPLAY_DURATION = 3000; // 3 seconds

	useEffect(() => {
		if (isCurrentlyPlaying) {
			playAudio();
		} else {
			stopAudio();
		}
	}, [isCurrentlyPlaying]);

	const playAudio = async () => {
		try {
			setIsLoading(true);
			setHasError(false);

			if (sound) {
				const status = await sound.getStatusAsync();
				if (status.isLoaded) {
					await sound.playAsync();
					setIsPlaying(true);
					return;
				}
			}

			const { sound: audioSound } = await Audio.Sound.createAsync(
				{ uri: audioUrl },
				{ shouldPlay: true, isLooping }
			);

			setSound(audioSound);
			setIsPlaying(true);

			audioSound.setOnPlaybackStatusUpdate((status) => {
				if (status.isLoaded) {
					if (status.didJustFinish) {
						setIsPlaying(false);
						onPlaybackComplete();
					}
				} else {
					handleError("Error during playback");
				}
			});
		} catch (error) {
			handleError(
				error instanceof Error ? error.message : "Error playing audio"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const stopAudio = async () => {
		try {
			if (sound) {
				const status = await sound.getStatusAsync();
				if (status.isLoaded) {
					await sound.pauseAsync();
					setIsPlaying(false);
				}
			}
		} catch (error) {
			console.error("Error stopping audio:", error);
		}
	};

	const togglePlayback = async () => {
		try {
			if (sound) {
				const status = await sound.getStatusAsync();
				if (status.isLoaded) {
					if (status.isPlaying) {
						await stopAudio();
					} else {
						await playAudio();
					}
				} else {
					await playAudio();
				}
			} else {
				await playAudio();
			}
			onPlaybackStatusChange(!isCurrentlyPlaying);
		} catch (error) {
			console.error("Error toggling playback:", error);
			handleError("Error toggling playback");
		}
	};

	const handleError = (message: string) => {
		setHasError(true);
		setIsLoading(false);
		setErrorMessage(message);
		onPlaybackStatusChange(false);

		setTimeout(() => {
			setHasError(false);
			setErrorMessage(null);
		}, ERROR_DISPLAY_DURATION);
	};

	const toggleLoop = () => {
		setIsLooping(!isLooping);
		if (sound) {
			sound.setIsLoopingAsync(!isLooping);
		}
	};

	const downloadAudio = async () => {
		try {
			setIsDownloading(true);

			// Create directory if it doesn't exist
			const dirPath = `${FileSystem.documentDirectory}quran_audio/`;
			const dirInfo = await FileSystem.getInfoAsync(dirPath);
			if (!dirInfo.exists) {
				await FileSystem.makeDirectoryAsync(dirPath, {
					intermediates: true,
				});
			}

			// Generate local file path
			const fileName = `verse_${verseKey.replace(":", "_")}.mp3`;
			const fileUri = `${dirPath}${fileName}`;

			// Check if file already exists
			const fileInfo = await FileSystem.getInfoAsync(fileUri);
			if (fileInfo.exists) {
				Alert.alert(
					"Already Downloaded",
					"This verse audio has already been downloaded.",
					[{ text: "OK" }]
				);
				return;
			}

			// Download the file
			const downloadResumable = FileSystem.createDownloadResumable(
				audioUrl,
				fileUri,
				{},
				(downloadProgress) => {
					const progress =
						downloadProgress.totalBytesWritten /
						downloadProgress.totalBytesExpectedToWrite;
					// You could add a progress indicator here if desired
				}
			);

			const { uri } = await downloadResumable.downloadAsync();

			if (uri) {
				Alert.alert("Success", "Audio downloaded successfully!", [
					{ text: "OK" },
				]);
			}
		} catch (error) {
			console.error("Download error:", error);
			Alert.alert(
				"Download Failed",
				"There was an error downloading the audio file.",
				[{ text: "OK" }]
			);
		} finally {
			setIsDownloading(false);
		}
	};

	// Add cleanup for audio when component unmounts or audioUrl changes
	useEffect(() => {
		return () => {
			if (sound) {
				sound.unloadAsync();
			}
		};
	}, [sound, audioUrl]);

	return (
		<View className="w-full px-4">
			<View className="bg-gray-100 rounded-xl p-4">
				{/* Main Controls Container */}
				<View className="flex flex-row items-center justify-between">
					{/* Left Side */}
					<TouchableOpacity
						onPress={toggleLoop}
						className="w-8 h-8 items-center justify-center"
					>
						<Ionicons
							name={isLooping ? "repeat" : "repeat-outline"}
							size={20}
							color={isLooping ? "#3b82f6" : "#64748b"}
						/>
					</TouchableOpacity>

					{/* Center Controls Group */}
					<View className="flex-row items-center space-x-8">
						<TouchableOpacity
							className="w-10 h-10 items-center justify-center"
							onPress={onPrevious}
						>
							<Ionicons
								name="play-skip-back"
								size={24}
								color="#3b82f6"
							/>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={togglePlayback}
							disabled={isLoading || hasError}
							className="w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
						>
							{isLoading ? (
								<ActivityIndicator
									size="small"
									color="#ffffff"
								/>
							) : hasError ? (
								<Ionicons
									name="alert-circle"
									size={28}
									color="#ef4444"
								/>
							) : (
								<Ionicons
									name={isPlaying ? "pause" : "play"}
									size={28}
									color="#ffffff"
								/>
							)}
						</TouchableOpacity>

						<TouchableOpacity
							className="w-10 h-10 items-center justify-center"
							onPress={onNext}
						>
							<Ionicons
								name="play-skip-forward"
								size={24}
								color="#3b82f6"
							/>
						</TouchableOpacity>
					</View>

					{/* Right Side */}
					<TouchableOpacity
						className="w-8 h-8 items-center justify-center"
						onPress={downloadAudio}
						disabled={isDownloading}
					>
						{isDownloading ? (
							<ActivityIndicator size="small" color="#3b82f6" />
						) : (
							<Ionicons
								name="download-outline"
								size={20}
								color="#64748b"
							/>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

export default VerseAudioPlayer;
