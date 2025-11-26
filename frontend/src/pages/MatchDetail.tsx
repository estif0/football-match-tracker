/**
 * Match Detail Page - Shows live match events
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Match, MatchEvent } from "../types";
import { api } from "../lib/api";

export function MatchDetail() {
	const { id } = useParams<{ id: string }>();
	const [match, setMatch] = useState<Match | null>(null);
	const [events, setEvents] = useState<MatchEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;

		// Load match details
		loadMatch();

		// Subscribe to SSE
		const eventSource = api.subscribeToMatch(id, (event: MatchEvent) => {
			handleEvent(event);
		});

		return () => {
			eventSource.close();
		};
	}, [id]);

	const loadMatch = async () => {
		if (!id) return;

		try {
			setLoading(true);
			const data = await api.getMatch(id);
			setMatch(data);
			setError(null);
		} catch (err) {
			setError("Failed to load match");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleEvent = (event: MatchEvent) => {
		// Add event to list
		setEvents((prev) => [...prev, event]);

		// Update match state
		setMatch((prev) => {
			if (!prev) return prev;

			const updated = { ...prev };

			if (event.type === "match_started") {
				updated.status = "live";
			} else if (event.type === "match_ended") {
				updated.status = "ended";
			}

			if (event.score) {
				updated.score = event.score;
			}

			return updated;
		});
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-gray-600 text-xl">Loading match...</div>
			</div>
		);
	}

	if (error || !match) {
		return (
			<div className="flex flex-col justify-center items-center min-h-screen">
				<div className="mb-4 text-red-600 text-xl">
					{error || "Match not found"}
				</div>
				<Link to="/" className="text-blue-600 hover:underline">
					← Back to matches
				</Link>
			</div>
		);
	}

	const getEventIcon = (type: MatchEvent["type"]) => {
		switch (type) {
			case "goal":
				return "⚽";
			case "card":
				return "🟨";
			case "foul":
				return "⚠️";
			case "match_started":
				return "🏁";
			case "match_ended":
				return "🏆";
			default:
				return "📝";
		}
	};

	const getEventColor = (type: MatchEvent["type"]) => {
		switch (type) {
			case "goal":
				return "border-green-500 bg-green-50";
			case "card":
				return "border-yellow-500 bg-yellow-50";
			case "foul":
				return "border-orange-500 bg-orange-50";
			case "match_started":
				return "border-blue-500 bg-blue-50";
			case "match_ended":
				return "border-purple-500 bg-purple-50";
			default:
				return "border-gray-500 bg-gray-50";
		}
	};

	const statusColors = {
		idle: "bg-gray-100 text-gray-700",
		live: "bg-green-100 text-green-700",
		ended: "bg-blue-100 text-blue-700",
	};

	const statusLabels = {
		idle: "Not Started",
		live: "🔴 LIVE",
		ended: "Ended",
	};

	return (
		<div className="bg-gray-50 min-h-screen">
			<div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
				{/* Back Button */}
				<Link
					to="/"
					className="inline-flex items-center mb-6 text-blue-600 hover:underline"
				>
					← Back to matches
				</Link>

				{/* Match Header */}
				<div className="bg-white shadow-md mb-6 p-6 border border-gray-200 rounded-lg">
					<div
						className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${
							statusColors[match.status]
						}`}
					>
						{statusLabels[match.status]}
					</div>

					<div className="flex justify-between items-center">
						<div className="flex-1 text-center">
							<h2 className="mb-2 font-bold text-gray-800 text-3xl">
								{match.teamA}
							</h2>
							<div className="text-gray-500 text-sm">Team A</div>
						</div>

						<div className="px-8">
							<div className="font-bold text-gray-900 text-5xl">
								{match.score.a} : {match.score.b}
							</div>
						</div>

						<div className="flex-1 text-center">
							<h2 className="mb-2 font-bold text-gray-800 text-3xl">
								{match.teamB}
							</h2>
							<div className="text-gray-500 text-sm">Team B</div>
						</div>
					</div>
				</div>

				{/* Events Feed */}
				<div className="bg-white shadow-md p-6 border border-gray-200 rounded-lg">
					<h3 className="mb-4 font-bold text-gray-900 text-2xl">
						Live Events
					</h3>

					{events.length === 0 ? (
						<div className="py-8 text-gray-500 text-center">
							{match.status === "idle"
								? "Match has not started yet"
								: "Waiting for events..."}
						</div>
					) : (
						<div className="space-y-3">
							{events.map((event, index) => (
								<div
									key={`${event.matchId}-${event.timestamp}-${index}`}
									className={`border-l-4 p-4 rounded ${getEventColor(
										event.type
									)}`}
								>
									<div className="flex items-start">
										<span className="mr-3 text-2xl">
											{getEventIcon(event.type)}
										</span>
										<div className="flex-1">
											<div className="flex justify-between items-center mb-1">
												<span className="font-semibold text-gray-900 capitalize">
													{event.type.replace(
														"_",
														" "
													)}
												</span>
												<span className="text-gray-500 text-sm">
													{new Date(
														event.timestamp
													).toLocaleTimeString()}
												</span>
											</div>
											{event.details && (
												<p className="text-gray-700">
													{event.details}
												</p>
											)}
											{event.team && (
												<p className="mt-1 text-gray-600 text-sm">
													Team {event.team}{" "}
													{event.player &&
														`• ${event.player}`}
												</p>
											)}
											{event.score &&
												event.type === "goal" && (
													<p className="mt-1 font-semibold text-gray-900 text-sm">
														Score: {event.score.a} -{" "}
														{event.score.b}
													</p>
												)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
