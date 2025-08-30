🌦️ Weather Agent Chat Interface

A simple React + Tailwind chat interface that allows users to interact with a weather agent.
Built as part of the assignment to demonstrate UI, API integration, and advanced chat features.

Deployed On Vercel - https://weather-chat-agent-interface-git-main-ajits-projects-d05baf59.vercel.app/ 

🚀 Features

✅ Chat UI with user/agent messages (auto-scroll).

✅ API integration with the provided Weather Agent endpoint.

✅ Message timestamps + delivery status (Sending → Sent → Delivered).

✅ Dark/Light mode toggle 🌙☀️.

✅ Message search (live highlight).

✅ Sound notifications 🔔 on send/receive.

✅ Export chat history 📄.


🛠️ Tech Stack

React (Vite) for frontend.

TailwindCSS for styling.

HTML5 Audio API for notifications.

📦 Setup Instructions

Clone the repo

git clone https://github.com/Ajitkhetal29/weather-chat-agent-interface
cd weather-chat


Install dependencies

npm install


Configure environment
Create a .env file in the project root:

VITE_API_URL=https://millions-screeching-vultur.mastra.cloud/api/agents/weatherAgent/stream


Run locally

npm run dev


