/**
 * Main App Component with Routing
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MatchList } from "./pages/MatchList";
import { MatchDetail } from "./pages/MatchDetail";
import { Admin } from "./pages/Admin";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<MatchList />} />
				<Route path="/matches/:id" element={<MatchDetail />} />
				<Route path="/admin" element={<Admin />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
