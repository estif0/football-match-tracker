/**
 * Match List Page - Shows all matches in a table format with real-time updates
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Match, MatchEvent } from "../types";
import { api } from "../lib/api";

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

	const getStatusBadge = (status: Match["status"]) => {
		switch (status) {
			case "live":
				return (
					<span className="inline-flex items-center bg-red-100 px-2.5 py-0.5 rounded-full font-semibold text-red-800 text-xs">
						<span className="bg-red-500 mr-1.5 rounded-full w-2 h-2 animate-pulse"></span>
						LIVE
					</span>
				);
			case "idle":
				return (
					<span className="inline-flex items-center bg-gray-100 px-2.5 py-0.5 rounded-full font-semibold text-gray-800 text-xs">
						Scheduled
					</span>
				);
			case "ended":
				return (
					<span className="inline-flex items-center bg-blue-100 px-2.5 py-0.5 rounded-full font-semibold text-blue-800 text-xs">
						FT
					</span>
				);
		}
	};

	const MatchRow = ({ match }: { match: Match }) => (
		<tr
			className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
				match.status === "live" ? "bg-green-50" : ""
			}`}
		>
			{/* Status */}
			<td className="px-6 py-4 whitespace-nowrap">
				{getStatusBadge(match.status)}
			</td>

			{/* Home Team */}
			<td className="px-6 py-4 text-right">
				<div className="font-semibold text-gray-900">{match.teamA}</div>
			</td>

			{/* Score */}
			<td className="px-6 py-4 text-center">
				<Link
					to={`/matches/${match.id}`}
					className="group inline-flex items-center hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
				>
					<span
						className={`text-2xl font-bold ${
							match.status === "live"
								? "text-red-600"
								: "text-gray-900"
						}`}
					>
						{match.score.a}
					</span>
					<span className="mx-3 text-gray-400 text-xl">-</span>
					<span
						className={`text-2xl font-bold ${
							match.status === "live"
								? "text-red-600"
								: "text-gray-900"
						}`}
					>
						{match.score.b}
					</span>
					<svg
						className="ml-2 w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</Link>
			</td>

			{/* Away Team */}
			<td className="px-6 py-4 text-left">
				<div className="font-semibold text-gray-900">{match.teamB}</div>
			</td>

			{/* Actions */}
			<td className="px-6 py-4 text-right whitespace-nowrap">
				<Link
					to={`/matches/${match.id}`}
					className="font-medium text-blue-600 hover:text-blue-800 text-sm"
				>
					View Details
				</Link>
			</td>
		</tr>
	);

	return (
		<div className="bg-gray-50 min-h-screen">
			<div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
				{/* Header */}
				<div className="flex justify-between items-start mb-8">
					<div>
						<h1 className="mb-2 font-bold text-gray-900 text-4xl">
							⚽ Football Scores
						</h1>
						<p className="text-gray-600">
							Live match updates • Real-time scores
						</p>
					</div>
					<Link
						to="/admin"
						className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium text-white transition-colors"
					>
						⚙️ Admin Panel
					</Link>
				</div>

				{/* Live Matches Table */}
				{liveMatches.length > 0 && (
					<div className="mb-8">
						<div className="bg-white shadow-md border border-gray-200 rounded-lg overflow-hidden">
							<div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4">
								<h2 className="flex items-center font-bold text-white text-xl">
									<span className="inline-block bg-white mr-2 rounded-full w-2.5 h-2.5 animate-pulse"></span>
									Live Now
								</h2>
							</div>
							<div className="overflow-x-auto">
								<table className="divide-y divide-gray-200 min-w-full">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
												Status
											</th>
											<th className="px-6 py-3 font-medium text-gray-500 text-xs text-right uppercase tracking-wider">
												Home
											</th>
											<th className="px-6 py-3 font-medium text-gray-500 text-xs text-center uppercase tracking-wider">
												Score
											</th>
											<th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
												Away
											</th>
											<th className="px-6 py-3 font-medium text-gray-500 text-xs text-right uppercase tracking-wider">
												Details
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{liveMatches.map((match) => (
											<MatchRow
												key={match.id}
												match={match}
											/>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				)}

				{/* Upcoming Matches Table */}
				{upcomingMatches.length > 0 && (
					<div className="mb-8">
						<div className="bg-white shadow-md border border-gray-200 rounded-lg overflow-hidden">
							<div className="bg-gray-700 px-6 py-4">
								<h2 className="font-bold text-white text-xl">
									Scheduled Matches
								</h2>
							</div>
							<div className="overflow-x-auto">
								<table className="divide-y divide-gray-200 min-w-full">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
												Status
											</th>
											<th className="px-6 py-3 font-medium text-gray-500 text-xs text-right uppercase tracking-wider">
												Home
											</th>
											<th className="px-6 py-3 font-medium text-gray-500 text-xs text-center uppercase tracking-wider">
												Score
											</th>
											<th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
												Away
											</th>
											<th className="px-6 py-3 font-medium text-gray-500 text-xs text-right uppercase tracking-wider">
												Details
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{upcomingMatches.map((match) => (
											<MatchRow
												key={match.id}
												match={match}
											/>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				)}

				{/* Ended Matches Table */}
				{endedMatches.length > 0 && (
					<div className="mb-8">
						<div className="bg-white shadow-md border border-gray-200 rounded-lg overflow-hidden">
							<div className="bg-blue-700 px-6 py-4">
								<h2 className="font-bold text-white text-xl">
									Finished Matches
								</h2>
							</div>
							<div className="overflow-x-auto">
								<table className="divide-y divide-gray-200 min-w-full">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
												Status
											</th>
											<th className="px-6 py-3 font-medium text-gray-500 text-xs text-right uppercase tracking-wider">
												Home
											</th>
											<th className="px-6 py-3 font-medium text-gray-500 text-xs text-center uppercase tracking-wider">
												Score
											</th>
											<th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
												Away
											</th>
											<th className="px-6 py-3 font-medium text-gray-500 text-xs text-right uppercase tracking-wider">
												Details
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{endedMatches.map((match) => (
											<MatchRow
												key={match.id}
												match={match}
											/>
										))}
									</tbody>
								</table>
							</div>
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
					</div>
				)}
			</div>
		</div>
	);
}
