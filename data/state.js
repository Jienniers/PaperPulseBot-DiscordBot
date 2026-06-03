// 📦 state.js
// This file stores globally shared runtime variables (e.g., maps and arrays)
// used across different modules in the bot to maintain session states and data consistency.

// 📦 STATE (Blueprint - NOT real runtime data)
// state = {
//   guilds: {
//     [guildId]: {
//       sessions: {
//         [channelId]: {
//           examinerId: string,
//           categoryId: string,
//           paperTimeMins: number,
//           status: false,
//
//           candidates: {
//             [userId]: {
//               marks: number,
//               submittedAt: Date | null
//             }
//           }
//         }
//       }
//     }
//   }
// }

export const state = {
  guilds: {}
};