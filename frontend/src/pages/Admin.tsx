/**
 * Admin Page - Create matches, start matches, and seed data
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Match } from "../types";
import { api } from "../lib/api";

export function Admin() {
	const [matches, setMatches] = useState<Match[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// Form state for creating custom match
	const [teamA, setTeamA] = useState("");
	const [teamB, setTeamB] = useState("");
	const [creating, setCreating] = useState(false);

	useEffect(() => {
		loadMatches();
	}, []);

	const loadMatches = async () => {
		try {
			setLoading(true);
			const data = await api.getMatches();
			setMatches(data);
			setError(null);
		} catch (err) {
			setError("Failed to load matches");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateMatch = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!teamA.trim() || !teamB.trim()) {
			setError("Both team names are required");
			return;
		}

		try {
			setCreating(true);
			setError(null);
			const newMatch = await api.createMatch(teamA.trim(), teamB.trim());
			setSuccess(`Match created: ${newMatch.teamA} vs ${newMatch.teamB}`);
			setTeamA("");
			setTeamB("");
			await loadMatches();

			// Clear success message after 3 seconds
			setTimeout(() => setSuccess(null), 3000);
		} catch (err) {
			setError("Failed to create match");
			console.error(err);
		} finally {
			setCreating(false);
		}
	};

	const handleStartMatch = async (matchId: string) => {
		try {
			setError(null);
			await api.startMatch(matchId);
			setSuccess("Match started successfully!");
			await loadMatches();

			setTimeout(() => setSuccess(null), 3000);
		} catch (err: any) {
			setError(err.message || "Failed to start match");
			console.error(err);
		}
	};

	const handleSeedMatches = async () => {
		try {
			setLoading(true);
			setError(null);
			const seeded = await api.seedMatches();
			setSuccess(`Successfully seeded ${seeded.length} sample matches!`);
			await loadMatches();

			setTimeout(() => setSuccess(null), 3000);
		} catch (err) {
			setError("Failed to seed matches");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const idleMatches = matches.filter((m) => m.status === "idle");
	const liveMatches = matches.filter((m) => m.status === "live");
	const endedMatches = matches.filter((m) => m.status === "ended");

	return (
		<div className="bg-gray-50 min-h-screen">
			<div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
				{/* Header */}
				<div className="mb-8">
					<Link
						to="/"
						className="inline-flex items-center mb-4 text-blue-600 hover:underline"
					>
						← Back to matches
					</Link>
					<h1 className="mb-2 font-bold text-gray-900 text-4xl">
						⚙️ Admin Panel
					</h1>
					<p className="text-gray-600">
						Create matches, start simulations, and manage data
					</p>
				</div>

				{/* Success/Error Messages */}
				{success && (
					<div className="bg-green-100 mb-6 p-4 border border-green-400 rounded text-green-700">
						✓ {success}
					</div>
				)}
				{error && (
					<div className="bg-red-100 mb-6 p-4 border border-red-400 rounded text-red-700">
						✗ {error}
					</div>
				)}

				<div className="gap-6 grid grid-cols-1 lg:grid-cols-2 mb-8">
					{/* Create Custom Match */}
					<div className="bg-white shadow-md p-6 border border-gray-200 rounded-lg">
						<h2 className="mb-4 font-bold text-gray-900 text-2xl">
							Create Custom Match
						</h2>
						<form onSubmit={handleCreateMatch}>
							<div className="mb-4">
								<label
									htmlFor="teamA"
									className="block mb-2 font-medium text-gray-700 text-sm"
								>
									Team A
								</label>
								<input
									type="text"
									id="teamA"
									value={teamA}
									onChange={(e) => setTeamA(e.target.value)}
									placeholder="e.g., Arsenal"
									className="px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
									disabled={creating}
								/>
							</div>
							<div className="mb-4">
								<label
									htmlFor="teamB"
									className="block mb-2 font-medium text-gray-700 text-sm"
								>
									Team B
								</label>
								<input
									type="text"
									id="teamB"
									value={teamB}
									onChange={(e) => setTeamB(e.target.value)}
									placeholder="e.g., Chelsea"
									className="px-4 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
									disabled={creating}
								/>
							</div>
							<button
								type="submit"
								disabled={creating}
								className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-3 rounded-lg w-full font-medium text-white transition-colors disabled:cursor-not-allowed"
							>
								{creating ? "Creating..." : "Create Match"}
							</button>
						</form>
					</div>

					{/* Quick Actions */}
					<div className="bg-white shadow-md p-6 border border-gray-200 rounded-lg">
						<h2 className="mb-4 font-bold text-gray-900 text-2xl">
							Quick Actions
						</h2>
						<div className="space-y-3">
							<button
								onClick={handleSeedMatches}
								disabled={loading}
								className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-3 rounded-lg w-full font-medium text-white transition-colors disabled:cursor-not-allowed"
							>
								{loading
									? "Seeding..."
									: "🌱 Seed Sample Matches"}
							</button>
							<p className="text-gray-600 text-sm">
								Creates 5 sample matches: Man United vs
								Liverpool, Real Madrid vs Barcelona, Bayern vs
								Dortmund, PSG vs Marseille, Juventus vs AC Milan
							</p>

							<button
								onClick={loadMatches}
								disabled={loading}
								className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 px-4 py-3 rounded-lg w-full font-medium text-white transition-colors disabled:cursor-not-allowed"
							>
								{loading
									? "Refreshing..."
									: "🔄 Refresh Match List"}
							</button>
						</div>
					</div>
				</div>

				{/* Match Management */}
				<div className="bg-white shadow-md p-6 border border-gray-200 rounded-lg">
					<h2 className="mb-4 font-bold text-gray-900 text-2xl">
						Match Management
					</h2>

					{loading && matches.length === 0 ? (
						<div className="py-8 text-gray-600 text-center">
							Loading matches...
						</div>
					) : matches.length === 0 ? (
						<div className="py-8 text-gray-600 text-center">
							No matches available. Create one above or seed
							sample matches.
						</div>
					) : (
						<div className="space-y-6">
							{/* Idle Matches - Ready to Start */}
							{idleMatches.length > 0 && (
								<div>
									<h3 className="mb-3 font-semibold text-gray-700 text-lg">
										Ready to Start ({idleMatches.length})
									</h3>
									<div className="space-y-2">
										{idleMatches.map((match) => (
											<div
												key={match.id}
												className="flex justify-between items-center bg-gray-50 p-4 border border-gray-200 rounded-lg"
											>
												<div className="flex-1">
													<div className="font-semibold text-gray-900">
														{match.teamA} vs{" "}
														{match.teamB}
													</div>
													<div className="text-gray-500 text-sm">
														Score: {match.score.a} -{" "}
														{match.score.b} •
														Status: Not Started
													</div>
												</div>
												<button
													onClick={() =>
														handleStartMatch(
															match.id
														)
													}
													className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium text-white transition-colors"
												>
													▶ Start Match
												</button>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Live Matches */}
							{liveMatches.length > 0 && (
								<div>
									<h3 className="flex items-center mb-3 font-semibold text-gray-700 text-lg">
										<span className="inline-block bg-red-500 mr-2 rounded-full w-3 h-3 animate-pulse"></span>
										Live Now ({liveMatches.length})
									</h3>
									<div className="space-y-2">
										{liveMatches.map((match) => (
											<div
												key={match.id}
												className="flex justify-between items-center bg-green-50 p-4 border border-green-300 rounded-lg"
											>
												<div className="flex-1">
													<div className="font-semibold text-gray-900">
														{match.teamA} vs{" "}
														{match.teamB}
													</div>
													<div className="text-gray-600 text-sm">
														Score: {match.score.a} -{" "}
														{match.score.b} • 🔴
														LIVE
													</div>
												</div>
												<Link
													to={`/matches/${match.id}`}
													className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white transition-colors"
												>
													Watch Live
												</Link>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Ended Matches */}
							{endedMatches.length > 0 && (
								<div>
									<h3 className="mb-3 font-semibold text-gray-700 text-lg">
										Ended ({endedMatches.length})
									</h3>
									<div className="space-y-2">
										{endedMatches.map((match) => (
											<div
												key={match.id}
												className="flex justify-between items-center bg-blue-50 p-4 border border-blue-200 rounded-lg"
											>
												<div className="flex-1">
													<div className="font-semibold text-gray-900">
														{match.teamA} vs{" "}
														{match.teamB}
													</div>
													<div className="text-gray-600 text-sm">
														Final Score:{" "}
														{match.score.a} -{" "}
														{match.score.b}
													</div>
												</div>
												<Link
													to={`/matches/${match.id}`}
													className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-medium text-white transition-colors"
												>
													View Details
												</Link>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
