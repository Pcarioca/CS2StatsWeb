import { storage } from "./storage";

async function seed() {
  console.log("Starting database seed...");

  try {
    const devUser = await storage.upsertUser({
      id: "dev-user",
      email: "dev@example.com",
      firstName: "Dev",
      lastName: "User",
      profileImageUrl: null,
      role: "admin",
    } as any);

    const guestUser = await storage.upsertUser({
      id: "guest-user",
      email: "guest@example.com",
      firstName: "Jamie",
      lastName: "Taylor",
      profileImageUrl: null,
      role: "user",
    } as any);

    const modUser = await storage.upsertUser({
      id: "mod-user",
      email: "mod@example.com",
      firstName: "Casey",
      lastName: "Moderator",
      profileImageUrl: null,
      role: "moderator",
    } as any);

    const teams = [
      {
        key: "navi",
        data: {
          name: "Natus Vincere",
          acronym: "NAVI",
          country: "UKR",
          region: "Europe",
          rank: 1,
          wins: 45,
          losses: 12,
          logoUrl: "/uploads/teams/navi-logo.png",
        },
      },
      {
        key: "faze",
        data: {
          name: "FaZe Clan",
          acronym: "FaZe",
          country: "EUR",
          region: "Europe",
          rank: 2,
          wins: 42,
          losses: 15,
          logoUrl: "/uploads/teams/faze-logo.png",
        },
      },
      {
        key: "vitality",
        data: {
          name: "Team Vitality",
          acronym: "VIT",
          country: "FRA",
          region: "Europe",
          rank: 3,
          wins: 38,
          losses: 18,
          logoUrl: "/uploads/teams/vitality-logo.png",
        },
      },
      {
        key: "g2",
        data: {
          name: "G2 Esports",
          acronym: "G2",
          country: "EUR",
          region: "Europe",
          rank: 4,
          wins: 35,
          losses: 20,
          logoUrl: "/uploads/teams/g2-logo.png",
        },
      },
      {
        key: "liquid",
        data: {
          name: "Team Liquid",
          acronym: "TL",
          country: "USA",
          region: "North America",
          rank: 5,
          wins: 32,
          losses: 22,
          logoUrl: "/uploads/teams/liquid-logo.png",
        },
      },
      {
        key: "mouz",
        data: {
          name: "MOUZ",
          acronym: "MOUZ",
          country: "DEU",
          region: "Europe",
          rank: 6,
          wins: 30,
          losses: 23,
          logoUrl: "/uploads/teams/mouz-logo.png",
        },
      },
      {
        key: "furia",
        data: {
          name: "FURIA",
          acronym: "FUR",
          country: "BRA",
          region: "South America",
          rank: 7,
          wins: 28,
          losses: 24,
          logoUrl: "/uploads/teams/furia-logo.png",
        },
      },
      {
        key: "cloud9",
        data: {
          name: "Cloud9",
          acronym: "C9",
          country: "USA",
          region: "North America",
          rank: 8,
          wins: 27,
          losses: 25,
          logoUrl: "/uploads/teams/cloud9-logo.png",
        },
      },
    ];

    const teamMap: Record<string, { id: string; name?: string }> = {};
    for (const team of teams) {
      const created = await storage.createTeam(team.data);
      teamMap[team.key] = created;
      console.log(`Created team: ${created.name}`);
    }

    const players = [
      {
        key: "s1mple",
        teamKey: "navi",
        data: {
          alias: "s1mple",
          realName: "Oleksandr Kostyliev",
          country: "UKR",
          role: "AWPer",
          totalMatches: 150,
          totalKills: 18500,
          totalDeaths: 12000,
          totalAssists: 3500,
          averageRating: 132,
          avatarUrl: "/uploads/players/s1mple.png",
        },
      },
      {
        key: "b1t",
        teamKey: "navi",
        data: {
          alias: "b1t",
          realName: "Valerii Vakhovskyi",
          country: "UKR",
          role: "Rifler",
          totalMatches: 120,
          totalKills: 12000,
          totalDeaths: 9800,
          totalAssists: 2800,
          averageRating: 118,
          avatarUrl: "/uploads/players/b1t.png",
        },
      },
      {
        key: "karrigan",
        teamKey: "faze",
        data: {
          alias: "karrigan",
          realName: "Finn Andersen",
          country: "DNK",
          role: "IGL",
          totalMatches: 200,
          totalKills: 15000,
          totalDeaths: 14000,
          totalAssists: 4000,
          averageRating: 110,
          avatarUrl: "/uploads/players/karrigan.png",
        },
      },
      {
        key: "rain",
        teamKey: "faze",
        data: {
          alias: "rain",
          realName: "Havard Nygaard",
          country: "NOR",
          role: "Entry Fragger",
          totalMatches: 180,
          totalKills: 17000,
          totalDeaths: 15000,
          totalAssists: 3200,
          averageRating: 114,
          avatarUrl: "/uploads/players/rain.png",
        },
      },
      {
        key: "zywoo",
        teamKey: "vitality",
        data: {
          alias: "ZywOo",
          realName: "Mathieu Herbaut",
          country: "FRA",
          role: "AWPer",
          totalMatches: 180,
          totalKills: 19000,
          totalDeaths: 13000,
          totalAssists: 4200,
          averageRating: 138,
          avatarUrl: "/uploads/players/zywoo.png",
        },
      },
      {
        key: "apex",
        teamKey: "vitality",
        data: {
          alias: "apEX",
          realName: "Dan Madesclaire",
          country: "FRA",
          role: "IGL",
          totalMatches: 220,
          totalKills: 16000,
          totalDeaths: 15500,
          totalAssists: 4200,
          averageRating: 108,
          avatarUrl: "/uploads/players/apex.png",
        },
      },
      {
        key: "niko",
        teamKey: "g2",
        data: {
          alias: "NiKo",
          realName: "Nikola Kovac",
          country: "BIH",
          role: "Rifler",
          totalMatches: 190,
          totalKills: 20000,
          totalDeaths: 13000,
          totalAssists: 3500,
          averageRating: 128,
          avatarUrl: "/uploads/players/niko.png",
        },
      },
      {
        key: "m0nesy",
        teamKey: "g2",
        data: {
          alias: "m0NESY",
          realName: "Ilya Osipov",
          country: "RUS",
          role: "AWPer",
          totalMatches: 90,
          totalKills: 9000,
          totalDeaths: 6000,
          totalAssists: 1500,
          averageRating: 125,
          avatarUrl: "/uploads/players/m0nesy.png",
        },
      },
      {
        key: "yekindar",
        teamKey: "liquid",
        data: {
          alias: "YEKINDAR",
          realName: "Mareks Gailins",
          country: "LVA",
          role: "Entry Fragger",
          totalMatches: 130,
          totalKills: 14000,
          totalDeaths: 12000,
          totalAssists: 2900,
          averageRating: 116,
          avatarUrl: "/uploads/players/yekindar.png",
        },
      },
      {
        key: "naf",
        teamKey: "liquid",
        data: {
          alias: "NAF",
          realName: "Keith Markovic",
          country: "CAN",
          role: "Support",
          totalMatches: 210,
          totalKills: 17000,
          totalDeaths: 15000,
          totalAssists: 4500,
          averageRating: 112,
          avatarUrl: "/uploads/players/naf.png",
        },
      },
      {
        key: "frozen",
        teamKey: "mouz",
        data: {
          alias: "frozen",
          realName: "David Cerny",
          country: "SVK",
          role: "Rifler",
          totalMatches: 160,
          totalKills: 15000,
          totalDeaths: 12000,
          totalAssists: 3100,
          averageRating: 120,
          avatarUrl: "/uploads/players/frozen.png",
        },
      },
      {
        key: "siuhy",
        teamKey: "mouz",
        data: {
          alias: "siuhy",
          realName: "Kamil Szkaradek",
          country: "POL",
          role: "IGL",
          totalMatches: 110,
          totalKills: 9800,
          totalDeaths: 9200,
          totalAssists: 2600,
          averageRating: 109,
          avatarUrl: "/uploads/players/siuhy.png",
        },
      },
      {
        key: "kscerato",
        teamKey: "furia",
        data: {
          alias: "KSCERATO",
          realName: "Kaike Cerato",
          country: "BRA",
          role: "Rifler",
          totalMatches: 170,
          totalKills: 16500,
          totalDeaths: 14000,
          totalAssists: 3300,
          averageRating: 121,
          avatarUrl: "/uploads/players/kscerato.png",
        },
      },
      {
        key: "yuurih",
        teamKey: "furia",
        data: {
          alias: "yuurih",
          realName: "Yuri Santos",
          country: "BRA",
          role: "Support",
          totalMatches: 165,
          totalKills: 15000,
          totalDeaths: 13500,
          totalAssists: 3600,
          averageRating: 115,
          avatarUrl: "/uploads/players/yuurih.png",
        },
      },
      {
        key: "ax1le",
        teamKey: "cloud9",
        data: {
          alias: "Ax1Le",
          realName: "Sergey Rykhtorov",
          country: "RUS",
          role: "Rifler",
          totalMatches: 175,
          totalKills: 15800,
          totalDeaths: 13000,
          totalAssists: 3400,
          averageRating: 119,
          avatarUrl: "/uploads/players/ax1le.png",
        },
      },
      {
        key: "hobbit",
        teamKey: "cloud9",
        data: {
          alias: "HObbit",
          realName: "Abay Khasenov",
          country: "KAZ",
          role: "Support",
          totalMatches: 190,
          totalKills: 15200,
          totalDeaths: 13800,
          totalAssists: 3700,
          averageRating: 113,
          avatarUrl: "/uploads/players/hobbit.png",
        },
      },
    ];

    const playerMap: Record<string, { id: string; alias?: string }> = {};
    for (const player of players) {
      const team = teamMap[player.teamKey];
      const created = await storage.createPlayer({
        ...player.data,
        teamId: team.id,
      });
      playerMap[player.key] = created;
      console.log(`Created player: ${created.alias}`);
    }

    const nowMs = Date.now();
    const minutes = 60 * 1000;
    const hours = 60 * minutes;
    const days = 24 * hours;

    const matches = [
      {
        key: "live1",
        data: {
          team1Id: teamMap.navi.id,
          team2Id: teamMap.faze.id,
          status: "live" as const,
          tournament: "BLAST Premier Spring Finals 2025",
          stage: "Grand Final",
          scheduledAt: new Date(nowMs - 50 * minutes),
          startedAt: new Date(nowMs - 35 * minutes),
          team1Score: 10,
          team2Score: 8,
          currentMap: "Inferno",
          maps: ["Mirage", "Inferno", "Nuke"],
          streamLinks: [
            { platform: "Twitch", url: "https://twitch.tv/blastpremier", latency: "Low" },
          ],
        },
      },
      {
        key: "live2",
        data: {
          team1Id: teamMap.vitality.id,
          team2Id: teamMap.g2.id,
          status: "live" as const,
          tournament: "ESL Pro League Season 19",
          stage: "Semi-Final",
          scheduledAt: new Date(nowMs - 60 * minutes),
          startedAt: new Date(nowMs - 40 * minutes),
          team1Score: 7,
          team2Score: 9,
          currentMap: "Ancient",
          maps: ["Anubis", "Ancient", "Nuke"],
          streamLinks: [
            { platform: "YouTube", url: "https://youtube.com/esl", latency: "Low" },
          ],
        },
      },
      {
        key: "upcoming1",
        data: {
          team1Id: teamMap.navi.id,
          team2Id: teamMap.liquid.id,
          status: "upcoming" as const,
          tournament: "IEM Katowice 2025",
          stage: "Quarter-Final",
          scheduledAt: new Date(nowMs + 4 * hours),
          team1Score: 0,
          team2Score: 0,
          maps: ["TBD", "TBD", "TBD"],
        },
      },
      {
        key: "upcoming2",
        data: {
          team1Id: teamMap.faze.id,
          team2Id: teamMap.cloud9.id,
          status: "upcoming" as const,
          tournament: "PGL Major Copenhagen 2025",
          stage: "Group Stage",
          scheduledAt: new Date(nowMs + 2 * days),
          team1Score: 0,
          team2Score: 0,
          maps: ["TBD", "TBD", "TBD"],
        },
      },
      {
        key: "finished1",
        data: {
          team1Id: teamMap.vitality.id,
          team2Id: teamMap.mouz.id,
          status: "finished" as const,
          tournament: "BLAST Premier Spring Groups 2025",
          stage: "Group A",
          scheduledAt: new Date(nowMs - 20 * hours),
          startedAt: new Date(nowMs - 19 * hours),
          finishedAt: new Date(nowMs - 18 * hours),
          team1Score: 16,
          team2Score: 12,
          currentMap: "Mirage",
          maps: ["Mirage", "Overpass"],
        },
      },
      {
        key: "finished2",
        data: {
          team1Id: teamMap.g2.id,
          team2Id: teamMap.furia.id,
          status: "finished" as const,
          tournament: "ESL Pro League Season 19",
          stage: "Group B",
          scheduledAt: new Date(nowMs - 2 * days),
          startedAt: new Date(nowMs - 2 * days + 2 * hours),
          finishedAt: new Date(nowMs - 2 * days + 4 * hours),
          team1Score: 19,
          team2Score: 17,
          currentMap: "Nuke",
          maps: ["Nuke", "Vertigo", "Overpass"],
        },
      },
    ];

    const matchMap: Record<string, { id: string }> = {};
    for (const match of matches) {
      const created = await storage.createMatch(match.data);
      matchMap[match.key] = created;
      console.log(`Created ${created.status} match: ${created.tournament}`);
    }

    const events = [
      {
        matchKey: "live1",
        data: {
          eventType: "kill" as const,
          timestamp: new Date(nowMs - 18 * minutes),
          description: "s1mple opens the round with an AWP pick",
          playerId: playerMap.s1mple.id,
          metadata: { weapon: "AWP", round: 8, side: "CT" },
        },
      },
      {
        matchKey: "live1",
        data: {
          eventType: "bomb_plant" as const,
          timestamp: new Date(nowMs - 15 * minutes),
          description: "FaZe get the bomb down on B",
          playerId: playerMap.karrigan.id,
          metadata: { round: 9, side: "T" },
        },
      },
      {
        matchKey: "live1",
        data: {
          eventType: "clutch" as const,
          timestamp: new Date(nowMs - 12 * minutes),
          description: "rain wins a 1v2 to keep FaZe close",
          playerId: playerMap.rain.id,
          metadata: { round: 10, side: "T" },
        },
      },
      {
        matchKey: "live1",
        data: {
          eventType: "round_end" as const,
          timestamp: new Date(nowMs - 9 * minutes),
          description: "NAVI take the round off a fast mid hit",
          playerId: playerMap.b1t.id,
          metadata: { round: 11, side: "CT" },
        },
      },
    ];

    for (const event of events) {
      await storage.createMatchEvent({
        matchId: matchMap[event.matchKey].id,
        ...event.data,
      });
    }

    const stats = [
      {
        matchKey: "live1",
        playerKey: "s1mple",
        data: { kills: 19, deaths: 12, assists: 5, adr: 89, headshotPercent: 42, rating: 128, openingKills: 3 },
      },
      {
        matchKey: "live1",
        playerKey: "b1t",
        data: { kills: 15, deaths: 11, assists: 4, adr: 77, headshotPercent: 48, rating: 114, openingKills: 2 },
      },
      {
        matchKey: "live1",
        playerKey: "karrigan",
        data: { kills: 12, deaths: 14, assists: 6, adr: 65, headshotPercent: 31, rating: 98, openingKills: 1 },
      },
      {
        matchKey: "live1",
        playerKey: "rain",
        data: { kills: 17, deaths: 13, assists: 3, adr: 82, headshotPercent: 39, rating: 121, openingKills: 2 },
      },
    ];

    for (const stat of stats) {
      await storage.createMatchPlayerStats({
        matchId: matchMap[stat.matchKey].id,
        playerId: playerMap[stat.playerKey].id,
        ...stat.data,
      });
    }

    const newsArticles = [
      {
        authorId: devUser.id,
        title: "NAVI edge FaZe in a tense map one",
        subtitle: "Early highlights from the grand final",
        content: "NAVI and FaZe traded rounds early on Mirage, but NAVI close the opener 13-10 with crisp mid control and strong late-round conversions.",
        heroImageUrl: "/uploads/news/navi-faze.jpg",
        tags: ["BLAST", "NAVI", "FaZe"],
        published: true,
      },
      {
        authorId: devUser.id,
        title: "ZywOo hits peak form in playoffs",
        subtitle: "Vitality's star continues to dominate",
        content: "ZywOo posted a 1.45 rating across the group stage and opened the semi-final with a 27-bomb. Vitality look poised for a deep run.",
        heroImageUrl: "/uploads/news/zywoo-form.jpg",
        tags: ["ESL", "Vitality", "Players"],
        published: true,
      },
      {
        authorId: devUser.id,
        title: "IEM Katowice 2025 preview",
        subtitle: "A quick look at the bracket and favorites",
        content: "Katowice is around the corner. NAVI, G2, and Vitality top the early predictions, with Liquid and MOUZ looking like strong dark horses.",
        heroImageUrl: "/uploads/news/katowice-preview.jpg",
        tags: ["IEM", "Preview"],
        published: true,
      },
    ];

    for (const article of newsArticles) {
      const created = await storage.createNewsArticle(article);
      console.log(`Created news article: ${created.title}`);
    }

    const comments = [
      {
        userId: guestUser.id,
        matchKey: "live1",
        content: "Great tempo from NAVI so far.",
      },
      {
        userId: devUser.id,
        matchKey: "live1",
        content: "FaZe needs a timeout to reset.",
      },
      {
        userId: guestUser.id,
        matchKey: "finished1",
        content: "Check out my stream for picks and tips.",
      },
    ];

    const createdComments = [];
    for (const comment of comments) {
      const created = await storage.createComment({
        userId: comment.userId,
        matchId: matchMap[comment.matchKey].id,
        content: comment.content,
      });
      createdComments.push(created);
    }

    if (createdComments[2]) {
      await storage.createCommentFlag({
        commentId: createdComments[2].id,
        userId: modUser.id,
        reason: "spam",
        additionalInfo: "Repeated promo text in multiple threads.",
      });
    }

    await storage.createUserFavorite({
      userId: devUser.id,
      teamId: teamMap.navi.id,
    });

    await storage.createUserFavorite({
      userId: devUser.id,
      playerId: playerMap.s1mple.id,
    });

    await storage.createNotification({
      userId: devUser.id,
      type: "match_start",
      title: "Match is live",
      message: "NAVI vs FaZe is now live.",
      link: `/matches/${matchMap.live1.id}`,
      read: false,
    });

    await storage.createNotification({
      userId: devUser.id,
      type: "comment_reply",
      title: "New reply",
      message: "Someone replied to your match comment.",
      link: `/matches/${matchMap.live2.id}`,
      read: false,
    });

    await storage.upsertUserSettings({
      userId: devUser.id,
      theme: "dark",
      emailNotifications: true,
      pushNotifications: true,
      matchStartAlerts: true,
    });

    console.log("OK. Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("Seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
