import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { getChapterInfo } from "../../query/verses";
import { ChapterInfoResponse } from "../../types";
import WebView from "react-native-webview";

const ChapterInfo = () => {
	const params = useLocalSearchParams<{ chapterId: string }>();

	const { data, isLoading, error } = useQuery<ChapterInfoResponse>({
		queryKey: ["chapterInfo", params.chapterId],
		queryFn: () => getChapterInfo(params.chapterId),
		enabled: !!params.chapterId,
	});

	if (isLoading) {
		return (
			<SafeAreaView className="flex-1">
				<View className="flex-1 items-center justify-center space-y-4">
					<ActivityIndicator size="large" color="#10b981" />
					<Text className="text-lg font-medium text-gray-600">
						Loading chapter information...
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (error) {
		return (
			<SafeAreaView className="flex-1">
				<View className="flex-1 items-center justify-center">
					<Text className="text-lg font-medium text-red-500">
						Error loading chapter information
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	const htmlContent = `
		<html dir="rtl">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
				<style>
					@font-face {
						font-family: 'Jameel Noori Nastaleeq';
						src: url('path-to-your-font-if-needed');
					}
					body {
						font-family: 'Jameel Noori Nastaleeq', system-ui;
						direction: rtl;
						text-align: right;
						padding: 16px;
						margin: 0;
						font-size: 16px;
						color: #000;
					}
				</style>
			</head>
			<body>
				<h2>Chapter Information</h2>
				${
					data?.chapter_info
						? `
					<p><strong>Source:</strong> ${data.chapter_info.source}</p>
					${data.chapter_info.text}
			 `
						: ""
				}
			</body>
		</html>
	`;

	return (
		<SafeAreaView edges={["top"]} className="flex-1">
			<WebView
				source={{ html: htmlContent }}
				style={{ flex: 1 }}
				scrollEnabled={true}
				showsVerticalScrollIndicator={true}
				originWhitelist={["*"]}
				scalesPageToFit={false}
			/>
		</SafeAreaView>
	);
};

export default ChapterInfo;
