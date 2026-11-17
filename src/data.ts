export interface SplitLine {
  left: string;
  right: string;
}

export interface HeroCycleItem {
  desktop: string;
  mobile: string[];
  caption: string;
  logo?: boolean;
  logoDesktop?: { cols: number; rows: number; cells: number[][] };
  logoMobile?: { cols: number; rows: number; cells: number[][] };
}

// 까치 로고(검정 배경 + 노란연두 까치 심볼)를 히어로 캔버스의 가로세로 비율(데스크탑 45x9, 모바일 25x20)에
// 맞춰 다운샘플링한 좌표. 텍스트 글리프와 같은 해상도로 그려지도록 캔버스 비율에 맞춰 따로 생성함.
export const LOGO_PIXEL_GRID_DESKTOP = {
  cols: 45,
  rows: 9,
  cells: [[25,1],[23,2],[24,2],[22,3],[23,3],[24,3],[20,4],[21,4],[22,4],[23,4],[20,5],[21,5],[22,5],[21,6],[22,6]] as number[][]
};
export const LOGO_PIXEL_GRID_MOBILE = {
  cols: 25,
  rows: 20,
  cells: [[18,2],[19,2],[17,3],[18,3],[19,3],[17,4],[18,4],[19,4],[15,5],[16,5],[11,6],[12,6],[13,6],[14,6],[15,6],[16,6],[9,7],[10,7],[11,7],[12,7],[13,7],[14,7],[15,7],[16,7],[12,8],[13,8],[14,8],[15,8],[9,9],[10,9],[11,9],[12,9],[13,9],[14,9],[15,9],[4,10],[5,10],[6,10],[7,10],[8,10],[9,10],[10,10],[11,10],[12,10],[14,10],[15,10],[4,11],[5,11],[6,11],[7,11],[8,11],[9,11],[10,11],[11,11],[12,11],[14,11],[15,11],[9,12],[10,12],[11,12],[12,12],[14,12],[10,13],[11,13],[12,13],[10,14],[11,14],[10,15],[11,15],[10,16],[11,16],[11,17]] as number[][]
};

export interface TrackItem {
  id: string;
  label: string;
  bg: string;
  fg: string;
  chipBg: string;
  chipFg: string;
  motif: string;
  desc: string;
  bitmap: string[];
}

export interface RoomItem {
  id: string;
  name: string;
  nickname: string;
  seats: string;
  level: number;
  features: string[];
}

export interface DayItem {
  id: string;
  date: string;
  label: string;
  shortLabel: string;
  fullLabel: string;
  num: string;
  theme: string;
  doors: string;
}

export interface HostItem {
  id: string;
  name: string;
  role: string;
  org: string;
  city: string;
  track: string;
  bio: string;
  portrait: {
    pal: string[];
    rows: string[];
  };
}

export interface SessionItem {
  id: string;
  day: string;
  start: string;
  end: string;
  room: string;
  type: string;
  track: string;
  speakers: string[];
  title: string;
  abstract: string;
}

export interface BreakItem {
  day: string;
  start: string;
  end: string;
  room: string;
  title: string;
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  allocation: number;
  sold: number;
  left: number;
  includes: string;
  color: string;
}

export interface VenuePlanItem {
  id: string;
  label: string;
  chip?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  text: string;
}

export interface FeedCommentItem {
  author: string;
  text: string;
}

export interface FeedPostItem {
  id: string;
  author: string;
  handle: string;
  avatarKind: "coffee" | "dog" | "riso" | "vinyl" | "spark";
  time: string;
  area: string;
  track: string;
  sessionId: string;
  likes: number;
  joined: string[];
  joinedCount: number;
  extraCount: number;
  caption: string;
  captionEn: string;
  mediaKind: "drip" | "walk" | "riso" | "vinyl" | "spark";
  comments: FeedCommentItem[];
}

export const DATA = {
  tokens: {
    sodium: "#D8E43B",
    ink: "#0A0A0A",
    paper: "#FFFFFF",
    vivid: "#CBFE23",
    soft: "#E7F08B",
    pale: "#F2F6CA",
    mid: "#A6C41D",
    olive: "#576B0D",
    deep: "#323E07",
    muted: "#B5BF6E"
  },
  meta: {
    name: "까치",
    engName: "KKACHI",
    organiser: "까치 팝미팅 커뮤니티 · KKACHI Pop-Meeting Collective",
    dates: { start: "2027-05-21", end: "2027-05-23" },
    doorsUTC: "2027-05-21T09:00:00Z",
    firstTalkUTC: "2027-05-21T10:00:00Z",
    venue: {
      name: "까치 서울 라운지 · KKACHI Seoul Hub",
      street: "서울시 성동구 연무장길 42 · Yeonmujang-gil 42",
      city: "성수 · 연남 · 을지로 · 한남 (Seoul)",
      country: "KR"
    },
    capacity: 640,
    rooms: 6,
    tracks: 4,
    speakers: 10,
    sessions: 18
  },
  nav: [
    { label: "BRAND STORY", href: "#/brand-story" },
    { label: "MAP", href: "#/map" },
    { label: "POP MEETING", href: "#/pop-meeting" },
    { label: "FEED", href: "#/feed" }
  ],
  glyphs: {
    "0": [".#####.","#.....#","#....##","#...#.#","#..#..#","#.#...#","##....#","#.....#",".#####."],
    "1": ["...#...","..##...",".#.#...","...#...","...#...","...#...","...#...","...#...",".#####."],
    "2": [".#####.","#.....#","......#",".....#.","...##..","..#....",".#.....","#......","#######"],
    "3": [".#####.","#.....#","......#","......#","..####.","......#","......#","#.....#",".#####."],
    "4": ["....##.","...#.#.","..#..#.",".#...#.","#....#.","#######",".....#.",".....#.",".....#."],
    "5": ["#######","#......","#......","######.","......#","......#","......#","#.....#",".#####."],
    "6": ["..####.",".#.....","#......","#......","######.","#.....#","#.....#","#.....#",".#####."],
    "7": ["#######","......#",".....#.","....#..","...#...","...#...","..#....","..#....","..#...."],
    "8": [".#####.","#.....#","#.....#","#.....#",".#####.","#.....#","#.....#","#.....#",".#####."],
    "9": [".#####.","#.....#","#.....#","#.....#",".######","......#","......#",".....#.",".####.."],
    "/": ["....##","....#.","....#.","...#..","...#..","..#...","..#...",".#....","##...."],
    "-": [".....",".....",".....",".....","#####",".....",".....",".....","....."],
    ":": [".",".","#",".",".",".","#",".","."],
    ".": [".",".",".",".",".",".",".",".","#"],
    "!": ["..#..","..#..","..#..","..#..","..#..","..#..",".....","..#..","..#.."],
    " ": ["...","...","...","...","...","...","...","...","..."],
    "A": ["..###..",".#...#.","#.....#","#.....#","#.....#","#######","#.....#","#.....#","#.....#"],
    "C": [".#####.","#.....#","#......","#......","#......","#......","#......","#.....#",".#####."],
    "D": ["#####..","#....#.","#.....#","#.....#","#.....#","#.....#","#.....#","#....#.","#####.."],
    "E": ["#######","#......","#......","#......","######.","#......","#......","#......","#######"],
    "H": ["#.....#","#.....#","#.....#","#.....#","#######","#.....#","#.....#","#.....#","#.....#"],
    "I": ["#####","..#..","..#..","..#..","..#..","..#..","..#..","..#..","#####"],
    "K": ["#....##","#...##.","#..##..","####...","#..##..","#...##.","#....##","#.....#","#.....#"],
    "L": ["#......","#......","#......","#......","#......","#......","#......","#......","#######"],
    "M": ["#.....#","##...##","#.#.#.#","#..#..#","#.....#","#.....#","#.....#","#.....#","#.....#"],
    "O": [".#####.","#.....#","#.....#","#.....#","#.....#","#.....#","#.....#","#.....#",".#####."],
    "P": ["######.","#.....#","#.....#","#.....#","######.","#......","#......","#......","#......"],
    "R": ["######.","#.....#","#.....#","#.....#","######.","#...#..","#....#.","#.....#","#.....#"],
    "S": [".#####.","#.....#","#......","#......",".#####.","......#","......#","#.....#",".#####."],
    "T": ["#######","...#...","...#...","...#...","...#...","...#...","...#...","...#...","...#..."],
    "U": ["#.....#","#.....#","#.....#","#.....#","#.....#","#.....#","#.....#","#.....#",".#####."],
    "Y": ["#.....#","#.....#",".#...#.","..#.#..","...#...","...#...","...#...","...#...","...#..."]
  } as Record<string, string[]>,
  glyphsBold: {
    "0": [".#####.","#######","##...##","##..###","##.#.##","###..##","##...##","#######",".#####."],
    "1": ["...##..","..###..",".####..","...##..","...##..","...##..","...##..","#######","#######"],
    "2": [".#####.","#######","##...##","....###","..####.",".###...","##.....","#######","#######"],
    "3": [".#####.","#######",".....##","..####.","..####.",".....##","##...##","#######",".#####."],
    "4": ["....##.","...###.","..####.",".##.##.","##..##.","#######","#######","....##.","....##."],
    "5": ["#######","#######","##.....","######.","#######",".....##","##...##","#######",".#####."],
    "6": ["..####.",".######","##.....","######.","#######","##...##","##...##","#######",".#####."],
    "7": ["#######","#######",".....##","....##.","...##..","..##...","..##...","..##...","..##..."],
    "8": [".#####.","#######","##...##",".#####.",".#####.","##...##","##...##","#######",".#####."],
    "9": [".#####.","#######","##...##","##...##","#######",".######",".....##","######.",".#####."],
    "/": ["....##","....##","...##.","...##.","..##..","..##..",".##...","##....","##...."],
    "-": [".....",".....",".....","#####","#####",".....",".....",".....","....."],
    ":": [".",".","#","#",".",".","#","#","."],
    ".": [".",".",".",".",".",".",".","#","#"],
    "!": [".##..",".##..",".##..",".##..",".##..",".##..",".....",".##..",".##.."],
    " ": ["...","...","...","...","...","...","...","...","..."],
    "A": ["..###..",".#####.","##...##","##...##","#######","#######","##...##","##...##","##...##"],
    "C": [".#####.","#######","##.....","##.....","##.....","##.....","##.....","#######",".#####."],
    "D": ["#####..","######.","##...##","##...##","##...##","##...##","##...##","######.","#####.."],
    "E": ["#######","#######","##.....","######.","######.","##.....","##.....","#######","#######"],
    "H": ["##...##","##...##","##...##","##...##","#######","#######","##...##","##...##","##...##"],
    "I": ["#####",".##..",".##..",".##..",".##..",".##..",".##..",".##..","#####"],
    "K": ["##...##","##..##.","##.##..","####...","##.##..","##..##.","##...##","##...##","##...##"],
    "L": ["##.....","##.....","##.....","##.....","##.....","##.....","##.....","#######","#######"],
    "M": ["##...##","###.###","#######","##.#.##","##...##","##...##","##...##","##...##","##...##"],
    "O": [".#####.","#######","##...##","##...##","##...##","##...##","##...##","#######",".#####."],
    "P": ["######.","#######","##...##","##...##","#######","######.","##.....","##.....","##....."],
    "R": ["######.","#######","##...##","##...##","#######","##.##..","##..##.","##...##","##...##"],
    "S": [".#####.","#######","##.....",".#####.","..#####",".....##","##...##","#######",".#####."],
    "T": ["#######","#######","..###..","..###..","..###..","..###..","..###..","..###..","..###.."],
    "U": ["##...##","##...##","##...##","##...##","##...##","##...##","##...##","#######",".#####."],
    "Y": ["##...##","##...##",".##.##.","..###..","..###..","..###..","..###..","..###..","..###.."]
  } as Record<string, string[]>,
  tracks: [
    {
      id: "walk",
      label: "Walk & Coffee · 산책과 커피",
      bg: "#CBFE23",
      fg: "#0A0A0A",
      chipBg: "#CBFE23",
      chipFg: "#0A0A0A",
      motif: "ring",
      desc: "골목 산책, 모닝 드립 커피, 동네 책방 투어 · Morning walks, local cafés and slow neighborhood routes.",
      bitmap: ["000000000","000000000","001111100","010000010","100000001","000000000","100000001","010000010","001111100"]
    },
    {
      id: "sound",
      label: "Sound & Vinyl · 사운드",
      bg: "#A6C41D",
      fg: "#0A0A0A",
      chipBg: "#A6C41D",
      chipFg: "#0A0A0A",
      motif: "wave",
      desc: "리스닝 바 번개, 바이닐 디깅, 앰비언트 세션 · Listening sessions, vinyl digging and curated soundscapes.",
      bitmap: ["001111100","010000010","110111011","110111011","111111111","101111101","110111011","011111110","001111100"]
    },
    {
      id: "craft",
      label: "Studio Craft · 스튜디오 크래프트",
      bg: "#E7F08B",
      fg: "#0A0A0A",
      chipBg: "#E7F08B",
      chipFg: "#0A0A0A",
      motif: "spark",
      desc: "리소그래피, 필름 포토 워크, 세라믹 원데이 번개 · Risograph zines, film photo walks and hands-on making.",
      bitmap: ["110000011","001000100","011000110","111101111","111111111","011111110","001111100","000111000","000010000"]
    },
    {
      id: "night",
      label: "Night Pop · 나이트 팝",
      bg: "#323E07",
      fg: "#CBFE23",
      chipBg: "#323E07",
      chipFg: "#CBFE23",
      motif: "star",
      desc: "한강 나이트 러닝, 루프탑 영화제, 심야 심포지엄 · Night runs by the river, rooftop cinema and late talks.",
      bitmap: ["111111111","011111110","001111100","000111000","000010000","000101000","001000100","010000010","111111111"]
    }
  ] as TrackItem[],
  rooms: [
    { id: "seongsu", name: "Seongsu Hub · 성수 베이스캠프", nickname: "Main Pop Spot", seats: "160", level: 1, features: ["도보 3분 성수역 · 3 min from Seongsu Stn", "배리어프리 출입 · Step-free access", "무료 필터 커피 · Filter coffee bar", "까치 체크인 데스크 · KKACHI check-in"] },
    { id: "yeonnam", name: "Yeonnam Loft · 연남 다락", nickname: "Craft Loft", seats: "45", level: 2, features: ["리소 인쇄 작업대 · Risograph worktables", "전원 콘센트 완비 · Power at every seat", "자연광 스튜디오 · Daylight studio"] },
    { id: "euljiro", name: "Euljiro Roof · 을지로 옥상", nickname: "Night Grid", seats: "120", level: 4, features: ["야외 사운드 시스템 · Open-air sound", "루프탑 시네마 · Rooftop cinema", "엘리베이터 연결 · Lift access"] },
    { id: "hannam", name: "Hannam Yard · 한남 중정", nickname: "Slow Garden", seats: "80", level: 1, features: ["반려견 동반 가능 · Pet-friendly", "빈백 라운지 · Courtyard seating", "주말 북스왑 · Weekend book swap"] },
    { id: "quiet", name: "Quiet Lounge · 고요 라운지", nickname: "Silent Reading", seats: "18", level: 2, features: ["무소음 휴식 공간 · No talking zone", "조도 조절 조명 · Dimmable light", "내향인 웰컴 · Introvert friendly"] },
    { id: "desk", name: "Pop Desk · 팝 데스크", nickname: "Badge & Goods", seats: "—", level: 1, features: ["픽셀 배지 교환 · Pixel badge swap", "무료 짐 보관 · Free cloakroom", "09:00–22:00 상시 운영 · Open daily"] }
  ] as RoomItem[],
  days: [
    { id: "d1", date: "2027-05-21", label: "Fri 21 · 금요일", shortLabel: "FRI 21", fullLabel: "2027년 5월 21일 금요일 · Friday 21 May 2027", num: "21", theme: "Signal · 첫 신호", doors: "10.00 KST" },
    { id: "d2", date: "2027-05-22", label: "Sat 22 · 토요일", shortLabel: "SAT 22", fullLabel: "2027년 5월 22일 토요일 · Saturday 22 May 2027", num: "22", theme: "Orbit · 취향의 궤도", doors: "09.30 KST" },
    { id: "d3", date: "2027-05-23", label: "Sun 23 · 일요일", shortLabel: "SUN 23", fullLabel: "2027년 5월 23일 일요일 · Sunday 23 May 2027", num: "23", theme: "Echo · 여운", doors: "10.00 KST" }
  ] as DayItem[],
  speakers: [
    {
      id: "minji-han",
      name: "한민지 · Minji Han",
      role: "산책 큐레이터 · Urban Walk Host",
      org: "성수 워킹클럽",
      city: "Seoul · 성수",
      track: "walk",
      bio: "성수동 골목의 오래된 인쇄소와 새 로스터리를 잇는 아침 산책 호스트입니다. 40분 남짓의 가벼운 동선 안에 작은 대화 거리를 심어둡니다. / Morning walk curator linking old print shops and independent roasteries in Seongsu.",
      portrait: { pal: ["#E7F08B", "#576B0D", "#0A0A0A", "#FFFFFF"], rows: ["00000000000000000000000000000000","00000000000000000000000000000000","00000000000000220000000000000000","00000000000022222222000000000000","00000000002222222222220000000000","00000000022222222222222000000000","00000000222222222222222200000000","00000000222222222222222200000000","00000002222122111122122220000000","00000002221222211222212220000000","00000002222222222222222220000000","00000002222112122111122220000000","00000002222211211211222220000000","00000022222122211222112222000000","00000022222111122111122222000000","00000022222111111111122222000000","00000022222211111111222222000000","00000002222221111112222220000000","00000000000011111111000000000000","00000000000011111111000000000000","00000000001133111133110000000000","00000001111111111111111110000000","00000111111111111111111111100000","00011111111111111111111111111000","00111111111111111111111111111100","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000"] }
    },
    {
      id: "doyun-kwon",
      name: "권도윤 · Doyun Kwon",
      role: "사운드 아카이비스트 · Vinyl Selector",
      org: "을지로 테이프룸",
      city: "Seoul · 을지로",
      track: "sound",
      bio: "을지로 4층 작업실에서 한국 70–90년대 시티팝과 앰비언트 바이닐을 모읍니다. 대화를 강요하지 않는 리스닝 팝미팅을 엽니다. / Collects rare Korean ambient vinyl in Euljiro and hosts pressure-free listening pop-meetings.",
      portrait: { pal: ["#A6C41D", "#323E07", "#0A0A0A", "#FFFFFF"], rows: ["00000000000000000000000000000000","00000000000000000000000000000000","00000000000222222222000000000000","00000000002222222222200000000000","00000000002222222222220000000000","00000000022222221122222000000000","00000000021111111112222200000000","00000000011111111112222200000000","00000000022212222113322200000000","00000000012211221111211100000000","00000000012211111111221100000000","00000000011211111111221000000000","00000000011111111112221000000000","00000000011221111112212000000000","00000000012222221122220000000000","00000000022222122222110000000000","00000000002222222221110000000000","00000000000222221111111100000000","00000000000012111111111100000000","00000000000121111111111111110000","00000000111111111111111111111100","00000011111211112111111111111110","00001111112121122221121111111110","00011111111111221112211111111110","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000","00000000000000000000000000000000"] }
    },
    {
      id: "seoyeon-cho",
      name: "조서연 · Seoyeon Cho",
      role: "리소그래피 프린터 · Riso Printer",
      org: "연남 프레스",
      city: "Seoul · 연남",
      track: "craft",
      bio: "두 가지 잉크만으로 진한 그래픽 포스터를 찍어내는 독립 출판 호스트입니다. 주말 오후 누구나 15분 만에 한 장의 진(Zine)을 완성하도록 돕습니다. / Independent risograph printer helping guests make a two-ink poster in 15 minutes.",
      portrait: { pal: ["#CBFE23", "#576B0D", "#0A0A0A", "#FFFFFF"], rows: [] }
    },
    {
      id: "junseo-baek",
      name: "백준서 · Junseo Baek",
      role: "나이트 러너 · Night Run Captain",
      org: "뚝섬 8PM",
      city: "Seoul · 뚝섬",
      track: "night",
      bio: "매주 수요일과 금요일 밤 한강변을 5km 달리고 보온병에 담아온 따뜻한 차를 나누는 러닝 호스트입니다. / Leads gentle 5km riverside night runs followed by warm tea along the Han River.",
      portrait: { pal: ["#D8E43B", "#323E07", "#0A0A0A", "#FFFFFF"], rows: [] }
    },
    {
      id: "haneul-oh",
      name: "오하늘 · Haneul Oh",
      role: "필름 포토그래퍼 · Film Walker",
      org: "망원 필름랩",
      city: "Seoul · 망원",
      track: "craft",
      bio: "일회용 카메라와 35mm 필름으로 동네의 초록과 빛을 기록합니다. 출사 후 현상소 앞에서 20분간 서로의 시선을 나눕니다. / Documents neighborhood light on 35mm film and hosts relaxed post-walk print swaps.",
      portrait: { pal: ["#F2F6CA", "#576B0D", "#0A0A0A", "#FFFFFF"], rows: [] }
    },
    {
      id: "jihoon-park",
      name: "박지훈 · Jihoon Park",
      role: "로컬 커피 호스트 · Filter Barista",
      org: "한남 드립하우스",
      city: "Seoul · 한남",
      track: "walk",
      bio: "작은 드리퍼 하나로 6명의 손님에게 서로 다른 산지의 원두를 내려주는 모닝 커피 팝미팅 호스트입니다. / Pours single-origin filter flights for six-person morning pop-meetings in Hannam.",
      portrait: { pal: ["#B5BF6E", "#323E07", "#0A0A0A", "#FFFFFF"], rows: [] }
    },
    {
      id: "yuna-kang",
      name: "강유나 · Yuna Kang",
      role: "심야 북클럽 호스트 · Silent Reader",
      org: "북촌 고요방",
      city: "Seoul · 북촌",
      track: "night",
      bio: "모여서 각자의 책을 45분 동안 조용히 읽고, 마지막 15분만 마음에 남은 한 문장을 메모지에 적어 교환하는 모임을 엽니다. / Hosts silent reading pop-meetings where strangers trade one handwritten quote at the end.",
      portrait: { pal: ["#E7F08B", "#323E07", "#0A0A0A", "#FFFFFF"], rows: [] }
    },
    {
      id: "taehyun-lim",
      name: "임태현 · Taehyun Lim",
      role: "신스 잼 호스트 · Synth Builder",
      org: "신당 사운드랩",
      city: "Seoul · 신당",
      track: "sound",
      bio: "포켓 오퍼레이터와 작은 아날로그 신디사이저를 테이블에 펼쳐두고 초보자도 30분 만에 비트 루프를 만드는 세션을 진행합니다. / Brings pocket synthesizers so first-timers can jam a live loop within thirty minutes.",
      portrait: { pal: ["#CBFE23", "#323E07", "#0A0A0A", "#FFFFFF"], rows: [] }
    },
    {
      id: "sora-kim",
      name: "김소라 · Sora Kim",
      role: "세라믹 메이커 · Clay Host",
      org: "연희 흙작업실",
      city: "Seoul · 연희",
      track: "craft",
      bio: "물레 없이 손으로만 작은 인센스 홀더와 에스프레소 잔을 빚는 주말 오후 원데이 팝미팅을 이끕니다. / Guides hand-built ceramic espresso cup pop-meetings with zero wheel experience needed.",
      portrait: { pal: ["#A6C41D", "#576B0D", "#0A0A0A", "#FFFFFF"], rows: [] }
    },
    {
      id: "eunwoo-jang",
      name: "장은우 · Eunwoo Jang",
      role: "루프탑 시네마 · Film Programmer",
      org: "종로 상영회",
      city: "Seoul · 을지로",
      track: "night",
      bio: "해 질 녘 옥상 스크린에 16mm 단편 영화를 걸고, 상영 후 25분 동안 가벼운 감상 카드를 나누는 심야 극장을 운영합니다. / Screens independent short films on Euljiro rooftops at dusk with post-screening note cards.",
      portrait: { pal: ["#D8E43B", "#576B0D", "#0A0A0A", "#FFFFFF"], rows: [] }
    }
  ] as HostItem[],
  sessions: [
    { id: "p01", day: "d1", start: "10:00", end: "11:00", room: "seongsu", type: "Morning Walk", track: "walk", speakers: ["minji-han"], title: "성수 골목 모닝 드립 워크 · Seongsu Morning Walk", abstract: "오전 10시 성수 베이스캠프에서 만나 연무장길 뒷골목을 40분 걷고 필터 커피 한 잔으로 하루를 여는 팝미팅입니다. / Meet at 10am for a 40-minute Seongsu back-alley walk ending with hand-brewed coffee." },
    { id: "p02", day: "d1", start: "13:00", end: "14:30", room: "yeonnam", type: "Workshop", track: "craft", speakers: ["seoyeon-cho"], title: "라임 잉크 2도 리소 포스터 · Two-Ink Riso Pop", abstract: "까치 시그니처 차트뢰즈 라임과 먹색 잉크 두 가지로 나만의 동네 포스터를 찍어가는 90분 워크숍입니다. / Print your own neighborhood poster using KKACHI chartreuse-lime and obsidian black riso ink." },
    { id: "p03", day: "d1", start: "15:00", end: "16:15", room: "seongsu", type: "Listening", track: "sound", speakers: ["doyun-kwon"], title: "오후의 시티팝 바이닐 · Afternoon Vinyl", abstract: "말 없이 헤드폰과 스피커로 한 장의 앨범을 처음부터 끝까지 감상하고 한 줄 감상을 남기는 모임입니다. / Listen to one classic album side-to-side without small-talk pressure." },
    { id: "p04", day: "d1", start: "18:30", end: "20:00", room: "euljiro", type: "Night Run", track: "night", speakers: ["junseo-baek"], title: "청계천–한강 5K 야간 러닝 · Night 5K Social Run", abstract: "초보자 페이스(6'30\"/km)로 함께 달리고 스트레칭 후 따뜻한 유자차를 나눕니다. / Beginner-friendly 5K night jog followed by warm tea and cool-down." },
    { id: "p05", day: "d1", start: "20:15", end: "21:30", room: "euljiro", type: "Cinema", track: "night", speakers: ["eunwoo-jang"], title: "을지로 옥상 단편 상영회 · Euljiro Rooftop Shorts", abstract: "서울의 밤을 다룬 독립 단편 3편을 옥상에서 함께 감상합니다. / Three independent short films celebrating Seoul after dusk on the rooftop screen." },
    { id: "p06", day: "d2", start: "10:00", end: "11:15", room: "hannam", type: "Coffee Tasting", track: "walk", speakers: ["jihoon-park"], title: "한남 중정 에스프레소 테이스팅 · Hannam Drip Flight", abstract: "3가지 산지의 싱글 오리진 커피를 비교 시음하며 가볍게 주말 아침을 깨웁니다. / Compare three single-origin brews in the Hannam courtyard garden." },
    { id: "p07", day: "d2", start: "11:30", end: "13:00", room: "yeonnam", type: "Photo Walk", track: "craft", speakers: ["haneul-oh"], title: "연남 35mm 컬러 필름 워크 · Yeonnam 35mm Walk", abstract: "초록빛 골목과 간판을 필름 카메라에 담는 산책 모임. 필름 1롤이 제공됩니다. / A relaxed 35mm film walk capturing green textures around Yeonnam; one film roll included." },
    { id: "p08", day: "d2", start: "13:30", end: "15:00", room: "seongsu", type: "Synth Jam", track: "sound", speakers: ["taehyun-lim"], title: "미니 신디사이저 루프 잼 · Pocket Synth Jam", abstract: "악기를 다뤄본 적 없어도 좋습니다. 8명이 연결된 미니 신스로 즉흥 리듬을 만듭니다. / Zero musical background required—build a shared rhythm loop with eight synced pocket synths." },
    { id: "p09", day: "d2", start: "15:30", end: "17:00", room: "yeonnam", type: "Ceramic", track: "craft", speakers: ["sora-kim"], title: "손빚기 라임 에스프레소 컵 · Hand-Built Clay Cup", abstract: "내 손에 꼭 맞는 작은 커피 컵을 빚고 까치 엠블럼 스탬프를 찍어 굽습니다. / Hand-build an espresso cup stamped with the KKACHI magpie emblem." },
    { id: "p10", day: "d2", start: "17:30", end: "19:00", room: "hannam", type: "Book Swap", track: "walk", speakers: ["yuna-kang", "minji-han"], title: "한남 잔디밭 책 교환 · Courtyard Book Swap", abstract: "다 읽은 책 한 권을 가져와 메모를 끼워두고 새로운 책과 인연을 만납니다. / Bring one beloved book with a handwritten note and swap with a neighbor." },
    { id: "p11", day: "d2", start: "19:30", end: "21:00", room: "euljiro", type: "Night Pop", track: "night", speakers: ["doyun-kwon", "taehyun-lim"], title: "을지로 앰비언트 라이브 · Euljiro Ambient Night", abstract: "도시의 소음 위를 흐르는 전자음과 바이닐 믹스로 토요일 밤을 채웁니다. / Live modular ambient sets layered over nocturnal vinyl textures." },
    { id: "p12", day: "d3", start: "10:30", end: "11:45", room: "seongsu", type: "Walk", track: "walk", speakers: ["jihoon-park", "minji-han"], title: "일요일 오전 베이커리 투어 · Sunday Bakery Hop", abstract: "성수 로컬 베이커리 세 곳의 시그니처 빵을 조금씩 나눠 먹는 유쾌한 일요일 산책. / Sample signature pastries from three local Seongsu bakeries together." },
    { id: "p13", day: "d3", start: "12:30", end: "14:00", room: "yeonnam", type: "Generative Zine", track: "craft", speakers: ["seoyeon-cho", "haneul-oh"], title: "40줄 코드 포스터 워크숍 · 40-Line Pattern Print", abstract: "피드 페이지의 인터랙티브 패턴 월을 직접 코딩하고 리소그래피로 출력해 갑니다. / Generate a 40-line pixel weave pattern and print it straight onto heavy cotton stock." },
    { id: "p14", day: "d3", start: "14:30", end: "15:45", room: "quiet", type: "Silent Read", track: "night", speakers: ["yuna-kang"], title: "고요 라운지 45분 묵독 · Silent Reading Pop", abstract: "아무 말도 하지 않고 45분간 각자의 책에 몰입한 뒤 문장 카드를 교환합니다. / Forty-five minutes of shared silence with your book, followed by quote card exchange." },
    { id: "p15", day: "d3", start: "16:00", end: "17:15", room: "seongsu", type: "Listening", track: "sound", speakers: ["doyun-kwon"], title: "재즈 & 소울 테이프 세션 · Jazz Tape Session", abstract: "카세트 데크에서 흘러나오는 따뜻한 아날로그 음반을 함께 듣습니다. / Analog cassette listening session featuring warm 70s jazz and soul." },
    { id: "p16", day: "d3", start: "17:30", end: "19:00", room: "euljiro", type: "Panel", track: "craft", speakers: ["seoyeon-cho", "sora-kim", "yuna-kang"], title: "작은 모임이 도시를 바꾸는 법 · How Micro-Meets Shape Cities", abstract: "거창한 파티 대신 6~12명의 느슨한 번개가 도시의 외로움을 덜어내는 방식을 이야기합니다. / Three hosts discuss how small, zero-pressure pop-meetings make big cities warmer." },
    { id: "p17", day: "d3", start: "19:15", end: "20:30", room: "hannam", type: "Night Run", track: "night", speakers: ["junseo-baek"], title: "남산 소월길 노을 조깅 · Namsan Sunset Run", abstract: "선선한 일요일 저녁, 남산 소월길을 따라 가볍게 뛰며 주말을 마무리합니다. / Easy sunset jog along Namsan Sowol-gil to close out the weekend." },
    { id: "p18", day: "d3", start: "20:30", end: "21:30", room: "seongsu", type: "Finale", track: "sound", speakers: ["eunwoo-jang", "taehyun-lim"], title: "까치 클로징 믹스 · KKACHI Closing Signal", abstract: "주말 동안 만든 배지와 포스터를 들고 모여 다음 주 번개를 예고하는 마무리 세션. / Bring the pixel badge you made and catch next week's spontaneous pop-meeting drops." }
  ] as SessionItem[],
  breaks: [
    { day: "d1", start: "09:00", end: "10:00", room: "desk", title: "체크인 & 픽셀 배지 수령 · Check-in & Badge Pickup" },
    { day: "d1", start: "12:00", end: "13:00", room: "hannam", title: "점심 피크닉 · Courtyard Lunch Break" },
    { day: "d2", start: "12:30", end: "13:30", room: "desk", title: "오픈 커뮤니티 테이블 · Open Table & Coffee" },
    { day: "d2", start: "17:00", end: "17:30", room: "desk", title: "까치 배지 스왑 · Pixel Badge Swap (Bring yours!)" },
    { day: "d3", start: "11:45", end: "12:30", room: "desk", title: "선데이 브런치 체크인 · Sunday Brunch Check-in" }
  ] as BreakItem[],
  tickets: [
    { id: "community-free", name: "Community Free · 기본 멤버십", price: 0, allocation: 400, sold: 312, left: 88, includes: "앱 다운로드, MAP 실시간 스팟 탐색, 주간 FEED 열람, 기본 1일 1회 팝미팅 참여 · Free app & map access", color: "#CBFE23" },
    { id: "pop-pass", name: "Pop Supporter · 팝 서포터 패스", price: 19000, allocation: 160, sold: 118, left: 42, includes: "원데이 팝미팅 무제한 찜, 워크숍 재료 지원, 음료 쿠폰 2매 · Unlimited pop-meetings & workshop kit", color: "#A6C41D" },
    { id: "host-creator", name: "Host Creator · 호스트 크리에이터", price: 39000, allocation: 80, sold: 58, left: 22, includes: "직접 팝미팅 개설, 성수/연남 라운지 우선 대관, 커스텀 배지 굿즈 · Host your own pop-meeting", color: "#576B0D" }
  ] as TicketTier[],
  faq: [
    { q: "까치(KKACHI)는 어떤 앱인가요? · What is KKACHI?", a: "까치는 내 주변 500m~3km 반경 안에서 지금 바로 가볍게 만날 수 있는 취향 기반 팝미팅(번개 모임) 커뮤니티 앱입니다. 거창한 자기소개나 회비 부담 없이 산책, 커피, 음악, 공예를 1시간 남짓 함께 즐길 수 있습니다. / KKACHI connects neighbors for spontaneous 1-hour pop-meetings nearby—walks, coffee, vinyl listening, and craft—without awkward networking pressure." },
    { q: "혼자 참여해도 어색하지 않나요? · Is it okay to join solo?", a: "전체 참여자의 84%가 혼자 참여합니다. '고요 라운지 묵독'이나 '바이닐 리스닝'처럼 말없이 함께 있는 모임도 많아 내향적인 분들도 편안하게 머물 수 있습니다. / 84% of members join solo. Quiet formats like silent reading and vinyl listening let you feel welcome without forced small talk." },
    { q: "왜 브랜드 컬러가 밝은 라임-차트뢰즈인가요? · Why the chartreuse-lime palette?", a: "까치가 전하는 반가운 첫 신호처럼, 도시의 회색 콘크리트 속에서 가장 먼저 눈에 띄는 생동감을 표현합니다. 모든 UI는 하나의 라임 휴에서 채도와 명도만을 변주해 통일감을 유지합니다. / Inspired by the magpie's bright morning signal, our entire visual system varies only saturation and brightness from one signature chartreuse-lime hue." },
    { q: "앱 출시는 언제인가요? · When does the app launch?", a: "현재 iOS / Android 오픈 베타 대기자 등록이 열려 있으며, GET A APP 페이지에서 패스를 선택해 사전 참여권을 확보할 수 있습니다. / Open beta is live for Seoul hubs—reserve your starter pass on the GET A APP page." }
  ],
  venuePlan: [
    { id: "seongsu", label: "성수 Hub", x: 1, y: 1, w: 22, h: 14, fill: "#CBFE23", text: "#0A0A0A" },
    { id: "yeonnam", label: "연남 Loft", x: 24, y: 1, w: 15, h: 9, fill: "#E7F08B", text: "#0A0A0A" },
    { id: "quiet", label: "Quiet L2", chip: "L2", x: 24, y: 11, w: 7, h: 4, fill: "#B5BF6E", text: "#0A0A0A" },
    { id: "desk", label: "Desk", x: 32, y: 11, w: 7, h: 4, fill: "#F2F6CA", text: "#0A0A0A" },
    { id: "hannam", label: "한남 Yard", x: 1, y: 16, w: 38, h: 7, fill: "#A6C41D", text: "#0A0A0A" },
    { id: "euljiro", label: "을지로 Roof", chip: "L4", x: 30, y: 17, w: 8, h: 5, fill: "#323E07", text: "#CBFE23" }
  ] as VenuePlanItem[],
  feedPosts: [
    {
      id: "f1",
      author: "커피공방 리플로우",
      handle: "@reflow_seongsu",
      avatarKind: "coffee",
      time: "2시간 전",
      area: "성수 베이스캠프 · Walk & Coffee",
      track: "walk",
      sessionId: "p01",
      likes: 42,
      joined: ["유", "유", "유", "민"],
      joinedCount: 5,
      extraCount: 1,
      caption: "지난 주말 핸드드립 클래스 현장 스케치 ☕ 다음 모임도 많관부!",
      captionEn: "Weekend hand-drip pop-meeting sketch in Seongsu — join the next morning drop!",
      mediaKind: "drip",
      comments: [
        { author: "민지", text: "산미 있는 원두 추출 팁 덕분에 아침이 즐거워졌어요!" },
        { author: "지훈", text: "이번 금요일 오전 모임도 신청했어요 :)" }
      ]
    },
    {
      id: "f2",
      author: "성수멍멍이",
      handle: "@seongsu_paws",
      avatarKind: "dog",
      time: "5시간 전",
      area: "한남 중정 · 서울숲 산책",
      track: "walk",
      sessionId: "p10",
      likes: 31,
      joined: ["하", "서", "지", "도"],
      joinedCount: 6,
      extraCount: 2,
      caption: "노을 질 때 강아지랑 서울숲 한 바퀴 산책 번개! 혼자 오셔도 금방 친해져요 🐾",
      captionEn: "Sunset dog-walk pop-meeting around Seoul Forest — solo walkers welcome!",
      mediaKind: "walk",
      comments: [
        { author: "유나", text: "반려견 없어도 같이 걸을 수 있어서 너무 좋았어요." }
      ]
    },
    {
      id: "f3",
      author: "연남 리소프레스",
      handle: "@yeonnam_riso",
      avatarKind: "riso",
      time: "어제",
      area: "연남 다락 · Studio Craft",
      track: "craft",
      sessionId: "p02",
      likes: 58,
      joined: ["서", "하", "소", "은"],
      joinedCount: 8,
      extraCount: 3,
      caption: "시그니처 라임 + 먹색 2도 잉크로 찍어낸 오늘의 동네 포스터! 처음 해본 분들도 15분 만에 완성했어요.",
      captionEn: "Two-ink risograph posters printed in vivid lime & obsidian black at Yeonnam Loft.",
      mediaKind: "riso",
      comments: [
        { author: "태현", text: "색감 진짜 깔끔해요! 다음 포스터 워크숍 대기합니다." }
      ]
    },
    {
      id: "f4",
      author: "을지로 테이프룸",
      handle: "@euljiro_vinyl",
      avatarKind: "vinyl",
      time: "1일 전",
      area: "을지로 옥상 · Sound & Vinyl",
      track: "sound",
      sessionId: "p03",
      likes: 64,
      joined: ["도", "태", "은", "백"],
      joinedCount: 9,
      extraCount: 4,
      caption: "말없이 앨범 한 장 통째로 듣는 오후의 리스닝 팝미팅. 내향인 멤버분들 최애 코스!",
      captionEn: "Zero small-talk vinyl listening session — an introvert favorite.",
      mediaKind: "vinyl",
      comments: [
        { author: "유나", text: "퇴근 후 머리가 맑아지는 최고의 한 시간이었습니다." }
      ]
    }
  ] as FeedPostItem[],
  copy: {
    siteTitleSuffix: " — 까치 KKACHI",
    homeTitle: "까치 KKACHI — 팝미팅 커뮤니티 앱 · Pop-Meeting Community App",
    heroH1: "까치 KKACHI, 지금 가장 가까운 취향의 팝미팅 커뮤니티 앱.",
    heroAddress: ["지금 바로, 내 주변 1km 팝미팅", "Spontaneous local pop-meetings nearby", "Seoul · Seongsu · Yeonnam · Euljiro"],
    heroDate: "21–23.05.2027 · BETA LIVE",
    heroTimes: ["모임 10.00–21.30 KST", "Pop-meetings daily"],
    heroCycle: [
      { desktop: "KKACHI", mobile: ["KKA", "CHI"], caption: "(까치 — 지금 반가운 소식을 전하는 팝미팅 커뮤니티 · Click to morph)" },
      { desktop: "POP!27", mobile: ["POP", "!27"], caption: "(POP MEETING — 가볍게 모였다 흩어지는 취향 번개)" },
      { desktop: "SEOUL", mobile: ["SEO", "UL"], caption: "(MAP — 성수 · 연남 · 을지로 · 한남 6개 스팟 실시간 오픈)" },
      {
        desktop: "", mobile: [], caption: "(까치 — 반가운 소식을 전하는 로고 · Click to morph)",
        logo: true, logoDesktop: LOGO_PIXEL_GRID_DESKTOP, logoMobile: LOGO_PIXEL_GRID_MOBILE
      }
    ] as HeroCycleItem[],
    heroSplit: [
      { left: "", right: "거창한 약속 대신, 반가운 손님이 온다는 까치의 신호처럼" },
      { left: "지금 내 반경 1km 안에서", right: "가볍게 취향을 나누는 팝미팅 커뮤니티" },
      { left: "까치 · KKACHI", right: "" },
      { left: "산책과 드립 커피, 바이닐 리스닝,", right: "리소그래피와 심야 러닝까지" },
      { left: "Seoul 6개 팝 스팟에서", right: "누구나 가볍게 열고, 혼자 와도 편안하게" }
    ] as SplitLine[],
    heroFinal: "GET A APP · 지금 시작하기",
    aboutLead: "까치 : 취향 기반 커뮤니티(우리는 팝미팅을 열어요) — Pop up? Nono, pop meeting!! We poped meeting everywhere.",
    aboutP1: "취향, 라이프 스타일을 공유하다. 까치는 장소를 배경으로 취향이 비슷한 사람들이 모이는 곳입니다. 우리는 여기서 취향과 라이프 스타일을 공유할 수 있어요. / KKACHI connects people with similar tastes around inspiring places.",
    aboutP2: "Who? 새로운 장소에서 새로운 사람들과 함께 새로운 경험을 하고 싶은 누구나 행사를 열 수 있습니다. New Area, New People, New Activity, New Community — Let's find me!",
    tracksLead: "네 가지 팝미팅 무드 · Four pop-meeting moods across Seoul.",
    daysLead: "이번 주말 열리는 팝미팅 캘린더 · Fri Signal, Sat Orbit, Sun Echo.",
    speakersLead: "동네의 취향을 여는 10명의 크루 호스트 · Meet the 10 community hosts.",
    posterLeftHead: ["까치", "FEED", "40줄 코드로 만든", "커뮤니티 포스터 월", "«Click to remix»"],
    posterRightHead: [
      "성수 · 연남 · 을지로 · 한남 팝 스팟",
      "라임 휴(Hue)의 채도와 명도만 변주한 그래픽 시스템",
      "Walk, Sound, Craft, Night 4개 트랙",
      "16×16 픽셀 프로필 배지 스왑 매주 토 17.00",
      "Click any tile below to cycle saturation"
    ],
    scheduleTitle: "POP MEETING · 주간 팝미팅 일정",
    scheduleLead: "시간대별 팝미팅을 탐색하고 + 버튼을 눌러 내 일정에 담아보세요. 시간 중복(Clash)도 자동으로 확인됩니다. / Filter by day or mood, star your favorite pop-meetings, and export .ics.",
    speakersTitle: "FEED · 크루 호스트 & 커뮤니티 피드",
    speakersLeadPage: "호스트 카드에 마우스를 올리면 픽셀 포트레이트의 컬러 웨이브가 반전됩니다. / Hover any portrait to wave-swap its lime palette, or click to inspect resolution.",
    talksTitle: "POP MEETING DIRECTORY · 전체 모임 검색",
    talksLead: "키워드·트랙·유형으로 원하는 팝미팅을 빠르게 찾아보세요. / Search every pop-meeting by keyword, mood, or host.",
    venueTitle: "MAP · 까치 동네 모임 지도",
    venueLead: "지금 내 주변에서 열리고 있는 팝미팅을 까치 지도 앱 홈 탭에서 바로 탐색해 보세요. / Explore live neighborhood pop-meetings directly inside the KKACHI Map home tab.",
    venueGettingThere: "모든 스팟은 지하철역 도보 5분 이내에 위치하며, 앱 내 MAP 탭에서 실시간 혼잡도와 남은 좌석을 확인할 수 있습니다. / Every hub sits within a 5-minute walk of a metro station with live seat counters inside the app.",
    venueAccess: [
      "전 지점 휠체어·유모차 배리어프리 출입 · Step-free entrance & lift",
      "초보·혼자 참여자 전용 웰컴 가이드 · Solo-friendly host greeting",
      "조용한 묵독 전용 Quiet Lounge 상시 개방 · Quiet reading zone",
      "성수·연남 무료 짐 보관 및 픽셀 배지 데스크 · Free cloakroom & badge desk"
    ],
    badgeTitle: "PROFILE · 나만의 까치 픽셀 배지",
    badgeLead: "16 × 16 픽셀 아바타와 닉네임을 디자인해 SVG로 저장하고 오프라인 배지 스왑에 가져오세요. / Paint your 16×16 avatar sprite and download a printable profile badge.",
    colophon: "까치(KKACHI) 팝미팅 커뮤니티 브랜드 페이지. 첨부된 시그니처 라임 컬러의 채도와 명도만을 변주해 구성했습니다. / Built with saturation & lightness variations of KKACHI's chartreuse-lime palette.",
    honesty: "까치(KKACHI)는 취향 기반 팝미팅 커뮤니티 브랜드 쇼케이스입니다. 모든 모임 일정, 배지 에디터, 정원 시뮬레이터가 실제로 동작합니다. / Interactive brand showcase for KKACHI.",
    version: "© 2027 까치 KKACHI · Brand System v1.0",
    countdownOver: "이번 주 플래그십 팝미팅이 지금 막 시작되었습니다! / Flagship pop-meeting is live now."
  }
};
