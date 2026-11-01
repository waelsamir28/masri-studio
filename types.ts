

export type Gender = 'MALE' | 'FEMALE';

export enum GenerationState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface VoiceActor {
  id: string;
  name: string;
  nameAr: string;
  gender: Gender;
  geminiModel: string; // The underlying AI model name
  description: string;
  imageColor: string; // For the avatar UI
}

export const VOICE_ACTORS: VoiceActor[] = [
  // ==================== MALES (11 Actors) ====================
  {
    id: 'actor_hassan',
    name: 'Hassan',
    nameAr: 'حسن',
    gender: 'MALE',
    geminiModel: 'Charon',
    description: 'Deep & Authoritative',
    imageColor: 'from-blue-900 to-slate-900'
  },
  {
    id: 'actor_amr',
    name: 'Amr',
    nameAr: 'عمرو',
    gender: 'MALE',
    geminiModel: 'Charon',
    description: 'The Voice of Egypt (Promo)',
    imageColor: 'from-indigo-900 to-black'
  },
  {
    id: 'actor_mido',
    name: 'Mido',
    nameAr: 'ميدو',
    gender: 'MALE',
    geminiModel: 'Fenrir',
    description: 'Energetic & Youthful',
    imageColor: 'from-amber-700 to-orange-900'
  },
  {
    id: 'actor_sherif',
    name: 'Sherif',
    nameAr: 'شريف',
    gender: 'MALE',
    geminiModel: 'Fenrir',
    description: 'Energetic Radio Host',
    imageColor: 'from-red-900 to-slate-900'
  },
  {
    id: 'actor_tarek',
    name: 'Tarek',
    nameAr: 'طارق',
    gender: 'MALE',
    geminiModel: 'Fenrir', 
    description: 'Strong & Serious',
    imageColor: 'from-emerald-900 to-slate-900'
  },
  {
    id: 'actor_khaled',
    name: 'Khaled',
    nameAr: 'خالد',
    gender: 'MALE',
    geminiModel: 'Charon',
    description: 'Documentary Style',
    imageColor: 'from-cyan-900 to-slate-900'
  },
  // -- NEW MALES --
  {
    id: 'actor_magdy',
    name: 'Magdy',
    nameAr: 'عم مجدي',
    gender: 'MALE',
    geminiModel: 'Charon',
    description: 'Wise Grandfather',
    imageColor: 'from-slate-600 to-gray-900'
  },
  {
    id: 'actor_youssef',
    name: 'Youssef',
    nameAr: 'يوسف',
    gender: 'MALE',
    geminiModel: 'Zephyr',
    description: 'Calm Intellectual',
    imageColor: 'from-teal-900 to-black'
  },
  {
    id: 'actor_seif',
    name: 'Seif',
    nameAr: 'سيف',
    gender: 'MALE',
    geminiModel: 'Fenrir',
    description: 'Dramatic & Intense',
    imageColor: 'from-red-950 to-black'
  },
  {
    id: 'actor_kareem',
    name: 'Kareem',
    nameAr: 'كريم',
    gender: 'MALE',
    geminiModel: 'Puck',
    description: 'Friendly Tech Reviewer',
    imageColor: 'from-blue-600 to-blue-900'
  },
  {
    id: 'actor_moataz',
    name: 'Moataz',
    nameAr: 'معتز',
    gender: 'MALE',
    geminiModel: 'Charon',
    description: 'Late Night FM Host',
    imageColor: 'from-purple-950 to-black'
  },

  // ==================== FEMALES (9 Actors) ====================
  {
    id: 'actor_layla',
    name: 'Layla',
    nameAr: 'ليلى',
    gender: 'FEMALE',
    geminiModel: 'Kore',
    description: 'Natural & Warm',
    imageColor: 'from-purple-900 to-slate-900'
  },
  {
    id: 'actor_dalia',
    name: 'Dalia',
    nameAr: 'داليا',
    gender: 'FEMALE',
    geminiModel: 'Kore',
    description: 'News Anchor (Official)',
    imageColor: 'from-fuchsia-900 to-slate-900'
  },
  {
    id: 'actor_sarah',
    name: 'Sarah',
    nameAr: 'سارة',
    gender: 'FEMALE',
    geminiModel: 'Aoede',
    description: 'Playful & Sharp',
    imageColor: 'from-pink-900 to-rose-950'
  },
  {
    id: 'actor_rania',
    name: 'Rania',
    nameAr: 'رانيا',
    gender: 'FEMALE',
    geminiModel: 'Aoede',
    description: 'Soft Commercial Voice',
    imageColor: 'from-rose-900 to-black'
  },
  // -- NEW FEMALES --
  {
    id: 'actor_hoda',
    name: 'Hoda',
    nameAr: 'هدى',
    gender: 'FEMALE',
    geminiModel: 'Aoede',
    description: 'Energetic & Loud',
    imageColor: 'from-orange-700 to-red-900'
  },
  {
    id: 'actor_nour',
    name: 'Nour',
    nameAr: 'نور',
    gender: 'FEMALE',
    geminiModel: 'Kore',
    description: 'Soft & Romantic',
    imageColor: 'from-pink-400 to-rose-900'
  },
  {
    id: 'actor_menna',
    name: 'Menna',
    nameAr: 'منة',
    gender: 'FEMALE',
    geminiModel: 'Aoede',
    description: 'Gen-Z Influencer (Fast)',
    imageColor: 'from-yellow-600 to-amber-900'
  },
  {
    id: 'actor_salma',
    name: 'Salma',
    nameAr: 'سلمى',
    gender: 'FEMALE',
    geminiModel: 'Kore',
    description: 'Corporate Professional',
    imageColor: 'from-cyan-800 to-blue-950'
  },
  {
    id: 'actor_faten',
    name: 'Faten',
    nameAr: 'فاتن',
    gender: 'FEMALE',
    geminiModel: 'Kore',
    description: 'Classic Actress',
    imageColor: 'from-violet-900 to-fuchsia-950'
  }
];

export interface VoicePreset {
  id: string;
  label: string;
  labelAr: string;
  icon: string;
  category: string;
  systemPrompt: string;
}

// Extensive Library of Egyptian Presets (80+)
export const VOICE_PRESETS: VoicePreset[] = [
  // ================= STARS (Celebrity Impressions) =================
  { id: 'p_star_henedy', label: 'The Comedian', labelAr: 'أسلوب هنيدي', icon: 'fa-face-grin-squint-tears', category: 'STARS', systemPrompt: 'Speak in a very high-pitched, fast, and squeaky comedic Egyptian accent. Sound energetic, funny, and slightly chaotic, like a small person trying to be tough.' },
  { id: 'p_star_chawali', label: 'The Commentator', labelAr: 'أسلوب الشوالي', icon: 'fa-microphone-lines', category: 'STARS', systemPrompt: 'Speak like a legendary football commentator. Extremely loud, passionate, shouting with adrenaline, stretching vowels poetically, and speaking in rapid bursts of energy.' },
  { id: 'p_star_adel', label: 'The Leader', labelAr: 'أسلوب الزعيم', icon: 'fa-user-tie', category: 'STARS', systemPrompt: 'Speak with a deep, raspy, and authoritative voice. Use long, dramatic pauses, a sarcastic tone, and distinct Egyptian intonations that sound iconic and commanding.' },
  { id: 'p_star_villain', label: 'Classic Villain', labelAr: 'شرير كلاسيكي', icon: 'fa-user-secret', category: 'STARS', systemPrompt: 'Speak like an old Egyptian movie villain (e.g. Tawfik El Deken). Smooth, sneaky, slightly laughing while threatening, using polite words with evil intent.' },
  { id: 'p_star_action', label: 'Action Hero', labelAr: 'نجم أكشن', icon: 'fa-gun', category: 'STARS', systemPrompt: 'Speak like an intense action movie star (e.g. Ahmed El Sakka). Breathless, serious, fast-paced, masculine, and full of grit and determination.' },
  { id: 'p_star_diva', label: 'The Diva', labelAr: 'نجمة الزمن الجميل', icon: 'fa-star', category: 'STARS', systemPrompt: 'Speak like a classic Egyptian golden age actress. Very soft, melodic, dramatic, and slightly over-acting with a posh accent.' },
  // -- NEW STARS (10 ADDED) --
  { id: 'p_star_ramadan', label: 'Number One', labelAr: 'الأسطورة', icon: 'fa-crown', category: 'STARS', systemPrompt: 'Speak like a confident, aggressive street leader (Number One). Use strong, assertive language, distinct pauses, and a tone of absolute superiority and street wisdom.' },
  { id: 'p_star_abla', label: 'The Auntie', labelAr: 'عبلة', icon: 'fa-face-sad-cry', category: 'STARS', systemPrompt: 'Speak like an authentic, dramatic Egyptian woman (Abla Kamel style). Use a complaining, emotional, slightly wailing tone, emphasizing tragedy even in small things.' },
  { id: 'p_star_lemby', label: 'The Slacker', labelAr: 'اللمبي', icon: 'fa-face-dizzy', category: 'STARS', systemPrompt: 'Speak like "El Lemby". Slur your words, speak slowly and confusedly, drag out the ends of sentences, and use a very specific, funny, stoned-like intonation.' },
  { id: 'p_star_ramez', label: 'The Prankster', labelAr: 'رامز', icon: 'fa-face-grin-tongue-wink', category: 'STARS', systemPrompt: 'Speak like Ramez Galal in a prank show intro. Extremely fast, screaming, hysterical, rhyming words, and full of chaotic high energy.' },
  { id: 'p_star_magic', label: 'The Magician', labelAr: 'الساحر', icon: 'fa-hat-wizard', category: 'STARS', systemPrompt: 'Speak like Mahmoud Abdel Aziz (The Magician). Smooth, charming, slightly raspy, with a warm, fatherly but clever tone. Very charismatic and relaxed.' },
  { id: 'p_star_emperor', label: 'The Emperor', labelAr: 'الإمبراطور', icon: 'fa-chess-king', category: 'STARS', systemPrompt: 'Speak like Ahmed Zaki. Intense, deep, emotional, and methodic. Use a gravelly voice that conveys heavy emotion and seriousness.' },
  { id: 'p_star_kabeer', label: 'The Mayor', labelAr: 'الكبير', icon: 'fa-user-sheriff', category: 'STARS', systemPrompt: 'Speak like "El Kabeer". A strong, authoritative Upper Egyptian (Saidi) accent, but with a comedic, bossy twist. Deep voice, commanding respect.' },
  { id: 'p_star_ismail', label: 'Classic Goof', labelAr: 'سمعة', icon: 'fa-face-grin-beam', category: 'STARS', systemPrompt: 'Speak like Ismail Yassine. High-pitched, stuttering, scared, and energetic. Use his iconic mouthy way of speaking and exaggerated fear.' },
  { id: 'p_star_saeed', label: 'The Friend', labelAr: 'سعيد صالح', icon: 'fa-masks-theater', category: 'STARS', systemPrompt: 'Speak like Saeed Saleh. Careless, laughing while talking, improvisational tone, friendly but sarcastic and non-serious.' },
  { id: 'p_star_hany', label: 'The Soft Singer', labelAr: 'هاني', icon: 'fa-guitar', category: 'STARS', systemPrompt: 'Speak like a sensitive romantic singer (e.g. Hany Shaker). Very soft, polite, almost crying from emotion, very formal and dramatic.' },

  // ================= ADS / PROMOTIONAL =================
  { id: 'p_ads_1', label: 'Promotional', labelAr: 'إعلاني ١', icon: 'fa-bullhorn', category: 'ADS', systemPrompt: 'A vibrant, energetic promotional tone spoken with a clear Egyptian accent. The delivery is rapid, engaging, and full of excitement, projecting confidence and strong persuasive power. It keeps the listener hooked with its lively rhythm and bold, attention-commanding presence.' },
  { id: 'p_ads_2', label: 'Promotional 2', labelAr: 'إعلاني ٢', icon: 'fa-certificate', category: 'ADS', systemPrompt: 'A high-energy, upbeat promotional tone, delivered in a lively Egyptian accent. The voice is fast, sharp, and attention-grabbing, packed with enthusiasm and confidence. It sounds dynamic and impactful, pushing the message forward with clarity and a persuasive drive that keeps the listener fully engaged.' },
  { id: 'p_ads_3', label: 'Promotional 3', labelAr: 'إعلاني ٣', icon: 'fa-bolt', category: 'ADS', systemPrompt: 'An excited, enthusiastic, and highly promotional tone — fast-paced, clear, and persuasive, delivered with an Egyptian Arabic accent. It brings high energy from the first second, grabs attention instantly, and uses a motivating, compelling style that encourages the listener to take action right away.' },
  { id: 'p_ads_4', label: 'Promotional 4', labelAr: 'إعلاني ٤', icon: 'fa-star', category: 'ADS', systemPrompt: 'A Cinematic, Epic Trailer tone. Deep, slow, and resonant Egyptian Arabic. It sounds like a high-budget movie trailer or a luxury car commercial. Mysterious, grand, and commanding.' },
  { id: 'p_ads_5', label: 'Promotional 5', labelAr: 'إعلاني ٥', icon: 'fa-fire', category: 'ADS', systemPrompt: 'Hard Sell urgency. Very fast, shouting excitedly about discounts and limited time offers (Flash Sale style). Authentic Egyptian street market energy, high volume, very pushy and convincing.' },
  { id: 'p_ads_6', label: 'Promotional 6', labelAr: 'إعلاني ٦', icon: 'fa-hand-holding-heart', category: 'ADS', systemPrompt: 'Trustworthy and Warm. A calm, advice-giving tone like a close friend recommending a product. Sincere, smiling voice, soft but very persuasive and reassuring.' },
  { id: 'p_ads_7', label: 'Promotional 7', labelAr: 'إعلاني ٧', icon: 'fa-music', category: 'ADS', systemPrompt: 'Youthful Rhythmic Hype. Speaking with a musical rhythm, almost like rapping or Mahraganat style. Full of slang, very loud, energetic, and targeting a Gen-Z audience.' },
  { id: 'p_ads_8', label: 'Promotional 8', labelAr: 'إعلاني ٨', icon: 'fa-volume-high', category: 'ADS', systemPrompt: 'A dynamic, high-impact promotional tone in a natural Egyptian accent. The delivery is fast, bold, and full of enthusiasm, creating an irresistible sense of urgency that drives the listener to take immediate action.' },
  { id: 'p_ads_9', label: 'Promotional 9', labelAr: 'إعلاني ٩', icon: 'fa-wand-sparkles', category: 'ADS', systemPrompt: 'A crisp, energetic voiceover style with a distinctly Egyptian accent — sharp, lively, and persuasive. The tone bursts with excitement and confidence, making the message sound powerful and highly engaging.' },
  { id: 'p_ads_10', label: 'Promotional 10', labelAr: 'إعلاني ١٠', icon: 'fa-rocket', category: 'ADS', systemPrompt: 'A fast-paced, enthusiastic marketing tone delivered in a warm Egyptian accent. It’s vibrant, expressive, and attention-grabbing, pushing the message forward with strong promotional energy and clear, convincing delivery.' },
  { id: 'p_ads_11', label: 'Promotional 11', labelAr: 'إعلاني ١١', icon: 'fa-sun', category: 'ADS', systemPrompt: 'A bold, upbeat commercial tone featuring a bright Egyptian accent. The speech is quick, impactful, and charged with enthusiasm, creating a compelling promotional atmosphere that holds the listener’s focus.' },
  { id: 'p_ads_12', label: 'Promotional 12', labelAr: 'إعلاني ١٢', icon: 'fa-trophy', category: 'ADS', systemPrompt: 'A lively, persuasive voice tone in a smooth Egyptian accent. The pace is energetic and the delivery is confident, blending excitement with clarity to produce a powerful, highly engaging promotional feel.' },
  { id: 'p_ads_13', label: 'Promotional 13', labelAr: 'إعلاني ١٣', icon: 'fa-gauge-high', category: 'ADS', systemPrompt: 'An ultra-energetic, fast-cut promotional tone delivered in a sharp Egyptian accent. The voice is punchy, confident, and urgency-driven, designed to grab attention instantly and keep momentum high.' },
  { id: 'p_ads_14', label: 'Promotional 14', labelAr: 'إعلاني ١٤', icon: 'fa-stopwatch', category: 'ADS', systemPrompt: 'A powerful, high-speed commercial tone with a lively Egyptian accent. The delivery is bold and rhythmic, packed with enthusiasm and persuasive force that pushes the message forward without slowing down.' },
  { id: 'p_ads_15', label: 'Promotional 15', labelAr: 'إعلاني ١٥', icon: 'fa-bullseye', category: 'ADS', systemPrompt: 'A rapid-fire, high-impact advertising voice in a clear Egyptian accent. It sounds confident, exciting, and action-oriented, creating immediate engagement and strong promotional presence.' },
  { id: 'p_ads_16', label: 'Promotional 16', labelAr: 'إعلاني ١٦', icon: 'fa-chart-line', category: 'ADS', systemPrompt: 'A fast, dynamic marketing tone spoken with a vibrant Egyptian accent. The energy is constant, the rhythm is tight, and the delivery feels modern, persuasive, and attention-commanding.' },
  { id: 'p_ads_17', label: 'Promotional 17', labelAr: 'إعلاني ١٧', icon: 'fa-fire-flame-curved', category: 'ADS', systemPrompt: 'An aggressive yet clean promotional tone in an authentic Egyptian accent. The pace is quick, the emphasis is strong, and the voice delivers excitement, confidence, and urgency in every line.' },
  { id: 'p_ads_18', label: 'Promotional 18', labelAr: 'إعلاني ١٨', icon: 'fa-forward', category: 'ADS', systemPrompt: 'A high-energy, quick-tempo commercial voice delivered in a confident Egyptian accent. It’s sharp, engaging, and persuasive, designed to spark interest instantly and drive immediate action.' },

  // ================= GENERAL =================
  { id: 'p_natural', label: 'Natural', labelAr: 'طبيعي', icon: 'fa-user', category: 'GENERAL', systemPrompt: 'natural and calm' },
  { id: 'p_formal', label: 'Formal', labelAr: 'رسمي', icon: 'fa-tie', category: 'GENERAL', systemPrompt: 'very formal and polite, suitable for business or news' },
  { id: 'p_promo', label: 'Promo', labelAr: 'إعلان حماسي', icon: 'fa-bullhorn', category: 'GENERAL', systemPrompt: 'professional, energetic and persuasive commercial voice' },
  { id: 'p_whisper', label: 'Whisper', labelAr: 'همس', icon: 'fa-comment-slash', category: 'GENERAL', systemPrompt: 'soft whispering, as if sharing a secret' },
  { id: 'p_shout', label: 'Shouting', labelAr: 'زعيق', icon: 'fa-bullhorn', category: 'GENERAL', systemPrompt: 'shouting loudly and angrily' },
  { id: 'p_fast', label: 'Fast Talker', labelAr: 'سريع جداً', icon: 'fa-bolt', category: 'GENERAL', systemPrompt: 'speaking very fast, like someone in a hurry' },
  { id: 'p_slow', label: 'Slow', labelAr: 'بطيء', icon: 'fa-hourglass', category: 'GENERAL', systemPrompt: 'speaking very slowly, emphasizing every word' },
  { id: 'p_poetic', label: 'Poetic', labelAr: 'شاعري', icon: 'fa-feather', category: 'GENERAL', systemPrompt: 'poetic, rhythmic, and full of feeling' },
  { id: 'p_storyteller', label: 'Storyteller', labelAr: 'حكواتي', icon: 'fa-book-open', category: 'GENERAL', systemPrompt: 'engaging storytelling tone, varying pitch for suspense' },
  { id: 'p_tired', label: 'Tired', labelAr: 'مُرهق', icon: 'fa-battery-quarter', category: 'GENERAL', systemPrompt: 'exhausted, out of breath, tired voice' },
  { id: 'p_confident', label: 'Confident', labelAr: 'واثق', icon: 'fa-thumbs-up', category: 'GENERAL', systemPrompt: 'full of confidence and assurance' },
  { id: 'p_secret', label: 'Secretive', labelAr: 'غامض', icon: 'fa-user-secret', category: 'GENERAL', systemPrompt: 'mysterious, low tone, secretive' },
  
  // ================= STREET & CHARACTERS (14) =================
  { id: 'p_saidi', label: 'Saidi', labelAr: 'صعيدي', icon: 'fa-mountain', category: 'CHARACTER', systemPrompt: 'with a strong Saidi accent from Upper Egypt. Deep and authentic' },
  { id: 'p_driver', label: 'Microbus Driver', labelAr: 'سواق ميكروباص', icon: 'fa-bus', category: 'CHARACTER', systemPrompt: 'loud, rude microbus driver shouting destinations' },
  { id: 'p_ahwagy', label: 'Ahwagy', labelAr: 'قهوجي', icon: 'fa-coffee', category: 'CHARACTER', systemPrompt: 'Egyptian waiter (Ahwagy), polite but with street slang' },
  { id: 'p_vendor', label: 'Street Vendor', labelAr: 'بياع سريح', icon: 'fa-carrot', category: 'CHARACTER', systemPrompt: 'street vendor calling out to sell goods. Melodic shouting' },
  { id: 'p_beggar', label: 'Beggar', labelAr: 'شحات', icon: 'fa-hand-holding-dollar', category: 'CHARACTER', systemPrompt: 'beggar asking for money, voice trembling and pleading' },
  { id: 'p_thug', label: 'Thug', labelAr: 'بلطجي', icon: 'fa-gavel', category: 'CHARACTER', systemPrompt: 'thug (Baltagy). Aggressive, threatening, using deep street slang' },
  { id: 'p_mechanic', label: 'Mechanic', labelAr: 'ميكانيكي', icon: 'fa-wrench', category: 'CHARACTER', systemPrompt: 'mechanic explaining a car problem. Greasy voice, authoritative' },
  { id: 'p_tuktuk', label: 'TukTuk Driver', labelAr: 'سواق توكتوك', icon: 'fa-motorcycle', category: 'CHARACTER', systemPrompt: 'young TukTuk driver, listening to loud music, energetic' },
  { id: 'p_sayes', label: 'Sayes', labelAr: 'سايس', icon: 'fa-car', category: 'CHARACTER', systemPrompt: 'Sayes guiding a car (Erga3, Ta3ala). Loud and helpful' },
  { id: 'p_bawab', label: 'Doorman', labelAr: 'بواب', icon: 'fa-door-closed', category: 'CHARACTER', systemPrompt: 'Egyptian Bawab. Humble, subservient tone' },
  { id: 'p_semsar', label: 'Broker', labelAr: 'سمسار', icon: 'fa-handshake', category: 'CHARACTER', systemPrompt: 'Semsar (Real Estate Broker). Fast talker, trying to close a deal, sneaky' },
  { id: 'p_alex', label: 'Alexandrian', labelAr: 'إسكندراني', icon: 'fa-water', category: 'CHARACTER', systemPrompt: 'with an Alexandrian accent (Iskandarani)' },
  { id: 'p_falah', label: 'Farmer', labelAr: 'فلاحي', icon: 'fa-wheat', category: 'CHARACTER', systemPrompt: 'authentic Egyptian farmer (Falah). Simple, kind, rural accent' },
  { id: 'p_fisherman', label: 'Fisherman', labelAr: 'صياد', icon: 'fa-fish', category: 'CHARACTER', systemPrompt: 'fisherman shouting fresh fish. Rough and loud' },

  // ================= PROFESSIONS (12) =================
  { id: 'p_doctor', label: 'Doctor', labelAr: 'دكتور', icon: 'fa-user-md', category: 'PROFESSION', systemPrompt: 'doctor giving a diagnosis. Calm, professional, slightly distant' },
  { id: 'p_teacher', label: 'Teacher', labelAr: 'مدرس', icon: 'fa-chalkboard-user', category: 'PROFESSION', systemPrompt: 'strict teacher explaining a lesson to students' },
  { id: 'p_officer', label: 'Police Officer', labelAr: 'ضابط شرطة', icon: 'fa-shield-halved', category: 'PROFESSION', systemPrompt: 'police officer interrogating someone. Stern and serious' },
  { id: 'p_hostess', label: 'Flight Attendant', labelAr: 'مضيفة طيران', icon: 'fa-plane', category: 'PROFESSION', systemPrompt: 'flight attendant making an announcement. Very polite and rehearsed' },
  { id: 'p_marketer', label: 'Salesman', labelAr: 'مندوب مبيعات', icon: 'fa-tag', category: 'PROFESSION', systemPrompt: 'pushy salesman trying to sell a product. Fast, convincing, fake smile' },
  { id: 'p_sheikh', label: 'Preacher', labelAr: 'خطيب', icon: 'fa-mosque', category: 'PROFESSION', systemPrompt: 'religious preacher giving a sermon. Resonant, rhythmic voice' },
  { id: 'p_commentator', label: 'Commentator', labelAr: 'معلق كروي', icon: 'fa-futbol', category: 'PROFESSION', systemPrompt: 'extremely energetic football commentator shouting a goal' },
  { id: 'p_callcenter', label: 'Call Center', labelAr: 'خدمة عملاء', icon: 'fa-headset', category: 'PROFESSION', systemPrompt: 'robotic, extremely polite call center agent' },
  { id: 'p_lawyer', label: 'Lawyer', labelAr: 'محامي', icon: 'fa-scale-balanced', category: 'PROFESSION', systemPrompt: 'lawyer speaking in court. Eloquent, serious, persuasive' },
  { id: 'p_guide', label: 'Tour Guide', labelAr: 'مرشد سياحي', icon: 'fa-map-location-dot', category: 'PROFESSION', systemPrompt: 'tour guide explaining history. Enthusiastic and informative' },
  { id: 'p_butcher', label: 'Butcher', labelAr: 'جزار', icon: 'fa-drumstick-bite', category: 'PROFESSION', systemPrompt: 'butcher. Deep voice, friendly but rough' },
  { id: 'p_carpenter', label: 'Carpenter', labelAr: 'نجار', icon: 'fa-hammer', category: 'PROFESSION', systemPrompt: 'carpenter. Practical, working class tone' },

  // ================= EMOTIONS (13) =================
  { id: 'p_sad', label: 'Sad', labelAr: 'حزين', icon: 'fa-face-sad-tear', category: 'EMOTION', systemPrompt: 'very sad, voice breaking, on the verge of tears' },
  { id: 'p_crying', label: 'Crying', labelAr: 'بكااء', icon: 'fa-droplet', category: 'EMOTION', systemPrompt: 'actively crying while speaking. Sobbing, hard to breathe' },
  { id: 'p_happy', label: 'Overjoyed', labelAr: 'فرحان جداً', icon: 'fa-face-laugh-beam', category: 'EMOTION', systemPrompt: 'extremely happy and excited. Laughing while talking' },
  { id: 'p_angry', label: 'Furious', labelAr: 'غاضب جداً', icon: 'fa-face-angry', category: 'EMOTION', systemPrompt: 'absolutely furious. Screaming, losing control' },
  { id: 'p_scared', label: 'Terrified', labelAr: 'مرعوب', icon: 'fa-ghost', category: 'EMOTION', systemPrompt: 'terrified, whispering, stuttering from fear' },
  { id: 'p_bored', label: 'Bored', labelAr: 'ملل', icon: 'fa-face-meh', category: 'EMOTION', systemPrompt: 'extremely bored and uninterested. Monotone, sighing' },
  { id: 'p_romantic', label: 'Romantic', labelAr: 'رومانسي', icon: 'fa-heart', category: 'EMOTION', systemPrompt: 'very romantic, soft, whispery, full of love' },
  { id: 'p_jealous', label: 'Jealous', labelAr: 'غيور', icon: 'fa-eye', category: 'EMOTION', systemPrompt: 'jealous tone, bitter and suspicious' },
  { id: 'p_arrogant', label: 'Arrogant', labelAr: 'متكبر', icon: 'fa-crown', category: 'EMOTION', systemPrompt: 'arrogant, looking down on others, superior tone' },
  { id: 'p_disgusted', label: 'Disgusted', labelAr: 'قرفان', icon: 'fa-face-grimace', category: 'EMOTION', systemPrompt: 'disgusted, repulsed tone' },
  { id: 'p_guilty', label: 'Guilty', labelAr: 'مذنب', icon: 'fa-handcuffs', category: 'EMOTION', systemPrompt: 'guilty, apologetic, ashamed voice' },
  { id: 'p_hopeful', label: 'Hopeful', labelAr: 'متفائل', icon: 'fa-sun', category: 'EMOTION', systemPrompt: 'full of hope and optimism, bright voice' },
  { id: 'p_nostalgic', label: 'Nostalgic', labelAr: 'حنين', icon: 'fa-clock-rotate-left', category: 'EMOTION', systemPrompt: 'nostalgic, remembering the past, soft and longing' },
  
  // ================= FAMILY (10) =================
  { id: 'p_mom', label: 'Mom', labelAr: 'الأم', icon: 'fa-person-breastfeeding', category: 'FAMILY', systemPrompt: 'caring but nagging Egyptian mother' },
  { id: 'p_dad', label: 'Strict Dad', labelAr: 'الأب الصارم', icon: 'fa-user-tie', category: 'FAMILY', systemPrompt: 'strict father scolding his children' },
  { id: 'p_grandma', label: 'Grandma', labelAr: 'الجدة', icon: 'fa-cookie-bite', category: 'FAMILY', systemPrompt: 'old, kind grandmother. Voice weak and shaky' },
  { id: 'p_grandpa', label: 'Grandpa', labelAr: 'الجد', icon: 'fa-glasses', category: 'FAMILY', systemPrompt: 'old grandfather telling a story. Raspy, slow voice' },
  { id: 'p_child', label: 'Child', labelAr: 'طفل', icon: 'fa-child', category: 'FAMILY', systemPrompt: 'young child. High pitched, innocent' },
  { id: 'p_teen', label: 'Teenager', labelAr: 'مراهق', icon: 'fa-gamepad', category: 'FAMILY', systemPrompt: 'moody teenager, using slang, bored tone' },
  { id: 'p_tant', label: 'Aunt (Tant)', labelAr: 'طنط', icon: 'fa-bag-shopping', category: 'FAMILY', systemPrompt: 'Egyptian Aunt (Tant). High class, gossiping tone' },
  { id: 'p_uncle', label: 'Uncle', labelAr: 'عمو', icon: 'fa-user-group', category: 'FAMILY', systemPrompt: 'Egyptian Uncle. Loud, joking, friendly' },
  { id: 'p_motherinlaw', label: 'Mother-in-law', labelAr: 'الحماة', icon: 'fa-dragon', category: 'FAMILY', systemPrompt: 'Egyptian mother-in-law (Hama). Sarcastic, critical, strong personality' },
  { id: 'p_brother', label: 'Big Brother', labelAr: 'الأخ الكبير', icon: 'fa-user-shield', category: 'FAMILY', systemPrompt: 'protective big brother. Authoritative but caring' },

  // ================= COMEDY & OTHERS (11) =================
  { id: 'p_stoner', label: 'Stoner', labelAr: 'مسطول', icon: 'fa-joint', category: 'COMEDY', systemPrompt: 'stoned person. Very slow, confused, finding everything funny' },
  { id: 'p_sarcastic', label: 'Sarcastic', labelAr: 'لمض', icon: 'fa-eye-roll', category: 'COMEDY', systemPrompt: 'extremely sarcastic and mocking' },
  { id: 'p_gossip', label: 'Gossip', labelAr: 'لتاتة', icon: 'fa-comments', category: 'COMEDY', systemPrompt: 'gossip sharing scandalous news. Hushed excitement' },
  { id: 'p_sleepy', label: 'Sleepy', labelAr: 'نايم', icon: 'fa-bed', category: 'COMEDY', systemPrompt: 'just waking up or falling asleep. Yawning, groggy' },
  { id: 'p_robot', label: 'Robot', labelAr: 'روبوت', icon: 'fa-robot', category: 'COMEDY', systemPrompt: 'robot. Monotone, staccato rhythm' },
  { id: 'p_zombie', label: 'Zombie', labelAr: 'زومبي', icon: 'fa-skull', category: 'COMEDY', systemPrompt: 'zombie. Groaning, slow, scary' },
  { id: 'p_alien', label: 'Alien', labelAr: 'فضائي', icon: 'fa-user-astronaut', category: 'COMEDY', systemPrompt: 'alien trying to speak human language. Weird intonation' },
  { id: 'p_spoiled', label: 'Spoiled', labelAr: 'فرفور', icon: 'fa-ice-cream', category: 'COMEDY', systemPrompt: 'spoiled rich kid (Fofo). Soft, complaining tone' },
  { id: 'p_villain', label: 'Villain', labelAr: 'شرير', icon: 'fa-mask', category: 'COMEDY', systemPrompt: 'evil villain planning a scheme. Dark, menacing laugh' },
  { id: 'p_drunk', label: 'Drunk', labelAr: 'سكران', icon: 'fa-wine-bottle', category: 'COMEDY', systemPrompt: 'drunk person. Slurring words, hiccuping, unstable pitch' },
  { id: 'p_clown', label: 'Clown', labelAr: 'مهرج', icon: 'fa-masks-theater', category: 'COMEDY', systemPrompt: 'circus clown. Exaggerated high pitch, silly' },
];

export interface GeneratedSpeech {
  id: string;
  text: string;
  actor: VoiceActor;
  preset: VoicePreset | null; // null if custom
  customTone?: string; 
  audioUrl?: string; 
  timestamp: number;
  folder?: string;
  shared?: boolean;
}

// ============ VOICE CLONING ============
export interface ClonedVoice {
  id: string;
  name: string;
  sampleDataUrl: string; // Base64 of uploaded sample
  createdAt: number;
  status: 'processing' | 'ready' | 'error';
}

// ============ AI ASSISTANT ============
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestions?: string[];
}

// ============ TEAM WORKSPACE ============
export type TeamRole = 'admin' | 'editor' | 'viewer';

export interface TeamMember {
  id: string;
  username: string;
  nameAr: string;
  role: TeamRole;
  avatar?: string;
  joinedAt: number;
  generations: number;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  members: TeamMember[];
  createdAt: number;
  maxMembers: number;
}

// ============ SUBSCRIPTIONS ============
export type PlanType = 'free' | 'pro' | 'business';
export type PaymentMethod = 'visa' | 'vodafone_cash' | 'fawry' | 'instapay';

export interface PlanFeature {
  key: string;
  label: string;
  labelAr: string;
  free: string;
  pro: string;
  business: string;
}

export interface UserSubscription {
  plan: PlanType;
  generationsToday: number;
  generationsLimit: number;
  expiresAt?: number;
  paymentMethod?: PaymentMethod;
  teamId?: string;
}

// ============ FOLDERS ============
export interface Folder {
  id: string;
  name: string;
  nameAr: string;
  color: string;
  icon: string;
  createdAt: number;
}
