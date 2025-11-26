/**
 * Match List Page - Shows all matches with real-time updates
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Match, MatchEvent } from "../types";
import { api } from "../lib/api";
import { MatchCard } from "../components/MatchCard";

export function MatchList() {
	const [matches, setMatches] = useState<Match[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch matches on mount
	useEffect(() => {
		loadMatches();
	}, []);

	// Subscribe to SSE for all live matches
	useEffect(() => {
		const liveMatches = matches.filter((m) => m.status === "live");
		const eventSources: EventSource[] = [];

		liveMatches.forEach((match) => {
			const es = api.subscribeToMatch(match.id, (event: MatchEvent) => {
				handleMatchEvent(event);
			});
			eventSources.push(es);
		});

		// Cleanup on unmount or when live matches change
		return () => {
			eventSources.forEach((es) => es.close());
		};
	}, [
		matches
			.filter((m) => m.status === "live")
			.map((m) => m.id)
			.join(","),
	]);

	const loadMatches = async () => {
		try {
			setLoading(true);
			const data = await api.getMatches();
			setMatches(data);
			setError(null);
		} catch (err) {
			setError(
				"Failed to load matches. Make sure the backend is running."
			);
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleMatchEvent = (event: MatchEvent) => {
		setMatches((prevMatches) =>
			prevMatches.map((match) => {
				if (match.id !== event.matchId) return match;

				// Update match based on event
				const updated = { ...match };

				if (event.type === "match_started") {
					updated.status = "live";
				} else if (event.type === "match_ended") {
					updated.status = "ended";
				}

				if (event.score) {
					updated.score = event.score;
				}

				return updated;
			})
		);
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-gray-600 text-xl">Loading matches...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col justify-center items-center min-h-screen">
				<div className="mb-4 text-red-600 text-xl">{error}</div>
				<button
					onClick={loadMatches}
					className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium text-white"
				>
					Retry
				</button>
			</div>
		);
	}

	const liveMatches = matches.filter((m) => m.status === "live");
	const upcomingMatches = matches.filter((m) => m.status === "idle");
	const endedMatches = matches.filter((m) => m.status === "ended");

	return (
		<div className="bg-gray-50 min-h-screen">
			<div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
				{/* Header */}
				<div className="flex justify-between items-start mb-8">
					<div>
						<h1 className="mb-2 font-bold text-gray-900 text-4xl">
							⚽ Football Match Tracker
						</h1>
						<p className="text-gray-600">
							Live match updates with Server-Sent Events
						</p>
					</div>
					<Link
						to="/admin"
						className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium text-white transition-colors"
					>
						⚙️ Admin Panel
					</Link>
				</div>

				{/* Live Matches */}
				{liveMatches.length > 0 && (
					<div className="mb-8">
						<h2 className="flex items-center mb-4 font-bold text-gray-900 text-2xl">
							<span className="inline-block bg-red-500 mr-2 rounded-full w-3 h-3 animate-pulse"></span>
							Live Matches ({liveMatches.length})
						</h2>
						<div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
							{liveMatches.map((match) => (
								<MatchCard key={match.id} match={match} />
							))}
						</div>
					</div>
				)}

				{/* Upcoming Matches */}
				{upcomingMatches.length > 0 && (
					<div className="mb-8">
						<h2 className="mb-4 font-bold text-gray-900 text-2xl">
							Upcoming Matches ({upcomingMatches.length})
						</h2>
						<div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
							{upcomingMatches.map((match) => (
								<MatchCard key={match.id} match={match} />
							))}
						</div>
					</div>
				)}

				{/* Ended Matches */}
				{endedMatches.length > 0 && (
					<div className="mb-8">
						<h2 className="mb-4 font-bold text-gray-900 text-2xl">
							Ended Matches ({endedMatches.length})
						</h2>
						<div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
							{endedMatches.map((match) => (
								<MatchCard key={match.id} match={match} />
							))}
						</div>
					</div>
				)}

				{/* Empty State */}
				{matches.length === 0 && (
					<div className="py-12 text-center">
						<p className="mb-4 text-gray-600 text-xl">
							No matches available
						</p>
						<p className="mb-6 text-gray-500">
							Create and start matches from the admin panel
						</p>
						<Link
							to="/admin"
							className="inline-block bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium text-white transition-colors"
						>
							Go to Admin Panel
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
