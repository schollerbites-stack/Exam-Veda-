import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Key,
  RotateCcw,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  Settings,
  MessageSquare,
  Flame,
  ArrowLeft,
  X,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  Trash2,
  ChevronDown,
  ExternalLink,
  Cpu,
  ShieldCheck,
  Zap
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  agentName?: string;
  modelUsed?: string;
  isErrorFallback?: boolean;
}

export interface CustomAgent {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  description?: string;
}

interface AITutorChatProps {
  initialQuery?: string;
  onNavigateHome?: () => void;
}

const STORAGE_KEY_GROQ_KEY = 'study_handler_groq_api_key';
const STORAGE_KEY_GROQ_MODEL = 'study_handler_groq_model';
const STORAGE_KEY_GEMINI_KEY = 'study_handler_gemini_api_key';
const STORAGE_KEY_GEMINI_MODEL = 'study_handler_gemini_model';
const STORAGE_KEY_OPENROUTER_KEY = 'study_handler_openrouter_api_key';
const STORAGE_KEY_OPENROUTER_MODEL = 'study_handler_openrouter_model';
const STORAGE_KEY_ACTIVE_AGENT = 'study_handler_active_agent';
const STORAGE_KEY_CUSTOM_AGENTS = 'study_handler_custom_agents';

export interface AgentDefinition {
  id: string;
  name: string;
  provider: 'veda' | 'gemini' | 'groq' | 'openrouter' | 'custom';
  badge: string;
  tagline: string;
  iconEmoji: string;
  requiresKey: boolean;
  defaultModel: string;
  models: { id: string; name: string; description: string }[];
}

const STANDARD_AGENTS: AgentDefinition[] = [
  {
    id: 'groq',
    name: 'Groq Cloud AI (वेद टर्बो)',
    provider: 'groq',
    badge: '120B फ्लैगशिप LPU',
    tagline: 'अल्ट्रा-हाई स्पीड GPT-OSS 120B व Qwen मॉडल्स (सर्वर-सक्षम)',
    iconEmoji: '⚡',
    requiresKey: false, // Server has pre-configured Groq key
    defaultModel: 'openai/gpt-oss-120b',
    models: [
      { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B (अनुशंसित)', description: '120B फ्लैगशिप मॉडल - उच्च सटीकता व विस्तृत व्याख्या' },
      { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B', description: 'बहुभाषी ज्ञान, हिंदी व उत्कृष्ट रीज़निंग' },
      { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B Instant', description: 'अल्ट्रा-फास्ट 1-लाइनर त्वरित उत्तर' },
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (कस्टम Key)', description: 'व्यक्तिगत Groq Key हेतु 70B मॉडल' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', description: 'लाइटवेट त्वरित उत्तर' },
    ],
  },
  {
    id: 'veda_builtin',
    name: 'वेदमंत्र (Veda Smart Engine)',
    provider: 'veda',
    badge: '100% मुफ़्त व ऑफ़लाइन',
    tagline: 'बिना API Key और बिना इंटरनेट के तुरंत NCERT व PYQ उत्तर',
    iconEmoji: '🕉️',
    requiresKey: false,
    defaultModel: 'veda-smart-engine',
    models: [
      { id: 'veda-smart-engine', name: 'वेदमंत्र कोर इंजन', description: 'अंतर्निहित प्रतियोगी परीक्षा ज्ञानकोष' },
    ],
  },
  {
    id: 'gemini',
    name: 'Google Gemini AI',
    provider: 'gemini',
    badge: 'Google DeepMind',
    tagline: 'मल्टीमॉडल गहन विश्लेषण (व्यक्तिगत API Key अनुशंसित)',
    iconEmoji: '✨',
    requiresKey: false,
    defaultModel: 'gemini-3.8-flash',
    models: [
      { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (नवीनतम)', description: 'सर्वश्रेष्ठ गति, उच्च सटीकता व विस्तृत व्याख्या' },
      { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', description: 'अल्ट्रा-फास्ट और कम लेटेंसी वाला हल्का मॉडल' },
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', description: 'गहन अध्ययन, जटिल गणित व कठिन अवधारणाएं' },
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (DeepSeek / Llama)',
    provider: 'openrouter',
    badge: 'Open Weights',
    tagline: 'DeepSeek V3, Qwen व 100+ ओपन-सोर्स AI मॉडल्स',
    iconEmoji: '🧠',
    requiresKey: true,
    defaultModel: 'deepseek/deepseek-chat',
    models: [
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3 (Chat)', description: 'उत्कृष्ट रीज़निंग और उच्च परीक्षा सटीकता' },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct', description: 'मेटा का शक्तिशाली 70B ओपन मॉडल' },
      { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B Instruct', description: 'बहुभाषी व सामान्य ज्ञान में अग्रणी' },
    ],
  },
];

const PRESET_TOPICS = [
  { label: 'हड़प्पा सभ्यता', query: 'हड़प्पा सभ्यता की खोज कब और किसने की थी? मुख्य बिंदु बताएं।' },
  { label: 'मौलिक अधिकार', query: 'भारतीय संविधान के 6 मौलिक अधिकार कौन से हैं और अनुच्छेद 32 क्या है?' },
  { label: 'भारत की नदियां', query: 'भारत की प्रमुख नदियां और पश्चिम वाहिनी नदियों के बारे में बताएं।' },
  { label: 'कोशिका विज्ञान', query: 'कोशिका का पावरहाउस और आत्मघाती थैली किसे कहते हैं और क्यों?' },
  { label: '1-लाइनर फॉर्मेट', query: 'MCQ में 1-लाइनर व्याख्या (Explanation) लिखने का सबसे बेहतरीन तरीका क्या है?' },
  { label: 'वैदिक काल', query: 'ऋग्वैदिक काल और चारों वेदों के प्रमुख परीक्षा उपयोगी तथ्य बताएं।' },
];

function getBuiltinKnowledgeResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('हड़प्पा') || q.includes('harappa') || q.includes('सिंधु') || q.includes('indus')) {
    return `🏛️ **सिंधु घाटी सभ्यता व हड़प्पा (Indus Valley Civilization):**\n\n` +
      `• **खोज एवं उत्खनन:** 1921 में **रायबहादुर दयाराम साहनी** ने हड़प्पा (रावी नदी तट) की खोज की। 1922 में **राखालदास बनर्जी** ने मोहनजोदड़ो की खोज की।\n` +
      `• **काल निर्धारण:** कार्बन-14 डेटिंग के अनुसार सर्वमान्य काल **2500 ई.पू. से 1750 ई.पू.** माना जाता है।\n` +
      `• **प्रमुख स्थल:**\n` +
      `  - **लोथल (गुजरात):** प्रमुख बंदरगाह (गोदीबाड़ा) और चावल के प्रथम साक्ष्य।\n` +
      `  - **मोहनजोदड़ो:** विशाल स्नानागार, विशाल अन्नागार एवं कांस्य नर्तकी मूर्ति।\n` +
      `  - **कालीबंगन (राजस्थान):** जूते हुए खेत और अग्नि वेदियां।\n` +
      `  - **धौलावीरा (गुजरात):** तीन भागों में विभाजित नगर और उन्नत जल प्रबंधन।\n\n` +
      `📌 **परीक्षा उपयोगी 1-लाइनर फैक्ट:**\n` +
      `सिंधु घाटी के निवासी लोहे (Iron) से अनभिज्ञ थे तथा उनकी लिपि भावचित्रात्मक (Boustrophedon) थी जो अभी तक पढ़ी नहीं जा सकी है।`;
  }

  if (q.includes('वैदिक') || q.includes('vedic') || q.includes('ऋग्वेद') || q.includes('वेद')) {
    return `🕉️ **वैदिक काल (Vedic Age: 1500 BC - 600 BC):**\n\n` +
      `• **चार वेद:**\n` +
      `  1. **ऋग्वेद:** सबसे प्राचीन वेद (10 मंडल, 1028 सूक्त)। तीसरे मंडल में **गायत्री मंत्र** है।\n` +
      `  2. **सामवेद:** भारतीय संगीत का जनक (स्वरों का प्रथम संकलन)।\n` +
      `  3. **यजुर्वेद:** यज्ञ विधि-विधान; यह एकमात्र वेद है जो **गद्य एवं पद्य** दोनों में है।\n` +
      `  4. **अथर्ववेद:** महर्षि अथर्वा रचित; रोग निवारण, औषधि व तंत्र-मंत्र।\n\n` +
      `• **प्रमुख शब्दावली व समाज:**\n` +
      `  - **सत्यमेव जयते:** मुण्डकोपनिषद् से लिया गया राष्ट्रीय आदर्श वाक्य।\n` +
      `  - **अघन्या:** ऋग्वेद में गाय को पूजनीय एवं 'न मारने योग्य' (अघन्या) कहा गया।\n` +
      `  - **वर्ण व्यवस्था:** प्रारंभिक काल में जन्म के आधार पर नहीं, बल्कि कर्म/व्यवसाय पर आधारित थी।\n\n` +
      `📌 **परीक्षा टिप:** 1000 ई.पू. के लगभग अतरंजीखेड़ा (उ.प्र.) से लोहे के प्राचीनतम साक्ष्य मिले हैं।`;
  }

  if (q.includes('मौलिक अधिकार') || q.includes('fundamental rights') || q.includes('संविधान') || q.includes('polity') || q.includes('अनुच्छेद 32')) {
    return `⚖️ **भारतीय संविधान के मौलिक अधिकार (Fundamental Rights):**\n\n` +
      `• **स्रोतः** संयुक्त राज्य अमेरिका (Bill of Rights) से प्रेरित।\n` +
      `• **भाग व अनुच्छेद:** भाग-III (अनुच्छेद 12 से 35)। इसे **'भारत का मैग्नाकार्टा'** कहा जाता है।\n` +
      `• **वर्तमान में 6 मौलिक अधिकार:**\n` +
      `  1. समानता का अधिकार (अनुच्छेद 14-18) [अनुच्छेद 17: अस्पृश्यता का अंत]\n` +
      `  2. स्वतंत्रता का अधिकार (अनुच्छेद 19-22) [अनुच्छेद 21: प्राण व दैहिक स्वतंत्रता]\n` +
      `  3. शोषण के विरुद्ध अधिकार (अनुच्छेद 23-24) [अनुच्छेद 24: बाल श्रम निषेध]\n` +
      `  4. धार्मिक स्वतंत्रता का अधिकार (अनुच्छेद 25-28)\n` +
      `  5. संस्कृति व शिक्षा संबंधी अधिकार (अनुच्छेद 29-30)\n` +
      `  6. संवैधानिक उपचारों का अधिकार (अनुच्छेद 32)\n\n` +
      `📌 **महत्वपूर्ण तथ्य:** डॉ. भीमराव अम्बेडकर ने अनुच्छेद 32 को **"संविधान की आत्मा और हृदय"** कहा था। संपत्ति का अधिकार 44वें संशोधन (1978) द्वारा विधिक अधिकार (300A) बना दिया गया।`;
  }

  if (q.includes('नदी') || q.includes('नदियां') || q.includes('river') || q.includes('भूगोल') || q.includes('geography')) {
    return `🌊 **भारत की नदियां (Drainage System of India):**\n\n` +
      `• **गंगा नदी तंत्र:**\n` +
      `  - उद्गम: गंगोत्री हिमनद (भागीरथी)। देवप्रयाग में अलकनंदा से मिलकर 'गंगा' कहलाती है।\n` +
      `  - लंबाई: 2525 किमी (भारत की सबसे लंबी नदी)।\n` +
      `  - डेल्टा: ब्रह्मपुत्र के साथ मिलकर **सुंदरबन डेल्टा** बनाती है।\n\n` +
      `• **प्रायद्वीपीय नदियां:**\n` +
      `  - **गोदावरी (1465 किमी):** प्रायद्वीपीय भारत की सबसे लंबी नदी। इसे **'दक्षिण गंगा'** व 'वृद्ध गंगा' कहा जाता है।\n` +
      `  - **कावेरी:** इसे 'दक्षिण भारत की गंगा' कहा जाता है।\n` +
      `  - **पश्चिम वाहिनी नदियां:** **नर्मदा एवं ताप्ती** भ्रंश घाटी से बहकर अरब सागर में गिरती हैं और डेल्टा के स्थान पर **एश्चुअरी (ज्वारनदमुख)** बनाती हैं।\n\n` +
      `📌 **परीक्षा टिप:** माही नदी कर्क रेखा को दो बार काटने वाली भारत की एकमात्र नदी है।`;
  }

  if (q.includes('कोशिका') || q.includes('cell') || q.includes('माइटोकॉन्ड्रिया') || q.includes('विज्ञान') || q.includes('science')) {
    return `🔬 **कोशिका विज्ञान महत्वपूर्ण तथ्य (Cytology):**\n\n` +
      `• **खोज:** 1665 में **रॉबर्ट हुक** ने मृत कोशिका देखी; 1674 में **ल्यूवेनहुक** ने जीवित कोशिका देखी।\n` +
      `• **प्रमुख कोशिकांग एवं उपनाम:**\n` +
      `  - **माइटोकॉन्ड्रिया:** 'कोशिका का शक्तिगृह' (Powerhouse) - यहाँ श्वसन द्वारा ATP बनती है।\n` +
      `  - **लाइसोसोम:** 'आत्मघाती थैली' (Suicidal Bag) - पाचक एंजाइमों से भरी होती है।\n` +
      `  - **राइबोसोम:** 'प्रोटीन की फैक्ट्री' (Protein Factory) - प्रोटीन निर्माण।\n` +
      `  - **गॉल्जीकाय:** 'कोशिका का ट्रैफिक पुलिस' - पदार्थों की पैकेजिंग।\n` +
      `  - **केंद्रक (Nucleus):** 'कोशिका का नियंत्रक / मस्तिष्क'।\n\n` +
      `📌 **महत्वपूर्ण भेद:** पादप कोशिका में सेल्यूलोज की बनी कोशिका भित्ति (Cell Wall) और क्लोरोप्लास्ट होते हैं, जो जंतु कोशिका में नहीं होते।`;
  }

  if (q.includes('1-liner') || q.includes('1 liner') || q.includes('format') || q.includes('व्याख्या') || q.includes('explanation')) {
    return `📝 **1-लाइनर व्याख्या (One-Liner Explanation) का सटीक प्रारूप:**\n\n` +
      `जब आप एडमिन पोर्टल में प्रश्न अपलोड करते हैं, तो सही उत्तर के तुरंत बाद 1-लाइनर इस प्रकार लिखें:\n\n` +
      `\`\`\`text\n` +
      `1. भारतीय संविधान में मौलिक कर्तव्य किस देश से लिए गए हैं?\n` +
      `A. अमेरिका\n` +
      `B. रूस (पूर्व सोवियत संघ)\n` +
      `C. ब्रिटेन\n` +
      `D. ऑस्ट्रेलिया\n` +
      `Ans. B\n` +
      `Exp: 42वें संविधान संशोधन (1976) द्वारा सरदार स्वर्ण सिंह समिति की सिफारिश पर रूस से मौलिक कर्तव्य जोड़े गए।\n` +
      `\`\`\`\n\n` +
      `✨ **फ़ायदे:** छात्र जब टेस्ट में गलत उत्तर देते हैं तो यह 1-लाइनर उन्हें तुरंत कारण और पृष्ठभूमि समझा देता है!`;
  }

  return `📚 **Veda AI अध्ययन विश्लेषण: "${query}"**\n\n` +
    `प्रतियोगी परीक्षाओं (UPSC, SSC, State PCS) की दृष्टि से यह अवधारणा अत्यंत महत्वपूर्ण है।\n\n` +
    `• **मूल सिद्धांत:** इस विषय को मुख्य रूप से 3 आयामों में याद रखें - पृष्ठभूमि/इतिहास, मुख्य प्रासंगिक बिंदु तथा अपवाद।\n` +
    `• **रिवीज़न टिप:** नोट्स पढ़ने के तुरंत बाद संबंधित अध्याय के वस्तुनिष्ठ प्रश्नों (PYQs) का अभ्यास करें।\n` +
    `• **मल्टी-एजेंट सहायता:** Veda AI में आप ऊपर एजेंट टैब से Google Gemini, Groq (Llama 3.3), DeepSeek या अपने कस्टम AI एजेंट को चुनकर असीमित अध्ययन नोट्स व प्रश्नों का त्वरित विश्लेषण प्राप्त कर सकते हैं।\n\n` +
    `📌 **परीक्षा टिप:** अपने अध्ययन में हमेशा पिछले वर्षों के प्रश्नपत्रों को आधार बनाकर रिवीजन जारी रखें। मुझसे किसी भी विषय पर बेझिझक प्रश्न पूछें!`;
}

export const AITutorChat: React.FC<AITutorChatProps> = ({ initialQuery, onNavigateHome }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text:
        'नमस्ते! 🙏 मैं **Veda AI (वेद AI)** हूँ - आपका मल्टी-एजेंट स्टडी गुरु व प्रतियोगी परीक्षा कोच।\n\nआप यहाँ **Google Gemini**, **Groq Llama 3.3**, **DeepSeek/OpenRouter** या हमारे **वेदमंत्र ऑफ़लाइन इंजन** के माध्यम से किसी भी विषय (इतिहास, भूगोल, संविधान, विज्ञान, करंट अफेयर्स) के डाउट पूछ सकते हैं।\n\nआज आप किस विषय पर चर्चा करना चाहते हैं?',
      timestamp: Date.now(),
      agentName: 'Veda AI',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Active Agent state
  const [activeAgentId, setActiveAgentId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_AGENT);
    if (saved && saved !== 'gemini') return saved;
    return 'groq';
  });

  // Keys & models per provider
  const [geminiKey, setGeminiKey] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
  });
  const [geminiModel, setGeminiModel] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_GEMINI_MODEL) || 'gemini-3.8-flash';
  });

  const [groqKey, setGroqKey] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_GROQ_KEY) || (import.meta.env.VITE_GROQ_API_KEY as string) || '';
  });
  const [groqModel, setGroqModel] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_GROQ_MODEL);
    if (saved && saved !== 'llama-3.3-70b-versatile') return saved;
    return 'openai/gpt-oss-120b';
  });

  const [openRouterKey, setOpenRouterKey] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_OPENROUTER_KEY) || (import.meta.env.VITE_OPENROUTER_API_KEY as string) || '';
  });
  const [openRouterModel, setOpenRouterModel] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_OPENROUTER_MODEL) || 'deepseek/deepseek-chat';
  });

  // Custom Agents list
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_AGENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Network connection state
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [connectionLostNotice, setConnectionLostNotice] = useState<string | null>(null);
  const [missingKeyNotice, setMissingKeyNotice] = useState<{ agentName: string; provider: string } | null>(null);

  // Server capability state
  const [hasServerGeminiKey, setHasServerGeminiKey] = useState(false);
  const [hasServerGroqKey, setHasServerGroqKey] = useState(false);

  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'agents' | 'keys' | 'custom'>('agents');
  const [saveToast, setSaveToast] = useState(false);

  // Custom agent creation form
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomUrl, setNewCustomUrl] = useState('');
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomModel, setNewCustomModel] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Monitor online / offline network state
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionLostNotice(null);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionLostNotice('इंटरनेट कनेक्शन अनुपलब्ध है (Offline Mode)।');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Probe server API status
    fetch('/api/veda/status')
      .then(res => {
        if (!res.ok) throw new Error('No server backend');
        return res.json();
      })
      .then(data => {
        if (data && typeof data.hasServerGeminiKey === 'boolean') {
          setHasServerGeminiKey(data.hasServerGeminiKey);
        }
        if (data && typeof data.hasServerGroqKey === 'boolean') {
          setHasServerGroqKey(data.hasServerGroqKey);
        }
      })
      .catch(() => {
        // Static hosting mode (GitHub Pages / APK WebView)
        setHasServerGeminiKey(false);
        setHasServerGroqKey(false);
      });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, connectionLostNotice, missingKeyNotice]);

  // Initial query trigger
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery.trim());
    }
  }, [initialQuery]);

  // Find active agent object
  const allAgents: AgentDefinition[] = [
    ...STANDARD_AGENTS,
    ...customAgents.map(ca => ({
      id: ca.id,
      name: ca.name,
      provider: 'custom' as const,
      badge: 'Custom Agent',
      tagline: `Base URL: ${ca.baseUrl}`,
      iconEmoji: '🤖',
      requiresKey: Boolean(ca.apiKey),
      defaultModel: ca.model || 'default',
      models: [{ id: ca.model || 'default', name: ca.model || 'Custom Model', description: ca.description || 'कस्टम मॉडल' }],
    })),
  ];

  const currentAgent = allAgents.find(a => a.id === activeAgentId) || STANDARD_AGENTS[0];

  // Helper to check if current agent has its key
  const checkAgentKeyConfigured = (agent: AgentDefinition): boolean => {
    if (agent.provider === 'veda') return true;
    if (agent.provider === 'gemini') {
      return Boolean(geminiKey || hasServerGeminiKey);
    }
    if (agent.provider === 'groq') {
      return Boolean((groqKey && groqKey.trim()) || hasServerGroqKey);
    }
    if (agent.provider === 'openrouter') {
      return Boolean(openRouterKey && openRouterKey.trim());
    }
    if (agent.provider === 'custom') {
      const ca = customAgents.find(c => c.id === agent.id);
      return Boolean(ca && ca.baseUrl);
    }
    return true;
  };

  const isCurrentAgentKeyMissing = !checkAgentKeyConfigured(currentAgent);

  const handleSelectAgent = (agentId: string) => {
    setActiveAgentId(agentId);
    localStorage.setItem(STORAGE_KEY_ACTIVE_AGENT, agentId);
    setConnectionLostNotice(null);

    const target = allAgents.find(a => a.id === agentId);
    if (target && !checkAgentKeyConfigured(target)) {
      setMissingKeyNotice({ agentName: target.name, provider: target.provider });
    } else {
      setMissingKeyNotice(null);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Add Custom Agent
  const handleAddCustomAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomName.trim() || !newCustomUrl.trim()) return;

    const newAgent: CustomAgent = {
      id: `custom_${Date.now()}`,
      name: newCustomName.trim(),
      baseUrl: newCustomUrl.trim(),
      apiKey: newCustomKey.trim(),
      model: newCustomModel.trim() || 'default',
    };

    const updated = [...customAgents, newAgent];
    setCustomAgents(updated);
    localStorage.setItem(STORAGE_KEY_CUSTOM_AGENTS, JSON.stringify(updated));

    // Reset inputs
    setNewCustomName('');
    setNewCustomUrl('');
    setNewCustomKey('');
    setNewCustomModel('');
    setActiveAgentId(newAgent.id);
    localStorage.setItem(STORAGE_KEY_ACTIVE_AGENT, newAgent.id);

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleDeleteCustomAgent = (agentId: string) => {
    const updated = customAgents.filter(c => c.id !== agentId);
    setCustomAgents(updated);
    localStorage.setItem(STORAGE_KEY_CUSTOM_AGENTS, JSON.stringify(updated));
    if (activeAgentId === agentId) {
      setActiveAgentId('gemini');
      localStorage.setItem(STORAGE_KEY_ACTIVE_AGENT, 'gemini');
    }
  };

  // Send Message Logic
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    // Check offline status first
    if (!navigator.onLine && currentAgent.provider !== 'veda') {
      setConnectionLostNotice('इंटरनेट कनेक्शन नहीं है। आप वेदमंत्र (Veda Smart Engine) से ऑफ़लाइन उत्तर पा सकते हैं।');
      return;
    }

    // Check if required key is missing for the active agent
    if (isCurrentAgentKeyMissing) {
      setMissingKeyNotice({ agentName: currentAgent.name, provider: currentAgent.provider });
      return;
    }

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setConnectionLostNotice(null);
    setMissingKeyNotice(null);

    try {
      // 1. Veda Built-in Knowledge Base (Offline, No API Key needed)
      if (currentAgent.provider === 'veda') {
        await new Promise(res => setTimeout(res, 400));
        const reply = getBuiltinKnowledgeResponse(query);
        setMessages(prev => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: reply,
            timestamp: Date.now(),
            agentName: 'वेदमंत्र कोर इंजन',
            modelUsed: 'Veda Knowledge 1.0',
          },
        ]);
        return;
      }

      // 2. Google Gemini Agent
      if (currentAgent.provider === 'gemini') {
        const effectiveGeminiKey = (geminiKey && geminiKey.trim()) || (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
        let directSuccess = false;

        try {
          const response = await fetch('/api/chat/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: effectiveGeminiKey || undefined,
              model: geminiModel,
              prompt: query,
              conversationHistory: messages.slice(-6).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text,
              })),
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setMessages(prev => [
              ...prev,
              {
                id: `ai_${Date.now()}`,
                sender: 'ai',
                text: data.reply || 'उत्तर प्राप्त नहीं हुआ।',
                timestamp: Date.now(),
                agentName: 'Google Gemini',
                modelUsed: geminiModel,
              },
            ]);
            return;
          }

          // If response not ok and not 404, check error message
          if (response.status !== 404) {
            const errData = await response.json().catch(() => ({}));
            if (errData?.error === 'GEMINI_KEY_MISSING') {
              setMissingKeyNotice({ agentName: 'Google Gemini', provider: 'gemini' });
              throw new Error(errData.message || 'Gemini API Key उपलब्ध नहीं है।');
            }
          }
        } catch (serverErr) {
          console.log('Server endpoint unavailable, attempting direct Gemini client...', serverErr);
        }

        // Direct Client Fallback (GitHub Pages / APK / Direct mode)
        if (effectiveGeminiKey) {
          try {
            const directRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${effectiveGeminiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [
                    ...messages.slice(-6).map(m => ({
                      role: m.sender === 'user' ? 'user' : 'model',
                      parts: [{ text: m.text }],
                    })),
                    { role: 'user', parts: [{ text: query }] },
                  ],
                  systemInstruction: {
                    parts: [
                      {
                        text: 'आप एक उत्कृष्ट हिंदी शिक्षक (Veda AI) हैं। छात्र को स्वच्छ, बुलेट पॉइंट्स व परीक्षा उपयोगी नोट्स में स्पष्ट उत्तर दें।',
                      },
                    ],
                  },
                }),
              }
            );

            if (directRes.ok) {
              const directData = await directRes.json();
              const reply =
                directData.candidates?.[0]?.content?.parts?.[0]?.text || 'उत्तर प्राप्त नहीं हुआ।';
              setMessages(prev => [
                ...prev,
                {
                  id: `ai_${Date.now()}`,
                  sender: 'ai',
                  text: reply,
                  timestamp: Date.now(),
                  agentName: 'Google Gemini',
                  modelUsed: geminiModel,
                },
              ]);
              directSuccess = true;
              return;
            }
          } catch (directErr) {
            console.warn('Direct Gemini call failed:', directErr);
          }
        }

        if (!directSuccess) {
          if (!effectiveGeminiKey && !hasServerGeminiKey) {
            setMissingKeyNotice({ agentName: 'Google Gemini', provider: 'gemini' });
          }
          throw new Error('Gemini API से संपर्क नहीं हो सका। कृपया सेटिंग्स में API Key जांचें।');
        }
        return;
      }

      // 3. Groq Agent
      if (currentAgent.provider === 'groq') {
        const effectiveGroqKey = (groqKey && groqKey.trim()) || (import.meta.env.VITE_GROQ_API_KEY as string) || '';
        const groqMessages = [
          ...messages.slice(-6).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
          { role: 'user', content: query },
        ];

        let directSuccess = false;

        try {
          const response = await fetch('/api/chat/groq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: effectiveGroqKey || undefined,
              model: groqModel,
              messages: groqMessages,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setMessages(prev => [
              ...prev,
              {
                id: `ai_${Date.now()}`,
                sender: 'ai',
                text: data.reply || 'उत्तर प्राप्त नहीं हुआ।',
                timestamp: Date.now(),
                agentName: 'Groq Cloud',
                modelUsed: groqModel,
              },
            ]);
            return;
          }

          if (response.status !== 404) {
            const errData = await response.json().catch(() => ({}));
            if (errData?.error === 'GROQ_KEY_MISSING') {
              setMissingKeyNotice({ agentName: 'Groq Cloud', provider: 'groq' });
              throw new Error(errData.message || 'Groq API Key अनुपलब्ध है।');
            }
          }
        } catch (serverErr) {
          console.log('Server endpoint unavailable, attempting direct Groq client...', serverErr);
        }

        // Direct Client Fallback to Groq Cloud (GitHub Pages / APK / Direct mode)
        if (effectiveGroqKey) {
          try {
            const directGroq = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${effectiveGroqKey}`,
              },
              body: JSON.stringify({
                model: groqModel,
                messages: [
                  {
                    role: 'system',
                    content:
                      'आप एक उत्कृष्ट हिंदी शिक्षक (Veda AI) हैं। छात्र को स्वच्छ, बुलेट पॉइंट्स व परीक्षा उपयोगी नोट्स में स्पष्ट उत्तर दें।',
                  },
                  ...groqMessages,
                ],
                temperature: 0.6,
                max_tokens: 1800,
              }),
            });

            if (directGroq.ok) {
              const directData = await directGroq.json();
              const reply =
                directData.choices?.[0]?.message?.content || 'उत्तर प्राप्त नहीं हुआ।';
              setMessages(prev => [
                ...prev,
                {
                  id: `ai_${Date.now()}`,
                  sender: 'ai',
                  text: reply,
                  timestamp: Date.now(),
                  agentName: 'Groq Cloud',
                  modelUsed: groqModel,
                },
              ]);
              directSuccess = true;
              return;
            } else {
              const errData = await directGroq.json().catch(() => ({}));
              console.warn('Direct Groq API returned non-200:', errData);
            }
          } catch (directErr) {
            console.warn('Direct Groq call failed:', directErr);
          }
        }

        if (!directSuccess) {
          if (!effectiveGroqKey && !hasServerGroqKey) {
            setMissingKeyNotice({ agentName: 'Groq Cloud', provider: 'groq' });
          }
          throw new Error('Groq AI से संपर्क नहीं हो सका। कृपया सेटिंग्स में API Key जांचें।');
        }
        return;
      }

      // 4. OpenRouter Agent
      if (currentAgent.provider === 'openrouter') {
        const effectiveOpenRouterKey = (openRouterKey && openRouterKey.trim()) || (import.meta.env.VITE_OPENROUTER_API_KEY as string) || '';
        const orMessages = [
          ...messages.slice(-6).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
          { role: 'user', content: query },
        ];

        let directSuccess = false;

        try {
          const response = await fetch('/api/chat/openrouter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: effectiveOpenRouterKey || undefined,
              model: openRouterModel,
              messages: orMessages,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setMessages(prev => [
              ...prev,
              {
                id: `ai_${Date.now()}`,
                sender: 'ai',
                text: data.reply || 'उत्तर प्राप्त नहीं हुआ।',
                timestamp: Date.now(),
                agentName: 'OpenRouter',
                modelUsed: openRouterModel,
              },
            ]);
            return;
          }
        } catch (serverErr) {
          console.log('Server endpoint unavailable, attempting direct OpenRouter client...', serverErr);
        }

        // Direct Client Fallback to OpenRouter
        if (effectiveOpenRouterKey) {
          try {
            const directOR = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${effectiveOpenRouterKey}`,
                'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://examveda.app',
                'X-Title': 'Exam Veda',
              },
              body: JSON.stringify({
                model: openRouterModel,
                messages: [
                  {
                    role: 'system',
                    content:
                      'आप एक उत्कृष्ट हिंदी शिक्षक (Veda AI) हैं। छात्र को स्वच्छ, बुलेट पॉइंट्स व परीक्षा उपयोगी नोट्स में स्पष्ट उत्तर दें।',
                  },
                  ...orMessages,
                ],
              }),
            });

            if (directOR.ok) {
              const directData = await directOR.json();
              const reply =
                directData.choices?.[0]?.message?.content || 'उत्तर प्राप्त नहीं हुआ।';
              setMessages(prev => [
                ...prev,
                {
                  id: `ai_${Date.now()}`,
                  sender: 'ai',
                  text: reply,
                  timestamp: Date.now(),
                  agentName: 'OpenRouter',
                  modelUsed: openRouterModel,
                },
              ]);
              directSuccess = true;
              return;
            }
          } catch (directErr) {
            console.warn('Direct OpenRouter call failed:', directErr);
          }
        }

        if (!directSuccess) {
          if (!effectiveOpenRouterKey) {
            setMissingKeyNotice({ agentName: 'OpenRouter', provider: 'openrouter' });
          }
          throw new Error('OpenRouter API से संपर्क नहीं हो सका। कृपया सेटिंग्स में API Key जांचें।');
        }
        return;
      }

      // 5. Custom Agent
      if (currentAgent.provider === 'custom') {
        const ca = customAgents.find(c => c.id === currentAgent.id);
        if (!ca) throw new Error('कस्टम एजेंट कॉन्फ़िगरेशन नहीं मिला।');

        const customMessages = [
          ...messages.slice(-6).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
          { role: 'user', content: query },
        ];

        let directSuccess = false;

        try {
          const response = await fetch('/api/chat/custom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              baseUrl: ca.baseUrl,
              apiKey: ca.apiKey,
              model: ca.model,
              messages: customMessages,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setMessages(prev => [
              ...prev,
              {
                id: `ai_${Date.now()}`,
                sender: 'ai',
                text: data.reply || 'उत्तर प्राप्त नहीं हुआ।',
                timestamp: Date.now(),
                agentName: ca.name,
                modelUsed: ca.model,
              },
            ]);
            return;
          }
        } catch (serverErr) {
          console.log('Server endpoint unavailable, attempting direct Custom Agent client...', serverErr);
        }

        // Direct Client Fallback to Custom endpoint
        if (ca.baseUrl) {
          try {
            const cleanUrl = ca.baseUrl.replace(/\/+$/, '');
            const targetUrl = cleanUrl.endsWith('/chat/completions')
              ? cleanUrl
              : `${cleanUrl}/chat/completions`;

            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
            };
            if (ca.apiKey) {
              headers['Authorization'] = `Bearer ${ca.apiKey}`;
            }

            const directCustom = await fetch(targetUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                model: ca.model || 'default',
                messages: customMessages,
              }),
            });

            if (directCustom.ok) {
              const data = await directCustom.json();
              const reply =
                data.choices?.[0]?.message?.content || data.reply || 'उत्तर प्राप्त नहीं हुआ।';
              setMessages(prev => [
                ...prev,
                {
                  id: `ai_${Date.now()}`,
                  sender: 'ai',
                  text: reply,
                  timestamp: Date.now(),
                  agentName: ca.name,
                  modelUsed: ca.model,
                },
              ]);
              directSuccess = true;
              return;
            }
          } catch (directErr) {
            console.warn('Direct custom agent call failed:', directErr);
          }
        }

        if (!directSuccess) {
          throw new Error('कस्टम AI एजेंट से उत्तर प्राप्त नहीं हो सका। कृपया URL व Key जांचें।');
        }
        return;
      }
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : 'सर्वर से संपर्क नहीं हो सका।';
      console.warn('Veda AI Chat error caught:', errMessage);

      // Check if it's a network/connection failure
      const isConnectionProblem =
        !navigator.onLine ||
        errMessage.includes('Failed to fetch') ||
        errMessage.includes('NetworkError') ||
        errMessage.includes('connection') ||
        errMessage.includes('कनेक्शन');

      if (isConnectionProblem) {
        setConnectionLostNotice(
          `📡 कनेक्शन बाधित (Connection Lost): ${errMessage}। अंतर्निहित वेदमंत्र इंजन से तत्काल उत्तर उपलब्ध कराया गया है।`
        );
      }

      // Gracefully deliver standard study response so user is never stranded
      const fallbackReply = getBuiltinKnowledgeResponse(query);
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: fallbackReply,
          timestamp: Date.now(),
          agentName: 'वेदमंत्र (स्मार्ट रिज़ॉल्वर)',
          modelUsed: 'Fallback Engine',
          isErrorFallback: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render formatted markdown-like text
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-slate-800">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // Heading
          if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
            const headingText = trimmed.replace(/^#+\s*/, '');
            return (
              <h4 key={idx} className="font-bold text-slate-900 text-base mt-2 pb-0.5 border-b border-slate-100">
                {headingText}
              </h4>
            );
          }

          // Exam point / Callout
          if (trimmed.startsWith('📌')) {
            return (
              <div
                key={idx}
                className="my-2.5 p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-950 font-medium text-xs sm:text-sm flex items-start gap-2 shadow-2xs"
              >
                <span className="text-base shrink-0">📌</span>
                <div className="flex-1">{renderInline(trimmed.replace(/^📌\s*/, ''))}</div>
              </div>
            );
          }

          // Bullet points
          if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
            const indentLevel = line.search(/\S/);
            return (
              <div
                key={idx}
                className={`flex items-start gap-2 my-1 text-slate-800 ${
                  indentLevel > 2 ? 'ml-5' : 'ml-1'
                }`}
              >
                <span className="text-indigo-600 font-bold text-xs mt-1 shrink-0">•</span>
                <div className="flex-1">{renderInline(trimmed.replace(/^[•\-]\s+/, ''))}</div>
              </div>
            );
          }

          // Numbered items
          if (/^\d+\.\s/.test(trimmed)) {
            const numMatch = trimmed.match(/^\d+\./)?.[0];
            return (
              <div key={idx} className="flex items-start gap-2 my-1.5 ml-1 text-slate-800">
                <span className="font-bold text-indigo-700 text-xs mt-0.5 shrink-0 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-150">
                  {numMatch}
                </span>
                <div className="flex-1">{renderInline(trimmed.replace(/^\d+\.\s+/, ''))}</div>
              </div>
            );
          }

          // Empty lines
          if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
          }

          // Normal line
          return <p key={idx}>{renderInline(trimmed)}</p>;
        })}
      </div>
    );
  };

  const renderInline = (str: string) => {
    // Bold **text**
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] pb-16 md:pb-4">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 shadow-xs shrink-0">
        <div className="flex items-center gap-2.5">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="होम पर जाएं"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold shadow-xs">
            <span className="text-base">🕉️</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm sm:text-base leading-tight flex items-center gap-1.5">
                <span>Veda AI</span>
                <span className="text-xs text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-bold border border-indigo-200">
                  वेद AI
                </span>
              </h2>

              {/* Real-time Status indicator */}
              <div className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                {isOnline ? (
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="hidden sm:inline">कनेक्टेड</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-700 font-bold">
                    <WifiOff className="w-3 h-3" />
                    <span>ऑफ़लाइन</span>
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-none mt-0.5 hidden sm:block">
              मल्टी-एजेंट स्टडी गुरु (Gemini, Groq, DeepSeek व वेदमंत्र)
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1.5">
          {/* Active Model Selector Pill */}
          <div className="relative">
            <select
              value={
                currentAgent.provider === 'gemini'
                  ? geminiModel
                  : currentAgent.provider === 'groq'
                  ? groqModel
                  : currentAgent.provider === 'openrouter'
                  ? openRouterModel
                  : currentAgent.models[0]?.id
              }
              onChange={e => {
                const val = e.target.value;
                if (currentAgent.provider === 'gemini') {
                  setGeminiModel(val);
                  localStorage.setItem(STORAGE_KEY_GEMINI_MODEL, val);
                } else if (currentAgent.provider === 'groq') {
                  setGroqModel(val);
                  localStorage.setItem(STORAGE_KEY_GROQ_MODEL, val);
                } else if (currentAgent.provider === 'openrouter') {
                  setOpenRouterModel(val);
                  localStorage.setItem(STORAGE_KEY_OPENROUTER_MODEL, val);
                }
              }}
              className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold pl-2.5 pr-6 py-1.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-[140px] sm:max-w-[210px] truncate"
              title="सक्रिय AI मॉडल बदलें"
            >
              {currentAgent.models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Settings button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Veda AI एजेंट्स व API Keys प्रबंधित करें"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">एजेंट्स</span>
          </button>
        </div>
      </div>

      {/* Multi-Agent Quick Switcher Tabs */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
        <span className="text-[11px] font-bold text-slate-500 shrink-0 mr-1 hidden sm:inline">
          एजेंट चुनें:
        </span>
        {allAgents.map(agent => {
          const isActive = agent.id === activeAgentId;
          const isMissing = !checkAgentKeyConfigured(agent);

          return (
            <button
              key={agent.id}
              onClick={() => handleSelectAgent(agent.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs scale-[1.02]'
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
              title={agent.tagline}
            >
              <span>{agent.iconEmoji}</span>
              <span>{agent.name.split(' ')[0]}</span>
              {agent.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                    isActive ? 'bg-indigo-700/80 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {agent.badge}
                </span>
              )}
              {isMissing && (
                <span
                  className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"
                  title="API Key आवश्यक"
                ></span>
              )}
            </button>
          );
        })}

        <button
          onClick={() => {
            setShowSettingsModal(true);
            setSettingsTab('custom');
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shrink-0 transition-colors cursor-pointer"
          title="+ नया कस्टम AI एजेंट जोड़ें"
        >
          <Plus className="w-3 h-3" />
          <span>+ कस्टम</span>
        </button>
      </div>

      {/* Warning Notice: Missing API Key */}
      {missingKeyNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-3.5 py-2 text-xs flex items-center justify-between gap-2 shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-900">
            <Key className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{missingKeyNotice.agentName}</strong> की API Key सेट नहीं है।
              सटीक उत्तर के लिए अपनी Key दर्ज करें या अंतर्निहित वेदमंत्र मोड का उपयोग करें।
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setShowSettingsModal(true);
                setSettingsTab('keys');
              }}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Key सेट करें
            </button>
            <button
              onClick={() => handleSelectAgent('veda_builtin')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-amber-900 font-bold rounded-lg border border-amber-300 transition-colors cursor-pointer"
            >
              वेदमंत्र चुनें
            </button>
            <button
              onClick={() => setMissingKeyNotice(null)}
              className="p-1 text-amber-700 hover:text-amber-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Warning Notice: Connection Lost */}
      {connectionLostNotice && (
        <div className="bg-rose-50 border-b border-rose-200 px-3.5 py-2 text-xs flex items-center justify-between gap-2 shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2 text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{connectionLostNotice}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setConnectionLostNotice(null);
                if (inputText) handleSendMessage();
              }}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              पुनः प्रयास
            </button>
            <button
              onClick={() => handleSelectAgent('veda_builtin')}
              className="px-2.5 py-1 bg-white text-rose-800 border border-rose-300 font-bold rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
            >
              वेदमंत्र मोड
            </button>
            <button
              onClick={() => setConnectionLostNotice(null)}
              className="p-1 text-rose-700 hover:text-rose-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5 sm:space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-3.5 sm:p-4.5 text-xs sm:text-sm shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-xs font-medium'
                  : 'bg-white border border-slate-200 rounded-tl-xs'
              }`}
            >
              {/* AI Agent badge header */}
              {msg.sender === 'ai' && (
                <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-150">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-indigo-50 border border-indigo-150 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                      🕉️
                    </span>
                    <span className="font-bold text-slate-900 text-xs">
                      {msg.agentName || 'Veda AI'}
                    </span>
                    {msg.modelUsed && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        • {msg.modelUsed}
                      </span>
                    )}
                    {msg.isErrorFallback && (
                      <span className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded">
                        स्मार्ट बैकअप
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Copy button */}
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="उत्तर कॉपी करें"
                    >
                      {copiedMsgId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Message Body */}
              <div>
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                ) : (
                  renderFormattedText(msg.text)
                )}
              </div>
            </div>

            <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 shadow-xs flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center animate-spin">
                <RefreshCw className="w-3 h-3" />
              </div>
              <span className="text-xs text-slate-600 font-medium">
                {currentAgent.name} उत्तर तैयार कर रहा है...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Topic Carousel */}
      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
        <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span>सुझाव:</span>
        </span>
        {PRESET_TOPICS.map((topic, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(topic.query)}
            className="text-[11px] font-semibold bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 hover:border-indigo-200 shrink-0 transition-colors cursor-pointer"
          >
            {topic.label}
          </button>
        ))}
      </div>

      {/* Bottom Input Area */}
      <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 shrink-0 shadow-lg">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={`${currentAgent.name} से कोई भी प्रश्न या 1-लाइनर फैक्ट पूछें...`}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">पूछें</span>
          </button>
        </form>
      </div>

      {/* SETTINGS MODAL: Agents & Keys */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  🕉️
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Veda AI सेटिंग्स व एजेंट्स (Settings)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Google Gemini, Groq, OpenRouter व कस्टम मॉडल्स प्रबंधित करें
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setSettingsTab('agents')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  settingsTab === 'agents'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. सक्रिय एजेंट्स
              </button>
              <button
                onClick={() => setSettingsTab('keys')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  settingsTab === 'keys'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. API Keys
              </button>
              <button
                onClick={() => setSettingsTab('custom')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                  settingsTab === 'custom'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. + कस्टम एजेंट
              </button>
            </div>

            {/* TAB 1: Available Agents Selection */}
            {settingsTab === 'agents' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  जिस एजेंट का उपयोग करना चाहते हैं, उसे चुनें:
                </p>

                <div className="space-y-2">
                  {allAgents.map(ag => {
                    const isSelected = ag.id === activeAgentId;
                    const keyConfigured = checkAgentKeyConfigured(ag);

                    return (
                      <div
                        key={ag.id}
                        onClick={() => handleSelectAgent(ag.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl p-2 rounded-xl bg-slate-100">{ag.iconEmoji}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">{ag.name}</h4>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200">
                                {ag.badge}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{ag.tagline}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {keyConfigured ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              तैयार ✓
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Key आवश्यक
                            </span>
                          )}

                          <input
                            type="radio"
                            name="agent_select"
                            checked={isSelected}
                            onChange={() => handleSelectAgent(ag.id)}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Provider Keys Configuration */}
            {settingsTab === 'keys' && (
              <div className="space-y-4 text-xs sm:text-sm">
                {/* 1. Google Gemini Key */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span>✨</span>
                      <span>Google Gemini API Key</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {hasServerGeminiKey ? 'सर्वर से कनेक्टेड (Active)' : 'कस्टम Key दर्ज करें'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    AI Studio सर्वर की का स्वतः उपयोग होता है, या आप अपनी व्यक्तिगत Gemini API Key भी डाल सकते हैं।
                  </p>
                  <input
                    type="password"
                    placeholder={hasServerGeminiKey ? '•••••••••••••••• (सर्वर डिफ़ॉल्ट सक्रिय)' : 'AIzaSy...'}
                    value={geminiKey}
                    onChange={e => {
                      setGeminiKey(e.target.value.trim());
                      localStorage.setItem(STORAGE_KEY_GEMINI_KEY, e.target.value.trim());
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex justify-end">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>मुफ़्त Gemini Key प्राप्त करें</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* 2. Groq Cloud Key */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span>⚡</span>
                      <span>Groq Cloud API Key</span>
                    </div>
                    {groqKey ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        सेव है ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        अनुपलब्ध
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Llama 3.3 (70B) के लिए मुफ़्त Groq API Key (gsk_...) दर्ज करें:
                  </p>
                  <input
                    type="password"
                    placeholder="gsk_..."
                    value={groqKey}
                    onChange={e => {
                      const clean = e.target.value.trim();
                      setGroqKey(clean);
                      localStorage.setItem(STORAGE_KEY_GROQ_KEY, clean);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex justify-between items-center">
                    {groqKey && (
                      <button
                        onClick={() => {
                          setGroqKey('');
                          localStorage.removeItem(STORAGE_KEY_GROQ_KEY);
                        }}
                        className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        Key हटाएं
                      </button>
                    )}
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-bold ml-auto"
                    >
                      <span>मुफ़्त Groq Key प्राप्त करें</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* 3. OpenRouter Key */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span>🧠</span>
                      <span>OpenRouter API Key (DeepSeek / Qwen)</span>
                    </div>
                    {openRouterKey ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        सेव है ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        वैकल्पिक
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder="sk-or-v1-..."
                    value={openRouterKey}
                    onChange={e => {
                      const clean = e.target.value.trim();
                      setOpenRouterKey(clean);
                      localStorage.setItem(STORAGE_KEY_OPENROUTER_KEY, clean);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex justify-end">
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>OpenRouter Keys देखें</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Add Custom Agent */}
            {settingsTab === 'custom' && (
              <div className="space-y-4 text-xs sm:text-sm">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  कोई भी OpenAI-संगत API एजेंट (जैसे Local Ollama, LM Studio, Together AI, Mistral) जोड़ें:
                </p>

                <form onSubmit={handleAddCustomAgent} className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      एजेंट का नाम (Name)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. Local Ollama या My Custom AI"
                      value={newCustomName}
                      onChange={e => setNewCustomName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Base URL (OpenAI Compatible)
                    </label>
                    <input
                      type="text"
                      placeholder="http://localhost:11434/v1 या https://api.together.xyz/v1"
                      value={newCustomUrl}
                      onChange={e => setNewCustomUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        मॉडल नाम (Model ID)
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. llama3.2, mistral आदि"
                        value={newCustomModel}
                        onChange={e => setNewCustomModel(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        API Key (यदि आवश्यक हो)
                      </label>
                      <input
                        type="password"
                        placeholder="वैकल्पिक / Optional"
                        value={newCustomKey}
                        onChange={e => setNewCustomKey(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer active:scale-95 shadow-xs"
                  >
                    + यह एजेंट Veda AI में जोड़ें
                  </button>
                </form>

                {/* Existing Custom Agents */}
                {customAgents.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <h5 className="font-bold text-slate-900 text-xs">आपके कस्टम एजेंट्स:</h5>
                    {customAgents.map(ca => (
                      <div
                        key={ca.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{ca.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
                            {ca.baseUrl} • {ca.model}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteCustomAgent(ca.id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="एजेंट हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {saveToast && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center animate-fadeIn">
                ✓ सेटिंग्स सफलतापूर्वक सुरक्षित कर दी गईं!
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                सम्पन्न (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
