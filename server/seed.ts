import { storage } from "./storage";

async function seed() {
  console.log("Starting database seed...");

  try {
    // Create Teams
    const teams = [
      {
        name: "Natus Vincere",
        acronym: "NAVI",
        country: "UKR",
        region: "Europe",
        rank: 1,
        wins: 45,
        losses: 12,
        logoUrl: "/uploads/teams/navi-logo.png",
      },
      {
        name: "FaZe Clan",
        acronym: "FaZe",
        country: "EUR",
        region: "Europe",
        rank: 2,
        wins: 42,
        losses: 15,
        logoUrl: "/uploads/teams/faze-logo.png",
      },
      {
        name: "Team Vitality",
        acronym: "VIT",
        country: "FRA",
        region: "Europe",
        rank: 3,
        wins: 38,
        losses: 18,
        logoUrl: "/uploads/teams/vitality-logo.png",
      },
      {
        name: "G2 Esports",
        acronym: "G2",
        country: "EUR",
        region: "Europe",
        rank: 4,
        wins: 35,
        losses: 20,
        logoUrl: "/uploads/teams/g2-logo.png",
      },
      {
        name: "Team Liquid",
        acronym: "TL",
        country: "USA",
        region: "North America",
        rank: 5,
        wins: 32,
        losses: 22,
        logoUrl: "/uploads/teams/liquid-logo.png",
      },
    ];

    const createdTeams = [];
    for (const team of teams) {
      const created = await storage.createTeam(team);
      createdTeams.push(created);
      console.log(`Created team: ${created.name}`);
    }

    // Create Players
    const players = [
      // NAVI players
      {
        teamId: createdTeams[0].id,
        alias: "s1mple",
        realName: "Oleksandr Kostyliev",
        country: "UKR",
        role: "AWPer",
        totalMatches: 150,
        totalKills: 18500,
        totalDeaths: 12000,
        totalAssists: 3500,
        averageRating: 132,
      },
      {
        teamId: createdTeams[0].id,
        alias: "b1t",
        realName: "Valerii Vakhovskyi",
        country: "UKR",
        role: "Rifler",
        totalMatches: 120,
        totalKills: 12000,
        totalDeaths: 10000,
        totalAssists: 2800,
        averageRating: 118,
      },
      // FaZe players
      {
        teamId: createdTeams[1].id,
        alias: "karrigan",
        realName: "Finn Andersen",
        country: "DNK",
        role: "IGL",
        totalMatches: 200,
        totalKills: 15000,
        totalDeaths: 14000,
        totalAssists: 4000,
        averageRating: 110,
      },
      {
        teamId: createdTeams[1].id,
        alias: "rain",
        realName: "Håvard Nygaard",
        country: "NOR",
        role: "Entry Fragger",
        totalMatches: 180,
        totalKills: 17000,
        totalDeaths: 15000,
        totalAssists: 3200,
        averageRating: 115,
      },
      // Vitality players
      {
        teamId: createdTeams[2].id,
        alias: "ZywOo",
        realName: "Mathieu Herbaut",
        country: "FRA",
        role: "AWPer",
        totalMatches: 140,
        totalKills: 19000,
        totalDeaths: 11000,
        totalAssists: 3000,
        averageRating: 135,
      },
      {
        teamId: createdTeams[2].id,
        alias: "apEX",
        realName: "Dan Madesclaire",
        country: "FRA",
        role: "IGL",
        totalMatches: 220,
        totalKills: 16000,
        totalDeaths: 15500,
        totalAssists: 4200,
        averageRating: 108,
      },
      // G2 players
      {
        teamId: createdTeams[3].id,
        alias: "NiKo",
        realName: "Nikola Kovač",
        country: "BIH",
        role: "Rifler",
        totalMatches: 190,
        totalKills: 20000,
        totalDeaths: 13000,
        totalAssists: 3500,
        averageRating: 128,
      },
      {
        teamId: createdTeams[3].id,
        alias: "m0NESY",
        realName: "Ilya Osipov",
        country: "RUS",
        role: "AWPer",
        totalMatches: 80,
        totalKills: 9000,
        totalDeaths: 6000,
        totalAssists: 1500,
        averageRating: 125,
      },
      // Liquid players
      {
        teamId: createdTeams[4].id,
        alias: "YEKINDAR",
        realName: "Mareks Gaļinskis",
        country: "LVA",
        role: "Entry Fragger",
        totalMatches: 130,
        totalKills: 14000,
        totalDeaths: 12000,
        totalAssists: 2900,
        averageRating: 116,
      },
      {
        teamId: createdTeams[4].id,
        alias: "NAF",
        realName: "Keith Markovic",
        country: "CAN",
        role: "Support",
        totalMatches: 210,
        totalKills: 17000,
        totalDeaths: 15000,
        totalAssists: 4500,
        averageRating: 112,
      },
    ];

    const createdPlayers = [];
    for (const player of players) {
      const created = await storage.createPlayer(player);
      createdPlayers.push(created);
      console.log(`Created player: ${created.alias}`);
    }

    // Create Matches
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const matches = [
      {
        team1Id: createdTeams[0].id, // NAVI
        team2Id: createdTeams[1].id, // FaZe
        status: "live" as const,
        tournament: "BLAST Premier Spring Finals 2025",
        stage: "Grand Final",
        scheduledAt: now,
        startedAt: now,
        team1Score: 13,
        team2Score: 11,
        currentMap: "Dust II",
        maps: ["Mirage", "Dust II", "Inferno"],
        streamLinks: [
          { platform: "Twitch", url: "https://twitch.tv/blast", latency: "low" },
        ],
      },
      {
        team1Id: createdTeams[2].id, // Vitality
        team2Id: createdTeams[3].id, // G2
        status: "live" as const,
        tournament: "ESL Pro League Season 19",
        stage: "Semi-Final",
        scheduledAt: now,
        startedAt: now,
        team1Score: 9,
        team2Score: 7,
        currentMap: "Ancient",
        maps: ["Anubis", "Ancient", "Nuke"],
        streamLinks: [
          { platform: "YouTube", url: "https://youtube.com/esl", latency: "low" },
        ],
      },
      {
        team1Id: createdTeams[0].id, // NAVI
        team2Id: createdTeams[4].id, // Liquid
        status: "upcoming" as const,
        tournament: "IEM Katowice 2025",
        stage: "Quarter-Final",
        scheduledAt: tomorrow,
        team1Score: 0,
        team2Score: 0,
        maps: ["TBD", "TBD", "TBD"],
      },
      {
        team1Id: createdTeams[1].id, // FaZe
        team2Id: createdTeams[3].id, // G2
        status: "upcoming" as const,
        tournament: "PGL Major Copenhagen 2025",
        stage: "Group Stage",
        scheduledAt: nextWeek,
        team1Score: 0,
        team2Score: 0,
        maps: ["TBD", "TBD", "TBD"],
      },
      {
        team1Id: createdTeams[2].id, // Vitality
        team2Id: createdTeams[4].id, // Liquid
        status: "finished" as const,
        tournament: "BLAST Premier Spring Groups 2025",
        stage: "Group A",
        scheduledAt: yesterday,
        startedAt: yesterday,
        finishedAt: yesterday,
        team1Score: 16,
        team2Score: 12,
        currentMap: "Inferno",
        maps: ["Mirage", "Inferno"],
      },
      {
        team1Id: createdTeams[0].id, // NAVI
        team2Id: createdTeams[3].id, // G2
        status: "finished" as const,
        tournament: "ESL Pro League Season 19",
        stage: "Group B",
        scheduledAt: yesterday,
        startedAt: yesterday,
        finishedAt: yesterday,
        team1Score: 19,
        team2Score: 17,
        currentMap: "Nuke",
        maps: ["Nuke", "Vertigo", "Overpass"],
      },
    ];

    for (const match of matches) {
      const created = await storage.createMatch(match);
      console.log(`Created ${created.status} match: ${created.tournament}`);
    }

    // Create News Articles
    const newsArticles = [
      {
        authorId: null as any,
        title: "NAVI Wins BLAST Premier Spring Finals 2025",
        subtitle: "Dominant performance secures first title of the year",
        content: "Natus Vincere has claimed victory at the BLAST Premier Spring Finals 2025, defeating FaZe Clan 3-1 in the grand final. The Ukrainian squad showcased exceptional form throughout the tournament, with s1mple delivering a masterclass performance across all maps. This marks NAVI's first major trophy of 2025 and cements their position as one of the top contenders for the upcoming PGL Major.",
        heroImageUrl: "/uploads/news/navi-wins.jpg",
        tags: ["BLAST", "NAVI", "Tournament"],
        published: true,
      },
      {
        authorId: null as any,
        title: "ZywOo Breaks Kill Record in ESL Pro League",
        subtitle: "Vitality star sets new benchmark with incredible performance",
        content: "Team Vitality's star AWPer ZywOo has broken the all-time kill record in ESL Pro League history, surpassing the previous record set in Season 15. The French prodigy achieved this milestone during Vitality's dominant run through Group A, averaging an incredible 1.45 rating across all matches. His performance has sparked debates about whether he's currently the best player in the world.",
        heroImageUrl: "/uploads/news/zywoo-record.jpg",
        tags: ["ESL", "Vitality", "Records"],
        published: true,
      },
      {
        authorId: null as any,
        title: "IEM Katowice 2025 Preview: Top Teams to Watch",
        subtitle: "Analysis of favorites heading into Poland's biggest CS2 event",
        content: "IEM Katowice 2025 is set to begin next week, featuring 24 of the world's best Counter-Strike 2 teams competing for a $1,000,000 prize pool. Our analysis breaks down the top contenders including NAVI, FaZe Clan, and Vitality, examining their recent form, map pools, and potential bracket runs. Don't miss this comprehensive preview of one of the year's most anticipated tournaments.",
        heroImageUrl: "/uploads/news/iem-preview.jpg",
        tags: ["IEM", "Preview", "Analysis"],
        published: true,
      },
    ];

    for (const article of newsArticles) {
      const created = await storage.createNewsArticle(article);
      console.log(`Created news article: ${created.title}`);
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

export { seed };

// Run seed if this file is executed directly
seed()
  .then(() => {
    console.log("Seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
