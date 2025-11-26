/**
 * Match Card Component - Displays a match summary
 */

import { Match } from "../types";
import { Link } from "react-router-dom";

interface MatchCardProps {
	match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
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
		<div className="bg-white shadow-md hover:shadow-lg border border-gray-200 rounded-lg overflow-hidden transition-shadow">
			{/* Status Badge */}
			<div
				className={`px-4 py-2 text-sm font-semibold ${
					statusColors[match.status]
				}`}
			>
				{statusLabels[match.status]}
			</div>

			{/* Match Details */}
			<div className="p-6">
				<div className="flex justify-between items-center mb-4">
					<div className="flex-1 text-right">
						<h3 className="font-bold text-gray-800 text-xl">
							{match.teamA}
						</h3>
					</div>

					<div className="px-6">
						<div className="font-bold text-gray-900 text-3xl">
							{match.score.a} : {match.score.b}
						</div>
					</div>

					<div className="flex-1 text-left">
						<h3 className="font-bold text-gray-800 text-xl">
							{match.teamB}
						</h3>
					</div>
				</div>

				{/* View Details Button */}
				<Link
					to={`/matches/${match.id}`}
					className="block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded w-full font-medium text-white text-center transition-colors"
				>
					View Details
				</Link>
			</div>
		</div>
	);
}
