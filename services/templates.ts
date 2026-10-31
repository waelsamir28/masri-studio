/**
 * Ready-made text templates for various use cases
 */

export interface TextTemplate {
  id: string;
  title: string;
  titleAr: string;
  icon: string;
  category: string;
  categoryAr: string;
  text: string;
  suggestedTone?: string;
}

export const TEXT_TEMPLATES: TextTemplate[] = [
  // ============ إعلانات (Ads) ============
  {
    id: 't_ad_restaurant',
    title: 'Restaurant Ad',
    titleAr: 'إعلان مطعم',
    icon: 'fa-utensils',
    category: 'ADS',
    categoryAr: 'إعلانات',
    text: 'جوعان؟ مش عارف تاكل إيه؟ مطعم "الأيادي" هيلحل مشكلتك! أكل بيتي بطعم امك، توصيل لحد باب بيتك في نص ساعة. اطلب دلوقتي واستمتع بخصم ٣٠٪ على أول طلب! الرقم على الشاشة.',
    suggestedTone: 'بمنتهى الحماس والطاقة'
  },
  {
    id: 't_ad_clothing',
    title: 'Clothing Store',
    titleAr: 'إعلان ملابس',
    icon: 'fa-shirt',
    category: 'ADS',
    categoryAr: 'إعلانات',
    text: 'عايز تبقي شيك؟ عايز تلبس ماركات بأرخص سعر؟ متجر "الأناقة" عندنا كل جديد الموضة. تشكيلة ضخمة من أرقى الماركات العالمية. خصومات تصل لـ ٧٠٪. زيارة واحدة تكفي!',
    suggestedTone: 'نبرة إغراء وعرض لا يقاوم'
  },
  {
    id: 't_ad_mobile',
    title: 'Mobile Phone Offer',
    titleAr: 'عرض موبايل',
    icon: 'fa-mobile-screen',
    category: 'ADS',
    categoryAr: 'إعلانات',
    text: 'أحدث موبايل في السوق وصل! كاميرا خيالية، بطارية بتعش أسبوع، شاشة بتجنن. السعر مش هتصدقه! العرض لفترة محدودة جداً. الحق قبل ما يخلص. اتصل دلوقتي!',
    suggestedTone: 'بمنتهى الحماس والطاقة'
  },
  {
    id: 't_ad_realestate',
    title: 'Real Estate',
    titleAr: 'إعلان عقارات',
    icon: 'fa-building',
    category: 'ADS',
    categoryAr: 'إعلانات',
    text: 'شقتك اللي بتتحلم بيها لقيتها! في أرقى الأحياء، بإطلالة خلابة، وتشطيب سوبر لوكس. تقسيط مريح يوصل لـ ١٠ سنين. استلم دلوقتي وابدأ حياتك الجديدة. اتصل بينا!',
    suggestedTone: 'نبرة واثقة وقوية'
  },

  // ============ أخبار (News) ============
  {
    id: 't_news_breaking',
    title: 'Breaking News',
    titleAr: 'خبر عاجل',
    icon: 'fa-newspaper',
    category: 'NEWS',
    categoryAr: 'أخبار',
    text: 'خبر عاجل وصلنا قبل قليل. مصادر مطلعة تؤكد حدوث تطور جديد ومفاجئ في الملف الاقتصادي. تفاصيل أكثر في النشرة القادمة. تابعونا للمزيد من التحديثات.',
    suggestedTone: 'نبرة رسمية إخبارية'
  },
  {
    id: 't_news_sports',
    title: 'Sports Report',
    titleAr: 'تقرير رياضي',
    icon: 'fa-futbol',
    category: 'NEWS',
    categoryAr: 'أخبار',
    text: 'مباراة من العيار الثقيل جمع بين الفريقين مساء اليوم. أجواء حماسية من أول دقيقة. أهداف مثيرة ولحظات لا تُنسى. النتيجة النهائية كانت مفاجأة للجميع!',
    suggestedTone: 'بمنتهى الحماس والطاقة'
  },
  {
    id: 't_news_weather',
    title: 'Weather Forecast',
    titleAr: 'نشرة الطقس',
    icon: 'fa-cloud-sun',
    category: 'NEWS',
    categoryAr: 'أخبار',
    text: 'نشرة الطقس لهذا الأسبوع. حالة من عدم الاستقرار في الأحوال الجوية متوقعة. ارتفاع في درجات الحرارة نهاراً وانخفاض ملموس ليلاً. نصائح مهمة للمواطنين.',
    suggestedTone: 'رسمي وهادئ'
  },

  // ============ قصص أطفال (Kids Stories) ============
  {
    id: 't_story_rabbit',
    title: 'The Clever Rabbit',
    titleAr: 'الأرنب الشاطر',
    icon: 'fa-rabbit',
    category: 'KIDS',
    categoryAr: 'أطفال',
    text: 'كان يا ما كان، في قديم الزمان، أرنب صغير اسمه فلفل. كان فلفل ذكي جداً وشاطر. كل يوم كان بيروح الغابة ويلعب مع أصحابه. يوم من الأيام، قابل ثعبان كبير كان عايز ياكله. بس فلفل فكر بسرعة وقاله: "استنى! أنا أعرف مكان فيه أكل أحسن بكتير!"',
    suggestedTone: 'حكاية أطفال ممتعة'
  },
  {
    id: 't_story_star',
    title: 'The Little Star',
    titleAr: 'النجمة الصغيرة',
    icon: 'fa-star',
    category: 'KIDS',
    categoryAr: 'أطفال',
    text: 'في السما العالية، كانت فيه نجمة صغيرة اسمها لمعة. كانت لمعة بتلمع كل ليلة بس كانت زعلانة لأنها أصغر النجوم. لكن كل الأطفال على الأرض كانوا بيدوها بالأيدي ويتمنوا. عرفت إن هي النجمة المفضلة عند كل الأطفال!',
    suggestedTone: 'هادئ ودافئ'
  },
  {
    id: 't_story_lion',
    title: 'The Kind Lion',
    titleAr: 'الأسد الطيب',
    icon: 'fa-paw',
    category: 'KIDS',
    categoryAr: 'أطفال',
    text: 'في أدغال أفريقيا، عاش أسد كبير اسمه زئير. كان قوي جداً بس قلبه طيب. كل حيوانات الغابة بتحبه لأنه بيساعدهم دايماً. يوم من الأيام، الفأر الصغير وقعت منه مشكلة كبيرة، وزئير ساعده!',
    suggestedTone: 'حكاية بصوت دافئ'
  },

  // ============ تعليمي (Educational) ============
  {
    id: 't_edu_science',
    title: 'Science Facts',
    titleAr: 'حقائق علمية',
    icon: 'fa-flask',
    category: 'EDU',
    categoryAr: 'تعليمي',
    text: 'هل تعلم أن قلب الإنسان بيدق أكثر من مائة ألف نبضة في اليوم الواحد؟ وأن المخ البشري فيه حوالي ٨٦ مليار خلية عصبية؟ جسم الإنسان معجزة حقيقية من الهندسة الإلهية!',
    suggestedTone: 'رسمي وتعليمي'
  },
  {
    id: 't_edu_history',
    title: 'History Lesson',
    titleAr: 'درس تاريخ',
    icon: 'fa-landmark',
    category: 'EDU',
    categoryAr: 'تعليمي',
    text: 'من آلاف السنين، بنى أجدادنا المصريون القدماء حضارة عظيمة لسه بتبهر العالم. الأهرامات، المعابد، والبرديات. إرث عظيم يثبت إن المصرى كان دايماً سابق عصره.',
    suggestedTone: 'فخور وملحمي'
  },

  // ============ مناسبات (Occasions) ============
  {
    id: 't_occ_birthday',
    title: 'Birthday Greeting',
    titleAr: 'تهنئة عيد ميلاد',
    icon: 'fa-cake-candles',
    category: 'OCCASIONS',
    categoryAr: 'مناسبات',
    text: 'كل سنة وإنت طيب! النهارده يوم مميز جداً، يوم ما جه للدنيا أحلى إنسان. ربنا يخليك ويحفظك ويحقق كل أحلامك. سنة جديدة مليانة نجاح وسعادة!',
    suggestedTone: 'سعيد وحماسي'
  },
  {
    id: 't_occ_wedding',
    title: 'Wedding Blessing',
    titleAr: 'تهنئة زفاف',
    icon: 'fa-rings-wedding',
    category: 'OCCASIONS',
    categoryAr: 'مناسبات',
    text: 'ألف مبروك للعروسين! ربنا يتمم لكم على خير ويجمع بينكم في خير. حياة مليانة حب وسعادة وتفاهم. بالهنا والشفا!',
    suggestedTone: 'احتفالي ودافئ'
  },
  {
    id: 't_occ_ramadan',
    title: 'Ramadan Greeting',
    titleAr: 'تهنئة رمضان',
    icon: 'fa-moon',
    category: 'OCCASIONS',
    categoryAr: 'مناسبات',
    text: 'رمضان كريم! أهلاً بشهر الخير والبركات. اللهم بلغنا رمضان وأعنا على صيامه وقيامه. شهر الرحمة والمغفرة والعتق من النار. كل سنة وأنتم طيبين!',
    suggestedTone: 'روحاني وهادئ'
  },

  // ============ دراما (Drama) ============
  {
    id: 't_drama_horror',
    title: 'Horror Scene',
    titleAr: 'مشهد رعب',
    icon: 'fa-ghost',
    category: 'DRAMA',
    categoryAr: 'دراما',
    text: 'الليل كان طويل... والبيت فاضي... بس كان فيه صوت غريب جاي من الدور التاني. خطوا على خطوا، قرب من الباب... فتحه... ومكانش فيه حد. بس المراية... المراية كان فيها حاجة تانية!',
    suggestedTone: 'يهمس بخوف'
  },
  {
    id: 't_drama_romance',
    title: 'Romantic Scene',
    titleAr: 'مشهد رومانسي',
    icon: 'fa-heart',
    category: 'DRAMA',
    categoryAr: 'دراما',
    text: 'من أول ما شفتك، عرفت إن حياتي هتتغير. عينيك زي البحر، عميقين وغموض. كل لحظة معاك بتخلي قلبي ينبض من جديد. بحبك أكثر من أي كلام يقدر يوصف.',
    suggestedTone: 'رومانسي وهامس'
  },
  {
    id: 't_drama_action',
    title: 'Action Scene',
    titleAr: 'مشهد أكشن',
    icon: 'fa-explosion',
    category: 'DRAMA',
    categoryAr: 'دراما',
    text: 'ما عندناش وقت! لازم نتحرك دلوقتي قبل ما يلاقونا. خد السلاح واستعد. ثلاثة، اتنين، واحد... انطلق! متقفش ورا، متبصلش! المطلوب نخرج من هنا أحياء!',
    suggestedTone: 'متوتر وسريع'
  }
];

export const TEMPLATE_CATEGORIES = [
  { id: 'ADS', label: 'Ads', labelAr: 'إعلانات', icon: 'fa-bullhorn' },
  { id: 'NEWS', label: 'News', labelAr: 'أخبار', icon: 'fa-newspaper' },
  { id: 'KIDS', label: 'Kids', labelAr: 'أطفال', icon: 'fa-child' },
  { id: 'EDU', label: 'Education', labelAr: 'تعليمي', icon: 'fa-graduation-cap' },
  { id: 'OCCASIONS', label: 'Occasions', labelAr: 'مناسبات', icon: 'fa-gift' },
  { id: 'DRAMA', label: 'Drama', labelAr: 'دراما', icon: 'fa-masks-theater' },
];
