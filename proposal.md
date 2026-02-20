Project Name: Facial Expression Control Game and Leaderboard

Team Members:

- Runze Wang
- Aniket Nandi

Description:

A web platform that serves a Flappy Bird-style game controlled by facial expressions using an open-source deep learning model packaged as WebAssembly. Players use their webcam to control the game character through facial movements instead of keyboard input. The platform features user accounts, a global leaderboard to track high scores, and user profiles with customizable avatars. Inspired by https://flappybird.io/ and built upon the existing prototype at https://driedyellowpeach.github.io/cs5610-web-dev/project-1-home-page/work.html.

User Personas:

1. Casual Gamer Leo
   A college student looking for a fun, quick distraction between classes. He enjoys novel game mechanics and wants to compete with friends on the leaderboard. He values an easy-to-use interface and instant gameplay without needing to install anything.
2. Accessibility Enthusiast Maria
   A UX researcher interested in alternative input methods for games. She wants to explore how facial expression controls can make gaming more inclusive and engaging. She enjoys tracking her improvement over time and comparing scores with other players.

User Stories:

- As a user, I need to register and log in with email validation, so I can have a persistent account and track my scores.
- As a user, I need to play the facial-expression-controlled game directly in the browser, so I can enjoy the game without installing anything.
- As a user, I need to see my score submitted to the leaderboard after each game, so I can track my performance.
- As a user, I need to view a global leaderboard with top scores, so I can see how I rank against other players.
- As a user, I need to set and update my profile avatar, so I can personalize my account.
- As a user, I need to view other players' profiles, so I can see their stats and avatars.

Core Features:

- User authentication (registration/login with JWT and email validation)
- Facial-expression-controlled game served via WebAssembly
- Global leaderboard with score submission and ranking
- User profile page with customizable avatar
- API for leaderboard score upload and retrieval
- API for user profile and avatar management

Technical Stack:

- Backend: Node.js, Express.js, MongoDB native driver (no Mongoose)
- Frontend: Vanilla ES6 JavaScript (no frameworks), HTML5, CSS3, WebAssembly
- Authentication: JWT (jsonwebtoken) with email validation
- Deployment: Docker Compose

Work Distribution:

- Runze Wang: Game page (serving the WebAssembly game, score submission, game-related backend APIs)
- Aniket Nandi: Leaderboard page, user profile page, and related backend APIs
