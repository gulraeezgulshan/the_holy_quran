import { View, Text, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { format, parse } from "date-fns";
import { Feather } from "@expo/vector-icons";

interface PrayerTimes {
	fajr: string;
	sunrise: string;
	dhuhr: string;
	asr: string;
	maghrib: string;
	isha: string;
	sunset: string;
}

export default function PrayerTimesScreen() {
	const [location, setLocation] = useState<Location.LocationObject | null>(
		null
	);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [locationName, setLocationName] = useState<string>("");

	useEffect(() => {
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				setErrorMsg("Permission to access location was denied");
				return;
			}

			let location = await Location.getCurrentPositionAsync({});
			setLocation(location);

			if (location) {
				(async () => {
					try {
						const [address] = await Location.reverseGeocodeAsync({
							latitude: location.coords.latitude,
							longitude: location.coords.longitude,
						});
						setLocationName(`${address.city}, ${address.country}`);
					} catch (error) {
						console.log("Error getting location name:", error);
					}
				})();
			}
		})();
	}, []);

	const { data: prayerTimes, isLoading } = useQuery({
		queryKey: ["prayerTimes", location?.coords],
		queryFn: async () => {
			if (!location) return null;

			const date = format(new Date(), "dd-MM-yyyy");
			const response = await fetch(
				`https://api.aladhan.com/v1/timings/${date}?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}&method=2`
			);
			const data = await response.json();
			return data.data.timings;
		},
		enabled: !!location,
	});

	const formatToAmPm = (time24: string) => {
		try {
			const parsed = parse(time24, "HH:mm", new Date());
			return format(parsed, "hh:mm a");
		} catch (error) {
			return time24;
		}
	};

	if (errorMsg) {
		return (
			<View className="flex-1 bg-gray-900 p-4 justify-center items-center">
				<Text className="text-red-500">{errorMsg}</Text>
			</View>
		);
	}

	if (isLoading || !prayerTimes) {
		return (
			<View className="flex-1 bg-gray-900 p-4 justify-center items-center">
				<ActivityIndicator size="large" color="#10b981" />
			</View>
		);
	}

	const prayers = [
		{ name: "Fajr", time: formatToAmPm(prayerTimes.Fajr) },
		{ name: "Dhuhr", time: formatToAmPm(prayerTimes.Dhuhr) },
		{ name: "Asr", time: formatToAmPm(prayerTimes.Asr) },
		{ name: "Maghrib", time: formatToAmPm(prayerTimes.Maghrib) },
		{ name: "Isha", time: formatToAmPm(prayerTimes.Isha) },
	];

	return (
		<View className="flex-1 bg-gray-900 p-4">
			<View className="bg-gray-800 rounded-xl p-4 mb-6">
				<Text className="text-xl font-bold text-gray-100 mb-2">
					{locationName || "Loading location..."}
				</Text>
				<Text className="text-gray-400">
					{format(new Date(), "EEEE, MMMM d, yyyy")}
				</Text>
				<Text className="text-gray-400">
					{format(new Date(), "hh:mm a")}
				</Text>
			</View>

			<View className="flex-row justify-between mb-6">
				<View className="bg-gray-800 rounded-xl p-4 flex-1 mr-2 items-center">
					<Feather name="sunrise" size={24} color="#f59e0b" />
					<Text className="text-gray-400 mt-2">Sunrise</Text>
					<Text className="text-amber-400 text-lg font-medium">
						{formatToAmPm(prayerTimes.Sunrise)}
					</Text>
				</View>
				<View className="bg-gray-800 rounded-xl p-4 flex-1 ml-2 items-center">
					<Feather name="sunset" size={24} color="#f59e0b" />
					<Text className="text-gray-400 mt-2">Sunset</Text>
					<Text className="text-amber-400 text-lg font-medium">
						{formatToAmPm(prayerTimes.Sunset)}
					</Text>
				</View>
			</View>

			<Text className="text-2xl font-bold text-gray-100 mb-6">
				Prayer Times
			</Text>

			<View className="bg-gray-800 rounded-xl p-4">
				{prayers.map((prayer, index) => (
					<View
						key={prayer.name}
						className={`flex-row justify-between items-center py-4 ${
							index !== prayers.length - 1
								? "border-b border-gray-700"
								: ""
						}`}
					>
						<View>
							<Text className="text-lg font-medium text-gray-100">
								{prayer.name}
							</Text>
						</View>
						<Text className="text-lg text-emerald-400 font-medium">
							{prayer.time}
						</Text>
					</View>
				))}
			</View>
		</View>
	);
}
