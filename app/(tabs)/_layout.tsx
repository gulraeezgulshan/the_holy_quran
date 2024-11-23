import React from "react";
import { Tabs } from "expo-router";
import { Book, Bookmark, Headphones } from "lucide-react-native";

const TabsLayout = () => {
	return (
		<Tabs screenOptions={{ headerShown: false }}>
			<Tabs.Screen
				name="chapters"
				options={{
					title: "Read",
					tabBarIcon: ({ color, size }) => (
						<Book color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="bookmarks"
				options={{
					title: "Bookmarks",
					tabBarIcon: ({ color, size }) => (
						<Bookmark color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="listen"
				options={{
					title: "Listen",
					tabBarIcon: ({ color, size }) => (
						<Headphones color={color} size={size} />
					),
				}}
			/>
		</Tabs>
	);
};

export default TabsLayout;
