import { View, Text, SafeAreaView, Pressable } from "react-native";
import React from "react";
import { Verse } from "../types";
import VerseAudioPlayer from "./verse-audio-player";

interface VerseItemProps {
	verse: Verse;
	currentlyPlayingVerseKey?: string | null;
	onPlaybackStatusChange?: (isPlaying: boolean) => void;
	onPlaybackComplete?: () => void;
	isAutoPlaying?: boolean;
	hidePlayer?: boolean;
}

const VerseItem = ({
	verse,
	currentlyPlayingVerseKey,
	onPlaybackStatusChange,
	onPlaybackComplete,
	isAutoPlaying,
	hidePlayer,
}: VerseItemProps) => {
	const [showPlayer, setShowPlayer] = React.useState(false);
	const isPlaying = currentlyPlayingVerseKey === verse.verse_key;

	// Construct audio URL only if verse.audio exists
	const audioUrl = verse.audio?.url
		? `https://verses.quran.com/${verse.audio.url}`
		: null;

	return (
		<View
			className={`mb-8 p-8 bg-gray-800 rounded-xl shadow-lg border ${
				isPlaying
					? "border-emerald-500/30 bg-emerald-900/20"
					: "border-gray-700"
			}`}
		>
			<Text
				className={`text-3xl leading-10 font-medium mb-4 text-right ${
					isPlaying ? "text-emerald-400" : "text-gray-100"
				}`}
				style={{ fontFamily: "me_quran-2" }}
			>
				{verse.text_uthmani}
			</Text>
			<Text className="text-xl text-gray-300 mb-6 text-right">
				{verse.words.map((word) => word.translation.text).join(" ")}
			</Text>
			<View className="flex-row items-center justify-between pt-2">
				<View className="flex-row items-center gap-2">
					<Text className="text-sm text-gray-400">
						Verse {verse.verse_number}
					</Text>
					<Text className="text-gray-600">•</Text>
					<Text className="text-sm text-gray-400">
						{verse.verse_key}
					</Text>
				</View>

				{!hidePlayer && audioUrl && (
					<>
						{!showPlayer ? (
							<Pressable
								onPress={() => setShowPlayer(true)}
								className="bg-emerald-500 p-2 rounded-full"
							>
								<Text className="text-white">Play</Text>
							</Pressable>
						) : (
							<VerseAudioPlayer
								audioUrl={audioUrl}
								verseKey={verse.verse_key}
								isCurrentlyPlaying={isPlaying}
								onPlaybackStatusChange={onPlaybackStatusChange}
								onPlaybackComplete={onPlaybackComplete}
							/>
						)}
					</>
				)}
			</View>
		</View>
	);
};

export default VerseItem;
