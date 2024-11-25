import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";

interface VerseAudioPlayerProps {
	audioUrl: string;
	verseKey: string;
	isCurrentlyPlaying: boolean;
	onPlaybackStatusChange: (isPlaying: boolean) => void;
	onPlaybackComplete: () => void;
}

const VerseAudioPlayer = ({
	audioUrl,
	verseKey,
	isCurrentlyPlaying,
	onPlaybackStatusChange,
	onPlaybackComplete,
}: VerseAudioPlayerProps) => {
	const [sound, setSound] = useState<Audio.Sound | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

			// Check if the audio file exists first
			try {
				const response = await fetch(audioUrl, { method: "HEAD" });
				if (!response.ok) {
					throw new Error("Audio file not available");
				}
			} catch (error) {
				throw new Error("Unable to connect to audio server");
			}

			if (sound) {
				await sound.unloadAsync();
			}

			const { sound: audioSound } = await Audio.Sound.createAsync(
				{ uri: audioUrl },
				{ shouldPlay: true }
			);

			setSound(audioSound);

			audioSound.setOnPlaybackStatusUpdate((status) => {
				if (status.isLoaded && status.didJustFinish) {
					onPlaybackComplete();
				}
				// Handle playback errors
				if (!status.isLoaded) {
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
		if (sound) {
			await sound.unloadAsync();
			setSound(null);
		}
	};

	const togglePlayback = () => {
		onPlaybackStatusChange(!isCurrentlyPlaying);
	};

	const handleError = (message: string) => {
		setHasError(true);
		setIsLoading(false);
		setErrorMessage(message);
		onPlaybackStatusChange(false);

		// Clear error state after delay
		setTimeout(() => {
			setHasError(false);
			setErrorMessage(null);
		}, ERROR_DISPLAY_DURATION);
	};

	// Cleanup
	useEffect(() => {
		return () => {
			if (sound) {
				sound.unloadAsync();
			}
		};
	}, [sound]);

	return (
		<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
			<TouchableOpacity
				onPress={togglePlayback}
				disabled={isLoading || hasError}
			>
				{isLoading ? (
					<ActivityIndicator size="small" color="#0000ff" />
				) : hasError ? (
					<Ionicons name="alert-circle" size={24} color="#ff0000" />
				) : (
					<Ionicons
						name={isCurrentlyPlaying ? "pause" : "play"}
						size={24}
						color="#0000ff"
					/>
				)}
			</TouchableOpacity>

			{errorMessage && (
				<Text
					style={{
						fontSize: 12,
						color: "#ff0000",
						maxWidth: 150,
					}}
				>
					{errorMessage}
				</Text>
			)}
		</View>
	);
};

export default VerseAudioPlayer;
