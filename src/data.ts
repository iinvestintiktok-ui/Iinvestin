/**
 * Legacy static mock data — kept as reference for the Convex mockape seed
 * (`convex/lib/mockSeedData.ts`). The app reads from Convex at runtime.
 */
import type { Creator, Investor, Investment, Sponsor, KpiData, LeaderboardPeriod } from './types';

export const creators: Creator[] = [
  {
    id: 'c1',
    pseudo: '@lolatradingroblox',
    avatar: 'https://p16-common-sign.tiktokcdn-us.com/tos-maliva-avt-0068/7397811f273517cdd8b0a833e1a47e5d~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=9640&refresh_token=67cb5ef3&x-expires=1790593200&x-signature=AgNISnhe19%2Bh376opx5g%2B5ik3Qs%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8',
    followers: 12400,
    tiktokUrl: 'https://www.tiktok.com/@lolatradingroblox',
    bio: 'SVT · physique-chimie · lycée',
    joinedAt: '2024-08-14',
  },
  {
    id: 'c2',
    pseudo: '@code.kawaii',
    avatar: 'https://p16-common-sign.tiktokcdn-us.com/tos-maliva-avt-0068/1bcd9203db59e5b941bb5b368803d957~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=9640&refresh_token=fe46bab0&x-expires=1790593200&x-signature=WfsnVY18ClnHUHr2dphmCy1R8nc%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8',
    followers: 3200,
    tiktokUrl: 'https://www.tiktok.com/@code.kawaii',
    bio: 'Game dev · Python · web scraping',
    joinedAt: '2025-01-22',
  },
  {
    id: 'c3',
    pseudo: '@drbeber',
    avatar: 'https://p16-common-sign.tiktokcdn-us.com/tos-maliva-avt-0068/42e72a1f5f8b6da01e8110aa865b2c89~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=9640&refresh_token=9bd6d570&x-expires=1790593200&x-signature=%2BWTk%2Be%2FBxeov0WRkQCe6DZinXvg%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast5',
    followers: 89000,
    tiktokUrl: 'https://www.tiktok.com/@drbeber',
    bio: 'Gaming · jeux vidéo · TikTok',
    joinedAt: '2024-03-09',
  },
  {
    id: 'c4',
    pseudo: '@tony.pascal98',
    avatar: 'https://p16-common-sign.tiktokcdn-us.com/tos-maliva-avt-0068/4c58fd51872ef584f723414187bee5c0~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=9640&refresh_token=4bf1a446&x-expires=1790593200&x-signature=kosV%2BaxbONt%2BQQaIha1J0%2F3DhQk%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast5',
    followers: 45000,
    tiktokUrl: 'https://www.tiktok.com/@tony.pascal98',
    bio: 'Comics · créateur · humour',
    joinedAt: '2024-11-30',
  },
  {
    id: 'c5',
    pseudo: '@yuwu.liu',
    avatar: 'https://p16-common-sign.tiktokcdn-us.com/tos-useast8-avt-0068-tx2/f8ce3ab18b7cf720d2f1957dc4eb01c3~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=9640&refresh_token=a6b1e20e&x-expires=1790593200&x-signature=kkkin3l1Ahe%2BWOc9WZtUBIEAyco%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast5',
    followers: 156000,
    tiktokUrl: 'https://www.tiktok.com/@yuwu.liu',
    bio: 'Naruto · edits · anime',
    joinedAt: '2023-12-05',
  },
  {
    id: 'c6',
    pseudo: '@blade_iris',
    avatar: 'https://p19-common-sign.tiktokcdn-us.com/tos-useast5-avt-0068-tx/1fbb5dd72e630ab5581494bc75c5df5f~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=9640&refresh_token=bc3ef3e4&x-expires=1790593200&x-signature=3VU6dKZmMYL%2FlW4KZ6V1xdbFkkg%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8',
    followers: 210000,
    tiktokUrl: 'https://www.tiktok.com/@blade_iris',
    bio: 'Minecraft · mods · DevBlade',
    joinedAt: '2024-06-18',
  },
  {
    id: 'c7',
    pseudo: '@im_eg2',
    avatar: 'https://p16-common-sign.tiktokcdn-us.com/tos-alisg-avt-0068/273c9e741d54502efb2546a5e8b89523~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=9640&refresh_token=0052b1e2&x-expires=1790593200&x-signature=%2F7wRairPne%2FdQDG1%2BobrV%2FUBcYA%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8',
    followers: 78000,
    tiktokUrl: 'https://www.tiktok.com/@im_eg2',
    bio: 'Edits · viral · for you',
    joinedAt: '2025-02-11',
  },
];

const mockTikTokVideos = [
  {
    creatorId: 'c1',
    tiktokUrl: 'https://www.tiktok.com/@lolatradingroblox/video/7688121718967225622',
    thumbnail: 'https://p19-common-sign.tiktokcdn-us.com/tos-no1a-p-0037-no/owbIghsEfbLsF9qq9FbaEHEKxDtgflAuRBBFmk~tplv-tiktokx-origin.image?dr=9636&x-expires=1790593200&x-signature=kwXzJpXfejTov6T3SzP1GmIMhP4%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast5',
    videoTitle: 'en pour ceux qui on pas compris c\'est simple en fait il y a #svt #adn #cours #lycee #physiquechimie',
    videoDescription: 'Explication simple sur l\'ADN et la physique-chimie pour le lycée.',
  },
  {
    creatorId: 'c2',
    tiktokUrl: 'https://www.tiktok.com/@code.kawaii/video/7688642988100160801',
    thumbnail: 'https://p19-common-sign.tiktokcdn-us.com/tos-useast2a-p-0037-euttp/oomIfeLZFIGCnSBAXGjgeTIXVzQdjhpGMVBxjD~tplv-tiktokx-origin.image?dr=9636&x-expires=1790593200&x-signature=SeUvdJzxg9F4W5S4bIsHtZ6wPDs%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast5',
    videoTitle: 'J\'investis part 5 💻 repérer les Tiktoks à fort potentiel viral #gamedevelopment #python #webscraping',
    videoDescription: 'Démo du jeu où tu repères les TikToks à fort potentiel viral avec Python et web scraping.',
  },
  {
    creatorId: 'c3',
    tiktokUrl: 'https://www.tiktok.com/@drbeber/video/7687660564109233431',
    thumbnail: 'https://p16-common-sign.tiktokcdn-us.com/tos-no1a-p-0037-no/oUnEfeBwGAvrGPAIAN5IA3FIDLYLEjqfVTziAC~tplv-tiktokx-origin.image?dr=9636&x-expires=1790593200&x-signature=yL8p4ix4M0Iw98ULWTwPr8eKjq0%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast8',
    videoTitle: 'Il est temps de connecter les neurones #jeuxvideo #gamingontiktok #gaming',
    videoDescription: 'Moment gaming où il faut réveiller les neurones avant de jouer.',
  },
  {
    creatorId: 'c4',
    tiktokUrl: 'https://www.tiktok.com/@tony.pascal98/video/7687855049682242849',
    thumbnail: 'https://p19-common-sign.tiktokcdn-us.com/tos-useast2a-p-0037-euttp/oULYMQjgGgHuXDfDgIeuAfEyELMAbVGIXucjgC~tplv-tiktokx-origin.image?dr=9636&x-expires=1790593200&x-signature=ZPXtW%2Bo27gL9K3IOxCFxdYE6bSE%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast5',
    videoTitle: '#creatorsearchinsights #le vol de la marmite 😁',
    videoDescription: 'Sketch humoristique autour du vol de la marmite.',
  },
  {
    creatorId: 'c5',
    tiktokUrl: 'https://www.tiktok.com/@yuwu.liu/video/7687263624007617822',
    thumbnail: 'https://p19-common-sign.tiktokcdn-us.com/tos-useast8-p-0068-tx2/o0EauqpAiPui6yBIA9N9REBClAoBAnVEdZbAl~tplv-tiktokx-origin.image?dr=9636&x-expires=1790593200&x-signature=G5Kd%2FeS2gM4SmRzMhAw%2B%2BTHzIPM%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast5',
    videoTitle: '依旧手搓火影 #火影忍者 #带土 #佩恩 #鸣人',
    videoDescription: 'Edit Naruto dessiné à la main avec Obito, Pain et Naruto.',
  },
  {
    creatorId: 'c6',
    tiktokUrl: 'https://www.tiktok.com/@blade_iris/video/7687539611903511822',
    thumbnail: 'https://p19-common-sign.tiktokcdn-us.com/tos-useast5-p-0068-tx/oELBVf9vEwGKBxAIAJ1iAYBJoBViEzRy1FBCAC~tplv-tiktokx-origin.image?dr=9636&x-expires=1790593200&x-signature=zN4jpaRByv2pf0hZ0wOr6xF0U1Q%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast5',
    videoTitle: 'What do I add next? DevBlade mod tool #minecraft #minecraftmemes',
    videoDescription: 'Création de mods Minecraft avec l\'outil DevBlade — que ajouter ensuite ?',
  },
  {
    creatorId: 'c7',
    tiktokUrl: 'https://www.tiktok.com/@im_eg2/video/7687512383832526087',
    thumbnail: 'https://p16-common-sign.tiktokcdn-us.com/tos-alisg-p-0037/o4Fa9R9qrAmbBUdBE0B4mRhBUdvfIAF0ETegID~tplv-tiktokx-origin.image?dr=9636&x-expires=1790593200&x-signature=vmjW3NvzVUJT8hCUU915iUvDvtI%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast5',
    videoTitle: 'iu lớp trưởng lắm óo😘😘❤️ #viral #foryou #loki #edit #xh',
    videoDescription: 'Edit Loki viral avec montage court et tendance for you.',
  },
  {
    creatorId: 'c7',
    tiktokUrl: 'https://www.tiktok.com/@im_eg2/video/7687189146263227656',
    thumbnail: 'https://p19-common-sign.tiktokcdn-us.com/tos-alisg-p-0037/ogQPWGFqkuuYfLJ27SeGdAARwtGeA7epqQzkIX~tplv-tiktokx-origin.image?dr=9636&x-expires=1790593200&x-signature=KlyqTTwbz4bynrXJsHtmC273A%2Fs%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=useast5',
    videoTitle: 'Small but mighty — The Blue LED 💡 #Blueled #Led #edit #foryou #viral',
    videoDescription: 'Histoire de la LED bleue, une des inventions les plus difficiles de l\'histoire.',
  },
];

const avatarColors = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-blue-500 to-cyan-600',
  'from-violet-500 to-fuchsia-600',
  'from-lime-500 to-green-600',
  'from-red-500 to-rose-600',
  'from-sky-500 to-indigo-600',
  'from-orange-500 to-red-600',
  'from-teal-500 to-cyan-600',
  'from-fuchsia-500 to-pink-600',
];

export const investors: Investor[] = [
  { id: 'i1', pseudo: 'ViralWhale', tag: 'VW', avatarColor: avatarColors[0], avatarUrl: null, joinedAt: '2025-04-03' },
  { id: 'i2', pseudo: 'TikTokShark', tag: 'TS', avatarColor: avatarColors[1], avatarUrl: null, joinedAt: '2025-05-17' },
  { id: 'i3', pseudo: 'MoonBag', tag: 'MB', avatarColor: avatarColors[2], avatarUrl: null, joinedAt: '2025-06-28' },
  { id: 'i4', pseudo: 'FOMO_King', tag: 'FK', avatarColor: avatarColors[3], avatarUrl: null, joinedAt: '2025-03-12' },
  { id: 'i5', pseudo: 'AlphaHunter', tag: 'AH', avatarColor: avatarColors[4], avatarUrl: null, joinedAt: '2025-07-08' },
  { id: 'i6', pseudo: 'DegenDuo', tag: 'DD', avatarColor: avatarColors[5], avatarUrl: null, joinedAt: '2025-08-19' },
  { id: 'i7', pseudo: 'SlopeSlayer', tag: 'SS', avatarColor: avatarColors[6], avatarUrl: null, joinedAt: '2025-02-25' },
  { id: 'i8', pseudo: 'ClipChaser', tag: 'CC', avatarColor: avatarColors[7], avatarUrl: null, joinedAt: '2025-09-01' },
  { id: 'i9', pseudo: 'TrendRider', tag: 'TR', avatarColor: avatarColors[8], avatarUrl: null, joinedAt: '2025-01-14' },
  { id: 'i10', pseudo: 'HypeScout', tag: 'HS', avatarColor: avatarColors[9], avatarUrl: null, joinedAt: '2025-06-06' },
  { id: 'i11', pseudo: 'PixelPunter', tag: 'PP', avatarColor: avatarColors[10], avatarUrl: null, joinedAt: '2025-08-02' },
  { id: 'i12', pseudo: 'GlowGambler', tag: 'GG', avatarColor: avatarColors[11], avatarUrl: null, joinedAt: '2025-05-30' },
];

function computeResult(
  viewsAtInvestment: number,
  followersAtInvestment: number,
  amount: number,
  viewsAfter: number,
): { multiplier: number; percentage: number; valueAfter: number; status: 'gain' | 'loss' | 'neutral' } {
  const viewGrowthRatio = viewsAfter / viewsAtInvestment;
  const followerFactor = Math.max(1, Math.log10(followersAtInvestment + 10) / 4);
  const rawMultiplier = viewGrowthRatio / followerFactor;
  const multiplier = Math.max(0, Math.round(rawMultiplier * 10) / 10);
  const valueAfter = Math.round(amount * multiplier);
  const percentage = Math.round((multiplier - 1) * 100);
  let status: 'gain' | 'loss' | 'neutral';
  if (percentage > 5) status = 'gain';
  else if (percentage < -5) status = 'loss';
  else status = 'neutral';
  return { multiplier, percentage, valueAfter, status };
}

type InvestmentSeed = Omit<Investment, 'multiplier' | 'percentage' | 'valueAfter48h' | 'status'>;

const investmentStats = [
  { id: 'inv1', investorId: 'i1', viewsAtInvestment: 246200, followersAtInvestment: 2900, amountInvested: 10000, viewsAfter48h: 437600, timestamp: '2026-09-25T14:30:00' },
  { id: 'inv2', investorId: 'i2', viewsAtInvestment: 1200000, followersAtInvestment: 84000, amountInvested: 5000, viewsAfter48h: 1450000, timestamp: '2026-09-25T10:15:00' },
  { id: 'inv3', investorId: 'i3', viewsAtInvestment: 1200, followersAtInvestment: 760, amountInvested: 3000, viewsAfter48h: 89400, timestamp: '2026-09-24T18:45:00' },
  { id: 'inv4', investorId: 'i4', viewsAtInvestment: 2300000, followersAtInvestment: 890000, amountInvested: 8000, viewsAfter48h: 2100000, timestamp: '2026-09-25T09:00:00' },
  { id: 'inv5', investorId: 'i5', viewsAtInvestment: 450000, followersAtInvestment: 152000, amountInvested: 6000, viewsAfter48h: 980000, timestamp: '2026-09-24T22:10:00' },
  { id: 'inv6', investorId: 'i6', viewsAtInvestment: 3400, followersAtInvestment: 6200, amountInvested: 2000, viewsAfter48h: 51200, timestamp: '2026-09-25T16:20:00' },
  { id: 'inv7', investorId: 'i7', viewsAtInvestment: 87000, followersAtInvestment: 45000, amountInvested: 4000, viewsAfter48h: 102000, timestamp: '2026-09-24T11:30:00' },
  { id: 'inv8', investorId: 'i8', viewsAtInvestment: 1800000, followersAtInvestment: 530000, amountInvested: 7000, viewsAfter48h: 2050000, timestamp: '2026-09-25T08:00:00' },
  { id: 'inv9', investorId: 'i9', viewsAtInvestment: 15000, followersAtInvestment: 21000, amountInvested: 5000, viewsAfter48h: 9800, timestamp: '2026-09-24T15:00:00' },
  { id: 'inv10', investorId: 'i10', viewsAtInvestment: 23000, followersAtInvestment: 12400, amountInvested: 3500, viewsAfter48h: 178000, timestamp: '2026-09-25T12:45:00' },
  { id: 'inv11', investorId: 'i11', viewsAtInvestment: 950000, followersAtInvestment: 320000, amountInvested: 6000, viewsAfter48h: 1080000, timestamp: '2026-09-24T20:00:00' },
  { id: 'inv12', investorId: 'i12', viewsAtInvestment: 12000, followersAtInvestment: 2900, amountInvested: 4000, viewsAfter48h: 312000, timestamp: '2026-09-25T11:00:00' },
  { id: 'inv13', investorId: 'i2', viewsAtInvestment: 800, followersAtInvestment: 760, amountInvested: 2000, viewsAfter48h: 14500, timestamp: '2026-09-24T14:00:00' },
  { id: 'inv14', investorId: 'i3', viewsAtInvestment: 320000, followersAtInvestment: 152000, amountInvested: 5000, viewsAfter48h: 290000, timestamp: '2026-09-25T07:30:00' },
  { id: 'inv15', investorId: 'i5', viewsAtInvestment: 2100, followersAtInvestment: 6200, amountInvested: 3000, viewsAfter48h: 67800, timestamp: '2026-09-24T17:15:00' },
  { id: 'inv16', investorId: 'i7', viewsAtInvestment: 670000, followersAtInvestment: 84000, amountInvested: 4500, viewsAfter48h: 1120000, timestamp: '2026-09-25T13:50:00' },
  { id: 'inv17', investorId: 'i8', viewsAtInvestment: 8900, followersAtInvestment: 21000, amountInvested: 2500, viewsAfter48h: 6200, timestamp: '2026-09-24T10:00:00' },
  { id: 'inv18', investorId: 'i1', viewsAtInvestment: 18000, followersAtInvestment: 12400, amountInvested: 5000, viewsAfter48h: 245000, timestamp: '2026-09-25T15:30:00' },
  { id: 'inv19', investorId: 'i4', viewsAtInvestment: 56000, followersAtInvestment: 45000, amountInvested: 3500, viewsAfter48h: 48000, timestamp: '2026-09-24T16:00:00' },
  { id: 'inv20', investorId: 'i6', viewsAtInvestment: 1100000, followersAtInvestment: 320000, amountInvested: 6000, viewsAfter48h: 1350000, timestamp: '2026-09-25T06:00:00' },
  { id: 'inv21', investorId: 'i9', viewsAtInvestment: 2100000, followersAtInvestment: 530000, amountInvested: 8000, viewsAfter48h: 1950000, timestamp: '2026-09-24T09:00:00' },
  { id: 'inv22', investorId: 'i10', viewsAtInvestment: 3400000, followersAtInvestment: 890000, amountInvested: 7000, viewsAfter48h: 3900000, timestamp: '2026-09-25T17:00:00' },
];

const rawInvestments: InvestmentSeed[] = investmentStats.map((stats, index) => {
  const video = mockTikTokVideos[index % mockTikTokVideos.length];
  return {
    ...stats,
    currentViews: stats.viewsAfter48h,
    creatorId: video.creatorId,
    videoTitle: video.videoTitle,
    videoDescription: video.videoDescription,
    thumbnail: video.thumbnail,
    tiktokUrl: video.tiktokUrl,
  };
});

export const investments: Investment[] = rawInvestments.map((inv) => {
  if (inv.viewsAfter48h === null) {
    return {
      ...inv,
      currentViews: null,
      viewsAfter48h: null,
      valueAfter48h: null,
      multiplier: null,
      percentage: null,
      status: 'pending' as const,
    };
  }
  const result = computeResult(inv.viewsAtInvestment, inv.followersAtInvestment, inv.amountInvested, inv.viewsAfter48h);
  return {
    ...inv,
    currentViews: inv.viewsAfter48h,
    viewsAfter48h: inv.viewsAfter48h,
    valueAfter48h: result.valueAfter,
    multiplier: result.multiplier,
    percentage: result.percentage,
    status: result.status,
  };
});

export const sponsor: Sponsor = {
  name: 'EnergyBoost',
  logo: '⚡',
  prizePool: 250000,
  endDate: '2026-09-28T23:59:59',
};

export const kpiData: KpiData = {
  totalDistributed: 1_847_500,
  totalUsers: 2800,
  investmentsLast48h: 342,
  bestMultiplier: 27.8,
  activeBets: 1284,
};

export function getInvestorById(id: string): Investor | undefined {
  return investors.find((i) => i.id === id);
}

export function getCreatorById(id: string): Creator | undefined {
  return creators.find((c) => c.id === id);
}

export function getInvestmentsByInvestor(investorId: string): Investment[] {
  return investments.filter((inv) => inv.investorId === investorId);
}

export function getInvestmentsByCreator(creatorId: string): Investment[] {
  return investments.filter((inv) => inv.creatorId === creatorId);
}

export interface InvestorStats {
  totalProfit: number;
  rank: number;
  winRate: number;
  bestMultiplier: number;
  winningBets: number;
  totalBets: number;
}

export function getInvestorStats(investorId: string): InvestorStats {
  const investorBets = getInvestmentsByInvestor(investorId);
  const completedBets = investorBets.filter((b) => b.status !== 'pending');
  const totalProfit = completedBets.reduce((sum, b) => {
    const profit = (b.valueAfter48h ?? 0) - b.amountInvested;
    return sum + profit;
  }, 0);
  const winningBets = completedBets.filter((b) => b.status === 'gain').length;
  const winRate = completedBets.length > 0 ? Math.round((winningBets / completedBets.length) * 100) : 0;
  const bestMultiplier = completedBets.reduce((max, b) => Math.max(max, b.multiplier ?? 0), 0);

  const allInvestors = investors.map((inv) => {
    const bets = getInvestmentsByInvestor(inv.id).filter((b) => b.status !== 'pending');
    return {
      id: inv.id,
      profit: bets.reduce((s, b) => s + ((b.valueAfter48h ?? 0) - b.amountInvested), 0),
    };
  });
  allInvestors.sort((a, b) => b.profit - a.profit);
  const rank = allInvestors.findIndex((inv) => inv.id === investorId) + 1;

  return {
    totalProfit,
    rank,
    winRate,
    bestMultiplier,
    winningBets,
    totalBets: completedBets.length,
  };
}

export interface CreatorStats {
  timesBet: number;
  totalGain: number;
  mostProfitableVideo: string | null;
  bestMultiplier: number;
}

export function getCreatorStats(creatorId: string): CreatorStats {
  const creatorBets = getInvestmentsByCreator(creatorId);
  const completedBets = creatorBets.filter((b) => b.status !== 'pending');
  const totalGain = completedBets.reduce((sum, b) => {
    const profit = (b.valueAfter48h ?? 0) - b.amountInvested;
    return sum + profit;
  }, 0);
  let mostProfitableVideo: string | null = null;
  let bestProfit = -Infinity;
  let bestMultiplier = 0;
  for (const b of completedBets) {
    const profit = (b.valueAfter48h ?? 0) - b.amountInvested;
    if (profit > bestProfit) {
      bestProfit = profit;
      mostProfitableVideo = b.videoTitle;
    }
    if ((b.multiplier ?? 0) > bestMultiplier) bestMultiplier = b.multiplier ?? 0;
  }
  return {
    timesBet: creatorBets.length,
    totalGain,
    mostProfitableVideo,
    bestMultiplier,
  };
}

export interface LeaderboardEntry {
  investor: Investor;
  totalProfit: number;
  winningBets: number;
  losingBets: number;
  totalBets: number;
  maxPercentage: number;
}

export function getLeaderboard(period: LeaderboardPeriod): LeaderboardEntry[] {
  const now = new Date('2026-09-26T00:00:00');
  const cutoff = new Date(now);
  if (period === 'day') cutoff.setDate(cutoff.getDate() - 1);
  else if (period === 'week') cutoff.setDate(cutoff.getDate() - 7);

  const entries = investors.map((inv) => {
    let bets = getInvestmentsByInvestor(inv.id).filter((b) => b.status !== 'pending');
    if (period !== 'all') {
      bets = bets.filter((b) => new Date(b.timestamp) >= cutoff);
    }
    const totalProfit = bets.reduce((s, b) => s + ((b.valueAfter48h ?? 0) - b.amountInvested), 0);
    const winningBets = bets.filter((b) => b.status === 'gain').length;
    const losingBets = bets.filter((b) => b.status === 'loss').length;
    const maxPercentage = bets.reduce((max, b) => Math.max(max, b.percentage ?? 0), 0);
    return {
      investor: inv,
      totalProfit,
      winningBets,
      losingBets,
      totalBets: bets.length,
      maxPercentage,
    };
  });
  entries.sort((a, b) => b.totalProfit - a.totalProfit);
  return entries;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.0', '') + 'k';
  return n.toLocaleString('en-US');
}

export function formatKwai(n: number): string {
  return n.toLocaleString('en-US') + ' KWAÏ';
}
