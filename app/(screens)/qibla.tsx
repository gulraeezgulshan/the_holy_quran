import { useEffect, useState } from "react";
import { View, Text, Alert, Image } from "react-native";
import { Magnetometer } from "expo-sensors";
import * as Location from "expo-location";
import Svg, { Line, Circle, Path } from "react-native-svg";
import { Stack } from "expo-router";
import { MapPin } from "lucide-react-native";

export default function QiblaScreen() {
	const [subscription, setSubscription] = useState(null);
	const [magnetometer, setMagnetometer] = useState(0);
	const [qiblaDirection, setQiblaDirection] = useState(0);
	const [location, setLocation] = useState(null);
	const [address, setAddress] = useState("Loading location...");
	const [compassRotation, setCompassRotation] = useState(0);

	const MECCA_COORDS = {
		latitude: 21.422487,
		longitude: 39.826206,
	};

	useEffect(() => {
		setupQibla();
		return () => {
			unsubscribe();
		};
	}, []);

	const setupQibla = async () => {
		try {
			const { status } =
				await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				Alert.alert(
					"Permission Denied",
					"Location permission is required for Qibla direction"
				);
				return;
			}

			const location = await Location.getCurrentPositionAsync({});
			setLocation(location);

			// Get address
			const [address] = await Location.reverseGeocodeAsync({
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
			});

			setAddress(`${address.city || address.region}, ${address.country}`);

			const qiblaAngle = calculateQiblaDirection(
				location.coords.latitude,
				location.coords.longitude
			);
			setQiblaDirection(qiblaAngle);

			// Start compass tracking
			Magnetometer.setUpdateInterval(100);
			const subscription = Magnetometer.addListener((data) => {
				let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
				angle = angle < 0 ? angle + 360 : angle;
				setMagnetometer(angle);
				setCompassRotation(-angle);
			});
			setSubscription(subscription);
		} catch (error) {
			Alert.alert("Error", "Failed to initialize Qibla direction");
		}
	};

	const unsubscribe = () => {
		subscription && subscription.remove();
		setSubscription(null);
	};

	const calculateQiblaDirection = (latitude, longitude) => {
		const φ1 = toRadians(latitude);
		const φ2 = toRadians(MECCA_COORDS.latitude);
		const Δλ = toRadians(MECCA_COORDS.longitude - longitude);

		const y = Math.sin(Δλ);
		const x =
			Math.cos(φ1) * Math.sin(φ2) -
			Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

		let qiblaAngle = Math.atan2(y, x) * (180 / Math.PI);
		return (qiblaAngle + 360) % 360;
	};

	const toRadians = (degrees) => {
		return degrees * (Math.PI / 180);
	};

	const getDirection = (angle: number) => {
		const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
		return directions[Math.round(angle / 45) % 8];
	};

	return (
		<View className="flex-1 bg-gray-900">
			<Stack.Screen
				options={{
					title: "Qibla Direction",
					headerStyle: { backgroundColor: "#111827" },
					headerTintColor: "#fff",
				}}
			/>

			{/* Location Info */}
			<View className="p-4">
				<View className="bg-gray-800 rounded-xl p-4 mb-4">
					<View className="flex-row items-center mb-2">
						<MapPin size={24} color="#10b981" />
						<Text className="text-white text-lg font-semibold ml-2">
							Your Location
						</Text>
					</View>
					<Text className="text-gray-400 text-base mb-1">
						{address}
					</Text>
					{location && (
						<Text className="text-gray-500 text-sm">
							{location.coords.latitude.toFixed(6)}°,{" "}
							{location.coords.longitude.toFixed(6)}°
						</Text>
					)}
				</View>
			</View>

			<View className="flex-1 items-center justify-center p-5">
				{/* Kaaba Icon */}
				<View
					className="absolute z-10"
					style={{
						transform: [
							{ translateY: -140 },
							{ rotate: `${qiblaDirection - magnetometer}deg` },
						],
					}}
				>
					<View className="w-8 h-8 bg-gray-900 items-center justify-center">
						<View className="w-6 h-6 bg-gray-900 border border-yellow-500" />
					</View>
					<View className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-gray-900 mx-auto" />
				</View>

				{/* Compass */}
				<View className="relative w-[280px] h-[280px] bg-white rounded-full">
					<Svg
						height="280"
						width="280"
						viewBox="-140 -140 280 280"
						style={{
							transform: [{ rotate: `${-magnetometer}deg` }],
						}}
					>
						{/* Main compass needle */}
						<Path
							d="M 0,-80 L 15,0 L 0,80 L -15,0 Z"
							fill="#2563eb"
							transform="rotate(0)"
						/>
						<Path
							d="M 0,-80 L 15,0 L 0,80 L -15,0 Z"
							fill="#22c55e"
							transform="rotate(180)"
						/>

						{/* Degree markers - every 30 degrees */}
						{[...Array(12)].map((_, i) => (
							<Line
								key={i}
								x1="0"
								y1="-120"
								x2="0"
								y2="-110"
								stroke="#374151"
								strokeWidth="2"
								transform={`rotate(${i * 30})`}
							/>
						))}

						{/* Smaller markers - every 10 degrees */}
						{[...Array(36)].map((_, i) => (
							<Line
								key={i}
								x1="0"
								y1="-120"
								x2="0"
								y2="-115"
								stroke="#374151"
								strokeWidth="1"
								transform={`rotate(${i * 10})`}
							/>
						))}

						{/* Cardinal directions as absolute positioned Text components */}
						<Text
							className="absolute text-gray-600 text-sm font-bold"
							style={{
								top: 10,
								left: "50%",
								transform: [{ translateX: -5 }],
							}}
						>
							N
						</Text>
						<Text
							className="absolute text-gray-600 text-sm font-bold"
							style={{
								top: "50%",
								right: 10,
								transform: [{ translateY: -10 }],
							}}
						>
							E
						</Text>
						<Text
							className="absolute text-gray-600 text-sm font-bold"
							style={{
								bottom: 10,
								left: "50%",
								transform: [{ translateX: -5 }],
							}}
						>
							S
						</Text>
						<Text
							className="absolute text-gray-600 text-sm font-bold"
							style={{
								top: "50%",
								left: 10,
								transform: [{ translateY: -10 }],
							}}
						>
							W
						</Text>
					</Svg>
				</View>

				{/* Degree Display */}
				<Text className="text-2xl font-semibold mt-8">
					{Math.round(magnetometer)}° {getDirection(magnetometer)}
				</Text>
			</View>
		</View>
	);
}
