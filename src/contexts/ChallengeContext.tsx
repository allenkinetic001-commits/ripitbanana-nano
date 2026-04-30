import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { posts } from '../data/posts';
import { formatDate } from '../lib/utils';
import { useSupabasePosts, formatPostForUI } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';

interface Survivor {
  id: number;
  username: string;
  avatar: string;
  image: string;
  caption: string;
  time: string;
  comments: { id: number; username: string; text: string; time: string; }[];
  survivalDate?: string;
  survivalTime?: string;
  roundDurationLabel?: string;
  roundDurationValue?: number;
  variant?: string | null;
  userVote?: 'up' | 'down' | null;
  rankingRule?: string | null;
  madeIt?: boolean;
  isSworn?: boolean;
}

interface RoundRecord {
  id: string;
  date: string;
  time: string;
  survivors: Survivor[];
  eliminated: Survivor[];
  durationLabel: string;
  variant: string | null;
  timestamp?: number;
  rankingRule?: string | null;
}

interface Comment {
  id: number;
  username: string;
  avatar: string;
  text: string;
  time: string;
}

interface WallPost {
  id: number;
  username: string;
  avatar: string;
  text: string;
  time: string;
  targetUser?: string; // If undefined, it's a community wall post
}

interface UserProfile {
  username: string;
  fullName: string;
  bio: string;
  avatar: string;
  website: string;
}

interface ChallengeContextType {
  timeLeft: number;
  isActive: boolean;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  clickCounts: Record<string, number>;
  eliminationCounts: Record<string, number>;
  madeItCounts: Record<string, number>;
  variantDurations: Record<string, number>;
  variantFirstClickTime: Record<string, number>;
  userSelection: string | null;
  isChallengeEnded: boolean;
  enemies: Survivor[];
  postComments: Record<number, Comment[]>;
  wallPosts: WallPost[];
  followedUsers: string[];
  toggleFollow: (username: string) => void;
  isLegend: (username: string) => boolean;
  isSurvivor: (username: string) => boolean;
  allPosts: any[];
  setAllPosts: React.Dispatch<React.SetStateAction<any[]>>;
  visiblePosts: any[];
  setVisiblePosts: React.Dispatch<React.SetStateAction<any[]>>;
  majorityVariant: string | null;
  survivors: Survivor[];
  eliminated: Survivor[];
  addEliminated: (user: Survivor) => void;
  survivorHistory: Survivor[];
  roundHistory: RoundRecord[];
  showPills: boolean;
  setShowPills: (show: boolean) => void;
  activeTab: string | null;
  setActiveTab: (tab: string | null) => void;
  historyLoading: boolean;
  postsLoading: boolean;
  unreadMessageCount: number;
  setUnreadMessageCount: (count: number) => void;
  setTimeLeft: (time: number) => void;
  setIsActive: (active: boolean) => void;
  setClickCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setEliminationCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setMadeItCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setVariantDurations: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setVariantFirstClickTime: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setUserSelection: (selection: string | null) => void;
  setIsChallengeEnded: (ended: boolean) => void;
  isEliminationRoundActive: boolean;
  setIsEliminationRoundActive: (active: boolean) => void;
  setSurvivors: React.Dispatch<React.SetStateAction<Survivor[]>>;
  setRoundHistory: React.Dispatch<React.SetStateAction<RoundRecord[]>>;
  updateHistoryVote: (survivorId: number, roundId: string | null, vote: 'up' | 'down' | null) => void;
  startNewChallenge: () => void;
  clearAllHistory: () => void;
  getVariantDisplayName: (key: string | null) => string;
  addEnemy: (survivor: Survivor) => void;
  addSwornEnemy: (survivor: Survivor) => void;
  removeEnemy: (enemyId: number) => void;
  addComment: (postId: number, text: string) => void;
  addWallPost: (text: string, targetUser?: string) => void;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (username: string) => void;
  logout: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  t: (key: string) => string;
  userVotes: Record<string, number>;
  setUserVoteForPost: (postId: string | number, vote: number) => void;
  postLives: Record<number, number>;
  setPostLivesForPost: (postId: number, lives: number) => void;
  userLives: Record<string, number>;
  setUserLivesForUser: (username: string, lives: number) => void;
  isEliminated: boolean;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    // Settings
    'settings': 'Settings',
    'app': 'App',
    'language': 'Language',
    'theme': 'Theme',
    'personalization': 'Personalization',
    'about': 'About',
    'model': 'Model',
    'terms': 'Terms of Service',
    'privacy': 'Privacy Policy',
    'contact': 'Contact Us',
    'logout': 'Log out',
    'cancel': 'Cancel',
    
    // BottomNav
    'nav_home': 'Home',
    'nav_search': 'public',
    'nav_create': 'Create',
    'nav_notifications': 'Activity',
    'nav_profile': 'Profile',
    'nav_chat': 'Messages',

    // Home
    'home_following': 'Following',
    'home_for_you': 'For You',
    'home_live_challenge': 'Live Challenge',
    'home_survivors': 'Survivors',
    'home_pass': 'Pass',
    'home_smash': 'Smash',
    'home_add_enemy': 'Add Enemy',
    'home_added_enemy': 'Added Enemy',
    'home_share': 'Share',
    'home_remix': 'Remix',
    'home_made_it': 'Made It',
    'home_pleyed': 'Pleyed',
    'home_won': 'Won',
    'home_survived': 'Survived',
    'home_the_end': 'The End',
    'home_all_judged': 'All profiles have been judged',
    'home_universal_complete': 'Universal Selection Complete',
    'home_winner_complete': 'Winner Selection Complete',
    'home_upload_modal_title': 'New Post',
    'home_upload_caption_placeholder': 'Write a caption...',
    'home_upload_cancel': 'Cancel',
    'home_upload_post': 'Post',
    'home_eliminated': 'Eliminated',
    'home_majority': 'Majority',
    'home_choose_variant': 'Choose Variant',
    'home_set_duration': 'Set Time',
    'home_calendar': 'Today',
    'home_next_reshuffle': 'Next Reshuffle',
    'home_select_ranking': 'Select Top Ranking',
    'home_select_rule': 'Select Rule',
    'home_current_choice': 'Current Choice',
    'home_community_votes': 'Community Votes',
    'home_selection_locked': 'Selection locked until timer ends',
    'home_submitted': 'Submitted',
    'home_invalid_ranking': 'Invalid Ranking',
    'home_submit': 'Submit',
    'home_view_history': 'View Round History',
    'home_start_new': 'Or Start New Round',

    // Search
    'search_header_details': 'Round Details',
    'search_header_results': 'Round Results',
    'search_header_hall': 'Hall of Fame',
    'search_header_history': 'Round History',
    'search_top_survivors': 'Top Survivors',
    'search_recent_outcomes': 'Recent Round Outcomes',
    'search_clear_history': 'Clear All History',
    'search_start_round': 'Start Round',
    'search_filter_type': 'Round Type:',
    'search_all_winners': 'All Winners',
    'search_try_again': 'Try Again',
    'search_total_termination': 'TOTAL TERMINATION',
    'search_no_winners': 'NO WINNERS FOUND',
    'search_waiting': 'Waiting for a winner',
    'search_no_active': 'No Active Round',
    'search_waiting_desc': 'The round is currently in progress. Stay tuned for the results.',
    'search_start_desc': 'Start a new round from the home screen to see survivors here.',
    'search_join_next': 'Join Next Task',

    // CreatePost
    'create_new_post': 'New Post',
    'create_next': 'Next',
    'create_camera': 'Camera',
    'create_gallery': 'Gallery',
    'create_select_preview': 'Select media to preview',
    'create_caption_placeholder': 'Write a caption...',

    // Notifications
    'notif_activity': 'Activity',
    'notif_follow': 'Follow',
    'notif_following': 'Following',
    'notif_upvoted': 'upvoted your photo',
    'notif_commented': 'commented:',
    'notif_started_following': 'started following you',

    // Profile
    'profile_posts': 'Posts',
    'profile_followers': 'Followers',
    'profile_following': 'Following',
    'profile_enemies': 'Enemies',
    'profile_edit': 'Edit Profile',
    'profile_share': 'Share Profile',
    'profile_bio_placeholder': 'Add a bio to your profile...',
    'profile_tab_posts': 'Posts',
    'profile_tab_enemies': 'Enemies',
    'profile_tab_following': 'Following',
    'profile_no_posts': 'No posts yet',
    'profile_no_enemies': 'No Sworn Enemies Yet',
    'profile_no_following': 'Not Following Anyone',
    'profile_marked_enemy': 'Marked Enemy',
    'profile_enemies_desc': 'Profiles you mark as enemies will appear here.',
    'profile_following_desc': 'Follow survivors from the Hall of Fame to see them here.',
    'profile_unfollow': 'Unfollow',
    'profile_legend': 'Legend',
    'post_view_comments': 'View all comments',
    'post_write_comment': 'Write a comment...',
    'post_add_comment': 'Add Comment',
    'timer_rule': 'Rule',
    'theme_light': 'Light',
    'theme_system': 'System',

    // Personalization Modal
    'pers_title': 'Rip It – Personalization (Gen Z Style)',
    'pers_subtitle': 'Rip It isn’t one-size-fits-all.',
    'pers_desc': 'Your profile evolves with how you survive.',
    'pers_item1': 'Custom vibes & themes',
    'pers_item2': 'Mode-based visuals (Pley hits different)',
    'pers_item3': 'Dynamic titles that flex your status',
    'pers_item4': 'Follower energy that builds your presence',
    'pers_footer1': 'The more you play, the more your identity shifts.',
    'pers_footer2': 'Win or reset — your legacy still talks.',
    'pers_button': 'Got it',

    // About Modal
    'about_title': 'About Rip It',
    'about_tagline': 'Tagline: Survive. Reset. Evolve.',
    'about_desc1': 'RIPIT is a global social media platform where users post any content and compete to survive for 24 hours based on audience reactions, where higher support keeps them in the network, lower performance leads to elimination for that round, and survivors gain survival, visibility, and importantly status as they continue competing daily.',
    'about_pley_title': 'Pley',
    'about_pley_desc': 'Survival mode with high-risk elimination.',
    'about_desc2': 'Rip It combines social interaction, competition, and dynamic personalization to create a unique, viral, and adrenaline-pumping experience.',
    'about_footer': 'We’re here to make your profile, status, and survival story matter—win, reset, or evolve.',
    'about_close': 'Close',

    // Contact Modal
    'contact_title': 'Contact Us',
    'contact_desc': 'Got questions, feedback, or just want to tell us your survival story? Reach out:',
    'contact_email_label': 'Email',
    'contact_email_or': 'or',
    'contact_footer': 'We’ll get back to you as fast as a Pley timer counting down.',
    'contact_close': 'Close',

    // Model Modal
    'model_title': 'Rip It – App Model',
    'model_concept_title': '1️⃣ Core Concept',
    'model_concept_desc': 'RIPIT is a global social media platform where users post any content and compete to survive for 24 hours based on audience reactions, where higher support keeps them in the network, lower performance leads to elimination for that round, and survivors gain survival, visibility, and importantly status as they continue competing daily.',
    'model_modes_title': '2️⃣ Modes',
    'model_pley_title': 'Pley',
    'model_pley_item1': 'Survival-focused',
    'model_pley_item2': 'Only down votes matter',
    'model_pley_item3': 'Timed rounds (user sets duration)',
    'model_pley_item4': 'Last standing users gain recognition',
    'model_pers_title': '3️⃣ Personalization (Non-IP Specific)',
    'model_pers_item1': 'Custom display name & profile theme',
    'model_pers_item2': 'Mode-based visual experience',
    'model_pers_item3': 'Dynamic titles & status',
    'model_pers_item4': 'Follower/engagement metrics',
    'model_close': 'Close',

    // Privacy Modal
    'priv_subtitle': 'Your privacy matters.',
    'priv_effective': 'Effective Date: 02/23/26',
    'priv_intro': 'By using Rip It, you agree to the collection and use of information as described below.',
    'priv_s1_title': '1️⃣ Information We Collect',
    'priv_s1_i1': 'Account info: Username, email, profile data, and preferences.',
    'priv_s1_i2': 'Gameplay info: Mode participation, votes, timers, achievements.',
    'priv_s1_i3': 'Device info: IP address, device type, OS, and usage stats.',
    'priv_s1_i4': 'Optional info: Social links or content you choose to share.',
    'priv_s2_title': '2️⃣ How We Use Your Info',
    'priv_s2_i1': 'To run and improve Rip It’s features and modes.',
    'priv_s2_i2': 'To personalize your experience, including profile themes and status.',
    'priv_s2_i3': 'To detect abuse, spam, or unsafe activity.',
    'priv_s2_i4': 'To communicate updates, events, or support messages.',
    'priv_s3_title': '3️⃣ Sharing Your Info',
    'priv_s3_i1': 'We do not sell your personal information.',
    'priv_s3_i2': 'Some data may be visible to other users (like usernames, status, and leaderboard info).',
    'priv_s3_i3': 'We may share data with service providers or for legal compliance.',
    'priv_s4_title': '4️⃣ Security',
    'priv_s4_i1': 'We use industry-standard practices to protect your data.',
    'priv_s4_i2': 'No system is perfect—participation carries risk, especially in public features.',
    'priv_s5_title': '5️⃣ Your Choices',
    'priv_s5_i1': 'You can update or delete your account anytime.',
    'priv_s5_i2': 'You can control visibility of your profile and activity in the app.',
    'priv_s5_i3': 'You can opt out of non-essential communications.',
    'priv_s6_title': '6️⃣ Changes to Privacy Policy',
    'priv_s6_i1': 'Updates may happen as the app evolves.',
    'priv_s6_i2': 'Major changes will be announced in-app.',

    // Terms Modal
    'terms_tagline': 'Tagline: Survive. Reset. Evolve.',
    'terms_effective': 'Effective Date: 02/23/26',
    'terms_intro': 'By using Rip It, you agree to these Terms. If you do not agree, please do not use the app.',
    'terms_s1_title': '1. What Rip It Is',
    'terms_s1_desc': 'Rip It is a high-stakes social survival app where users participate in timed challenges, public voting, and competitive modes.',
    'terms_s1_list_title': 'We provide tools for:',
    'terms_s1_i1': 'Mode-based survival experiences (Pley, Pills)',
    'terms_s1_i2': 'Public voting and recognition',
    'terms_s1_i3': 'Profile personalization and status tracking',
    'terms_s1_disclaimer': 'Rip It does not guarantee outcomes, survival, or ranking.',
    'terms_s2_title': '2. Who Can Use Rip It',
    'terms_s2_i1': 'Be at least 13 years old',
    'terms_s2_i2': 'Use the app legally and respectfully',
    'terms_s2_i3': 'Provide accurate information',
    'terms_s2_i4': 'Be responsible for your account and activity',
    'terms_s3_title': '3. Modes & Voting Rules',
    'terms_s3_i1': 'Pley and Pills have unique mechanics affecting profile status and progression.',
    'terms_s3_i2': 'Votes may affect user progress, profile reset, or temporary restrictions.',
    'terms_s3_i3': 'Timers, rounds, and outcomes are determined by the app and participating users.',
    'terms_s3_i4': 'Users participate at their own discretion.',
    'terms_s4_title': '4. Reputation, Status & Scores',
    'terms_s4_intro': 'By using Rip It, you understand:',
    'terms_s4_i1': 'Status, titles, and recognition reflect in-app performance and survival history',
    'terms_s4_i2': 'Public voting affects progression within modes',
    'terms_s4_i3': 'Rip It does not manipulate outcomes to favor any user',
    'terms_s4_i4': 'Abuse, manipulation, or spamming may result in penalties or removal',
    'terms_s5_title': '5. User Conduct',
    'terms_s5_intro': 'You agree not to:',
    'terms_s5_i1': 'Harass, threaten, or bully others',
    'terms_s5_i2': 'Spam or manipulate votes',
    'terms_s5_i3': 'Impersonate other users',
    'terms_s5_i4': 'Use Rip It for illegal activity',
    'terms_s5_footer': 'Violations may result in suspension, restriction, or account removal.',
    'terms_s6_title': '6. Content & User Data',
    'terms_s6_i1': 'You retain ownership of content you create in the app.',
    'terms_s6_i2': 'You are responsible for your submissions and behavior.',
    'terms_s6_i3': 'Rip It is not responsible for user-generated content.',
    'terms_s6_i4': 'We may remove content that violates these Terms or is unsafe.',
    'terms_s7_title': '7. Account Suspension, Reset & Termination',
    'terms_s7_i1': 'Accounts may be suspended, reset, or deleted if Terms are violated or the platform is misused.',
    'terms_s7_i2': 'Certain modes may result in profile resets as part of gameplay mechanics.',
    'terms_s7_i3': 'You may delete your account at any time.',
    'terms_s8_title': '8. Disclaimer',
    'terms_s8_i1': 'Rip It is provided “as is.”',
    'terms_s8_i2': 'We do not guarantee uninterrupted service.',
    'terms_s8_i3': 'We are not responsible for user outcomes, profile resets, or lost recognition.',
    'terms_s8_i4': 'Participation is at your own discretion.',
    'terms_s9_title': '9. Changes to These Terms',
    'terms_s9_desc': 'We may update these Terms periodically. Significant changes will be communicated in-app.',
    'terms_s10_title': '10. Contact',
    'terms_s10_desc': 'Questions or concerns?',
    'terms_s10_email': 'Email: ripit90210@gmail.com'
  },
  ko: {
    // Settings
    'settings': '설정',
    'app': '앱',
    'language': '언어',
    'theme': '테마',
    'personalization': '개인화',
    'about': '정보',
    'model': '모델',
    'terms': '서비스 약관',
    'privacy': '개인정보 처리방침',
    'contact': '문의하기',
    'logout': '로그아웃',
    'cancel': '취소',

    // BottomNav
    'nav_home': '홈',
    'nav_search': 'imemo0',
    'nav_create': '만들기',
    'nav_notifications': '활동',
    'nav_profile': '프로필',

    // Home
    'home_following': '팔로잉',
    'home_for_you': '추천',
    'home_live_challenge': '라이브 챌린지',
    'home_survivors': '생존자',
    'home_pass': '패스',
    'home_smash': '스매시',
    'home_add_enemy': '적으로 추가',
    'home_added_enemy': '적 추가됨',
    'home_share': '공유',
    'home_remix': '리믹스',
    'home_made_it': '성공',
    'home_pleyed': '플레이함',
    'home_won': '승리',
    'home_survived': '생존함',
    'home_the_end': '끝',
    'home_all_judged': '모든 프로필 심사 완료',
    'home_universal_complete': '공통 선택 완료',
    'home_winner_complete': '우승자 선택 완료',
    'home_upload_modal_title': '새 게시물',
    'home_upload_caption_placeholder': '문구 입력...',
    'home_upload_cancel': '취소',
    'home_upload_post': '게시',
    'home_eliminated': '탈락됨',
    'home_majority': '다수결',
    'home_choose_variant': '버전 선택',
    'home_set_duration': '시간 설정',
    'home_select_ranking': '순위 선택',
    'home_select_rule': '규칙 선택',
    'home_current_choice': '현재 선택',
    'home_community_votes': '커뮤니티 투표',
    'home_selection_locked': '타이머 종료까지 선택 잠금',
    'home_submitted': '제출됨',
    'home_invalid_ranking': '잘못된 순위',
    'home_submit': '제출',
    'home_view_history': '기록 보기',
    'home_start_new': '또는 새 라운드 시작',

    // Search
    'search_header_details': '라운드 상세',
    'search_header_results': '라운드 결과',
    'search_header_hall': '명예의 전당',
    'search_header_history': '라운드 기록',
    'search_top_survivors': '최고 생존자',
    'search_recent_outcomes': '최근 결과',
    'search_clear_history': '기록 삭제',
    'search_start_round': '라운드 시작',
    'search_filter_type': '라운드 유형:',
    'search_all_winners': '모든 우승자',
    'search_try_again': '다시 시도',
    'search_total_termination': '전체 종료',
    'search_no_winners': '우승자를 찾을 수 없음',
    'search_waiting': '우승자 대기 중',
    'search_no_active': '진행 중인 라운드 없음',
    'search_waiting_desc': '라운드가 진행 중입니다. 결과를 기다려 주세요.',
    'search_start_desc': '생존자를 보려면 홈 화면에서 새 라운드를 시작하세요.',
    'search_join_next': '다음 미션 참여',

    // CreatePost
    'create_new_post': '새 게시물',
    'create_next': '다음',
    'create_camera': '카메라',
    'create_gallery': '갤러리',
    'create_select_preview': '미리보기 파일 선택',
    'create_caption_placeholder': '문구 입력...',

    // Notifications
    'notif_activity': '활동',
    'notif_follow': '팔로우',
    'notif_following': '팔로잉',
    'notif_upvoted': '회원님의 사진을 좋아합니다',
    'notif_commented': '댓글을 남겼습니다:',
    'notif_started_following': '회원님을 팔로우하기 시작했습니다',

    // Profile
    'profile_posts': '게시물',
    'profile_followers': '팔로워',
    'profile_following': '팔로잉',
    'profile_enemies': '적',
    'profile_edit': '프로필 편집',
    'profile_share': '프로필 공유',
    'profile_bio_placeholder': '소개 추가...',
    'profile_tab_posts': '게시물',
    'profile_tab_enemies': '적',
    'profile_tab_following': '팔로잉',
    'profile_no_posts': '게시물 없음',
    'profile_no_enemies': '아직 숙적이 없습니다',
    'profile_no_following': '아직 팔로우하는 사람이 없습니다',
    'profile_marked_enemy': '적으로 표시됨',
    'profile_enemies_desc': '적으로 표시한 프로필이 여기에 표시됩니다.',
    'profile_following_desc': '명예의 전당에서 생존자를 팔로우하여 여기서 확인하세요.',
    'profile_unfollow': '팔로우 취소',
    'profile_legend': '전설',
    'post_view_comments': '모든 댓글 보기',
    'post_write_comment': '댓글 달기...',
    'post_add_comment': '댓글 추가',
    'timer_rule': '규칙',
    'theme_light': '밝게',
    'theme_system': '시스템',

    // Personalization Modal
    'pers_title': 'Rip It – 개인화 (Z세대 스타일)',
    'pers_subtitle': 'Rip It은 모두에게 똑같은 경험을 제공하지 않습니다.',
    'pers_desc': '당신의 프로필은 생존 방식에 따라 진화합니다.',
    'pers_item1': '커스텀 분위기 및 테마',
    'pers_item2': '모드 기반 비주얼 (Pley, Pley마다 느낌이 다름)',
    'pers_item3': '당신의 상태를 뽐낼 수 있는 역동적인 타이틀',
    'pers_item4': '당신의 존재감을 높여주는 팔로워 에너지',
    'pers_footer1': '더 많이 플레이할수록 당신의 정체성도 변화합니다.',
    'pers_footer2': '승리하든 리셋되든 — 당신의 유산은 계속됩니다.',
    'pers_button': '확인',

    // About Modal
    'about_title': 'Rip It 정보',
    'about_tagline': '슬로건: 생존. 리셋. 진화.',
    'about_desc1': 'Rip It은 대담한 플레이어들을 위해 설계된 고위험 사회적 생존 플랫폼입니다. Pley, Pley와 같은 모드에서 경쟁하며 전략, 회복력, 사회적 기술을 테스트하세요.',
    'about_pley_title': 'Pley',
    'about_pley_desc': '고위험 탈락이 있는 생존 모드.',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': '모든 것을 걸 용기가 있는 사람들을 위한 극한 모드.',
    'about_desc2': 'Rip It은 사회적 상호작용, 경쟁, 역동적인 개인화를 결합하여 독특하고 바이럴하며 아드레날린이 솟구치는 경험을 제공합니다.',
    'about_footer': '우리는 당신의 프로필, 상태, 생존 이야기가 중요하게 느껴지도록 여기 있습니다—승리하거나, 리셋되거나, 진화하세요.',
    'about_close': '닫기',

    // Contact Modal
    'contact_title': '문의하기',
    'contact_desc': '질문, 피드백 또는 생존 이야기를 들려주고 싶으신가요? 연락주세요:',
    'contact_email_label': '이메일',
    'contact_email_or': '또는',
    'contact_footer': 'Pley 타이머가 카운트다운되는 것만큼 빠르게 답변해 드리겠습니다.',
    'contact_close': '닫기',

    // Model Modal
    'model_title': 'Rip It – 앱 모델',
    'model_concept_title': '1️⃣ 핵심 컨셉',
    'model_concept_desc': 'Rip It은 사용자 참여, 투표, 전략이 진행 상황, 상태 및 유산을 결정하는 고위험 사회적 생존 앱입니다. 모든 행동에는 결과가 따르며 긴장감과 몰입감을 조성합니다.',
    'model_modes_title': '2️⃣ 모드',
    'model_pley_title': 'Pley',
    'model_pley_item1': '생존 중심',
    'model_pley_item2': '다운 투표만 중요함',
    'model_pley_item3': '시간 제한 라운드 (사용자가 기간 설정)',
    'model_pley_item4': '마지막까지 살아남은 사용자가 인정을 받음',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': '극한 생존 모드',
    'model_Pley_item2': '다운 투표만 가능',
    'model_Pley_item3': '투표 결과에 따라 완전 리셋',
    'model_Pley_item4': '고위험 스릴을 즐기는 사람들을 위한 자발적 참여',
    'model_pers_title': '3️⃣ 개인화 (비 IP 특정)',
    'model_pers_item1': '커스텀 표시 이름 및 프로필 테마',
    'model_pers_item2': '모드 기반 시각적 경험',
    'model_pers_item3': '역동적인 타이틀 및 상태',
    'model_pers_item4': '팔로워/참여 지표',
    'model_close': '닫기',

    // Privacy Modal
    'priv_subtitle': '당신의 개인정보는 중요합니다.',
    'priv_effective': '시행일: 2026년 2월 23일',
    'priv_intro': 'Rip It을 사용함으로써 당신은 아래에 설명된 정보 수집 및 사용에 동의하게 됩니다.',
    'priv_s1_title': '1️⃣ 수집하는 정보',
    'priv_s1_i1': '계정 정보: 사용자 이름, 이메일, 프로필 데이터 및 기본 설정.',
    'priv_s1_i2': '게임플레이 정보: 모드 참여, 투표, 타이머, 업적.',
    'priv_s1_i3': '기기 정보: IP 주소, 기기 유형, OS 및 사용 통계.',
    'priv_s1_i4': '선택적 정보: 당신이 공유하기로 선택한 소셜 링크 또는 콘텐츠.',
    'priv_s2_title': '2️⃣ 정보 사용 방법',
    'priv_s2_i1': 'Rip It의 기능 및 모드를 실행하고 개선하기 위해.',
    'priv_s2_i2': '프로필 테마 및 상태를 포함한 당신의 경험을 개인화하기 위해.',
    'priv_s2_i3': '남용, 스팸 또는 안전하지 않은 활동을 감지하기 위해.',
    'priv_s2_i4': '업데이트, 이벤트 또는 지원 메시지를 전달하기 위해.',
    'priv_s3_title': '3️⃣ 정보 공유',
    'priv_s3_i1': '우리는 당신의 개인 정보를 판매하지 않습니다.',
    'priv_s3_i2': '일부 데이터는 다른 사용자에게 보일 수 있습니다 (사용자 이름, 상태, 리더보드 정보 등).',
    'priv_s3_i3': '서비스 제공업체와 데이터를 공유하거나 법적 준수를 위해 공유할 수 있습니다.',
    'priv_s4_title': '4️⃣ 보안',
    'priv_s4_i1': '우리는 당신의 데이터를 보호하기 위해 업계 표준 관행을 사용합니다.',
    'priv_s4_i2': '어떤 시스템도 완벽하지 않습니다—참여에는 위험이 따르며, 특히 공개 기능에서 그렇습니다.',
    'priv_s5_title': '5️⃣ 당신의 선택',
    'priv_s5_i1': '언제든지 계정을 업데이트하거나 삭제할 수 있습니다.',
    'priv_s5_i2': '앱 내에서 프로필 및 활동의 가시성을 제어할 수 있습니다.',
    'priv_s5_i3': '비필수 커뮤니케이션을 거부할 수 있습니다.',
    'priv_s6_title': '6️⃣ 개인정보 처리방침 변경',
    'priv_s6_i1': '앱이 발전함에 따라 업데이트가 발생할 수 있습니다.',
    'priv_s6_i2': '주요 변경 사항은 앱 내에서 공지됩니다.',

    // Terms Modal
    'terms_tagline': '슬로건: 생존. 리셋. 진화.',
    'terms_effective': '시행일: 2026년 2월 23일',
    'terms_intro': 'Rip It을 사용함으로써 당신은 이 약관에 동의하게 됩니다. 동의하지 않는 경우 앱을 사용하지 마십시오.',
    'terms_s1_title': '1. Rip It이란 무엇인가',
    'terms_s1_desc': 'Rip It은 사용자가 시간 제한 챌린지, 공개 투표 및 경쟁 모드에 참여하는 고위험 사회적 생존 앱입니다.',
    'terms_s1_list_title': '우리는 다음을 위한 도구를 제공합니다:',
    'terms_s1_i1': '모드 기반 생존 경험 (Pley, Pley)',
    'terms_s1_i2': '공개 투표 및 인정',
    'terms_s1_i3': '프로필 개인화 및 상태 추적',
    'terms_s1_disclaimer': 'Rip It은 결과, 생존 또는 순위를 보장하지 않습니다.',
    'terms_s2_title': '2. 누가 Rip It을 사용할 수 있는가',
    'terms_s2_i1': '최소 13세 이상이어야 함',
    'terms_s2_i2': '법적이고 존중하는 방식으로 앱 사용',
    'terms_s2_i3': '정확한 정보 제공',
    'terms_s2_i4': '당신의 계정 및 활동에 대한 책임',
    'terms_s3_title': '3. 모드 및 투표 규칙',
    'terms_s3_i1': 'Pley, Pley는 프로필 상태 및 진행에 영향을 미치는 고유한 메커니즘을 가집니다.',
    'terms_s3_i2': '투표는 사용자 진행, 프로필 리셋 또는 일시적 제한에 영향을 미칠 수 있습니다.',
    'terms_s3_i3': '타이머, 라운드 및 결과는 앱과 참여 사용자에 의해 결정됩니다.',
    'terms_s3_i4': '사용자는 자신의 재량에 따라 참여합니다.',
    'terms_s4_title': '4. 평판, 상태 및 점수',
    'terms_s4_intro': 'Rip It을 사용함으로써 당신은 다음을 이해합니다:',
    'terms_s4_i1': '상태, 타이틀 및 인정은 앱 내 성과 및 생존 기록을 반영합니다.',
    'terms_s4_i2': '공개 투표는 모드 내 진행에 영향을 미칩니다.',
    'terms_s4_i3': 'Rip It은 특정 사용자를 위해 결과를 조작하지 않습니다.',
    'terms_s4_i4': '남용, 조작 또는 스팸은 패널티 또는 제거로 이어질 수 있습니다.',
    'terms_s5_title': '5. 사용자 행동',
    'terms_s5_intro': '당신은 다음에 동의합니다:',
    'terms_s5_i1': '타인을 괴롭히거나 위협하거나 불링하지 않음',
    'terms_s5_i2': '투표 스팸 또는 조작 금지',
    'terms_s5_i3': '다른 사용자 사칭 금지',
    'terms_s5_i4': '불법적인 활동을 위해 Rip It 사용 금지',
    'terms_s5_footer': '위반 시 일시 중지, 제한 또는 계정 삭제가 발생할 수 있습니다.',
    'terms_s6_title': '6. 콘텐츠 및 사용자 데이터',
    'terms_s6_i1': '당신이 앱에서 생성한 콘텐츠의 소유권은 당신에게 있습니다.',
    'terms_s6_i2': '당신은 당신의 제출물 및 행동에 책임이 있습니다.',
    'terms_s6_i3': 'Rip It은 사용자 생성 콘텐츠에 대해 책임을 지지 않습니다.',
    'terms_s6_i4': '약관을 위반하거나 안전하지 않은 콘텐츠를 제거할 수 있습니다.',
    'terms_s7_title': '7. 계정 일시 중지, 리셋 및 종료',
    'terms_s7_i1': '약관 위반 또는 플랫폼 오용 시 계정이 일시 중지, 리셋 또는 삭제될 수 있습니다.',
    'terms_s7_i2': '특정 모드는 게임플레이 메커니즘의 일부로 프로필 리셋을 초래할 수 있습니다.',
    'terms_s7_i3': '언제든지 계정을 삭제할 수 있습니다.',
    'terms_s8_title': '8. 면책 조항',
    'terms_s8_i1': 'Rip It은 "있는 그대로" 제공됩니다.',
    'terms_s8_i2': '중단 없는 서비스를 보장하지 않습니다.',
    'terms_s8_i3': '사용자 결과, 프로필 리셋 또는 손실된 인정에 대해 책임을 지지 않습니다.',
    'terms_s8_i4': '참여는 사용자의 재량에 따릅니다.',
    'terms_s9_title': '9. 약관 변경',
    'terms_s9_desc': '우리는 주기적으로 이 약관을 업데이트할 수 있습니다. 주요 변경 사항은 앱 내에서 공지됩니다.',
    'terms_s10_title': '10. 문의',
    'terms_s10_desc': '질문이나 우려 사항이 있으신가요?',
    'terms_s10_email': '이메일: ripit90210@gmail.com'
  },
  ja: {
    // Settings
    'settings': '設定',
    'app': 'アプリ',
    'language': '言語',
    'theme': 'テーマ',
    'personalization': '個人設定',
    'about': '情報',
    'model': 'モデル',
    'terms': '利用規約',
    'privacy': 'プライバシーポリシー',
    'contact': 'お問い合わせ',
    'logout': 'ログアウト',
    'cancel': 'キャンセル',

    // BottomNav
    'nav_home': 'ホーム',
    'nav_search': '検索',
    'nav_create': '作成',
    'nav_notifications': 'アクティビティ',
    'nav_profile': 'プロフィール',

    // Home
    'home_following': 'フォロー中',
    'home_for_you': 'おすすめ',
    'home_live_challenge': 'ライブチャレンジ',
    'home_survivors': '生存者',
    'home_pass': 'パス',
    'home_smash': 'スマッシュ',
    'home_add_enemy': '敵に追加',
    'home_added_enemy': '敵に追加済み',
    'home_share': '共有',
    'home_remix': 'リミックス',
    'home_made_it': '達成',
    'home_pleyed': 'プレイ済み',
    'home_won': '勝利',
    'home_survived': '生存',
    'home_the_end': '終了',
    'home_all_judged': 'すべてのプロフィールが判定されました',
    'home_universal_complete': 'ユニバーサル選択完了',
    'home_winner_complete': '勝者選択完了',
    'home_upload_modal_title': '新規投稿',
    'home_upload_caption_placeholder': 'キャプションを入力...',
    'home_upload_cancel': 'キャンセル',
    'home_upload_post': '投稿',
    'home_eliminated': '排除',
    'home_majority': '過半数',
    'home_choose_variant': 'バリアントを選択',
    'home_set_duration': '時間を設定',
    'home_select_ranking': 'トップランキングを選択',
    'home_select_rule': 'ルールを選択',
    'home_current_choice': '現在の選択',
    'home_community_votes': 'コミュニティ投票',
    'home_selection_locked': 'タイマー終了まで選択はロックされます',
    'home_submitted': '送信済み',
    'home_invalid_ranking': '無効なランキング',
    'home_submit': '送信',
    'home_view_history': 'ラウンド履歴を表示',
    'home_start_new': 'または新しいラウンドを開始',

    // Search
    'search_header_details': 'ラウンド詳細',
    'search_header_results': 'ラウンド結果',
    'search_header_hall': '殿堂入り',
    'search_header_history': 'ラウンド履歴',
    'search_top_survivors': 'トップサバイバー',
    'search_recent_outcomes': '最近の結果',
    'search_clear_history': '履歴を消去',
    'search_start_round': 'ラウンド開始',
    'search_filter_type': 'ラウンドタイプ:',
    'search_all_winners': 'すべての勝者',
    'search_try_again': 'もう一度試す',
    'search_total_termination': '完全排除',
    'search_no_winners': '勝者なし',
    'search_waiting': '勝者を待っています',
    'search_no_active': 'アクティブなラウンドなし',
    'search_waiting_desc': 'ラウンドは現在進行中です。結果をお待ちください。',
    'search_start_desc': 'ホーム画面から新しいラウンドを開始して、生存者を確認してください。',
    'search_join_next': '次のタスクに参加',

    // CreatePost
    'create_new_post': '新規投稿',
    'create_next': '次へ',
    'create_camera': 'カメラ',
    'create_gallery': 'ギャラリー',
    'create_select_preview': 'プレビューするメディアを選択',
    'create_caption_placeholder': 'キャプションを入力...',

    // Notifications
    'notif_activity': 'アクティビティ',
    'notif_follow': 'フォロー',
    'notif_following': 'フォロー中',
    'notif_upvoted': 'があなたの写真をアップボートしました',
    'notif_commented': 'がコメントしました:',
    'notif_started_following': 'があなたをフォローし始めました',

    // Profile
    'profile_posts': '投稿',
    'profile_followers': 'フォロワー',
    'profile_following': 'フォロー中',
    'profile_enemies': '敵',
    'profile_edit': 'プロフィール編集',
    'profile_share': 'プロフィール共有',
    'profile_bio_placeholder': 'プロフィールに自己紹介を追加...',
    'profile_tab_posts': '投稿',
    'profile_tab_enemies': '敵',
    'profile_tab_following': 'フォロー中',
    'profile_no_posts': '投稿はまだありません',
    'profile_no_enemies': 'まだ敵はいません',
    'profile_no_following': 'まだ誰もフォローしていません',
    'profile_marked_enemy': 'マークされた敵',
    'profile_enemies_desc': '敵としてマークしたプロフィールがここに表示されます。',
    'profile_following_desc': '殿堂入りした生存者をフォローして、ここに表示させましょう。',
    'profile_unfollow': 'フォロー解除',
    'profile_legend': 'レジェンド',
    'post_view_comments': 'すべてのコメントを表示',
    'post_write_comment': 'コメントを書く...',
    'post_add_comment': 'コメントを追加',
    'theme_light': 'ライト',
    'theme_system': 'システム',

    // Personalization Modal
    'pers_title': 'Rip It – 個人設定 (Z世代スタイル)',
    'pers_subtitle': 'Rip Itは一律の体験ではありません。',
    'pers_desc': 'プロフィールはあなたの生き残り方とともに進化します。',
    'pers_item1': 'カスタムバイブス＆テーマ',
    'pers_item2': 'モード別ビジュアル (Pley, Pleyはそれぞれ異なる感覚)',
    'pers_item3': 'ステータスを示すダイナミックな称号',
    'pers_item4': '存在感を高めるフォロワーのエネルギー',
    'pers_footer1': 'プレイすればするほど、あなたのアイデンティティは変化します。',
    'pers_footer2': '勝利してもリセットされても — あなたの遺産は語り続けます。',
    'pers_button': '了解',

    // About Modal
    'about_title': 'Rip Itについて',
    'about_tagline': 'スローガン: 生存. リセット. 進化.',
    'about_desc1': 'Rip Itは、大胆なプレイヤーのために設計されたハイリスクなソーシャルサバイバルプラットフォームです。Pley、Pleyなどのモードで競い合い、戦略、回復力、ソーシャルスキルをテストしましょう。',
    'about_pley_title': 'Pley',
    'about_pley_desc': 'ハイリスクな脱落があるサバイバルモード。',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': 'すべてを賭ける勇気がある人のための極限モード。',
    'about_desc2': 'Rip Itは、ソーシャルインタラクション、競争、ダイナミックなパーソナライゼーションを組み合わせ、ユニークでバイラル、そしてアドレナリンを刺激する体験を提供します。',
    'about_footer': '私たちは、あなたのプロフィール、ステータス、そしてサバイバルストーリーを大切にするためにここにいます。勝利し、リセットし、進化しましょう。',
    'about_close': '閉じる',

    // Contact Modal
    'contact_title': 'お問い合わせ',
    'contact_desc': '質問やフィードバック、あるいはあなたのサバイバルストーリーを聞かせてください。',
    'contact_email_label': 'メール',
    'contact_email_or': 'または',
    'contact_footer': 'Pleyのタイマーがカウントダウンするのと同じくらい速く返信します。',
    'contact_close': '閉じる',

    // Model Modal
    'model_title': 'Rip It – アプリモデル',
    'model_concept_title': '1️⃣ コアコンセプト',
    'model_concept_desc': 'Rip Itは、ユーザーの参加、投票、戦略が進行状況、ステータス、遺産を決定するハイリスクなソーシャルサバイバルアプリです。すべての行動には結果が伴い、緊張感とエンゲージメントを生み出します。',
    'model_modes_title': '2️⃣ モード',
    'model_pley_title': 'Pley',
    'model_pley_item1': '生存重視',
    'model_pley_item2': 'ダウン投票のみが重要',
    'model_pley_item3': '時間制限ラウンド（ユーザーが期間を設定）',
    'model_pley_item4': '最後まで残ったユーザーが認知を得る',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': '極限サバイバルモード',
    'model_Pley_item2': 'ダウン投票のみ',
    'model_Pley_item3': '投票により完全リ셋',
    'model_Pley_item4': 'ハイリスクなスリルを求める人のための自発的参加',
    'model_pers_title': '3️⃣ パーソナライゼーション（非IP固有）',
    'model_pers_item1': 'カスタム表示名とプロフィールテーマ',
    'model_pers_item2': 'モードベースの視覚体験',
    'model_pers_item3': 'ダイナミックな称号とステータス',
    'model_pers_item4': 'フォロワー/エンゲージメント指標',
    'model_close': '閉じる',

    // Privacy Modal
    'priv_subtitle': 'あなたのプライバシーは重要です。',
    'priv_effective': '施行日: 2026年2月23日',
    'priv_intro': 'Rip Itを使用することで、以下の情報収集および使用に同意したものとみなされます。',
    'priv_s1_title': '1️⃣ 収集する情報',
    'priv_s1_i1': 'アカウント情報: ユーザー名、メール、プロフィールデータ、基本設定。',
    'priv_s1_i2': 'ゲームプレイ情報: モードへの参加、投票、タイマー、実績。',
    'priv_s1_i3': 'デバイス情報: IPアドレス、デバイスタイプ、OS、使用統計。',
    'priv_s1_i4': 'オプション情報: あなたが共有を選択したソーシャルリンクやコンテンツ。',
    'priv_s2_title': '2️⃣ 情報の使用方法',
    'priv_s2_i1': 'Rip Itの機能およびモードの運営と改善のため。',
    'priv_s2_i2': 'プロフィールテーマやステータスを含む、あなたの体験をパーソナライズするため。',
    'priv_s2_i3': '不正行為、スパム、または安全でない活動を検出するため。',
    'priv_s2_i4': 'アップデート、イベント、またはサポートメッセージを伝えるため。',
    'priv_s3_title': '3️⃣ 情報の共有',
    'priv_s3_i1': '当社は個人情報を販売しません。',
    'priv_s3_i2': '一部のデータ（ユーザー名、ステータス、リーダーボード情報など）は他のユーザーに表示される場合があります。',
    'priv_s3_i3': 'サービスプロバイダーや法的遵守のためにデータを共有する場合があります。',
    'priv_s4_title': '4️⃣ セキュリティ',
    'priv_s4_i1': '業界標準の慣行を使用してデータを保護します。',
    'priv_s4_i2': '完璧なシステムはありません。参加にはリスクが伴います（特に公開機能において）。',
    'priv_s5_title': '5️⃣ あなたの選択',
    'priv_s5_i1': 'いつでもアカウントの更新や削除が可能です。',
    'priv_s5_i2': 'アプリ内でプロフィールや活動の公開範囲を制御できます。',
    'priv_s5_i3': '必須ではない通信をオプトアウトできます。',
    'priv_s6_title': '6️⃣ 子供',
    'priv_s6_i1': 'Rip Itは13歳未満のユーザーを対象としていません。',
    'priv_s6_i2': '未成年のユーザーであると判明した場合、アカウントが削除される場合があります。',
    'priv_s7_title': '7️⃣ プライバシーポリシーの変更',
    'priv_s7_i1': 'アプリの進化に伴い、アップデートが発生する場合があります。',
    'priv_s7_i2': '重要な変更はアプリ内で通知されます。',

    // Terms Modal
    'terms_tagline': 'スローガン: 生存. リセット. 進化.',
    'terms_effective': '施行日: 2026年2月23日',
    'terms_intro': 'Rip Itを使用することで、これらの規約に同意したものとみなされます。同意しない場合は、アプリを使用しないでください。',
    'terms_s1_title': '1. Rip Itとは何か',
    'terms_s1_desc': 'Rip Itは、ユーザーが時間制限のあるチャレンジ、公開投票、競争モードに参加するハイリスクなソーシャルサバイバルアプリです。',
    'terms_s1_list_title': '以下のためのツールを提供します:',
    'terms_s1_i1': 'モードベースのサバイバル体験（Pley, Pley）',
    'terms_s1_i2': '公開投票と認知',
    'terms_s1_i3': 'プロフィールのパーソナライゼーションとステータスの追跡',
    'terms_s1_disclaimer': 'Rip Itは、結果、生存、またはランキングを保証しません。',
    'terms_s2_title': '2. 誰がRip Itを使用できるか',
    'terms_s2_i1': '13歳以上であること',
    'terms_s2_i2': '合法的かつ敬意を持ってアプリを使用すること',
    'terms_s2_i3': '正確な情報を提供すること',
    'terms_s2_i4': '自身のアカウントと活動に責任を持つこと',
    'terms_s3_title': '3. モードと投票ルール',
    'terms_s3_i1': 'Pley, Pleyには、プロフィールのステータスや進行に影響を与える独自のメカニズムがあります。',
    'terms_s3_i2': '投票は、ユーザーの進行、プロフィールのリセット、または一時的な制限に影響を与える場合があります。',
    'terms_s3_i3': 'タイマー、ラウンド、結果は、アプリと参加ユーザーによって決定されます。',
    'terms_s3_i4': 'ユーザーは自身の裁量で参加します。',
    'terms_s4_title': '4. 評判、ステータス、スコア',
    'terms_s4_intro': 'Rip Itを使用することで、以下を理解したものとみなされます:',
    'terms_s4_i1': 'ステータス、称号、認知は、アプリ内でのパフォーマンスとサバイバル履歴を反映します。',
    'terms_s4_i2': '公開投票は、モード内での進行に影響します。',
    'terms_s4_i3': 'Rip Itは、特定のユーザーに有利になるよう結果を操作しません。',
    'terms_s4_i4': '不正行為、操作、またはスパムは、ペナルティや削除につながる場合があります。',
    'terms_s5_title': '5. ユーザーの行動',
    'terms_s5_intro': '以下に同意するものとします:',
    'terms_s5_i1': '他者を嫌がらせ、脅迫、またはいじめないこと',
    'terms_s5_i2': '投票のスパムや操作を行わないこと',
    'terms_s5_i3': '他のユーザーになりすまさないこと',
    'terms_s5_i4': '違法な活動のためにRip Itを使用しないこと',
    'terms_s5_footer': '違反した場合は、停止、制限、またはアカウントの削除が行われる場合があります。',
    'terms_s6_title': '6. コンテンツとユーザーデータ',
    'terms_s6_i1': 'アプリ内で作成したコンテンツの所有権はユーザーに帰属します。',
    'terms_s6_i2': '自身の投稿と行動に責任を持ちます。',
    'terms_s6_i3': 'Rip Itはユーザー生成コンテンツに対して責任を負いません。',
    'terms_s6_i4': '規約に違反する、または安全でないコンテンツを削除する場合があります。',
    'terms_s7_title': '7. アカウントの停止、リセット、終了',
    'terms_s7_i1': '規約違反やプラットフォームの悪用があった場合、アカウントが停止、リセット、または削除される場合があります。',
    'terms_s7_i2': '特定のモードでは、ゲームプレイメカニズムの一部としてプロフィールがリセットされる場合があります。',
    'terms_s7_i3': 'いつでもアカウントを削除できます。',
    'terms_s8_title': '8. 免責事項',
    'terms_s8_i1': 'Rip Itは「現状のまま」提供されます。',
    'terms_s8_i2': '中断のないサービスを保証しません。',
    'terms_s8_i3': 'ユーザーの結果、プロフィールのリセット、または失われた認知に対して責任を負いません。',
    'terms_s8_i4': '参加は自身の裁量によります。',
    'terms_s9_title': '9. 規約の変更',
    'terms_s9_desc': '規約は定期的に更新される場合があります。重要な変更はアプリ内で通知されます。',
    'terms_s10_title': '10. お問い合わせ',
    'terms_s10_desc': '質問や懸念がありますか？',
    'terms_s10_email': 'メール: ripit90210@gmail.com',

    // Extra
    'timer_rule': 'ルール',

    // Personalization Modal

    // About Modal

    // Contact Modal

    // Model Modal

    // Privacy Modal

    // Terms Modal
  },
  fr: {
    // Settings
    'settings': 'Paramètres',
    'app': 'Application',
    'language': 'Langue',
    'theme': 'Thème',
    'personalization': 'Personnalisation',
    'about': 'À propos',
    'model': 'Modèle',
    'terms': 'Conditions d\'utilisation',
    'privacy': 'Politique de confidentialité',
    'contact': 'Contactez-nous',
    'logout': 'Se déconnecter',
    'cancel': 'Annuler',

    // BottomNav
    'nav_home': 'Accueil',
    'nav_search': 'Recherche',
    'nav_create': 'Créer',
    'nav_notifications': 'Activité',
    'nav_profile': 'Profil',

    // Home
    'home_following': 'Abonnements',
    'home_for_you': 'Pour vous',
    'home_live_challenge': 'Défi en direct',
    'home_survivors': 'Survivants',
    'home_pass': 'Passer',
    'home_smash': 'Smash',
    'home_add_enemy': 'Ajouter ennemi',
    'home_added_enemy': 'Ennemi ajouté',
    'home_share': 'Partager',
    'home_remix': 'Remix',
    'home_made_it': 'Réussi',
    'home_pleyed': 'Joué',
    'home_won': 'Gagné',
    'home_survived': 'Survécu',
    'home_the_end': 'La Fin',
    'home_all_judged': 'Tous les profils ont été jugés',
    'home_universal_complete': 'Sélection universelle terminée',
    'home_winner_complete': 'Sélection du gagnant terminée',
    'home_upload_modal_title': 'Nouvelle publication',
    'home_upload_caption_placeholder': 'Écrivez une légende...',
    'home_upload_cancel': 'Annuler',
    'home_upload_post': 'Publier',
    'home_eliminated': 'Éliminé',
    'home_majority': 'Majorité',
    'home_choose_variant': 'Choisir une variante',
    'home_set_duration': 'Définir la durée',
    'home_select_ranking': 'Sélectionner le classement',
    'home_select_rule': 'Sélectionner une règle',
    'home_current_choice': 'Choix actuel',
    'home_community_votes': 'Votes de la communauté',
    'home_selection_locked': 'Sélection verrouillée',
    'home_submitted': 'Soumis',
    'home_invalid_ranking': 'Classement invalide',
    'home_submit': 'Soumettre',
    'home_view_history': 'Voir l\'historique',
    'home_start_new': 'Ou commencer un nouveau tour',

    // Search
    'search_header_details': 'Détails du tour',
    'search_header_results': 'Résultats du tour',
    'search_header_hall': 'Panthéon',
    'search_header_history': 'Historique',
    'search_top_survivors': 'Meilleurs survivants',
    'search_recent_outcomes': 'Résultats récents',
    'search_clear_history': 'Effacer l\'historique',
    'search_start_round': 'Commencer',
    'search_filter_type': 'Type de tour:',
    'search_all_winners': 'Tous les gagnants',
    'search_try_again': 'Réessayer',
    'search_total_termination': 'TERMINATION TOTALE',
    'search_no_winners': 'AUCUN GAGNANT',
    'search_waiting': 'En attente d\'un gagnant',
    'search_no_active': 'Aucun tour actif',
    'search_waiting_desc': 'Le tour est en cours. Restez à l\'écoute pour les résultats.',
    'search_start_desc': 'Commencez un nouveau tour depuis l\'écran d\'accueil pour voir les survivants.',
    'search_join_next': 'Rejoindre la tâche suivante',

    // CreatePost
    'create_new_post': 'Nouvelle publication',
    'create_next': 'Suivant',
    'create_camera': 'Caméra',
    'create_gallery': 'Galerie',
    'create_select_preview': 'Sélectionner un média',
    'create_caption_placeholder': 'Écrivez une légende...',

    // Notifications
    'notif_activity': 'Activité',
    'notif_follow': 'Suivre',
    'notif_following': 'Suivi',
    'notif_upvoted': 'a aimé votre photo',
    'notif_commented': 'a commenté:',
    'notif_started_following': 'a commencé à vous suivre',

    // Profile
    'profile_posts': 'Posts',
    'profile_followers': 'Abonnés',
    'profile_following': 'Abonnements',
    'profile_enemies': 'Ennemis',
    'profile_edit': 'Modifier le profil',
    'profile_share': 'Partager le profil',
    'profile_bio_placeholder': 'Ajoutez une bio à votre profil...',
    'profile_tab_posts': 'Posts',
    'profile_tab_enemies': 'Ennemis',
    'profile_tab_following': 'Abonnements',
    'profile_no_posts': 'Aucun post',
    'profile_no_enemies': 'Aucun ennemi',
    'profile_no_following': 'Aucun abonnement',
    'theme_light': 'Clair',
    'theme_system': 'Système',

    // Personalization Modal
    'pers_title': '🔥 Rip It – Personnalisation (Style Gen Z)',
    'pers_subtitle': 'Rip It n’est pas à taille unique.',
    'pers_desc': 'Votre profil évolue avec votre façon de survivre.',
    'pers_item1': 'Vibes et thèmes personnalisés',
    'pers_item2': 'Visuels par mode (Pley, Pley sont tous différents)',
    'pers_item3': 'Titres dynamiques qui affichent votre statut',
    'pers_item4': 'Énergie des followers qui renforce votre présence',
    'pers_footer1': 'Plus vous jouez, plus votre identité change.',
    'pers_footer2': 'Victoire ou réinitialisation — votre héritage parle toujours.',
    'pers_button': 'Compris',

    // About Modal
    'about_title': 'À propos de Rip It',
    'about_tagline': 'Slogan : Survivre. Réinitialiser. Évoluer.',
    'about_desc1': 'Rip It est une plateforme de survie sociale à enjeux élevés conçue pour les joueurs audacieux. Participez à des modes comme Pley, Pley et Pley pour tester votre stratégie, votre résilience et vos compétences sociales.',
    'about_pley_title': 'Pley',
    'about_pley_desc': 'Mode survie avec élimination à haut risque.',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': 'Mode extrême pour ceux qui osent tout risquer.',
    'about_desc2': 'Rip It combine interaction sociale, compétition et personnalisation dynamique pour créer une expérience unique, virale et pleine d\'adrénaline.',
    'about_footer': 'Nous sommes ici pour que votre profil, votre statut et votre histoire de survie comptent — gagnez, réinitialisez ou évoluez.',
    'about_close': 'Fermer',

    // Contact Modal
    'contact_title': 'Contactez-nous',
    'contact_desc': 'Vous avez des questions, des commentaires ou vous voulez simplement nous raconter votre histoire de survie ? Contactez-nous :',
    'contact_email_label': 'E-mail',
    'contact_email_or': 'ou',
    'contact_footer': 'Nous vous répondrons aussi vite qu\'un minuteur Pley qui décompte.',
    'contact_close': 'Fermer',

    // Model Modal
    'model_title': '🔥 Rip It – Modèle d\'application',
    'model_concept_title': '1️⃣ Concept de base',
    'model_concept_desc': 'Rip It est une application de survie sociale où la participation des utilisateurs, le vote et la stratégie déterminent la progression, le statut et l\'héritage. Chaque action a des conséquences, créant tension et engagement.',
    'model_modes_title': '2️⃣ Modes',
    'model_pley_title': 'Pley',
    'model_pley_item1': 'Axé sur la survie',
    'model_pley_item2': 'Seuls les votes négatifs comptent',
    'model_pley_item3': 'Tours chronométrés (l\'utilisateur définit la durée)',
    'model_pley_item4': 'Les derniers utilisateurs debout gagnent en reconnaissance',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': 'Mode de survie extrême',
    'model_Pley_item2': 'Uniquement des votes négatifs',
    'model_Pley_item3': 'Réinitialisation complète si voté contre',
    'model_Pley_item4': 'Volontaire pour les amateurs de sensations fortes à haut risque',
    'model_pers_title': '3️⃣ Personnalisation (non spécifique à l\'IP)',
    'model_pers_item1': 'Nom d\'affichage et thème de profil personnalisés',
    'model_pers_item2': 'Expérience visuelle basée sur le mode',
    'model_pers_item3': 'Titres et statuts dynamiques',
    'model_pers_item4': 'Métriques d\'abonnés/engagement',
    'model_close': 'Fermer',

    // Privacy Modal
    'priv_subtitle': 'Votre vie privée compte.',
    'priv_effective': 'Date d\'entrée en vigueur : 23/02/26',
    'priv_intro': 'En utilisant Rip It, vous acceptez la collecte et l\'utilisation des informations comme décrit ci-dessous.',
    'priv_s1_title': '1️⃣ Informations que nous collectons',
    'priv_s1_i1': 'Infos de compte : Nom d\'utilisateur, e-mail, données de profil et préférences.',
    'priv_s1_i2': 'Infos de jeu : Participation aux modes, votes, minuteurs, réalisations.',
    'priv_s1_i3': 'Infos sur l\'appareil : Adresse IP, type d\'appareil, système d\'exploitation et statistiques d\'utilisation.',
    'priv_s1_i4': 'Infos optionnelles : Liens sociaux ou contenu que vous choisissez de partager.',
    'priv_s2_title': '2️⃣ Comment nous utilisons vos infos',
    'priv_s2_i1': 'Pour faire fonctionner et améliorer les fonctionnalités et les modes de Rip It.',
    'priv_s2_i2': 'Pour personnaliser votre expérience, y compris les thèmes de profil et le statut.',
    'priv_s2_i3': 'Pour détecter les abus, le spam ou les activités dangereuses.',
    'priv_s2_i4': 'Pour communiquer les mises à jour, les événements ou les messages de support.',
    'priv_s3_title': '3️⃣ Partage de vos infos',
    'priv_s3_i1': 'Nous ne vendons pas vos informations personnelles.',
    'priv_s3_i2': 'Certaines données peuvent être visibles par d\'autres utilisateurs (comme les noms d\'utilisateur, le statut et les informations du classement).',
    'priv_s3_i3': 'Nous pouvons partager des données avec des prestataires de services ou pour la conformité légale.',
    'priv_s4_title': '4️⃣ Sécurité',
    'priv_s4_i1': 'Nous utilisons des pratiques conformes aux normes de l\'industrie pour protéger vos données.',
    'priv_s4_i2': 'Aucun système n\'est parfait — la participation comporte des risques, surtout dans les fonctionnalités publiques.',
    'priv_s5_title': '5️⃣ Vos choix',
    'priv_s5_i1': 'Vous pouvez mettre à jour ou supprimer votre compte à tout moment.',
    'priv_s5_i2': 'Vous pouvez contrôler la visibilité de votre profil et de votre activité dans l\'application.',
    'priv_s5_i3': 'Vous pouvez vous désinscrire des communications non essentielles.',
    'priv_s6_title': '6️⃣ Enfants',
    'priv_s6_i1': 'Rip It n\'est pas destiné aux utilisateurs de moins de 13 ans.',
    'priv_s6_i2': 'Les comptes appartenant à des utilisateurs mineurs peuvent être supprimés.',
    'priv_s7_title': '7️⃣ Modifications de la politique de confidentialité',
    'priv_s7_i1': 'Des mises à jour peuvent survenir à mesure que l\'application évolue.',
    'priv_s7_i2': 'Les modifications majeures seront annoncées dans l\'application.',

    // Terms Modal
    'terms_tagline': 'Slogan : Survivre. Réinitialiser. Évoluer.',
    'terms_effective': 'Date d\'entrée en vigueur : 23/02/26',
    'terms_intro': 'En utilisant Rip It, vous acceptez ces conditions. Si vous n\'êtes pas d\'accord, veuillez ne pas utiliser l\'application.',
    'terms_s1_title': '1. Ce qu\'est Rip It',
    'terms_s1_desc': 'Rip It est une application de survie sociale à enjeux élevés où les utilisateurs participent à des défis chronométrés, des votes publics et des modes compétitifs.',
    'terms_s1_list_title': 'Nous fournissons des outils pour :',
    'terms_s1_i1': 'Expériences de survie basées sur les modes (Pley, Pley)',
    'terms_s1_i2': 'Vote public et reconnaissance',
    'terms_s1_i3': 'Personnalisation du profil et suivi du statut',
    'terms_s1_disclaimer': 'Rip It ne garantit pas les résultats, la survie ou le classement.',
    'terms_s2_title': '2. Qui peut utiliser Rip It',
    'terms_s2_i1': 'Avoir au moins 13 ans',
    'terms_s2_i2': 'Utiliser l\'application légalement et respectueusement',
    'terms_s2_i3': 'Fournir des informations exactes',
    'terms_s2_i4': 'Être responsable de votre compte et de votre activité',
    'terms_s3_title': '3. Modes et règles de vote',
    'terms_s3_i1': 'Pley, Pley et Pley ont des mécanismes uniques affectant le statut et la progression du profil.',
    'terms_s3_i2': 'Les votes peuvent affecter la progression de l\'utilisateur, la réinitialisation du profil ou des restrictions temporaires.',
    'terms_s3_i3': 'Les minuteurs, les tours et les résultats sont déterminés par l\'application et les utilisateurs participants.',
    'terms_s3_i4': 'Les utilisateurs participent à leur propre discrétion.',
    'terms_s4_title': '4. Réputation, statut et scores',
    'terms_s4_intro': 'En utilisant Rip It, vous comprenez que :',
    'terms_s4_i1': 'Le statut, les titres et la reconnaissance reflètent les performances dans l\'application et l\'historique de survie',
    'terms_s4_i2': 'Le vote public affecte la progression dans les modes',
    'terms_s4_i3': 'Rip It ne manipule pas les résultats en faveur d\'un utilisateur',
    'terms_s4_i4': 'Les abus, la manipulation ou le spam peuvent entraîner des pénalités ou une suppression',
    'terms_s5_title': '5. Conduite de l\'utilisateur',
    'terms_s5_intro': 'Vous acceptez de ne pas :',
    'terms_s5_i1': 'Harceler, menacer ou intimider les autres',
    'terms_s5_i2': 'Spammer ou manipuler les votes',
    'terms_s5_i3': 'Usurper l\'identité d\'autres utilisateurs',
    'terms_s5_i4': 'Utiliser Rip It pour des activités illégales',
    'terms_s5_footer': 'Les violations peuvent entraîner une suspension, une restriction ou une suppression de compte.',
    'terms_s6_title': '6. Contenu et données utilisateur',
    'terms_s6_i1': 'Vous conservez la propriété du contenu que vous créez dans l\'application.',
    'terms_s6_i2': 'Vous êtes responsable de vos soumissions et de votre comportement.',
    'terms_s6_i3': 'Rip It n\'est pas responsable du contenu généré par les utilisateurs.',
    'terms_s6_i4': 'Nous pouvons supprimer le contenu qui viole ces conditions ou qui est dangereux.',
    'terms_s7_title': '7. Suspension, réinitialisation et résiliation de compte',
    'terms_s7_i1': 'Les comptes peuvent être suspendus, réinitialisés ou supprimés si les conditions sont violées ou si la plateforme est mal utilisée.',
    'terms_s7_i2': 'Certains modes peuvent entraîner des réinitialisations de profil dans le cadre des mécanismes de jeu.',
    'terms_s7_i3': 'Vous pouvez supprimer votre compte à tout moment.',
    'terms_s8_title': '8. Avis de non-responsabilité',
    'terms_s8_i1': 'Rip It est fourni "en l\'état".',
    'terms_s8_i2': 'Nous ne garantissons pas un service ininterrompu.',
    'terms_s8_i3': 'Nous ne sommes pas responsables des résultats des utilisateurs, des réinitialisations de profil ou de la perte de reconnaissance.',
    'terms_s8_i4': 'La participation est à votre propre discrétion.',
    'terms_s9_title': '9. Modifications de ces conditions',
    'terms_s9_desc': 'Nous pouvons mettre à jour ces conditions périodiquement. Les modifications importantes seront communiquées dans l\'application.',
    'terms_s10_title': '10. Contact',
    'terms_s10_desc': 'Questions ou préoccupations ?',
    'terms_s10_email': 'E-mail : ripit90210@gmail.com'
  },
  hi: {
    // Settings
    'settings': 'सेटिंग्स',
    'app': 'ऐप',
    'language': 'भाषा',
    'theme': 'थीम',
    'personalization': 'निजीकरण',
    'about': 'के बारे में',
    'model': 'मॉडल',
    'terms': 'सेवा की शर्तें',
    'privacy': 'गोपनीयता नीति',
    'contact': 'संपर्क करें',
    'logout': 'लॉग आउट',
    'cancel': 'रद्द करें',

    // BottomNav
    'nav_home': 'होम',
    'nav_search': 'imemo0',
    'nav_create': 'बनाएं',
    'nav_notifications': 'गतिविधि',
    'nav_profile': 'प्रोफ़ाइल',

    // Home
    'home_following': 'फॉलो कर रहे हैं',
    'home_for_you': 'आपके लिए',
    'home_live_challenge': 'लाइव चुनौती',
    'home_survivors': 'जीवित बचे लोग',
    'home_pass': 'पास',
    'home_smash': 'स्मैश',
    'home_add_enemy': 'दुश्मन जोड़ें',
    'home_added_enemy': 'दुश्मन जोड़ा गया',
    'home_share': 'साझा करें',
    'home_remix': 'रीमिक्स',
    'home_made_it': 'बना दिया',
    'home_pleyed': 'खेला',
    'home_won': 'जीता',
    'home_survived': 'जीवित बचा',
    'home_the_end': 'समाप्त',
    'home_all_judged': 'सभी प्रोफाइल का न्याय किया गया है',
    'home_universal_complete': 'सार्वभौमिक चयन पूर्ण',
    'home_winner_complete': 'विजेता चयन पूर्ण',
    'home_upload_modal_title': 'नई पोस्ट',
    'home_upload_caption_placeholder': 'कैप्शन लिखें...',
    'home_upload_cancel': 'रद्द करें',
    'home_upload_post': 'पोस्ट करें',
    'home_eliminated': 'बाहर किया गया',
    'home_majority': 'बहुमत',
    'home_choose_variant': 'वेरिएंट चुनें',
    'home_set_duration': 'अवधि सेट करें',
    'home_select_ranking': 'शीर्ष रैंकिंग चुनें',
    'home_select_rule': 'नियम चुनें',
    'home_current_choice': 'वर्तमान विकल्प',
    'home_community_votes': 'समुदाय वोट',
    'home_selection_locked': 'टाइमर समाप्त होने तक चयन लॉक है',
    'home_submitted': 'सबमिट किया गया',
    'home_invalid_ranking': 'अमान्य रैंकिंग',
    'home_submit': 'सबमिट करें',
    'home_view_history': 'राउंड इतिहास देखें',
    'home_start_new': 'या नया राउंड शुरू करें',

    // Search
    'search_header_details': 'राउंड विवरण',
    'search_header_results': 'राउंड परिणाम',
    'search_header_hall': 'हॉल ऑफ फेम',
    'search_header_history': 'राउंड इतिहास',
    'search_top_survivors': 'शीर्ष उत्तरजीवी',
    'search_recent_outcomes': 'हाल के परिणाम',
    'search_clear_history': 'इतिहास साफ़ करें',
    'search_start_round': 'राउंड शुरू करें',
    'search_filter_type': 'राउंड प्रकार:',
    'search_all_winners': 'सभी विजेता',
    'search_try_again': 'पुनः प्रयास करें',
    'search_total_termination': 'पूर्ण समाप्ति',
    'search_no_winners': 'कोई विजेता नहीं मिला',
    'search_waiting': 'विजेता की प्रतीक्षा है',
    'search_no_active': 'कोई सक्रिय राउंड नहीं',
    'search_waiting_desc': 'राउंड अभी चल रहा है। परिणामों के लिए बने रहें।',
    'search_start_desc': 'उत्तरजीवियों को देखने के लिए होम स्क्रीन से एक नया राउंड शुरू करें।',
    'search_join_next': 'अगले कार्य में शामिल हों',

    // CreatePost
    'create_new_post': 'नई पोस्ट',
    'create_next': 'अगला',
    'create_camera': 'कैमरा',
    'create_gallery': 'गैलरी',
    'create_select_preview': 'पूर्वावलोकन के लिए मीडिया चुनें',
    'create_caption_placeholder': 'कैप्शन लिखें...',

    // Notifications
    'notif_activity': 'गतिविधि',
    'notif_follow': 'फॉलो',
    'notif_following': 'फॉलो कर रहे हैं',
    'notif_upvoted': 'ने आपकी फोटो को अपवोट किया',
    'notif_commented': 'ने टिप्पणी की:',
    'notif_started_following': 'ने आपको फॉलो करना शुरू किया',

    // Profile
    'profile_posts': 'पोस्ट',
    'profile_followers': 'फॉलोअर्स',
    'profile_following': 'फॉलो कर रहे हैं',
    'profile_enemies': 'दुश्मन',
    'profile_edit': 'प्रोफ़ाइल संपादित करें',
    'profile_share': 'प्रोफ़ाइल साझा करें',
    'profile_bio_placeholder': 'अपनी प्रोफ़ाइल में बायो जोड़ें...',
    'profile_tab_posts': 'पोस्ट',
    'profile_tab_enemies': 'दुश्मन',
    'profile_tab_following': 'फॉलो कर रहे हैं',
    'profile_no_posts': 'अभी तक कोई पोस्ट नहीं',
    'profile_no_enemies': 'अभी तक कोई दुश्मन नहीं',
    'profile_no_following': 'अभी तक किसी को फॉलो नहीं किया',
    'theme_light': 'लाइट',
    'theme_system': 'सिस्टम',

    // Personalization Modal
    'pers_title': '🔥 Rip It – निजीकरण (Z पीढ़ी शैली)',
    'pers_subtitle': 'Rip It सबके लिए एक जैसा नहीं है।',
    'pers_desc': 'आपकी प्रोफ़ाइल आपके जीवित रहने के तरीके के साथ विकसित होती है।',
    'pers_item1': 'कस्टम वाइब्स और थीम',
    'pers_item2': 'मोड-आधारित दृश्य (Pley, Pley हर एक का अहसास अलग है)',
    'pers_item3': 'गतिशील शीर्षक जो आपकी स्थिति को दर्शाते हैं',
    'pers_item4': 'अनुयायी ऊर्जा जो आपकी उपस्थिति का निर्माण करती है',
    'pers_footer1': 'जितना अधिक आप खेलेंगे, उतनी ही आपकी पहचान बदलेगी।',
    'pers_footer2': 'जीतें या रीसेट करें — आपकी विरासत अभी भी बोलती है।',
    'pers_button': 'समझ गया',

    // About Modal
    'about_title': 'Rip It के बारे में',
    'about_tagline': 'टैगलाइन: जीवित रहें। रीसेट करें। विकसित हों।',
    'about_desc1': 'Rip It साहसी खिलाड़ियों के लिए डिज़ाइन किया गया एक उच्च-दांव वाला सामाजिक अस्तित्व मंच है। अपनी रणनीति, लचीलापन और सामाजिक कौशल का परीक्षण करने के लिए Pley, Pley और Pley जैसे मोड में प्रतिस्पर्धा करें।',
    'about_pley_title': 'Pley',
    'about_pley_desc': 'उच्च जोखिम वाले निष्कासन के साथ उत्तरजीविता मोड।',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': 'उन लोगों के लिए चरम मोड जो सब कुछ जोखिम में डालने की हिम्मत रखते हैं।',
    'about_desc2': 'Rip It एक अनूठा, वायरल और एड्रेनालाईन-पंपिंग अनुभव बनाने के लिए सामाजिक संपर्क, प्रतिस्पर्धा और गतिशील निजीकरण को जोड़ता है।',
    'about_footer': 'हम यहाँ आपकी प्रोफ़ाइल, स्थिति और उत्तरजीविता की कहानी को महत्वपूर्ण बनाने के लिए हैं—जीतें, रीसेट करें या विकसित हों।',
    'about_close': 'बंद करें',

    // Contact Modal
    'contact_title': 'संपर्क करें',
    'contact_desc': 'प्रश्न, प्रतिक्रिया मिली है, या बस हमें अपनी उत्तरजीविता की कहानी बताना चाहते हैं? संपर्क करें:',
    'contact_email_label': 'ईमेल',
    'contact_email_or': 'या',
    'contact_footer': 'हम Pley टाइमर की उलटी गिनती जितनी तेजी से आपसे संपर्क करेंगे।',
    'contact_close': 'बंद करें',

    // Model Modal
    'model_title': '🔥 Rip It – ऐप मॉडल',
    'model_concept_title': '1️⃣ मूल अवधारणा',
    'model_concept_desc': 'Rip It एक उच्च-दांव वाला सामाजिक अस्तित्व ऐप है जहां उपयोगकर्ता की भागीदारी, मतदान और रणनीति प्रगति, स्थिति और विरासत निर्धारित करती है। प्रत्येक क्रिया के परिणाम होते हैं, जो तनाव और जुड़ाव पैदा करते हैं।',
    'model_modes_title': '2️⃣ मोड',
    'model_pley_title': 'Pley',
    'model_pley_item1': 'उत्तरजीविता-केंद्रित',
    'model_pley_item2': 'केवल डाउन वोट मायने रखते हैं',
    'model_pley_item3': 'समयबद्ध राउंड (उपयोगकर्ता अवधि निर्धारित करता है)',
    'model_pley_item4': 'अंतिम खड़े उपयोगकर्ताओं को पहचान मिलती है',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': 'चरम उत्तरजीविता मोड',
    'model_Pley_item2': 'केवल डाउन वोट',
    'model_Pley_item3': 'डाउन वोट होने पर पूर्ण रीसेट',
    'model_Pley_item4': 'उच्च जोखिम वाले रोमांच चाहने वालों के लिए स्वैच्छिक',
    'model_pers_title': '3️⃣ निजीकरण (गैर-IP विशिष्ट)',
    'model_pers_item1': 'कस्टम डिस्प्ले नाम और प्रोफ़ाइल थीम',
    'model_pers_item2': 'मोड-आधारित दृश्य अनुभव',
    'model_pers_item3': 'गतिशील शीर्षक और स्थिति',
    'model_pers_item4': 'अनुयायी/जुड़ाव मेट्रिक्स',
    'model_close': 'बंद करें',

    // Privacy Modal
    'priv_subtitle': 'आपकी गोपनीयता मायने रखती है।',
    'priv_effective': 'प्रभावी तिथि: 23/02/26',
    'priv_intro': 'Rip It का उपयोग करके, आप नीचे बताए अनुसार जानकारी के संग्रह और उपयोग से सहमत हैं।',
    'priv_s1_title': '1️⃣ जानकारी जो हम एकत्र करते हैं',
    'priv_s1_i1': 'खाता जानकारी: उपयोगकर्ता नाम, ईमेल, प्रोफ़ाइल डेटा और प्राथमिकताएं।',
    'priv_s1_i2': 'गेमप्ले जानकारी: मोड भागीदारी, वोट, टाइमर, उपलब्धियां।',
    'priv_s1_i3': 'डिवाइस जानकारी: आईपी पता, डिवाइस प्रकार, ओएस और उपयोग के आंकड़े।',
    'priv_s1_i4': 'वैकल्पिक जानकारी: सामाजिक लिंक या सामग्री जिसे आप साझा करना चुनते हैं।',
    'priv_s2_title': '2️⃣ हम आपकी जानकारी का उपयोग कैसे करते हैं',
    'priv_s2_i1': 'Rip It की सुविधाओं और मोड को चलाने$ और बेहतर बनाने के लिए।',
    'priv_s2_i2': 'प्रोफ़ाइल थीम और स्थिति सहित आपके अनुभव को निजीकृत करने के लिए।',
    'priv_s2_i3': 'दुरुपयोग, स्पैम या असुरक्षित गतिविधि का पता लगाने के लिए।',
    'priv_s2_i4': 'अपडेट, ईवेंट या समर्थन संदेशों को संप्रेषित करने के लिए।',
    'priv_s3_title': '3️⃣ आपकी जानकारी साझा करना',
    'priv_s3_i1': 'हम आपकी व्यक्तिगत जानकारी नहीं बेचते हैं।',
    'priv_s3_i2': 'कुछ डेटा अन्य उपयोगकर्ताओं को दिखाई दे सकता है (जैसे उपयोगकर्ता नाम, स्थिति और लीडरबोर्ड जानकारी)।',
    'priv_s3_i3': 'हम सेवा प्रदाताओं के साथ या कानूनी अनुपालन के लिए डेटा साझा कर सकते हैं।',
    'priv_s4_title': '4️⃣ सुरक्षा',
    'priv_s4_i1': 'हम आपके डेटा की सुरक्षा के लिए उद्योग-मानक प्रथाओं का उपयोग करते हैं।',
    'priv_s4_i2': 'कोई भी प्रणाली पूर्ण नहीं है—भागीदारी में जोखिम होता है, विशेष रूप से सार्वजनिक सुविधाओं में।',
    'priv_s5_title': '5️⃣ आपकी पसंद',
    'priv_s5_i1': 'आप किसी भी समय अपना खाता अपडेट या हटा सकते हैं।',
    'priv_s5_i2': 'आप ऐप में अपनी प्रोफ़ाइल और गतिविधि की दृश्यता को नियंत्रित कर सकते हैं।',
    'priv_s5_i3': 'आप गैर-जरूरी संचारों से बाहर निकल सकते हैं।',
    'priv_s6_title': '6️⃣ बच्चे',
    'priv_s6_i1': 'Rip It 13 वर्ष से कम उम्र के उपयोगकर्ताओं के लिए अभिप्रेत नहीं है।',
    'priv_s6_i2': 'कम उम्र के उपयोगकर्ताओं के खाते हटाए जा सकते हैं।',
    'priv_s7_title': '7️⃣ गोपनीयता नीति में परिवर्तन',
    'priv_s7_i1': 'ऐप विकसित होने पर अपडेट हो सकते हैं।',
    'priv_s7_i2': 'प्रमुख परिवर्तनों की घोषणा ऐप में की जाएगी।',

    // Terms Modal
    'terms_tagline': 'टैगलाइन: जीवित रहें। रीसेट करें। विकसित हों।',
    'terms_effective': 'प्रभावी तिथि: 23/02/26',
    'terms_intro': 'Rip It का उपयोग करके, आप इन शर्तों से सहमत होते हैं। यदि आप सहमत नहीं हैं, तो कृपया ऐप का उपयोग न करें।',
    'terms_s1_title': '1. Rip It क्या है',
    'terms_s1_desc': 'Rip It एक उच्च-दांव वाला सामाजिक अस्तित्व ऐप है जहां उपयोगकर्ता समयबद्ध चुनौतियों, सार्वजनिक मतदान और प्रतिस्पर्धी मोड में भाग लेते हैं।',
    'terms_s1_list_title': 'हम इनके लिए उपकरण प्रदान करते हैं:',
    'terms_s1_i1': 'मोड-आधारित उत्तरजीविता अनुभव (Pley, Pley)',
    'terms_s1_i2': 'सार्वजनिक मतदान और मान्यता',
    'terms_s1_i3': 'प्रोफ़ाइल निजीकरण और स्थिति ट्रैकिंग',
    'terms_s1_disclaimer': 'Rip It परिणामों, उत्तरजीविता या रैंकिंग की गारंटी नहीं देता है।',
    'terms_s2_title': '2. Rip It का उपयोग कौन कर सकता है',
    'terms_s2_i1': 'कम से कम 13 वर्ष का होना चाहिए',
    'terms_s2_i2': 'ऐप का कानूनी और सम्मानपूर्वक उपयोग करें',
    'terms_s2_i3': 'सटीक जानकारी प्रदान करें',
    'terms_s2_i4': 'अपने खाते और गतिविधि के लिए जिम्मेदार बनें',
    'terms_s3_title': '3. मोड और वोटिंग नियम',
    'terms_s3_i1': 'Pley, Pley और Pley में प्रोफ़ाइल स्थिति और प्रगति को प्रभावित करने वाली अनूठी विशेषताएं हैं।',
    'terms_s3_i2': 'वोट उपयोगकर्ता की प्रगति, प्रोफ़ाइल रीसेट या अस्थायी प्रतिबंधों को प्रभावित कर सकते हैं।',
    'terms_s3_i3': 'टाइमर, राउंड और परिणाम ऐप और भाग लेने वाले उपयोगकर्ताओं द्वारा निर्धारित किए जाते हैं।',
    'terms_s3_i4': 'उपयोगकर्ता अपने विवेक से भाग लेते हैं।',
    'terms_s4_title': '4. प्रतिष्ठा, स्थिति और स्कोर',
    'terms_s4_intro': 'Rip It का उपयोग करके, आप समझते हैं कि:',
    'terms_s4_i1': 'स्थिति, शीर्षक और मान्यता ऐप के भीतर प्रदर्शन और उत्तरजीविता इतिहास को दर्शाती है',
    'terms_s4_i2': 'सार्वजनिक मतदान मोड के भीतर प्रगति को प्रभावित करता है',
    'terms_s4_i3': 'Rip It किसी भी उपयोगकर्ता के पक्ष में परिणामों में हेरफेर नहीं करता है',
    'terms_s4_i4': 'दुरुपयोग, हेरफेर या स्पैम के परिणामस्वरूप दंड या निष्कासन हो सकता है',
    'terms_s5_title': '5. उपयोगकर्ता आचरण',
    'terms_s5_intro': 'आप सहमत हैं कि नहीं करेंगे:',
    'terms_s5_i1': 'दूसरों को परेशान करना, धमकाना या डराना',
    'terms_s5_i2': 'स्पैम करना या वोटों में हेरफेर करना',
    'terms_s5_i3': 'दूसरे उपयोगकर्ताओं का रूप धारण करना',
    'terms_s5_i4': 'अवैध गतिविधि के लिए Rip It का उपयोग करना',
    'terms_s5_footer': 'उल्लंघन के परिणामस्वरूप खाता निलंबن, प्रतिबंध या निष्कासन हो सकता है।',
    'terms_s6_title': '6. सामग्री और उपयोगकर्ता डेटा',
    'terms_s6_i1': 'आप ऐप में बनाई गई सामग्री का स्वामित्व बनाए रखते हैं।',
    'terms_s6_i2': 'आप अपनी प्रस्तुतियों और व्यवहार के लिए जिम्मेदार हैं।',
    'terms_s6_i3': 'Rip It उपयोगकर्ता द्वारा उत्पन्न सामग्री के लिए जिम्मेदार नहीं है।',
    'terms_s6_i4': 'हम उन सामग्रियों को हटा सकते हैं जो इन शर्तों का उल्लंघन करती हैं या असुरक्षित हैं।',
    'terms_s7_title': '7. खाता निलंबن, रीसेट और समाप्ति',
    'terms_s7_i1': 'शर्तों का उल्लंघन होने या प्लेटफॉर्म का दुरुपयोग होने पर खाते निलंबित, रीसेट या हटाए जा सकते हैं।',
    'terms_s7_i2': 'कुछ मोड गेमप्ले सुविधाओं के हिस्से के रूप में प्रोफ़ाइल रीसेट का परिणाम हो सकते हैं।',
    'terms_s7_i3': 'आप किसी भी समय अपना खाता हटा सकते हैं।',
    'terms_s8_title': '8. अस्वीकरण',
    'terms_s8_i1': 'Rip It "जैसा है" वैसा ही प्रदान किया जाता है।',
    'terms_s8_i2': 'हम निर्बाध सेवा की गारंटी नहीं देते हैं।',
    'terms_s8_i3': 'हम उपयोगकर्ता परिणामों, प्रोफ़ाइल रीसेट या मान्यता के नुकसान के लिए जिम्मेदार नहीं हैं।',
    'terms_s8_i4': 'भागीदारी आपके अपने विवेक पर है।',
    'terms_s9_title': '9. इन शर्तों में बदलाव',
    'terms_s9_desc': 'हम समय-समय पर इन शर्तों को अपडेट कर सकते हैं। महत्वपूर्ण बदलावों की सूचना ऐप में दी जाएगी।',
    'terms_s10_title': '10. संपर्क',
    'terms_s10_desc': 'प्रश्न या चिंताएं?',
    'terms_s10_email': 'ईमेल: ripit90210@gmail.com'
  },
  zh: {
    // Settings
    'settings': '设置',
    'app': '应用',
    'language': '语言',
    'theme': '主题',
    'personalization': '个性化',
    'about': '关于',
    'model': '模型',
    'terms': '服务条款',
    'privacy': '隐私政策',
    'contact': '联系我们',
    'logout': '退出登录',
    'cancel': '取消',

    // BottomNav
    'nav_home': '首页',
    'nav_search': '搜索',
    'nav_create': '发布',
    'nav_notifications': '动态',
    'nav_profile': '我的',

    // Home
    'home_following': '关注',
    'home_for_you': '推荐',
    'home_live_challenge': '实时挑战',
    'home_survivors': '幸存者',
    'home_pass': '跳过',
    'home_smash': '喜欢',
    'home_add_enemy': '加为敌人',
    'home_added_enemy': '已加敌人',
    'home_share': '分享',
    'home_remix': '混剪',
    'home_made_it': '达成',
    'home_pleyed': '参与',
    'home_won': '获胜',
    'home_survived': '幸存',
    'home_the_end': '结束',
    'home_all_judged': '所有档案已评审',
    'home_universal_complete': '全员选择完成',
    'home_winner_complete': '获胜者选择完成',
    'home_upload_modal_title': '发布新帖',
    'home_upload_caption_placeholder': '写点什么...',
    'home_upload_cancel': '取消',
    'home_upload_post': '发布',
    'home_eliminated': '已淘汰',
    'home_majority': '多数',
    'home_choose_variant': '选择变体',
    'home_set_duration': '设置时长',
    'home_select_ranking': '选择排名',
    'home_select_rule': '选择规则',
    'home_current_choice': '当前选择',
    'home_community_votes': '社区投票',
    'home_selection_locked': '计时结束前选择锁定',
    'home_submitted': '已提交',
    'home_invalid_ranking': '无效排名',
    'home_submit': '提交',
    'home_view_history': '查看回合历史',
    'home_start_new': '或开始新回合',

    // Search
    'search_header_details': '回合详情',
    'search_header_results': '回合结果',
    'search_header_hall': '名人堂',
    'search_header_history': '回合历史',
    'search_top_survivors': '顶级幸存者',
    'search_recent_outcomes': '近期结果',
    'search_clear_history': '清除历史',
    'search_start_round': '开始回合',
    'search_filter_type': '回合类型:',
    'search_all_winners': '所有获胜者',
    'search_try_again': '重试',
    'search_total_termination': '全员淘汰',
    'search_no_winners': '无获胜者',
    'search_waiting': '等待获胜者',
    'search_no_active': '无活跃回合',
    'search_waiting_desc': '回合正在进行中，请留意结果。',
    'search_start_desc': '从主页开始新回合以查看幸存者。',
    'search_join_next': '参加下一个任务',

    // CreatePost
    'create_new_post': '发布新帖',
    'create_next': '下一步',
    'create_camera': '相机',
    'create_gallery': '相册',
    'create_select_preview': '选择预览媒体',
    'create_caption_placeholder': '写点什么...',

    // Notifications
    'notif_activity': '动态',
    'notif_follow': '关注',
    'notif_following': '已关注',
    'notif_upvoted': '赞了你的照片',
    'notif_commented': '评论了:',
    'notif_started_following': '开始关注你',

    // Profile
    'profile_posts': '帖子',
    'profile_followers': '粉丝',
    'profile_following': '关注',
    'profile_enemies': '敌人',
    'profile_edit': '编辑资料',
    'profile_share': '分享资料',
    'profile_bio_placeholder': '添加个人简介...',
    'profile_tab_posts': '帖子',
    'profile_tab_enemies': '敌人',
    'profile_tab_following': '关注',
    'profile_no_posts': '暂无帖子',
    'profile_no_enemies': '暂无敌人',
    'profile_no_following': '暂无关注',
    'theme_light': '浅色',
    'theme_system': '系统',

    // Personalization Modal
    'pers_title': '🔥 Rip It – 个性化 (Z世代风格)',
    'pers_subtitle': 'Rip It 不是千篇一律的。',
    'pers_desc': '你的个人资料随你的生存方式而进化。',
    'pers_item1': '自定义氛围与主题',
    'pers_item2': '基于模式的视觉效果 (Pley, Pley 各不相同)',
    'pers_item3': '展示你地位的动态称号',
    'pers_item4': '增强你存在感的粉丝能量',
    'pers_footer1': '你玩得越多，你的身份就越会转变。',
    'pers_footer2': '无论是获胜还是重置 —— 你的传奇依然存在。',
    'pers_button': '知道了',

    // About Modal
    'about_title': '关于 Rip It',
    'about_tagline': '口号：生存。重置。进化。',
    'about_desc1': 'Rip It 是一个为大胆玩家设计的高风险社交生存平台。在 Pley、Pley 和 Pley 等模式中竞争，测试你的策略、韧性和社交技巧。',
    'about_pley_title': 'Pley',
    'about_pley_desc': '具有高风险淘汰机制的生存模式。',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': '为敢于冒险的人准备的极端模式。',
    'about_desc2': 'Rip It 结合了社交互动、竞争和动态个性化，创造出独特、病毒式且令人肾上腺素飙升的体验。',
    'about_footer': '我们在这里是为了让你的资料、地位和生存故事变得重要——获胜、重置或进化。',
    'about_close': '关闭',

    // Contact Modal
    'contact_title': '联系我们',
    'contact_desc': '有疑问、反馈，或者只是想告诉我们你的生存故事？请联系我们：',
    'contact_email_label': '电子邮件',
    'contact_email_or': '或',
    'contact_footer': '我们会像 Pley 计时器倒计时一样快地回复你。',
    'contact_close': '关闭',

    // Model Modal
    'model_title': '🔥 Rip It – 应用模型',
    'model_concept_title': '1️⃣ 核心概念',
    'model_concept_desc': 'Rip It 是一款高风险社交生存应用，用户的参与、投票和策略决定了进度、地位和遗产。每一个行动都有后果，创造出紧张感和参与感。',
    'model_modes_title': '2️⃣ 模式',
    'model_pley_title': 'Pley',
    'model_pley_item1': '专注于生存',
    'model_pley_item2': '只有反对票重要',
    'model_pley_item3': '计时回合（用户设置时长）',
    'model_pley_item4': '最后站着的用户获得认可',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': '极端生存模式',
    'model_Pley_item2': '只有反对票',
    'model_Pley_item3': '如果被投反对票则完全重置',
    'model_Pley_item4': '自愿参加的高风险寻求刺激者',
    'model_pers_title': '3️⃣ 个性化（非特定 IP）',
    'model_pers_item1': '自定义显示名称和个人资料主题',
    'model_pers_item2': '基于模式的视觉体验',
    'model_pers_item3': '动态称号和状态',
    'model_pers_item4': '关注者/参与度指标',
    'model_close': '关闭',

    // Privacy Modal
    'priv_subtitle': '你的隐私很重要。',
    'priv_effective': '生效日期：26/02/23',
    'priv_intro': '使用 Rip It，即表示你同意按照下文所述收集和使用信息。',
    'priv_s1_title': '1️⃣ 我们收集的信息',
    'priv_s1_i1': '账户信息：用户名、电子邮件、个人资料数据和偏好。',
    'priv_s1_i2': '游戏信息：模式参与、投票、计时器、成就。',
    'priv_s1_i3': '设备信息：IP 地址、设备类型、操作系统和使用统计。',
    'priv_s1_i4': '可选信息：你选择分享的社交链接或内容。',
    'priv_s2_title': '2️⃣ 我们如何使用你的信息',
    'priv_s2_i1': '运行和改进 Rip It 的功能和模式。',
    'priv_s2_i2': '个性化你的体验，包括资料主题和状态。',
    'priv_s2_i3': '检测滥用、垃圾邮件或不安全活动。',
    'priv_s2_i4': '沟通更新、活动或支持消息。',
    'priv_s3_title': '3️⃣ 分享你的信息',
    'priv_s3_i1': '我们不会出售你的个人信息。',
    'priv_s3_i2': '某些数据可能对其他用户可见（如用户名、状态和排行榜信息）。',
    'priv_s3_i3': '我们可能会与服务提供商共享数据，或为了符合法律规定。',
    'priv_s4_title': '4️⃣ 安全',
    'priv_s4_i1': '我们使用行业标准做法来保护你的数据。',
    'priv_s4_i2': '没有系统是完美的——参与带有风险，尤其是在公开功能中。',
    'priv_s5_title': '5️⃣ 你的选择',
    'priv_s5_i1': '你可以随时更新或删除你的账户。',
    'priv_s5_i2': '你可以控制你的资料和活动在应用中的可见性。',
    'priv_s5_i3': '你可以选择退出非必要的沟通。',
    'priv_s6_title': '6️⃣ 隐私政策的变更',
    'priv_s6_i1': '随着应用的发展，可能会进行更新。',
    'priv_s6_i2': '重大变更将在应用内公布。',

    // Terms Modal
    'terms_tagline': '口号：生存。重置。进化。',
    'terms_effective': '生效日期：26/02/23',
    'terms_intro': '使用 Rip It，即表示你同意这些条款。如果你不同意，请不要使用该应用。',
    'terms_s1_title': '1. 什么是 Rip It',
    'terms_s1_desc': 'Rip It 是一款高风险社交生存应用，用户参与计时挑战、公开投票和竞争模式。',
    'terms_s1_list_title': '我们提供的工具用于：',
    'terms_s1_i1': '基于模式的生存体验（Pley、Pley）',
    'terms_s1_i2': '公开投票和认可',
    'terms_s1_i3': '个人资料个性化和状态跟踪',
    'terms_s1_disclaimer': 'Rip It 不保证结果、生存或排名。',
    'terms_s2_title': '2. 谁可以使用 Rip It',
    'terms_s2_i1': '年满 13 岁',
    'terms_s2_i2': '合法且尊重地使用应用',
    'terms_s2_i3': '提供准确的信息',
    'terms_s2_i4': '对你的账户和活动负责',
    'terms_s3_title': '3. 模式和投票规则',
    'terms_s3_i1': 'Pley、Pley 和 Pley 具有影响资料状态和进度的独特机制。',
    'terms_s3_i2': '投票可能会影响用户进度、资料重置或临时限制。',
    'terms_s3_i3': '计时器、回合和结果由应用和参与用户决定。',
    'terms_s4_title': '4. 声誉、地位和得分',
    'terms_s4_intro': '使用 Rip It，即表示你理解：',
    'terms_s4_i1': '状态、称号和认可反映了应用内的表现和生存历史',
    'terms_s4_i2': '公开投票影响模式内的进度',
    'terms_s4_i3': 'Rip It 不会操纵结果以偏袒任何用户',
    'terms_s4_i4': '滥用、操纵或垃圾邮件可能会导致处罚或移除',
    'terms_s5_title': '5. 用户行为',
    'terms_s5_intro': '你同意不：',
    'terms_s5_i1': '骚扰、威胁或欺凌他人',
    'terms_s5_i2': '发送垃圾邮件或操纵投票',
    'terms_s5_i3': '冒充其他用户',
    'terms_s5_i4': '将 Rip It 用于非法活动',
    'terms_s5_footer': '违规行为可能会导致账户停用、限制或移除。',
    'terms_s6_title': '6. 内容和用户数据',
    'terms_s6_i1': '你保留在应用中创建的内容的所有权。',
    'terms_s6_i2': '你对你的提交内容和行为负责。',
    'terms_s6_i3': 'Rip It 对用户生成的内容不承担责任。',
    'terms_s6_i4': '我们可能会移除违反这些条款或不安全的内容。',
    'terms_s7_title': '7. 账户停用、重置和终止',
    'terms_s7_i1': '如果违反条款或滥用平台，账户可能会被停用、重置或删除。',
    'terms_s7_i2': '某些模式可能会导致资料重置，作为游戏机制的一部分。',
    'terms_s7_i3': '你可以随时删除你的账户。',
    'terms_s8_title': '8. 免责声明',
    'terms_s8_i1': 'Rip It 按“原样”提供。',
    'terms_s8_i2': '我们不保证服务不中断。',
    'terms_s8_i3': '我们对用户结果、资料重置或失去认可不承担责任。',
    'terms_s8_i4': '参与由你自行决定。',
    'terms_s9_title': '9. 这些条款的变更',
    'terms_s9_desc': '我们可能会定期更新这些条款。重大变更将在应用内传达。',
    'terms_s10_title': '10. 联系方式',
    'terms_s10_desc': '有疑问或担忧吗？',
    'terms_s10_email': '电子邮件：ripit90210@gmail.com'
  },
  de: {
    // Settings
    'settings': 'Einstellungen',
    'app': 'App',
    'language': 'Sprache',
    'theme': 'Thema',
    'personalization': 'Personalisierung',
    'about': 'Über',
    'model': 'Modell',
    'terms': 'Nutzungsbedingungen',
    'privacy': 'Datenschutzrichtlinie',
    'contact': 'Kontakt',
    'logout': 'Abmelden',
    'cancel': 'Abbrechen',

    // BottomNav
    'nav_home': 'Startseite',
    'nav_search': 'imemo0',
    'nav_create': 'Erstellen',
    'nav_notifications': 'Aktivität',
    'nav_profile': 'Profil',

    // Home
    'home_following': 'Folge ich',
    'home_for_you': 'Für dich',
    'home_live_challenge': 'Live-Challenge',
    'home_survivors': 'Überlebende',
    'home_pass': 'Passen',
    'home_smash': 'Smash',
    'home_add_enemy': 'Als Feind hinzufügen',
    'home_added_enemy': 'Feind hinzugefügt',
    'home_share': 'Teilen',
    'home_remix': 'Remix',
    'home_made_it': 'Geschafft',
    'home_pleyed': 'Gespielt',
    'home_won': 'Gewonnen',
    'home_survived': 'Überlebt',
    'home_the_end': 'Das Ende',
    'home_all_judged': 'Alle Profile wurden bewertet',
    'home_universal_complete': 'Universelle Auswahl abgeschlossen',
    'home_winner_complete': 'Gewinnerauswahl abgeschlossen',
    'home_upload_modal_title': 'Neuer Beitrag',
    'home_upload_caption_placeholder': 'Schreibe eine Bildunterschrift...',
    'home_upload_cancel': 'Abbrechen',
    'home_upload_post': 'Posten',
    'home_eliminated': 'Eliminiert',
    'home_majority': 'Mehrheit',
    'home_choose_variant': 'Variante wählen',
    'home_set_duration': 'Dauer festlegen',
    'home_select_ranking': 'Top-Ranking wählen',
    'home_select_rule': 'Regel wählen',
    'home_current_choice': 'Aktuelle Wahl',
    'home_community_votes': 'Community-Stimmen',
    'home_selection_locked': 'Auswahl gesperrt bis Timer endet',
    'home_submitted': 'Eingereicht',
    'home_invalid_ranking': 'Ungültiges Ranking',
    'home_submit': 'Einreichen',
    'home_view_history': 'Rundenverlauf ansehen',
    'home_start_new': 'Oder neue Runde starten',

    // Search
    'search_header_details': 'Rundendetails',
    'search_header_results': 'Rundenergebnisse',
    'search_header_hall': 'Ruhmeshalle',
    'search_header_history': 'Rundenverlauf',
    'search_top_survivors': 'Top-Überlebende',
    'search_recent_outcomes': 'Aktuelle Ergebnisse',
    'search_clear_history': 'Verlauf löschen',
    'search_start_round': 'Runde starten',
    'search_filter_type': 'Rundentyp:',
    'search_all_winners': 'Alle Gewinner',
    'search_try_again': 'Erneut versuchen',
    'search_total_termination': 'TOTALE TERMINIERUNG',
    'search_no_winners': 'KEINE GEWINNER GEFUNDEN',
    'search_waiting': 'Warte auf Gewinner',
    'search_no_active': 'Keine aktive Runde',
    'search_waiting_desc': 'Die Runde läuft noch. Bleib dran für die Ergebnisse.',
    'search_start_desc': 'Starte eine neue Runde vom Startbildschirm, um Überlebende zu sehen.',
    'search_join_next': 'Nächster Aufgabe beitreten',

    // CreatePost
    'create_new_post': 'Neuer Beitrag',
    'create_next': 'Weiter',
    'create_camera': 'Kamera',
    'create_gallery': 'Galerie',
    'create_select_preview': 'Medien zur Vorschau auswählen',
    'create_caption_placeholder': 'Schreibe eine Bildunterschrift...',

    // Notifications
    'notif_activity': 'Aktivität',
    'notif_follow': 'Folgen',
    'notif_following': 'Folge ich',
    'notif_upvoted': 'hat dein Foto hochgewählt',
    'notif_commented': 'hat kommentiert:',
    'notif_started_following': 'folgt dir jetzt',

    // Profile
    'profile_posts': 'Beiträge',
    'profile_followers': 'Follower',
    'profile_following': 'Folge ich',
    'profile_enemies': 'Feinde',
    'profile_edit': 'Profil bearbeiten',
    'profile_share': 'Profil teilen',
    'profile_bio_placeholder': 'Füge deinem Profil eine Biografie hinzu...',
    'profile_tab_posts': 'Beiträge',
    'profile_tab_enemies': 'Feinde',
    'profile_tab_following': 'Folge ich',
    'profile_no_posts': 'Noch keine Beiträge',
    'profile_no_enemies': 'Noch keine geschworenen Feinde',
    'profile_no_following': 'Du folgst noch niemandem',
    'profile_marked_enemy': 'Als Feind markiert',
    'profile_enemies_desc': 'Profile, die du als Feinde markierst, erscheinen hier.',
    'profile_following_desc': 'Folge Überlebenden aus der Ruhmeshalle, um sie hier zu sehen.',
    'profile_unfollow': 'Entfolgen',
    'profile_legend': 'Legende',
    'post_view_comments': 'Alle Kommentare ansehen',
    'post_write_comment': 'Kommentar schreiben...',
    'post_add_comment': 'Kommentar hinzufügen',
    'timer_rule': 'Regel',
    'theme_light': 'Hell',
    'theme_system': 'System',

    // Personalization Modal
    'pers_title': '🔥 Rip It – Personalisierung (Gen Z Style)',
    'pers_subtitle': 'Rip It ist nicht für alle gleich.',
    'pers_desc': 'Dein Profil entwickelt sich mit der Art und Weise, wie du überlebst.',
    'pers_item1': 'Eigene Vibes & Themen',
    'pers_item2': 'Modus-basierte Visuals (Pley, Pley fühlen sich alle anders an)',
    'pers_item3': 'Dynamische Titel, die deinen Status zeigen',
    'pers_item4': 'Follower-Energie, die deine Präsenz aufbaut',
    'pers_footer1': 'Je mehr du spielst, desto mehr verändert sich deine Identität.',
    'pers_footer2': 'Gewinne oder Reset — dein Vermächis bleibt.',
    'pers_button': 'Verstanden',

    // About Modal
    'about_title': 'Über Rip It',
    'about_tagline': 'Slogan: Überleben. Zurücksetzen. Entwickeln.',
    'about_desc1': 'Rip It ist eine hochriskante soziale Überlebensplattform für mutige Spieler. Tritt in Modi wie Pley, Pley und Pley an, um deine Strategie, Belastbarkeit und sozialen Fähigkeiten zu testen.',
    'about_pley_title': 'Pley',
    'about_pley_desc': 'Überlebensmodus mit hohem Eliminationsrisiko.',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': 'Extremer Modus für diejenigen, die alles riskieren wollen.',
    'about_desc2': 'Rip It kombiniert soziale Interaktion, Wettbewerb und dynamische Personalisierung, um ein einzigartiges, virales und adrenalingeladenes Erlebnis zu schaffen.',
    'about_footer': 'Wir sind hier, um dein Profil, deinen Status und deine Überlebensgeschichte wichtig zu machen – gewinne, setze zurück oder entwickle dich weiter.',
    'about_close': 'Schließen',

    // Contact Modal
    'contact_title': 'Kontakt',
    'contact_desc': 'Hast du Fragen, Feedback oder möchtest uns deine Überlebensgeschichte erzählen? Melde dich bei uns:',
    'contact_email_label': 'E-Mail',
    'contact_email_or': 'oder',
    'contact_footer': 'Wir melden uns so schnell zurück, wie ein Pley-Timer abläuft.',
    'contact_close': 'Schließen',

    // Model Modal
    'model_title': '🔥 Rip It – App-Modell',
    'model_concept_title': '1️⃣ Kernkonzept',
    'model_concept_desc': 'Rip It ist eine soziale Überlebens-App, bei der Nutzerbeteiligung, Voting und Strategie über Fortschritt, Status und Vermächtnis entscheiden. Jede Aktion hat Konsequenzen, was Spannung und Engagement erzeugt.',
    'model_modes_title': '2️⃣ Modi',
    'model_pley_title': 'Pley',
    'model_pley_item1': 'Überlebensorientiert',
    'model_pley_item2': 'Nur Down-Votes zählen',
    'model_pley_item3': 'Zeitgesteuerte Runden (Nutzer legt Dauer fest)',
    'model_pley_item4': 'Die letzten verbleibenden Nutzer erhalten Anerkennung',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': 'Extremer Überlebensmodus',
    'model_Pley_item2': 'Nur Down-Votes',
    'model_Pley_item3': 'Vollständiger Reset bei Down-Vote',
    'model_Pley_item4': 'Freiwillig für Abenteuerlustige mit hohem Risiko',
    'model_pers_title': '3️⃣ Personalisierung (nicht IP-spezifisch)',
    'model_pers_item1': 'Eigener Anzeigename & Profilthema',
    'model_pers_item2': 'Modus-basiertes visuelles Erlebnis',
    'model_pers_item3': 'Dynamische Titel & Status',
    'model_pers_item4': 'Follower-/Engagement-Metriken',
    'model_close': 'Schließen',

    // Privacy Modal
    'priv_subtitle': 'Deine Privatsphäre ist uns wichtig.',
    'priv_effective': 'Gültig ab: 23.02.26',
    'priv_intro': 'Durch die Nutzung von Rip It stimmst du der Erfassung und Nutzung von Informationen wie unten beschrieben zu.',
    'priv_s1_title': '1️⃣ Informationen, die wir sammeln',
    'priv_s1_i1': 'Kontoinformationen: Benutzername, E-Mail, Profildaten und Präferenzen.',
    'priv_s1_i2': 'Gameplay-Informationen: Modus-Teilnahme, Stimmen, Timer, Erfolge.',
    'priv_s1_i3': 'Geräteinformationen: IP-Adresse, Gerätetyp, Betriebssystem und Nutzungsstatistiken.',
    'priv_s1_i4': 'Optionale Informationen: Soziale Links oder Inhalte, die du teilen möchtest.',
    'priv_s2_title': '2️⃣ Wie wir deine Informationen nutzen',
    'priv_s2_i1': 'Um Funktionen und Modi von Rip It bereitzustellen und zu verbessern.',
    'priv_s2_i2': 'Um dein Erlebnis zu personalisieren, einschließlich Profilthemen und Status.',
    'priv_s2_i3': 'Um Missbrauch, Spam oder unsichere Aktivitäten zu erkennen.',
    'priv_s2_i4': 'Um Updates, Ereignisse oder Support-Nachrichten zu kommunizieren.',
    'priv_s3_title': '3️⃣ Weitergabe deiner Informationen',
    'priv_s3_i1': 'Wir verkaufen deine persönlichen Informationen nicht.',
    'priv_s3_i2': 'Einige Daten können für andere Nutzer sichtbar sein (wie Benutzernamen, Status und Bestenlisten-Informationen).',
    'priv_s3_i3': 'Wir können Daten mit Dienstleistern teilen oder zur Einhaltung gesetzlicher Vorschriften.',
    'priv_s4_title': '4️⃣ Sicherheit',
    'priv_s4_i1': 'Wir nutzen branchenübliche Praktiken, um deine Daten zu schützen.',
    'priv_s4_i2': 'Kein System ist perfekt – die Teilnahme birgt Risiken, insbesondere bei öffentlichen Funktionen.',
    'priv_s5_title': '5️⃣ Deine Auswahlmöglichkeiten',
    'priv_s5_i1': 'Du kannst dein Konto jederzeit aktualisieren oder löschen.',
    'priv_s5_i2': 'Du kannst die Sichtbarkeit deines Profils und deiner Aktivitäten in der App steuern.',
    'priv_s5_i3': 'Du kannst dich von nicht wesentlichen Kommunikationen abmelden.',
    'priv_s6_title': '6️⃣ Änderungen der Datenschutzrichtlinie',
    'priv_s6_i1': 'Updates können im Zuge der Weiterentwicklung der App erfolgen.',
    'priv_s6_i2': 'Größere Änderungen werden in der App bekannt gegeben.',

    // Terms Modal
    'terms_tagline': 'Slogan: Überleben. Zurücksetzen. Entwickeln.',
    'terms_effective': 'Gültig ab: 23.02.26',
    'terms_intro': 'Durch die Nutzung von Rip It stimmst du diesen Bedingungen zu. Wenn du nicht einverstanden bist, nutze die App bitte nicht.',
    'terms_s1_title': '1. Was Rip It ist',
    'terms_s1_desc': 'Rip It ist eine hochriskante soziale Überlebens-App, bei der Nutzer an zeitgesteuerten Herausforderungen, öffentlichen Abstimmungen und Wettbewerbsmodi teilnehmen.',
    'terms_s1_list_title': 'Wir bieten Tools für:',
    'terms_s1_i1': 'Modus-basierte Überlebenserlebnisse (Pley, Pley)',
    'terms_s1_i2': 'Öffentliche Abstimmung und Anerkennung',
    'terms_s1_i3': 'Profil-Personalisierung und Status-Tracking',
    'terms_s1_disclaimer': 'Rip It garantiert keine Ergebnisse, kein Überleben oder Ranking.',
    'terms_s2_title': '2. Wer Rip It nutzen kann',
    'terms_s2_i1': 'Mindestens 13 Jahre alt sein',
    'terms_s2_i2': 'Die App legal und respektvoll nutzen',
    'terms_s2_i3': 'Genaue Informationen bereitstellen',
    'terms_s2_i4': 'Verantwortlich für dein Konto und deine Aktivitäten sein',
    'terms_s3_title': '3. Modi & Abstimmungsregeln',
    'terms_s3_i1': 'Pley, Pley und Pley haben einzigartige Mechaniken, die Profilstatus und Fortschritt beeinflussen.',
    'terms_s3_i2': 'Stimmen können den Fortschritt des Nutzers, den Profil-Reset oder temporäre Einschränkungen beeinflussen.',
    'terms_s3_i3': 'Timer, Runden und Ergebnisse werden von der App und den teilnehmenden Nutzern bestimmt.',
    'terms_s3_i4': 'Nutzer nehmen nach eigenem Ermessen teil.',
    'terms_s4_title': '4. Ruf, Status & Scores',
    'terms_s4_intro': 'Durch die Nutzung von Rip It verstehst du:',
    'terms_s4_i1': 'Status, Titel und Anerkennung spiegeln die In-App-Leistung und die Überlebenshistorie wider',
    'terms_s4_i2': 'Öffentliche Abstimmungen beeinflussen den Fortschritt in den Modi',
    'terms_s4_i3': 'Rip It manipuliert keine Ergebnisse zugunsten eines Nutzers',
    'terms_s4_i4': 'Missbrauch, Manipulation oder Spamming können zu Strafen oder Entfernung führen',
    'terms_s5_title': '5. Nutzerverhalten',
    'terms_s5_intro': 'Du stimmst zu, Folgendes nicht zu tun:',
    'terms_s5_i1': 'Andere belästigen, bedrohen oder schikanieren',
    'terms_s5_i2': 'Spammen oder Stimmen manipulieren',
    'terms_s5_i3': 'Andere Nutzer imitieren',
    'terms_s5_i4': 'Rip It für illegale Aktivitäten nutzen',
    'terms_s5_footer': 'Verstöße können zur Sperrung, Einschränkung oder Kontolöschung führen.',
    'terms_s6_title': '6. Inhalte & Nutzerdaten',
    'terms_s6_i1': 'Du behältst das Eigentum an den Inhalten, die du in der App erstellst.',
    'terms_s6_i2': 'Du bist für deine Beiträge und dein Verhalten verantwortlich.',
    'terms_s6_i3': 'Rip It ist nicht für nutzergenerierte Inhalte verantwortlich.',
    'terms_s6_i4': 'Wir können Inhalte entfernen, die gegen diese Bedingungen verstoßen oder unsicher sind.',
    'terms_s7_title': '7. Kontosperrung, Reset & Kündigung',
    'terms_s7_i1': 'Konten können gesperrt, zurückgesetzt oder gelöscht werden, wenn gegen die Bedingungen verstoßen oder die Plattform missbraucht wird.',
    'terms_s7_i2': 'Bestimmte Modi können im Rahmen der Gameplay-Mechanik zu Profil-Resets führen.',
    'terms_s7_i3': 'Du kannst dein Konto jederzeit löschen.',
    'terms_s8_title': '8. Disclaimer',
    'terms_s8_i1': 'Rip It wird "wie besehen" bereitgestellt.',
    'terms_s8_i2': 'Wir garantieren keinen ununterbrochenen Dienst.',
    'terms_s8_i3': 'Wir sind nicht verantwortlich für Nutzerergebnisse, Profil-Resets oder verlorene Anerkennung.',
    'terms_s8_i4': 'Die Teilnahme erfolgt nach eigenem Ermessen.',
    'terms_s9_title': '9. Änderungen dieser Bedingungen',
    'terms_s9_desc': 'Wir können diese Bedingungen regelmäßig aktualisieren. Wesentliche Änderungen werden in der App bekannt gegeben.',
    'terms_s10_title': '10. Kontakt',
    'terms_s10_desc': 'Fragen oder Bedenken?',
    'terms_s10_email': 'E-Mail: ripit90210@gmail.com'
  },
  uk: {
    // Settings
    'settings': 'Налаштування',
    'app': 'Додаток',
    'language': 'Мова',
    'theme': 'Тема',
    'personalization': 'Персоналізація',
    'about': 'Про нас',
    'model': 'Модель',
    'terms': 'Умови використання',
    'privacy': 'Політика конфіденційності',
    'contact': 'Зв\'язатися з нами',
    'logout': 'Вийти',
    'cancel': 'Скасувати',

    // BottomNav
    'nav_home': 'Головна',
    'nav_search': 'imemo0',
    'nav_create': 'Створити',
    'nav_notifications': 'Активність',
    'nav_profile': 'Профіль',

    // Home
    'home_following': 'Підписки',
    'home_for_you': 'Для вас',
    'home_live_challenge': 'Живий виклик',
    'home_survivors': 'Ті, що вижили',
    'home_pass': 'Пас',
    'home_smash': 'Смаш',
    'home_add_enemy': 'Додати ворога',
    'home_added_enemy': 'Ворога додано',
    'home_share': 'Поділитися',
    'home_remix': 'Ремікс',
    'home_made_it': 'Зроблено',
    'home_pleyed': 'Зіграно',
    'home_won': 'Виграно',
    'home_survived': 'Вижив',
    'home_the_end': 'Кінець',
    'home_all_judged': 'Всі профілі оцінено',
    'home_universal_complete': 'Універсальний вибір завершено',
    'home_winner_complete': 'Вибір переможця завершено',
    'home_upload_modal_title': 'Новий допис',
    'home_upload_caption_placeholder': 'Напишіть підпис...',
    'home_upload_cancel': 'Скасувати',
    'home_upload_post': 'Опублікувати',
    'home_eliminated': 'Вибув',
    'home_majority': 'Більшість',
    'home_choose_variant': 'Виберіть варіант',
    'home_set_duration': 'Встановити тривалість',
    'home_select_ranking': 'Вибрати рейтинг',
    'home_select_rule': 'Вибрати правило',
    'home_current_choice': 'Поточний вибір',
    'home_community_votes': 'Голоси спільноти',
    'home_selection_locked': 'Вибір заблоковано до закінчення таймера',
    'home_submitted': 'Надіслано',
    'home_invalid_ranking': 'Недійсний рейтинг',
    'home_submit': 'Надіслати',
    'home_view_history': 'Переглянути історію',
    'home_start_new': 'Або почати новий раунд',

    // Search
    'search_header_details': 'Деталі раунду',
    'search_header_results': 'Результати раунду',
    'search_header_hall': 'Зала слави',
    'search_header_history': 'Історія раундів',
    'search_top_survivors': 'Найкращі виживші',
    'search_recent_outcomes': 'Останні результати',
    'search_clear_history': 'Очистити історію',
    'search_start_round': 'Почати раунд',
    'search_filter_type': 'Тип раунду:',
    'search_all_winners': 'Всі переможці',
    'search_try_again': 'Спробувати ще раз',
    'search_total_termination': 'ПОВНЕ ЗНИЩЕННЯ',
    'search_no_winners': 'ПЕРЕМОЖЦІВ НЕ ЗНАЙДЕНО',
    'search_waiting': 'Очікування переможця',
    'search_no_active': 'Немає активного раунду',
    'search_waiting_desc': 'Раунд триває. Чекайте на результати.',
    'search_start_desc': 'Почніть новий раунд з головного екрану, щоб побачити виживших.',
    'search_join_next': 'Приєднатися до наступного завдання',

    // CreatePost
    'create_new_post': 'Новий допис',
    'create_next': 'Далі',
    'create_camera': 'Камера',
    'create_gallery': 'Галерея',
    'create_select_preview': 'Виберіть медіа для перегляду',
    'create_caption_placeholder': 'Напишіть підпис...',

    // Notifications
    'notif_activity': 'Активність',
    'notif_follow': 'Стежити',
    'notif_following': 'Стежите',
    'notif_upvoted': 'вподобав ваше фото',
    'notif_commented': 'прокоментував:',
    'notif_started_following': 'почав стежити за вами',

    // Profile
    'profile_posts': 'Дописи',
    'profile_followers': 'Підписники',
    'profile_following': 'Підписки',
    'profile_enemies': 'Вороги',
    'profile_edit': 'Редагувати профіль',
    'profile_share': 'Поділитися профілем',
    'profile_bio_placeholder': 'Додайте біографію до свого профілю...',
    'profile_tab_posts': 'Дописи',
    'profile_tab_enemies': 'Вороги',
    'profile_tab_following': 'Підписки',
    'profile_no_posts': 'Ще немає дописів',
    'profile_no_enemies': 'Ще немає заклятих ворогів',
    'profile_no_following': 'Ви ще нікого не читаєте',
    'profile_marked_enemy': 'Позначений як ворог',
    'profile_enemies_desc': 'Профілі, які ви позначите як ворогів, з\'являться тут.',
    'profile_following_desc': 'Слідкуйте за вижившими із Зали слави, щоб бачити їх тут.',
    'profile_unfollow': 'Не стежити',
    'profile_legend': 'Легенда',
    'post_view_comments': 'Переглянути всі коментарі',
    'post_write_comment': 'Написати коментар...',
    'post_add_comment': 'Додати коментар',
    'timer_rule': 'Правило',
    'theme_light': 'Світла',
    'theme_system': 'Системна',

    // Personalization Modal
    'pers_title': '🔥 Rip It – Персоналізація (Стиль Gen Z)',
    'pers_subtitle': 'Rip It не однаковий для всіх.',
    'pers_desc': 'Ваш профіль еволюціонує разом із тим, як ви виживаєте.',
    'pers_item1': 'Власні вайби та теми',
    'pers_item2': 'Візуальні ефекти на основі режимів (Pley, Pley — кожен відчувається по-різному)',
    'pers_item3': 'Динамічні титули, що підкреслюють ваш статус',
    'pers_item4': 'Енергія фоловерів, що будує вашу присутність',
    'pers_footer1': 'Чим більше ви граєте, тим більше змінюється ваша ідентичність.',
    'pers_footer2': 'Перемога або скидання — ваша спадщина все одно говорить за вас.',
    'pers_button': 'Зрозуміло',

    // About Modal
    'about_title': 'Про Rip It',
    'about_tagline': 'Слоган: Виживай. Скидай. Еволюціонуй.',
    'about_desc1': 'Rip It — це соціальна платформа для виживання з високими ставками, створена для сміливих гравців. Змагайтеся в таких режимах, як Pley, Pley та Pley, щоб перевірити свою стратегію, стійкість та соціальні навички.',
    'about_pley_title': 'Pley',
    'about_pley_desc': 'Режим виживання з високим ризиком вибування.',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': 'Екстремальний режим для тих, хто наважується ризикнути всім.',
    'about_desc2': 'Rip It поєднує соціальну взаємодію, конкуренцію та динамічну персоналізацію для створення унікального, вірального та сповненого адреналіну досвіду.',
    'about_footer': 'Ми тут, щоб зробити ваш профіль, статус та історію виживання важливими — перемагайте, скидайте або еволюціонуйте.',
    'about_close': 'Закрити',

    // Contact Modal
    'contact_title': 'Зв\'язатися з нами',
    'contact_desc': 'Маєте запитання, відгуки або просто хочете розповісти нам свою історію виживання? Зв\'яжіться з нами:',
    'contact_email_label': 'Email',
    'contact_email_or': 'або',
    'contact_footer': 'Ми відповімо так само швидко, як зворотний відлік таймера Pley.',
    'contact_close': 'Закрити',

    // Model Modal
    'model_title': '🔥 Rip It – Модель додатка',
    'model_concept_title': '1️⃣ Основна концепція',
    'model_concept_desc': 'Rip It — це соціальний додаток для виживання з високими ставками, де участь користувачів, голосування та стратегія визначають прогрес, статус і спадщину. Кожна дія має наслідки, що створює напругу та залученість.',
    'model_modes_title': '2️⃣ Режими',
    'model_pley_title': 'Pley',
    'model_pley_item1': 'Орієнтований на виживання',
    'model_pley_item2': 'Мають значення лише голоси "проти"',
    'model_pley_item3': 'Раунди на час (користувач встановлює тривалість)',
    'model_pley_item4': 'Останні користувачі, що залишилися, отримують визнання',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': 'Екстремальний режим виживання',
    'model_Pley_item2': 'Тільки голоси "проти"',
    'model_Pley_item3': 'Повне скидання у разі голосування "проти"',
    'model_Pley_item4': 'Добровільно для тих, хто шукає гострих відчуттів з високим ризиком',
    'model_pers_title': '3️⃣ Персоналізація (без прив\'язки до IP)',
    'model_pers_item1': 'Власне відображуване ім\'я та тема профілю',
    'model_pers_item2': 'Візуальний досвід на основі режимів',
    'model_pers_item3': 'Динамічні титули та статус',
    'model_pers_item4': 'Метрики фоловерів/залученості',
    'model_close': 'Закрити',

    // Privacy Modal
    'priv_subtitle': 'Ваша конфіденційність важлива.',
    'priv_effective': 'Дата набрання чинності: 23.02.26',
    'priv_intro': 'Використовуючи Rip It, ви погоджуєтеся на збір та використання інформації, як описано нижче.',
    'priv_s1_title': '1️⃣ Інформація, яку ми збираємо',
    'priv_s1_i1': 'Інформація про обліковий запис: ім\'я користувача, email, дані профілю та налаштування.',
    'priv_s1_i2': 'Інформація про ігровий процес: участь у режимах, голоси, таймери, досягнення.',
    'priv_s1_i3': 'Інформація про пристрій: IP-адреса, тип пристрою, ОС та статистика використання.',
    'priv_s1_i4': 'Додаткова інформація: соціальні посилання або контент, яким ви вирішите поділитися.',
    'priv_s2_title': '2️⃣ Як ми використовуємо вашу інформацію',
    'priv_s2_i1': 'Для роботи та покращення функцій і режимів Rip It.',
    'priv_s2_i2': 'Для персоналізації вашого досвіду, включаючи теми профілю та статус.',
    'priv_s2_i3': 'Для виявлення зловживань, спаму або небезпечної активності.',
    'priv_s2_i4': 'Для повідомлення про оновлення, події або повідомлення служби підтримки.',
    'priv_s3_title': '3️⃣ Обмін вашою інформацією',
    'priv_s3_i1': 'Ми не продаємо вашу особисту інформацію.',
    'priv_s3_i2': 'Деякі дані можуть бути видимими для інших користувачів (наприклад, імена користувачів, статус та інформація в таблиці лідерів).',
    'priv_s3_i3': 'Ми можемо ділитися даними з постачальниками послуг або для дотримання законодавства.',
    'priv_s4_title': '4️⃣ Безпека',
    'priv_s4_i1': 'Ми використовуємо галузеві стандартні методи для захисту ваших даних.',
    'priv_s4_i2': 'Жодна система не є ідеальною — участь несе ризики, особливо у публічних функціях.',
    'priv_s5_title': '5️⃣ Ваш вибір',
    'priv_s5_i1': 'Ви можете оновити або видалити свій обліковий запис у будь-який час.',
    'priv_s5_i2': 'Ви можете керувати видимістю свого профілю та активності в додатку.',
    'priv_s5_i3': 'Ви можете відмовитися від необов\'язкових повідомлень.',
    'priv_s6_title': '6️⃣ Зміни до Політики конфіденційності',
    'priv_s6_i1': 'Оновлення можуть відбуватися в міру розвитку додатка.',
    'priv_s6_i2': 'Про основні зміни буде повідомлено в додатку.',

    // Terms Modal
    'terms_tagline': 'Слоган: Виживай. Скидай. Еволюціонуй.',
    'terms_effective': 'Дата набрання чинності: 23.02.26',
    'terms_intro': 'Використовуючи Rip It, ви погоджуєтеся з цими Умовами. Якщо ви не згодні, будь ласка, не використовуйте додаток.',
    'terms_s1_title': '1. Що таке Rip It',
    'terms_s1_desc': 'Rip It — це соціальний додаток для виживання з високими ставками, де користувачі беруть участь у викликах на час, публічних голосуваннях та конкурентних режимах.',
    'terms_s1_list_title': 'Ми надаємо інструменти для:',
    'terms_s1_i1': 'Досвіду виживання на основі режимів (Pley, Pley)',
    'terms_s1_i2': 'Публічного голосування та визнання',
    'terms_s1_i3': 'Персоналізації профілю та відстеження статусу',
    'terms_s1_disclaimer': 'Rip It не гарантує результатів, виживання або рейтингу.',
    'terms_s2_title': '2. Хто може використовувати Rip It',
    'terms_s2_i1': 'Бути принаймні 13 років',
    'terms_s2_i2': 'Використовувати додаток законно та з повагою',
    'terms_s2_i3': 'Надавати точну інформацію',
    'terms_s2_i4': 'Бути відповідальним за свій обліковий запис і діяльність',
    'terms_s3_title': '3. Режими та правила голосування',
    'terms_s3_i1': 'Pley, Pley та Pley мають унікальну механіку, що впливає на статус і прогрес профілю.',
    'terms_s3_i2': 'Голоси можуть впливати на прогрес користувача, скидання профілю або тимчасові обмеження.',
    'terms_s3_i3': 'Таймери, раунди та результати визначаються додатком та користувачами-учасниками.',
    'terms_s3_i4': 'Користувачі беруть участь на власний розсуд.',
    'terms_s4_title': '4. Репутація, статус і бали',
    'terms_s4_intro': 'Використовуючи Rip It, ви розумієте:',
    'terms_s4_i1': 'Статус, титули та визнання відображають ефективність у додатку та історію виживання',
    'terms_s4_i2': 'Публічне голосування впливає на прогрес у режимах',
    'terms_s4_i3': 'Rip It не маніпулює результатами на користь будь-якого користувача',
    'terms_s4_i4': 'Зловживання, маніпуляції або спам можуть призвести до санкцій або видалення',
    'terms_s5_title': '5. Поведінка користувача',
    'terms_s5_intro': 'Ви погоджуєтеся не:',
    'terms_s5_i1': 'Переслідувати, погрожувати або цькувати інших',
    'terms_s5_i2': 'Спамити або маніпулювати голосами',
    'terms_s5_i3': 'Видавати себе за інших користувачів',
    'terms_s5_i4': 'Використовувати Rip It для незаконної діяльності',
    'terms_s5_footer': 'Порушення можуть призвести до призупинення, обмеження або видалення облікового запису.',
    'terms_s6_title': '6. Контент і дані користувачів',
    'terms_s6_i1': 'Ви зберігаєте право власності на контент, який створюєте в додатку.',
    'terms_s6_i2': 'Ви несете відповідальність за свої подання та поведінку.',
    'terms_s6_i3': 'Rip It не несе відповідальності за контент, створений користувачами.',
    'terms_s6_i4': 'Ми можемо видаляти контент, який порушує ці Умови або є небезпечним.',
    'terms_s7_title': '7. Призупинення, скидання та припинення дії облікового запису',
    'terms_s7_i1': 'Облікові записи можуть бути призупинені, скинуті або видалені у разі порушення Умов або неналежного використання платформи.',
    'terms_s7_i2': 'Певні режими можуть призвести до скидання профілю в рамках ігрової механіки.',
    'terms_s7_i3': 'Ви можете видалити свій обліковий запис у будь-який час.',
    'terms_s8_title': '8. Відмова від відповідальності',
    'terms_s8_i1': 'Rip It надається «як є».',
    'terms_s8_i2': 'Ми не гарантуємо безперебійну роботу сервісу.',
    'terms_s8_i3': 'Ми не несемо відповідальності за результати користувачів, скидання профілів або втрачене визнання.',
    'terms_s8_i4': 'Участь на ваш власний розсуд.',
    'terms_s9_title': '9. Зміни до цих Умов',
    'terms_s9_desc': 'Ми можемо періодично оновлювати ці Умови. Про суттєві зміни буде повідомлено в додатку.',
    'terms_s10_title': '10. Контакти',
    'terms_s10_desc': 'Запитання чи занепокоєння?',
    'terms_s10_email': 'Email: ripit90210@gmail.com'
  },
  ru: {
    // Settings
    'settings': 'Настройки',
    'app': 'Приложение',
    'language': 'Язык',
    'theme': 'Тема',
    'personalization': 'Персонализация',
    'about': 'О нас',
    'model': 'Модель',
    'terms': 'Условия использования',
    'privacy': 'Политика конфиденциальности',
    'contact': 'Связаться с нами',
    'logout': 'Выйти',
    'cancel': 'Отмена',

    // BottomNav
    'nav_home': 'Главная',
    'nav_search': 'Поиск',
    'nav_create': 'Создать',
    'nav_notifications': 'Активность',
    'nav_profile': 'Профиль',

    // Home
    'home_following': 'Подписки',
    'home_for_you': 'Для вас',
    'home_live_challenge': 'Живой вызов',
    'home_survivors': 'Выжившие',
    'home_pass': 'Пас',
    'home_smash': 'Смаш',
    'home_add_enemy': 'Добавить врага',
    'home_added_enemy': 'Враг добавлен',
    'home_share': 'Поделиться',
    'home_remix': 'Ремикс',
    'home_made_it': 'Сделано',
    'home_pleyed': 'Сыграно',
    'home_won': 'Выиграно',
    'home_survived': 'Выжил',
    'home_the_end': 'Конец',
    'home_all_judged': 'Все профили оценены',
    'home_universal_complete': 'Универсальный выбор завершен',
    'home_winner_complete': 'Выбор победителя завершен',
    'home_upload_modal_title': 'Новая публикация',
    'home_upload_caption_placeholder': 'Напишите подпись...',
    'home_upload_cancel': 'Отмена',
    'home_upload_post': 'Опубликовать',
    'home_eliminated': 'Исключен',
    'home_majority': 'Большинство',
    'home_choose_variant': 'Выберите вариант',
    'home_set_duration': 'Установить длительность',
    'home_select_ranking': 'Выбрать рейтинг',
    'home_select_rule': 'Выбрать правило',
    'home_current_choice': 'Текущий выбор',
    'home_community_votes': 'Голоса сообщества',
    'home_selection_locked': 'Выбор заблокирован до окончания таймера',
    'home_submitted': 'Отправлено',
    'home_invalid_ranking': 'Неверный рейтинг',
    'home_submit': 'Отправить',
    'home_view_history': 'История раундов',
    'home_start_new': 'Или начать новый раунд',

    // Search
    'search_header_details': 'Деталі раунда',
    'search_header_results': 'Результати раунда',
    'search_header_hall': 'Зал славы',
    'search_header_history': 'История раундов',
    'search_top_survivors': 'Лучшие выжившие',
    'search_recent_outcomes': 'Недавние результаты',
    'search_clear_history': 'Очистить историю',
    'search_start_round': 'Начать раунд',
    'search_filter_type': 'Тип раунда:',
    'search_all_winners': 'Все победители',
    'search_try_again': 'Попробовать снова',
    'search_total_termination': 'ПОЛНОЕ УНИЧТОЖЕНИЕ',
    'search_no_winners': 'ПОБЕДИТЕЛИ НЕ НАЙДЕНЫ',
    'search_waiting': 'Ожидание победителя',
    'search_no_active': 'Нет активного раунда',
    'search_waiting_desc': 'Раунд в настоящее время выполняется. Следите за результатами.',
    'search_start_desc': 'Начните новый раунд с главного экрана, чтобы увидеть выживших.',
    'search_join_next': 'Присоединиться к следующей задаче',

    // CreatePost
    'create_new_post': 'Новая публикация',
    'create_next': 'Далее',
    'create_camera': 'Камера',
    'create_gallery': 'Галерея',
    'create_select_preview': 'Выберите медиа для просмотра',
    'create_caption_placeholder': 'Напишите подпись...',

    // Notifications
    'notif_activity': 'Активность',
    'notif_follow': 'Подписаться',
    'notif_following': 'Подписки',
    'notif_upvoted': 'лайкнул ваше фото',
    'notif_commented': 'прокомментировал:',
    'notif_started_following': 'начал читать вас',

    // Profile
    'profile_posts': 'Публикации',
    'profile_followers': 'Подписчики',
    'profile_following': 'Подписки',
    'profile_enemies': 'Враги',
    'profile_edit': 'Редактировать профиль',
    'profile_share': 'Поделиться профилем',
    'profile_bio_placeholder': 'Добавьте биографию в свой профиль...',
    'profile_tab_posts': 'Публикации',
    'profile_tab_enemies': 'Враги',
    'profile_tab_following': 'Подписки',
    'profile_no_posts': 'Пока нет публикаций',
    'profile_no_enemies': 'Пока нет заклятых врагов',
    'profile_no_following': 'Вы пока ни на кого не подписаны',
    'profile_marked_enemy': 'Помечен как враг',
    'profile_enemies_desc': 'Профили, которые вы пометите как врагов, появятся здесь.',
    'profile_following_desc': 'Следите за выжившими из Зала славы, чтобы увидеть их здесь.',
    'profile_unfollow': 'Отписаться',
    'profile_legend': 'Легенда',
    'post_view_comments': 'Посмотреть все комментарии',
    'post_write_comment': 'Написать комментарий...',
    'post_add_comment': 'Добавить комментарий',
    'timer_rule': 'Правило',
    'theme_light': 'Светлая',
    'theme_system': 'Системная',

    // Personalization Modal
    'pers_title': '🔥 Rip It – Персонализация (Стиль Gen Z)',
    'pers_subtitle': 'Rip It не одинаков для всех.',
    'pers_desc': 'Ваш профиль эволюционирует вместе с тем, как вы выживаете.',
    'pers_item1': 'Свои вайбы и темы',
    'pers_item2': 'Визуальные эффекты на основе режимов (Pley, Pley — каждый ощущается по-разному)',
    'pers_item3': 'Динамические титулы, подчеркивающие ваш статус',
    'pers_item4': 'Энергия фолловеров, строящая ваше присутствие',
    'pers_footer1': 'Чем больше вы играете, тем больше меняется ваша идентичность.',
    'pers_footer2': 'Победа или сброс — ваше наследие все равно говорит за вас.',
    'pers_button': 'Понятно',

    // About Modal
    'about_title': 'О Rip It',
    'about_tagline': 'Слоган: Выживай. Сбрасывай. Эволюционируй.',
    'about_desc1': 'Rip It — это социальная платформа для выживания с высокими ставками, созданная для смелых игроков. Соревнуйтесь в таких режимах, как Pley, Pley и Pley, чтобы проверить свою стратегию, стойкость и социальные навыки.',
    'about_pley_title': 'Pley',
    'about_pley_desc': 'Режим выживания с высоким риском выбывания.',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': 'Экстремальный режим для тех, кто осмеливается рискнуть всем.',
    'about_desc2': 'Rip It сочетает социальное взаимодействие, конкуренцию и динамическую персонализацию для создания уникального, вирального и полного адреналина опыта.',
    'about_footer': 'Мы здесь, чтобы сделать ваш профиль, статус и историю выживания важными — побеждайте, сбрасывайте или эволюционируйте.',
    'about_close': 'Закрыть',

    // Contact Modal
    'contact_title': 'Связаться с нами',
    'contact_desc': 'Есть вопросы, отзывы или просто хотите рассказать нам свою историю выживания? Свяжитесь с нами:',
    'contact_email_label': 'Email',
    'contact_email_or': 'или',
    'contact_footer': 'Мы ответим так же быстро, как обратный отсчет таймера Pley.',
    'contact_close': 'Закрыть',

    // Model Modal
    'model_title': '🔥 Rip It – Модель приложения',
    'model_concept_title': '1️⃣ Основная концепция',
    'model_concept_desc': 'Rip It — это социальное приложение для выживания с высокими ставками, где участие пользователей, голосование и стратегия определяют прогресс, статус и наследие. Каждое действие имеет последствия, что создает напряжение и вовлеченность.',
    'model_modes_title': '2️⃣ Режимы',
    'model_pley_title': 'Pley',
    'model_pley_item1': 'Ориентирован на выживание',
    'model_pley_item2': 'Имеют значение только голоса "против"',
    'model_pley_item3': 'Раунды на время (пользователь устанавливает длительность)',
    'model_pley_item4': 'Последние оставшиеся пользователи получают признание',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': 'Экстремальный режим выживания',
    'model_Pley_item2': 'Только голоса "против"',
    'model_Pley_item3': 'Полный сброс в случае голосования "против"',
    'model_Pley_item4': 'Добровольно для тех, кто ищет острых ощущений с высоким риском',
    'model_pers_title': '3️⃣ Персонализация (без привязки к IP)',
    'model_pers_item1': 'Собственное отображаемое имя и тема профиля',
    'model_pers_item2': 'Визуальный опыт на основе режимов',
    'model_pers_item3': 'Динамические титулы и статус',
    'model_pers_item4': 'Метрики фолловеров/вовлеченности',
    'model_close': 'Закрыть',

    // Privacy Modal
    'priv_subtitle': 'Ваша конфиденциальность важна.',
    'priv_effective': 'Дата вступления в силу: 23.02.26',
    'priv_intro': 'Используя Rip It, вы соглашаетесь на сбор и использование информации, как описано ниже.',
    'priv_s1_title': '1️⃣ Информация, которую мы собираем',
    'priv_s1_i1': 'Информация об учетной записи: имя пользователя, email, данные профиля и настройки.',
    'priv_s1_i2': 'Информация об игровом процессе: участие в режимах, голоса, таймеры, достижения.',
    'priv_s1_i3': 'Информация об устройстве: IP-адрес, тип устройства, ОС и статистика использования.',
    'priv_s1_i4': 'Дополнительная информация: социальные ссылки или контент, которым вы решите поделиться.',
    'priv_s2_title': '2️⃣ Как мы используем вашу информацию',
    'priv_s2_i1': 'Для работы и улучшения функций и режимов Rip It.',
    'priv_s2_i2': 'Для персонализации вашего опыта, включая темы профиля и статус.',
    'priv_s2_i3': 'Для обнаружения злоупотреблений, спама или небезопасной активности.',
    'priv_s2_i4': 'Для сообщения об обновлениях, событиях или сообщениях службы поддержки.',
    'priv_s3_title': '3️⃣ Обмен вашей информацией',
    'priv_s3_i1': 'Мы не продаем вашу личную информацию.',
    'priv_s3_i2': 'Некоторые данные могут быть видимыми для других пользователей (например, имена пользователей, статус и информация в таблице лидеров).',
    'priv_s3_i3': 'Мы можем делиться данными с поставщиками услуг или для соблюдения законодательства.',
    'priv_s4_title': '4️⃣ Безопасность',
    'priv_s4_i1': 'Мы используем отраслевые стандартные методы для защиты ваших данных.',
    'priv_s4_i2': 'Ни одна система не идеальна — участие несет риски, особенно в публичных функциях.',
    'priv_s5_title': '5️⃣ Ваш выбор',
    'priv_s5_i1': 'Вы можете обновить или удалить свою учетную запись в любое время.',
    'priv_s5_i2': 'Вы можете управлять видимостью своего профиля и активности в приложении.',
    'priv_s5_i3': 'Вы можете отказаться от необязательных сообщений.',
    'priv_s6_title': '6️⃣ Изменения в Политике конфиденциальности',
    'priv_s6_i1': 'Обновления могут происходить по мере развития приложения.',
    'priv_s6_i2': 'О крупных изменениях будет объявлено в приложении.',

    // Terms Modal
    'terms_tagline': 'Слоган: Выживай. Сбрасывай. Эволюционируй.',
    'terms_effective': 'Дата вступления в силу: 23.02.26',
    'terms_intro': 'Используя Rip It, вы соглашаетесь с этими Условиями. Если вы не согласны, пожалуйста, не используйте приложение.',
    'terms_s1_title': '1. Что такое Rip It',
    'terms_s1_desc': 'Rip It — это социальное приложение для выживания с высокими ставками, где пользователи участвуют в испытаниях на время, публичных голосованиях и конкурентных режимах.',
    'terms_s1_list_title': 'Мы предоставляем инструменты для:',
    'terms_s1_i1': 'Опыта выживания на основе режимов (Pley, Pley)',
    'terms_s1_i2': 'Публичного голосования и признания',
    'terms_s1_i3': 'Персонализации профиля и отслеживания статуса',
    'terms_s1_disclaimer': 'Rip It не гарантирует результатов, выживания или рейтинга.',
    'terms_s2_title': '2. Кто может использовать Rip It',
    'terms_s2_i1': 'Быть не моложе 13 лет',
    'terms_s2_i2': 'Использовать приложение законно и с уважением',
    'terms_s2_i3': 'Предоставлять точную информацию',
    'terms_s2_i4': 'Нести ответственность за свою учетную запись и деятельность',
    'terms_s3_title': '3. Режимы и правила голосования',
    'terms_s3_i1': 'Pley, Pley и Pley имеют уникальную механику, влияющую на статус и прогресс профиля.',
    'terms_s3_i2': 'Голоса могут влиять на прогресс пользователя, сброс профиля или временные ограничения.',
    'terms_s3_i3': 'Таймеры, раунды и результаты определяются приложением и участвующими пользователями.',
    'terms_s3_i4': 'Пользователи участвуют по своему усмотрению.',
    'terms_s4_title': '4. Репутация, статус и баллы',
    'terms_s4_intro': 'Используя Rip It, вы понимаете:',
    'terms_s4_i1': 'Статус, титулы и признание отражают эффективность в приложении и историю выживания',
    'terms_s4_i2': 'Публичное голосование влияет на прогресс в режимах',
    'terms_s4_i3': 'Rip It не манипурует результатами в пользу любого пользователя',
    'terms_s4_i4': 'Злоупотребление, манипуляция или спам могут привести к санкциям или удалению',
    'terms_s5_title': '5. Поведение пользователя',
    'terms_s5_intro': 'Вы соглашаетесь не:',
    'terms_s5_i1': 'Преследовать, угрожать или травить других',
    'terms_s5_i2': 'Спамить или манипулировать голосами',
    'terms_s5_i3': 'Выдавать себя за других пользователей',
    'terms_s5_i4': 'Использовать Rip It для незаконной деятельности',
    'terms_s5_footer': 'Нарушения могут привести к приостановке, ограничению или удалению учетной записи.',
    'terms_s6_title': '6. Контент и пользовательские данные',
    'terms_s6_i1': 'Вы сохраняете право собственности на контент, который создаете в приложении.',
    'terms_s6_i2': 'Вы несете ответственность за свои материалы и поведение.',
    'terms_s6_i3': 'Rip It не несет ответственности за контент, созданный пользователями.',
    'terms_s6_i4': 'Мы можем удалять контент, который нарушает эти Условия или является небезопасным.',
    'terms_s7_title': '7. Приостановка, сброс и прекращение действия учетной записи',
    'terms_s7_i1': 'Учетные записи могут быть приостановены, сброшены или удалены в случае нарушения Условий или ненадлежащего использования платформы.',
    'terms_s7_i2': 'Определенные режимы могут привести к сбросу профиля в рамках игровой механики.',
    'terms_s7_i3': 'Вы можете удалить свою учетную запись в любое время.',
    'terms_s8_title': '8. Отказ от ответственности',
    'terms_s8_i1': 'Rip It предоставляется «как есть».',
    'terms_s8_i2': 'Мы не гарантируем бесперебойную работу сервиса.',
    'terms_s8_i3': 'Мы не несем ответственности за результаты пользователей, сброс профилей или утерянное признание.',
    'terms_s8_i4': 'Участие на ваше собственное усмотрение.',
    'terms_s9_title': '9. Изменения в этих Условиях',
    'terms_s9_desc': 'Мы можем периодически обновлять эти Условия. О существенных изменениях будет объявлено в приложении.',
    'terms_s10_title': '10. Контакты',
    'terms_s10_desc': 'Вопросы или опасения?',
    'terms_s10_email': 'Email: ripit90210@gmail.com'
  },
  it: {
    'settings': 'Impostazioni',
    'app': 'App',
    'language': 'Lingua',
    'theme': 'Tema',
    'personalization': 'Personalizzazione',
    'about': 'Informazioni',
    'model': 'Modello',
    'terms': 'Termini di servizio',
    'privacy': 'Informativa sulla privacy',
    'contact': 'Contattaci',
    'logout': 'Disconnetti',
    'cancel': 'Annulla',
    'nav_home': 'Home',
    'nav_search': 'imemo0',
    'nav_create': 'Crea',
    'nav_notifications': 'Attività',
    'nav_profile': 'Profilo',
    'nav_chat': 'Messaggi',
    'home_following': 'Seguiti',
    'home_for_you': 'Per te',
    'home_live_challenge': 'Sfida dal vivo',
    'home_survivors': 'Sopravvissuti',
    'home_pass': 'Passa',
    'home_smash': 'Smash',
    'home_add_enemy': 'Aggiungi nemico',
    'home_added_enemy': 'Nemico aggiunto',
    'home_share': 'Condividi',
    'home_remix': 'Remix',
    'home_made_it': 'Ce l\'ho fatta',
    'home_pleyed': 'Giocato',
    'home_won': 'Vinto',
    'home_survived': 'Sopravvissuto',
    'home_the_end': 'La Fine',
    'home_all_judged': 'Tutti i profili sono stati giudicati',
    'home_universal_complete': 'Selezione universale completata',
    'home_winner_complete': 'Selezione del vincitore completata',
    'home_upload_modal_title': 'Nuovo post',
    'home_upload_caption_placeholder': 'Scrivi una didascalia...',
    'home_upload_cancel': 'Annulla',
    'home_upload_post': 'Pubblica',
    'home_eliminated': 'Eliminato',
    'home_majority': 'Maggioranza',
    'home_choose_variant': 'Scegli variante',
    'home_set_duration': 'Imposta durata',
    'home_select_ranking': 'Seleziona classifica',
    'home_select_rule': 'Seleziona regola',
    'home_current_choice': 'Scelta attuale',
    'home_community_votes': 'Voti della comunità',
    'home_selection_locked': 'Selezione bloccata fino alla fine del timer',
    'home_submitted': 'Inviato',
    'home_invalid_ranking': 'Classifica non valida',
    'home_submit': 'Invia',
    'home_view_history': 'Visualizza cronologia round',
    'home_start_new': 'O inizia un nuovo round',
    'search_header_details': 'Dettagli round',
    'search_header_results': 'Risultati round',
    'search_header_hall': 'Hall of Fame',
    'search_header_history': 'Cronologia round',
    'search_top_survivors': 'Migliori sopravvissuti',
    'search_recent_outcomes': 'Risultati recenti',
    'search_clear_history': 'Cancella tutta la cronologia',
    'search_start_round': 'Inizia round',
    'search_filter_type': 'Tipo di round:',
    'search_all_winners': 'Tutti i vincitori',
    'search_try_again': 'Riprova',
    'search_total_termination': 'TERMINAZIONE TOTALE',
    'search_no_winners': 'NESSUN VINCITORE TROVATO',
    'search_waiting': 'In attesa di un vincitore',
    'search_no_active': 'Nessun round attivo',
    'search_waiting_desc': 'Il round è attualmente in corso. Resta sintonizzato per i risultati.',
    'search_start_desc': 'Inizia un nuovo round dalla schermata home per vedere i sopravvissuti qui.',
    'search_join_next': 'Partecipa alla prossima attività',
    'create_new_post': 'Nuovo post',
    'create_next': 'Avanti',
    'create_camera': 'Fotocamera',
    'create_gallery': 'Galleria',
    'create_select_preview': 'Seleziona file multimediale per l\'anteprima',
    'create_caption_placeholder': 'Scrivi una didascalia...',
    'notif_activity': 'Attività',
    'notif_follow': 'Segui',
    'notif_following': 'Seguiti',
    'notif_upvoted': 'ha messo mi piace alla tua foto',
    'notif_commented': 'ha commentato:',
    'notif_started_following': 'ha iniziato a seguirti',
    'profile_posts': 'Post',
    'profile_followers': 'Follower',
    'profile_following': 'Seguiti',
    'profile_enemies': 'Nemici',
    'profile_edit': 'Modifica profilo',
    'profile_share': 'Condividi profilo',
    'profile_bio_placeholder': 'Aggiungi una biografia al tuo profilo...',
    'profile_tab_posts': 'Post',
    'profile_tab_enemies': 'Nemici',
    'profile_tab_following': 'Seguiti',
    'profile_no_posts': 'Ancora nessun post',
    'profile_no_enemies': 'Ancora nessun nemico giurato',
    'profile_no_following': 'Non segui ancora nessuno',
    'profile_marked_enemy': 'Nemico segnato',
    'profile_enemies_desc': 'I profili che segni come nemici appariranno qui.',
    'profile_following_desc': 'Segui i sopravvissuti dalla Hall of Fame per vederli qui.',
    'profile_unfollow': 'Smetti di seguire',
    'profile_legend': 'Leggenda',
    'post_view_comments': 'Visualizza tutti i commenti',
    'post_write_comment': 'Scrivi un commento...',
    'post_add_comment': 'Aggiungi commento',
    'timer_rule': 'Regola',
    'theme_light': 'Chiaro',
    'theme_system': 'Sistema',
    'pers_title': '🔥 Rip It – Personalizzazione (Stile Gen Z)',
    'pers_subtitle': 'Rip It non è uguale per tutti.',
    'pers_desc': 'Il tuo profilo si evolve con il modo in cui sopravvivi.',
    'pers_item1': 'Vibrazioni e temi personalizzati',
    'pers_item2': 'Effetti visivi basati sulla modalità (Pley, Pley colpiscono in modo diverso)',
    'pers_item3': 'Titoli dinamici che mostrano il tuo status',
    'pers_item4': 'Energia dei follower che costruisce la tua presenza',
    'pers_footer1': 'Più giochi, più la tua identità cambia.',
    'pers_footer2': 'Vinci o resetta — la tua eredità parla ancora.',
    'pers_button': 'Capito',
    'about_title': 'Informazioni su Rip It',
    'about_tagline': 'Tagline: Sopravvivi. Resetta. Evolvi.',
    'about_desc1': 'Rip It è una piattaforma di sopravvivenza sociale ad alta posta in gioco progettata per giocatori audaci. Competi in modalità come Pley, Pley e Pley per testare la tua strategia, resilienza e abilità sociali.',
    'about_pley_title': 'Pley',
    'about_pley_desc': 'Modalità sopravvivenza con eliminazione ad alto rischio.',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': 'Modalità estrema per chi osa rischiare tutto.',
    'about_desc2': 'Rip It combina interazione sociale, competizione e personalizzazione dinamica per creare un\'esperienza unica, virale e adrenalinica.',
    'about_footer': 'Siamo qui per dare importanza al tuo profilo, al tuo status e alla tua storia di sopravvivenza—vinci, resetta o evolvi.',
    'about_close': 'Chiudi',
    'contact_title': 'Contattaci',
    'contact_desc': 'Hai domande, feedback o vuoi semplicemente raccontarci la tua storia di sopravvivenza? Contattaci:',
    'contact_email_label': 'Email',
    'contact_email_or': 'oppure',
    'contact_footer': 'Ti risponderemo velocemente come un timer Pley che fa il conto alla rovescia.',
    'contact_close': 'Chiudi',
    'model_title': '🔥 Rip It – Modello App',
    'model_concept_title': '1️⃣ Concetto di base',
    'model_concept_desc': 'Rip It è un\'app di sopravvivenza sociale ad alta posta in gioco dove la partecipazione degli utenti, il voto e la strategia determinano la progressione, lo status e l\'eredità. Ogni azione ha conseguenze, creando tensione e coinvolgimento.',
    'model_modes_title': '2️⃣ Modalità',
    'model_pley_title': 'Pley',
    'model_pley_item1': 'Focalizzata sulla sopravvivenza',
    'model_pley_item2': 'Contano solo i voti negativi',
    'model_pley_item3': 'Round a tempo (l\'utente imposta la durata)',
    'model_pley_item4': 'Gli ultimi utenti rimasti ottengono riconoscimento',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': 'Modalità sopravvivenza estrema',
    'model_Pley_item2': 'Solo voti negativi',
    'model_Pley_item3': 'Reset completo se votato contro',
    'model_Pley_item4': 'Volontario per chi cerca il brivido ad alto rischio',
    'model_pers_title': '3️⃣ Personalizzazione (Non specifica per IP)',
    'model_pers_item1': 'Nome visualizzato e tema del profilo personalizzati',
    'model_pers_item2': 'Esperienza visiva basata sulla modalità',
    'model_pers_item3': 'Titoli e status dinamici',
    'model_pers_item4': 'Metriche di follower/coinvolgimento',
    'model_close': 'Chiudi',
    'priv_subtitle': 'La tua privacy è importante.',
    'priv_effective': 'Data di decorrenza: 23/02/26',
    'priv_intro': 'Utilizzando Rip It, accetti la raccolta e l\'uso delle informazioni come descritto di seguito.',
    'priv_s1_title': '1️⃣ Informazioni che raccogliamo',
    'priv_s1_i1': 'Info account: Nome utente, email, dati del profilo e preferenze.',
    'priv_s1_i2': 'Info gameplay: Partecipazione alle modalità, voti, timer, obiettivi.',
    'priv_s1_i3': 'Info dispositivo: Indirizzo IP, tipo di dispositivo, OS e statistiche di utilizzo.',
    'priv_s1_i4': 'Info opzionali: Link social o contenuti che scegli di condividere.',
    'priv_s2_title': '2️⃣ Come usiamo le tue info',
    'priv_s2_i1': 'Per gestire e migliorare le funzionalità e le modalità di Rip It.',
    'priv_s2_i2': 'Per personalizzare la tua esperienza, inclusi i temi del profilo e lo status.',
    'priv_s2_i3': 'Per rilevare abusi, spam o attività non sicure.',
    'priv_s2_i4': 'Per comunicare aggiornamenti, eventi o messaggi di supporto.',
    'priv_s3_title': '3️⃣ Condivisione delle tue info',
    'priv_s3_i1': 'Non vendiamo le tue informazioni personali.',
    'priv_s3_i2': 'Alcuni dati possono essere visibili ad altri utenti (come nomi utente, status e info della classifica).',
    'priv_s3_i3': 'Potremmo condividere dati con fornitori di servizi o per conformità legale.',
    'priv_s4_title': '4️⃣ Sicurezza',
    'priv_s4_i1': 'Utilizziamo pratiche standard del settore per proteggere i tuoi dati.',
    'priv_s4_i2': 'Nessun sistema è perfetto — la partecipazione comporta rischi, specialmente nelle funzionalità pubbliche.',
    'priv_s5_title': '5️⃣ Le tue scelte',
    'priv_s5_i1': 'Puoi aggiornare o eliminare il tuo account in qualsiasi momento.',
    'priv_s5_i2': 'Puoi controllare la visibilità del tuo profilo e della tua attività nell\'app.',
    'priv_s5_i3': 'Puoi disattivare le comunicazioni non essenziali.',
    'priv_s6_title': '6️⃣ Bambini',
    'priv_s6_i1': 'Rip It non è destinato a utenti di età inferiore ai 13 anni.',
    'priv_s6_i2': 'Gli account appartenenti a utenti minorenni possono essere eliminati.',
    'priv_s7_title': '7️⃣ Modifiche all\'informativa sulla privacy',
    'priv_s7_i1': 'Potrebbero verificarsi aggiornamenti man mano che l\'app si evolve.',
    'priv_s7_i2': 'Le modifiche principali saranno annunciate nell\'app.',
    'terms_tagline': 'Tagline: Sopravvivi. Resetta. Evolvi.',
    'terms_effective': 'Data di decorrenza: 23/02/26',
    'terms_intro': 'Utilizzando Rip It, accetti questi Termini. Se non accetti, ti preghiamo di non utilizzare l\'app.',
    'terms_s1_title': '1. Cos\'è Rip It',
    'terms_s1_desc': 'Rip It è un\'app di sopravvivenza sociale ad alta posta in gioco dove gli utenti partecipano a sfide a tempo, votazioni pubbliche e modalità competitive.',
    'terms_s1_list_title': 'Forniamo strumenti per:',
    'terms_s1_i1': 'Esperienze di sopravvivenza basate sulla modalità (Pley, Pley)',
    'terms_s1_i2': 'Votazione pubblica e riconoscimento',
    'terms_s1_i3': 'Personalizzazione del profilo e tracciamento dello status',
    'terms_s1_disclaimer': 'Rip It non garantisce risultati, sopravvivenza o classifica.',
    'terms_s2_title': '2. Chi può usare Rip It',
    'terms_s2_i1': 'Avere almeno 13 anni',
    'terms_s2_i2': 'Usare l\'app in modo legale e rispettoso',
    'terms_s2_i3': 'Fornire informazioni accurate',
    'terms_s2_i4': 'Essere responsabile del proprio account e della propria attività',
    'terms_s3_title': '3. Modalità e regole di voto',
    'terms_s3_i1': 'Pley, Pley e Pley hanno meccaniche uniche che influenzano lo status del profilo e la progressione.',
    'terms_s3_i2': 'I voti possono influenzare la progressione dell\'utente, il reset del profilo o restrizioni temporanee.',
    'terms_s3_i3': 'I timer, i round e i risultati sono determinati dall\'app e dagli utenti partecipanti.',
    'terms_s3_i4': 'Gli utenti partecipano a propria discrezione.',
    'terms_s4_title': '4. Reputazione, status e punteggi',
    'terms_s4_intro': 'Utilizzando Rip It, comprendi che:',
    'terms_s4_i1': 'Status, titoli e riconoscimento riflettono le prestazioni nell\'app e la cronologia di sopravvivenza',
    'terms_s4_i2': 'Il voto pubblico influenza la progressione all\'interno delle modalità',
    'terms_s4_i3': 'Rip It non manipola i risultati per favorire alcun utente',
    'terms_s4_i4': 'Abusi, manipolazioni o spam possono comportare sanzioni o rimozione',
    'terms_s5_title': '5. Condotta dell\'utente',
    'terms_s5_intro': 'Accetti di non:',
    'terms_s5_i1': 'Molestare, minacciare o bullizzare gli altri',
    'terms_s5_i2': 'Spammare o manipolare i voti',
    'terms_s5_i3': 'Impersonare altri utenti',
    'terms_s5_i4': 'Usare Rip It per attività illegali',
    'terms_s5_footer': 'Le violazioni possono comportare sospensione, restrizione o rimozione dell\'account.',
    'terms_s6_title': '6. Contenuto e dati utente',
    'terms_s6_i1': 'Mantieni la proprietà dei contenuti che crei nell\'app.',
    'terms_s6_i2': 'Sei responsabile delle tue sottomissioni e del tuo comportamento.',
    'terms_s6_i3': 'Rip It non è responsabile per i contenuti generati dagli utenti.',
    'terms_s6_i4': 'Potremmo rimuovere contenuti che violano questi Termini o che non sono sicuri.',
    'terms_s7_title': '7. Sospensione, reset e terminazione dell\'account',
    'terms_s7_i1': 'Gli account possono essere sospesi, resettati o eliminati se i Termini vengono violati o la piattaforma viene utilizzata in modo improprio.',
    'terms_s7_i2': 'Alcune modalità possono comportare il reset del profilo come parte delle meccaniche di gioco.',
    'terms_s7_i3': 'Puoi eliminare il tuo account in qualsiasi momento.',
    'terms_s8_title': '8. Esclusione di responsabilità',
    'terms_s8_i1': 'Rip It è fornito "così com\'è".',
    'terms_s8_i2': 'Non garantiamo un servizio ininterrotto.',
    'terms_s8_i3': 'Non siamo responsabili per i risultati degli utenti, i reset del profilo o la perdita di riconoscimento.',
    'terms_s8_i4': 'La partecipazione è a propria discrezione.',
    'terms_s9_title': '9. Modifiche a questi Termini',
    'terms_s9_desc': 'Potremmo aggiornare questi Termini periodicamente. Le modifiche significative saranno comunicate nell\'app.',
    'terms_s10_title': '10. Contatto',
    'terms_s10_desc': 'Domande o dubbi?',
    'terms_s10_email': 'Email: ripit90210@gmail.com'
  },
  pt: {
    'settings': 'Configurações',
    'app': 'App',
    'language': 'Idioma',
    'theme': 'Tema',
    'personalization': 'Personalização',
    'about': 'Sobre',
    'model': 'Modelo',
    'terms': 'Termos de Serviço',
    'privacy': 'Política de Privacidade',
    'contact': 'Contate-nos',
    'logout': 'Sair',
    'cancel': 'Cancelar',
    'nav_home': 'Início',
    'nav_search': 'imemo0',
    'nav_create': 'Criar',
    'nav_notifications': 'Atividade',
    'nav_profile': 'Perfil',
    'nav_chat': 'Mensagens',
    'home_following': 'Seguindo',
    'home_for_you': 'Para Você',
    'home_live_challenge': 'Desafio ao Vivo',
    'home_survivors': 'Sobreviventes',
    'home_pass': 'Passar',
    'home_smash': 'Smash',
    'home_add_enemy': 'Adicionar Inimigo',
    'home_added_enemy': 'Inimigo Adicionado',
    'home_share': 'Compartilhar',
    'home_remix': 'Remix',
    'home_made_it': 'Conseguiu',
    'home_pleyed': 'Jogado',
    'home_won': 'Ganhou',
    'home_survived': 'Sobreviveu',
    'home_the_end': 'O Fim',
    'home_all_judged': 'Todos os perfis foram julgados',
    'home_universal_complete': 'Seleção Universal Concluída',
    'home_winner_complete': 'Seleção do Vencedor Concluída',
    'home_upload_modal_title': 'Novo Post',
    'home_upload_caption_placeholder': 'Escreva uma legenda...',
    'home_upload_cancel': 'Cancelar',
    'home_upload_post': 'Postar',
    'home_eliminated': 'Eliminado',
    'home_majority': 'Maioria',
    'home_choose_variant': 'Escolher Variante',
    'home_set_duration': 'Definir Duração',
    'home_select_ranking': 'Selecionar Ranking',
    'home_select_rule': 'Selecionar Regra',
    'home_current_choice': 'Escolha Atual',
    'home_community_votes': 'Votos da Comunidade',
    'home_selection_locked': 'Seleção bloqueada até o timer terminar',
    'home_submitted': 'Enviado',
    'home_invalid_ranking': 'Ranking Inválido',
    'home_submit': 'Enviar',
    'home_view_history': 'Ver Histórico de Rodadas',
    'home_start_new': 'Ou Iniciar Nova Rodada',
    'search_header_details': 'Detalhes da Rodada',
    'search_header_results': 'Resultados da Rodada',
    'search_header_hall': 'Hall da Fama',
    'search_header_history': 'Histórico de Rodadas',
    'search_top_survivors': 'Melhores Sobreviventes',
    'search_recent_outcomes': 'Resultados Recentes',
    'search_clear_history': 'Limpar Todo o Histórico',
    'search_start_round': 'Iniciar Rodada',
    'search_filter_type': 'Tipo de Rodada:',
    'search_all_winners': 'Todos os Vencedores',
    'search_try_again': 'Tentar Novamente',
    'search_total_termination': 'TERMINAÇÃO TOTAL',
    'search_no_winners': 'NENHUM VENCEDOR ENCONTRADO',
    'search_waiting': 'Aguardando um vencedor',
    'search_no_active': 'Nenhuma Rodada Ativa',
    'search_waiting_desc': 'A rodada está em andamento. Fique ligado nos resultados.',
    'search_start_desc': 'Inicie uma nova rodada na tela inicial para ver os sobreviventes aqui.',
    'search_join_next': 'Participar da Próxima Tarefa',
    'create_new_post': 'Novo Post',
    'create_next': 'Próximo',
    'create_camera': 'Câmera',
    'create_gallery': 'Galeria',
    'create_select_preview': 'Selecionar mídia para visualizar',
    'create_caption_placeholder': 'Escreva uma legenda...',
    'notif_activity': 'Atividade',
    'notif_follow': 'Seguir',
    'notif_following': 'Seguindo',
    'notif_upvoted': 'curtiu sua foto',
    'notif_commented': 'comentou:',
    'notif_started_following': 'começou a seguir você',
    'profile_posts': 'Posts',
    'profile_followers': 'Seguidores',
    'profile_following': 'Seguindo',
    'profile_enemies': 'Inimigos',
    'profile_edit': 'Editar Perfil',
    'profile_share': 'Compartilhar Perfil',
    'profile_bio_placeholder': 'Adicione uma bio ao seu perfil...',
    'profile_tab_posts': 'Posts',
    'profile_tab_enemies': 'Inimigos',
    'profile_tab_following': 'Seguindo',
    'profile_no_posts': 'Ainda sem posts',
    'profile_no_enemies': 'Ainda sem inimigos jurados',
    'profile_no_following': 'Não segue ninguém ainda',
    'profile_marked_enemy': 'Inimigo Marcado',
    'profile_enemies_desc': 'Perfis que você marcar como inimigos aparecerão aqui.',
    'profile_following_desc': 'Siga sobreviventes do Hall da Fama para vê-los aqui.',
    'profile_unfollow': 'Parar de Seguir',
    'profile_legend': 'Lenda',
    'post_view_comments': 'Ver todos os comentários',
    'post_write_comment': 'Escreva um comentário...',
    'post_add_comment': 'Adicionar Comentário',
    'timer_rule': 'Regra',
    'theme_light': 'Claro',
    'theme_system': 'Sistema',
    'pers_title': '🔥 Rip It – Personalização (Estilo Gen Z)',
    'pers_subtitle': 'Rip It não é para todos os tamanhos.',
    'pers_desc': 'Seu perfil evolui conforme você sobrevive.',
    'pers_item1': 'Vibrações e temas personalizados',
    'pers_item2': 'Visuais baseados no modo (Pley, Pley cada um bate diferente)',
    'pers_item3': 'Títulos dinâmicos que mostram seu status',
    'pers_item4': 'Energia de seguidores que constrói sua presença',
    'pers_footer1': 'Quanto mais você joga, mais sua identidade muda.',
    'pers_footer2': 'Vença ou resete — seu legado ainda fala.',
    'pers_button': 'Entendi',
    'about_title': 'Sobre o Rip It',
    'about_tagline': 'Tagline: Sobreviva. Resete. Evolua.',
    'about_desc1': 'Rip It é uma plataforma de sobrevivência social de alto risco projetada para jogadores ousados. Compita em modos como Pley, Pley e Pley para testar sua estratégia, resiliência e habilidades sociais.',
    'about_pley_title': 'Pley',
    'about_pley_desc': 'Modo sobrevivência com eliminação de alto risco.',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': 'Modo extremo para quem ousa arriscar tudo.',
    'about_desc2': 'Rip It combina interação social, competição e personalização dinâmica para criar uma experiência única, viral e cheia de adrenalina.',
    'about_footer': 'Estamos aqui para fazer seu perfil, status e história de sobrevivência importarem—vença, resete ou evolua.',
    'about_close': 'Fechar',
    'contact_title': 'Contate-nos',
    'contact_desc': 'Tem dúvidas, feedback ou quer apenas nos contar sua história de sobrevivência? Entre em contato:',
    'contact_email_label': 'E-mail',
    'contact_email_or': 'ou',
    'contact_footer': 'Responderemos tão rápido quanto um timer do Pley em contagem regressiva.',
    'contact_close': 'Fechar',
    'model_title': '🔥 Rip It – Modelo do App',
    'model_concept_title': '1️⃣ Conceito Principal',
    'model_concept_desc': 'Rip It é um app de sobrevivência social de alto risco onde a participação do usuário, votação e estratégia determinam progressão, status e legado. Cada ação tem consequências, criando tensão e engajamento.',
    'model_modes_title': '2️⃣ Modos',
    'model_pley_title': 'Pley',
    'model_pley_item1': 'Focado em sobrevivência',
    'model_pley_item2': 'Apenas votos negativos importam',
    'model_pley_item3': 'Rodadas cronometradas (o usuário define a duração)',
    'model_pley_item4': 'Últimos usuários de pé ganham reconhecimento',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': 'Modo de sobrevivência extrema',
    'model_Pley_item2': 'Apenas votos negativos',
    'model_Pley_item3': 'Reset total se votado negativamente',
    'model_Pley_item4': 'Voluntário para quem busca emoções de alto risco',
    'model_pers_title': '3️⃣ Personalização (Não Específica de IP)',
    'model_pers_item1': 'Nome de exibição e tema de perfil personalizados',
    'model_pers_item2': 'Experiência visual baseada no modo',
    'model_pers_item3': 'Títulos e status dinâmicos',
    'model_pers_item4': 'Métricas de seguidores/engajamento',
    'model_close': 'Fechar',
    'priv_subtitle': 'Sua privacidade importa.',
    'priv_effective': 'Data de Vigência: 23/02/26',
    'priv_intro': 'Ao usar o Rip It, você concorda com a coleta e uso de informações conforme descrito abaixo.',
    'priv_s1_title': '1️⃣ Informações que Coletamos',
    'priv_s1_i1': 'Informações da conta: Nome de usuário, e-mail, dados do perfil e preferências.',
    'priv_s1_i2': 'Informações de jogo: Participação no modo, votos, timers, conquistas.',
    'priv_s1_i3': 'Informações do dispositivo: Endereço IP, tipo de dispositivo, SO e estatísticas de uso.',
    'priv_s1_i4': 'Informações opcionais: Links sociais ou conteúdo que você escolhe compartilhar.',
    'priv_s2_title': '2️⃣ Como Usamos Suas Informações',
    'priv_s2_i1': 'Para operar e melhorar os recursos e modos do Rip It.',
    'priv_s2_i2': 'Para personalizar sua experiência, incluindo temas de perfil e status.',
    'priv_s2_i3': 'Para detectar abusos, spam ou atividades inseguras.',
    'priv_s2_i4': 'Para comunicar atualizações, eventos ou mensagens de suporte.',
    'priv_s3_title': '3️⃣ Compartilhamento de Suas Informações',
    'priv_s3_i1': 'Não vendemos suas informações pessoais.',
    'priv_s3_i2': 'Alguns dados podem estar visíveis para outros usuários (como nomes de usuário, status e informações da classificação).',
    'priv_s3_i3': 'Podemos compartilhar dados com prestadores de serviços ou para conformidade legal.',
    'priv_s4_title': '4️⃣ Segurança',
    'priv_s4_i1': 'Usamos práticas padrão da indústria para proteger seus dados.',
    'priv_s4_i2': 'Nenhum sistema é perfeito — a participação acarreta riscos, especialmente em recursos públicos.',
    'priv_s5_title': '5️⃣ Suas Escolhas',
    'priv_s5_i1': 'Você pode atualizar ou excluir sua conta a qualquer momento.',
    'priv_s5_i2': 'Você pode controlar a visibilidade do seu perfil e atividade no app.',
    'priv_s5_i3': 'Você pode optar por não receber comunicações não essenciais.',
    'priv_s6_title': '6️⃣ Crianças',
    'priv_s6_i1': 'O Rip It não se destina a usuários menores de 13 anos.',
    'priv_s6_i2': 'Contas que pertençam a usuários menores de idade podem ser excluídas.',
    'priv_s7_title': '7️⃣ Alterações na Política de Privacidade',
    'priv_s7_i1': 'Atualizações podem ocorrer conforme o app evolui.',
    'priv_s7_i2': 'Alterações importantes serão anunciadas no app.',
    'terms_tagline': 'Tagline: Sobreviva. Resete. Evolua.',
    'terms_effective': 'Data de Vigência: 23/02/26',
    'terms_intro': 'Ao usar o Rip It, você concorda com estes Termos. Se você não concordar, por favor não use o app.',
    'terms_s1_title': '1. O que é o Rip It',
    'terms_s1_desc': 'Rip It é um app de sobrevivência social de alto risco onde os usuários participam de desafios cronometrados, votação pública e modos competitivos.',
    'terms_s1_list_title': 'Fornecemos ferramentas para:',
    'terms_s1_i1': 'Experiências de sobrevivência baseadas no modo (Pley, Pley)',
    'terms_s1_i2': 'Votação pública e reconhecimento',
    'terms_s1_i3': 'Personalização de perfil e rastreamento de status',
    'terms_s1_disclaimer': 'O Rip It não garante resultados, sobrevivência ou classificação.',
    'terms_s2_title': '2. Quem Pode Usar o Rip It',
    'terms_s2_i1': 'Ter pelo menos 13 anos de idade',
    'terms_s2_i2': 'Usar o app de forma legal e respeitosa',
    'terms_s2_i3': 'Fornecer informações precisas',
    'terms_s2_i4': 'Ser responsável por sua conta e atividade',
    'terms_s3_title': '3. Modos e Regras de Votação',
    'terms_s3_i1': 'Pley, Pley e Pley têm mecânicas únicas que afetam o status e a progressão do perfil.',
    'terms_s3_i2': 'Os votos podem afetar a progressão do usuário, reset de perfil ou restrições temporárias.',
    'terms_s3_i3': 'Timers, rodadas e resultados são determinados pelo app e usuários participantes.',
    'terms_s3_i4': 'Usuários participam por sua própria conta e risco.',
    'terms_s4_title': '4. Reputação, Status e Pontuações',
    'terms_s4_intro': 'Ao usar o Rip It, você entende que:',
    'terms_s4_i1': 'Status, títulos e reconhecimento refletem o desempenho no app e o histórico de sobrevivência',
    'terms_s4_i2': 'A votação pública afeta a progressão dentro dos modos',
    'terms_s4_i3': 'O Rip It não manipula resultados para favorecer nenhum usuário',
    'terms_s4_i4': 'Abuso, manipulação ou spam podem resultar em penalidades ou remoção',
    'terms_s5_title': '5. Conduta do Usuário',
    'terms_s5_intro': 'Você concorda em não:',
    'terms_s5_i1': 'Assediar, ameaçar ou intimidar os outros',
    'terms_s5_i2': 'Spamar ou manipular votos',
    'terms_s5_i3': 'Imitar outros usuários',
    'terms_s5_i4': 'Usar o Rip It para atividade ilegal',
    'terms_s5_footer': 'Violações podem resultar em suspensão, restrição ou remoção da conta.',
    'terms_s6_title': '6. Conteúdo e Dados do Usuário',
    'terms_s6_i1': 'Você mantém a propriedade do conteúdo que cria no app.',
    'terms_s6_i2': 'Você é responsável por suas submissões e comportamento.',
    'terms_s6_i3': 'O Rip It não é responsável por conteúdo gerado pelo usuário.',
    'terms_s6_i4': 'Podemos remover conteúdo que viole estes Termos ou que não seja seguro.',
    'terms_s7_title': '7. Suspensão, Reset e Terminamento da Conta',
    'terms_s7_i1': 'As contas podem ser suspensas, resetadas ou excluídas se os Termos forem violados ou se a plataforma for mal utilizada.',
    'terms_s7_i2': 'Certos modos podem resultar em resets de perfil como parte das mecânicas de jogo.',
    'terms_s7_i3': 'Você pode excluir sua conta a qualquer momento.',
    'terms_s8_title': '8. Isenção de Responsabilidade',
    'terms_s8_i1': 'O Rip It é fornecido "como está".',
    'terms_s8_i2': 'Não garantimos serviço ininterrupto.',
    'terms_s8_i3': 'Não somos responsáveis por resultados de usuários, resets de perfil ou perda de reconhecimento.',
    'terms_s8_i4': 'A participação é por sua própria conta e risco.',
    'terms_s9_title': '9. Alterações nestes Termos',
    'terms_s9_desc': 'Podemos atualizar estes Termos periodicamente. Alterações significativas serão comunicadas no app.',
    'terms_s10_title': '10. Contato',
    'terms_s10_desc': 'Perguntas ou preocupações?',
    'terms_s10_email': 'Email: ripit90210@gmail.com'
  },
  vi: {
    'settings': 'Cài đặt',
    'app': 'Ứng dụng',
    'language': 'Ngôn ngữ',
    'theme': 'Giao diện',
    'personalization': 'Cá nhân hóa',
    'about': 'Giới thiệu',
    'model': 'Mô hình',
    'terms': 'Điều khoản dịch vụ',
    'privacy': 'Chính sách bảo mật',
    'contact': 'Liên hệ',
    'logout': 'Đăng xuất',
    'cancel': 'Hủy',
    'nav_home': 'Trang chủ',
    'nav_search': 'imemo0',
    'nav_create': 'Tạo',
    'nav_notifications': 'Hoạt động',
    'nav_profile': 'Hồ sơ',
    'nav_chat': 'Tin nhắn',
    'home_following': 'Đang theo dõi',
    'home_for_you': 'Dành cho bạn',
    'home_live_challenge': 'Thử thách trực tiếp',
    'home_survivors': 'Người sống sót',
    'home_pass': 'Bỏ qua',
    'home_smash': 'Smash',
    'home_add_enemy': 'Thêm kẻ thù',
    'home_added_enemy': 'Đã thêm kẻ thù',
    'home_share': 'Chia sẻ',
    'home_remix': 'Remix',
    'home_made_it': 'Đã vượt qua',
    'home_pleyed': 'Đã chơi',
    'home_won': 'Đã thắng',
    'home_survived': 'Đã sống sót',
    'home_the_end': 'Kết thúc',
    'home_all_judged': 'Tất cả hồ sơ đã được đánh giá',
    'home_universal_complete': 'Hoàn thành lựa chọn chung',
    'home_winner_complete': 'Hoàn thành lựa chọn người thắng',
    'home_upload_modal_title': 'Bài viết mới',
    'home_upload_caption_placeholder': 'Viết chú thích...',
    'home_upload_cancel': 'Hủy',
    'home_upload_post': 'Đăng',
    'home_eliminated': 'Đã bị loại',
    'home_majority': 'Đa số',
    'home_choose_variant': 'Chọn biến thể',
    'home_set_duration': 'Đặt thời gian',
    'home_select_ranking': 'Chọn bảng xếp hạng',
    'home_select_rule': 'Chọn quy tắc',
    'home_current_choice': 'Lựa chọn hiện tại',
    'home_community_votes': 'Số phiếu cộng đồng',
    'home_selection_locked': 'Lựa chọn bị khóa cho đến khi hết thời gian',
    'home_submitted': 'Đã gửi',
    'home_invalid_ranking': 'Xếp hạng không hợp lệ',
    'home_submit': 'Gửi',
    'home_view_history': 'Xem lịch sử vòng chơi',
    'home_start_new': 'Hoặc bắt đầu vòng mới',
    'search_header_details': 'Chi tiết vòng chơi',
    'search_header_results': 'Kết quả vòng chơi',
    'search_header_hall': 'Đại lộ danh vọng',
    'search_header_history': 'Lịch sử vòng chơi',
    'search_top_survivors': 'Người sống sót hàng đầu',
    'search_recent_outcomes': 'Kết quả gần đây',
    'search_clear_history': 'Xóa tất cả lịch sử',
    'search_start_round': 'Bắt đầu vòng',
    'search_filter_type': 'Loại vòng:',
    'search_all_winners': 'Tất cả người thắng',
    'search_try_again': 'Thử lại',
    'search_total_termination': 'CHẤM DỨT HOÀN TOÀN',
    'search_no_winners': 'KHÔNG TÌM THẤY NGƯỜI THẮNG',
    'search_waiting': 'Đang chờ người thắng',
    'search_no_active': 'Không có vòng nào đang diễn ra',
    'search_waiting_desc': 'Vòng chơi đang diễn ra. Hãy chờ đợi kết quả.',
    'search_start_desc': 'Bắt đầu một vòng mới từ màn hình chính để xem những người sống sót tại đây.',
    'search_join_next': 'Tham gia nhiệm vụ tiếp theo',
    'create_new_post': 'Bài viết mới',
    'create_next': 'Tiếp theo',
    'create_camera': 'Máy ảnh',
    'create_gallery': 'Thư viện',
    'create_select_preview': 'Chọn phương tiện để xem trước',
    'create_caption_placeholder': 'Viết chú thích...',
    'notif_activity': 'Hoạt động',
    'notif_follow': 'Theo dõi',
    'notif_following': 'Đang theo dõi',
    'notif_upvoted': 'đã thích ảnh của bạn',
    'notif_commented': 'đã bình luận:',
    'notif_started_following': 'đã bắt đầu theo dõi bạn',
    'profile_posts': 'Bài viết',
    'profile_followers': 'Người theo dõi',
    'profile_following': 'Đang theo dõi',
    'profile_enemies': 'Kẻ thù',
    'profile_edit': 'Chỉnh sửa hồ sơ',
    'profile_share': 'Chia sẻ hồ sơ',
    'profile_bio_placeholder': 'Thêm tiểu sử vào hồ sơ của bạn...',
    'profile_tab_posts': 'Bài viết',
    'profile_tab_enemies': 'Kẻ thù',
    'profile_tab_following': 'Đang theo dõi',
    'profile_no_posts': 'Chưa có bài viết nào',
    'profile_no_enemies': 'Chưa có kẻ thù truyền kiếp nào',
    'profile_no_following': 'Chưa theo dõi ai',
    'profile_marked_enemy': 'Đã đánh dấu kẻ thù',
    'profile_enemies_desc': 'Các hồ sơ bạn đánh dấu là kẻ thù sẽ xuất hiện tại đây.',
    'profile_following_desc': 'Theo dõi những người sống sót từ Đại lộ danh vọng để xem họ tại đây.',
    'profile_unfollow': 'Bỏ theo dõi',
    'profile_legend': 'Huyền thoại',
    'post_view_comments': 'Xem tất cả bình luận',
    'post_write_comment': 'Viết bình luận...',
    'post_add_comment': 'Thêm bình luận',
    'timer_rule': 'Quy tắc',
    'theme_light': 'Sáng',
    'theme_system': 'Hệ thống',
    'pers_title': '🔥 Rip It – Cá nhân hóa (Phong cách Gen Z)',
    'pers_subtitle': 'Rip It không dành cho tất cả mọi người.',
    'pers_desc': 'Hồ sơ của bạn phát triển theo cách bạn sống sót.',
    'pers_item1': 'Cảm hứng & chủ đề tùy chỉnh',
    'pers_item2': 'Hình ảnh theo chế độ (Pley, Pley mỗi cái một vẻ)',
    'pers_item3': 'Danh hiệu năng động thể hiện vị thế của bạn',
    'pers_item4': 'Năng lượng từ người theo dõi xây dựng sự hiện diện của bạn',
    'pers_footer1': 'Bạn càng chơi nhiều, danh tính của bạn càng thay đổi.',
    'pers_footer2': 'Thắng hay đặt lại — di sản của bạn vẫn lên tiếng.',
    'pers_button': 'Đã hiểu',
    'about_title': 'Giới thiệu về Rip It',
    'about_tagline': 'Slogan: Sống sót. Đặt lại. Tiến hóa.',
    'about_desc1': 'Rip It là một nền tảng sống sót xã hội với rủi ro cao được thiết kế cho những người chơi táo bạo. Cạnh tranh trong các chế độ như Pley, Pley và Pley để kiểm tra chiến lược, khả năng phục hồi và kỹ năng xã hội của bạn.',
    'about_pley_title': 'Pley',
    'about_pley_desc': 'Chế độ sống sót với rủi ro bị loại cao.',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': 'Chế độ khắc nghiệt cho những ai dám mạo hiểm tất cả.',
    'about_desc2': 'Rip It kết hợp tương tác xã hội, cạnh tranh và cá nhân hóa năng động để tạo ra một trải nghiệm độc đáo, lan truyền và đầy kịch tính.',
    'about_footer': 'Chúng tôi ở đây để làm cho hồ sơ, vị thế và câu chuyện sống sót của bạn trở nên quan trọng—thắng, đặt lại hoặc tiến hóa.',
    'about_close': 'Đóng',
    'contact_title': 'Liên hệ với chúng tôi',
    'contact_desc': 'Có câu hỏi, phản hồi hoặc chỉ muốn kể cho chúng tôi câu chuyện sống sót của bạn? Hãy liên hệ:',
    'contact_email_label': 'Email',
    'contact_email_or': 'hoặc',
    'contact_footer': 'Chúng tôi sẽ phản hồi nhanh như bộ đếm thời gian Pley đang đếm ngược.',
    'contact_close': 'Đóng',
    'model_title': '🔥 Rip It – Mô hình ứng dụng',
    'model_concept_title': '1️⃣ Khái niệm cốt lõi',
    'model_concept_desc': 'Rip It là một ứng dụng sống sót xã hội với rủi ro cao, nơi sự tham gia của người dùng, bình chọn và chiến lược quyết định sự tiến bộ, vị thế và di sản. Mỗi hành động đều có hệ quả, tạo ra sự căng thẳng và gắn kết.',
    'model_modes_title': '2️⃣ Chế độ',
    'model_pley_title': 'Pley',
    'model_pley_item1': 'Tập trung vào sống sót',
    'model_pley_item2': 'Chỉ số phiếu bầu xuống mới quan trọng',
    'model_pley_item3': 'Các vòng chơi có thời gian (người dùng đặt thời lượng)',
    'model_pley_item4': 'Những người dùng cuối cùng trụ lại sẽ được công nhận',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': 'Chế độ sống sót khắc nghiệt',
    'model_Pley_item2': 'Chỉ bình chọn xuống',
    'model_Pley_item3': 'Đặt lại hoàn toàn nếu bị bình chọn xuống',
    'model_Pley_item4': 'Tự nguyện cho những người tìm kiếm cảm giác mạnh rủi ro cao',
    'model_pers_title': '3️⃣ Cá nhân hóa (Không theo IP cụ thể)',
    'model_pers_item1': 'Tên hiển thị & chủ đề hồ sơ tùy chỉnh',
    'model_pers_item2': 'Trải nghiệm hình ảnh theo chế độ',
    'model_pers_item3': 'Danh hiệu & vị thế năng động',
    'model_pers_item4': 'Chỉ số người theo dõi/tương tác',
    'model_close': 'Đóng',
    'priv_subtitle': 'Sự riêng tư của bạn rất quan trọng.',
    'priv_effective': 'Ngày có hiệu lực: 23/02/26',
    'priv_intro': 'Bằng việc sử dụng Rip It, bạn đồng ý với việc thu thập và sử dụng thông tin như mô tả dưới đây.',
    'priv_s1_title': '1️⃣ Thông tin chúng tôi thu thập',
    'priv_s1_i1': 'Thông tin tài khoản: Tên người dùng, email, dữ liệu hồ sơ và tùy chọn.',
    'priv_s1_i2': 'Thông tin trò chơi: Tham gia chế độ, bình chọn, bộ đếm thời gian, thành tựu.',
    'priv_s1_i3': 'Thông tin thiết bị: Địa chỉ IP, loại thiết bị, hệ điều hành và số liệu thống kê sử dụng.',
    'priv_s1_i4': 'Thông tin tùy chọn: Các liên kết mạng xã hội hoặc nội dung bạn chọn chia sẻ.',
    'priv_s2_title': '2️⃣ Cách chúng tôi sử dụng thông tin của bạn',
    'priv_s2_i1': 'Để vận hành và cải thiện các tính năng và chế độ của Rip It.',
    'priv_s2_i2': 'Để cá nhân hóa trải nghiệm của bạn, bao gồm chủ đề hồ sơ và vị thế.',
    'priv_s2_i3': 'Để phát hiện lạm dụng, thư rác hoặc hoạt động không an toàn.',
    'priv_s2_i4': 'Để thông báo về các bản cập nhật, sự kiện hoặc tin nhắn hỗ trợ.',
    'priv_s3_title': '3️⃣ Chia sẻ thông tin của bạn',
    'priv_s3_i1': 'Chúng tôi không bán thông tin cá nhân của bạn.',
    'priv_s3_i2': 'Một số dữ liệu có thể hiển thị với người dùng khác (như tên người dùng, vị thế và thông tin bảng xếp hạng).',
    'priv_s3_i3': 'Chúng tôi có thể chia sẻ dữ liệu với các nhà cung cấp dịch vụ hoặc để tuân thủ pháp luật.',
    'priv_s4_title': '4️⃣ Bảo mật',
    'priv_s4_i1': 'Chúng tôi sử dụng các biện pháp tiêu chuẩn ngành để bảo vệ dữ liệu của bạn.',
    'priv_s4_i2': 'Không có hệ thống nào là hoàn hảo — việc tham gia luôn đi kèm rủi ro, đặc biệt là trong các tính năng công khai.',
    'priv_s5_title': '5️⃣ Lựa chọn của bạn',
    'priv_s5_i1': 'Bạn có thể cập nhật hoặc xóa tài khoản của mình bất kỳ lúc nào.',
    'priv_s5_i2': 'Bạn có thể kiểm soát khả năng hiển thị của hồ sơ và hoạt động của mình trong ứng dụng.',
    'priv_s5_i3': 'Bạn có thể từ chối nhận các thông tin không thiết yếu.',
    'priv_s6_title': '6️⃣ Trẻ em',
    'priv_s6_i1': 'Rip It không dành cho người dùng dưới 13 tuổi.',
    'priv_s6_i2': 'Các tài khoản được xác định thuộc về người dùng chưa đủ tuổi có thể bị xóa.',
    'priv_s7_title': '7️⃣ Thay đổi Chính sách Bảo mật',
    'priv_s7_i1': 'Các bản cập nhật có thể xảy ra khi ứng dụng phát triển.',
    'priv_s7_i2': 'Các thay đổi lớn sẽ được thông báo trong ứng dụng.',
    'terms_tagline': 'Slogan: Sống sót. Đặt lại. Tiến hóa.',
    'terms_effective': 'Ngày có hiệu lực: 23/02/26',
    'terms_intro': 'Bằng việc sử dụng Rip It, bạn đồng ý với các Điều khoản này. Nếu bạn không đồng ý, vui lòng không sử dụng ứng dụng.',
    'terms_s1_title': '1. Rip It là gì',
    'terms_s1_desc': 'Rip It là một ứng dụng sống sót xã hội với rủi ro cao, nơi người dùng tham gia vào các thử thách có thời gian, bình chọn công khai và các chế độ cạnh tranh.',
    'terms_s1_list_title': 'Chúng tôi cung cấp các công cụ cho:',
    'terms_s1_i1': 'Trải nghiệm sống sót theo chế độ (Pley, Pley)',
    'terms_s1_i2': 'Bình chọn và công nhận công khai',
    'terms_s1_i3': 'Cá nhân hóa hồ sơ và theo dõi vị thế',
    'terms_s1_disclaimer': 'Rip It không đảm bảo kết quả, sự sống sót hay xếp hạng.',
    'terms_s2_title': '2. Ai có thể sử dụng Rip It',
    'terms_s2_i1': 'Ít nhất 13 tuổi',
    'terms_s2_i2': 'Sử dụng ứng dụng một cách hợp pháp và tôn trọng',
    'terms_s2_i3': 'Cung cấp thông tin chính xác',
    'terms_s2_i4': 'Chịu trách nhiệm về tài khoản và hoạt động của mình',
    'terms_s3_title': '3. Quy tắc chế độ & bình chọn',
    'terms_s3_i1': 'Pley, Pley và Pley có các cơ chế độc đáo ảnh hưởng đến vị thế và sự tiến triển của hồ sơ.',
    'terms_s3_i2': 'Phiếu bầu có thể ảnh hưởng đến sự tiến triển của người dùng, đặt lại hồ sơ hoặc các hạn chế tạm thời.',
    'terms_s3_i3': 'Bộ đếm thời gian, vòng chơi và kết quả được quyết định bởi ứng dụng và người dùng tham gia.',
    'terms_s3_i4': 'Người dùng tham gia theo quyết định của riêng mình.',
    'terms_s4_title': '4. Danh tiếng, Vị thế & Điểm số',
    'terms_s4_intro': 'Bằng việc sử dụng Rip It, bạn hiểu rằng:',
    'terms_s4_i1': 'Vị thế, danh hiệu và sự công nhận phản ánh hiệu suất trong ứng dụng và lịch sử sống sót',
    'terms_s4_i2': 'Bình chọn công khai ảnh hưởng đến sự tiến triển trong các chế độ',
    'terms_s4_i3': 'Rip It không thao túng kết quả để ủng hộ bất kỳ người dùng nào',
    'terms_s4_i4': 'Lạm dụng, thao túng hoặc gửi thư rác có thể dẫn đến hình phạt hoặc bị loại bỏ',
    'terms_s5_title': '5. Hành vi người dùng',
    'terms_s5_intro': 'Bạn đồng ý không:',
    'terms_s5_i1': 'Quấy rối, đe dọa hoặc bắt nạt người khác',
    'terms_s5_i2': 'Gửi thư rác hoặc thao túng phiếu bầu',
    'terms_s5_i3': 'Mạo danh người dùng khác',
    'terms_s5_i4': 'Sử dụng Rip It cho hoạt động bất hợp pháp',
    'terms_s5_footer': 'Các vi phạm có thể dẫn đến đình chỉ, hạn chế hoặc xóa tài khoản.',
    'terms_s6_title': '6. Nội dung & Dữ liệu người dùng',
    'terms_s6_i1': 'Bạn giữ quyền sở hữu nội dung bạn tạo trong ứng dụng.',
    'terms_s6_i2': 'Bạn chịu trách nhiệm về những gì mình gửi và hành vi của mình.',
    'terms_s6_i3': 'Rip It không chịu trách nhiệm về nội dung do người dùng tạo ra.',
    'terms_s6_i4': 'Chúng tôi có thể xóa nội dung vi phạm các Điều khoản này hoặc không an toàn.',
    'terms_s7_title': '7. Đình chỉ, Đặt lại & Chấm dứt tài khoản',
    'terms_s7_i1': 'Tài khoản có thể bị đình chỉ, đặt lại hoặc xóa nếu Điều khoản bị vi phạm hoặc nền tảng bị lạm dụng.',
    'terms_s7_i2': 'Một số chế độ có thể dẫn đến việc đặt lại hồ sơ như một phần của cơ chế trò chơi.',
    'terms_s7_i3': 'Bạn có thể xóa tài khoản của mình bất kỳ lúc nào.',
    'terms_s8_title': '8. Tuyên bố từ chối trách nhiệm',
    'terms_s8_i1': 'Rip It được cung cấp "nguyên trạng".',
    'terms_s8_i2': 'Chúng tôi không đảm bảo dịch vụ không bị gián đoạn.',
    'terms_s8_i3': 'Chúng tôi không chịu trách nhiệm về kết quả của người dùng, việc đặt lại hồ sơ hoặc mất sự công nhận.',
    'terms_s8_i4': 'Việc tham gia là theo quyết định của riêng bạn.',
    'terms_s9_title': '9. Thay đổi các Điều khoản này',
    'terms_s9_desc': 'Chúng tôi có thể cập nhật các Điều khoản này định kỳ. Các thay đổi quan trọng sẽ được thông báo trong ứng dụng.',
    'terms_s10_title': '10. Liên hệ',
    'terms_s10_desc': 'Câu hỏi hoặc thắc mắc?',
    'terms_s10_email': 'Email: ripit90210@gmail.com'
  },
  th: {
    'settings': 'การตั้งค่า',
    'app': 'แอป',
    'language': 'ภาษา',
    'theme': 'ธีม',
    'personalization': 'การปรับแต่งเฉพาะตัว',
    'about': 'เกี่ยวกับ',
    'model': 'โมเดล',
    'terms': 'ข้อกำหนดการให้บริการ',
    'privacy': 'นโยบายความเป็นส่วนตัว',
    'contact': 'ติดต่อเรา',
    'logout': 'ออกจากระบบ',
    'cancel': 'ยกเลิก',
    'nav_home': 'หน้าแรก',
    'nav_search': 'imemo0',
    'nav_create': 'สร้าง',
    'nav_notifications': 'กิจกรรม',
    'nav_profile': 'โปรไฟล์',
    'nav_chat': 'ข้อความ',
    'home_following': 'กำลังติดตาม',
    'home_for_you': 'สำหรับคุณ',
    'home_live_challenge': 'ชาเลนจ์สด',
    'home_survivors': 'ผู้รอดชีวิต',
    'home_pass': 'ผ่าน',
    'home_smash': 'สแมช',
    'home_add_enemy': 'เพิ่มศัตรู',
    'home_added_enemy': 'เพิ่มศัตรูแล้ว',
    'home_share': 'แชร์',
    'home_remix': 'รีมิกซ์',
    'home_made_it': 'ทำได้แล้ว',
    'home_pleyed': 'เล่นแล้ว',
    'home_won': 'ชนะ',
    'home_survived': 'รอดชีวิต',
    'home_the_end': 'จุดจบ',
    'home_all_judged': 'โปรไฟล์ทั้งหมดได้รับการตัดสินแล้ว',
    'home_universal_complete': 'การเลือกแบบสากลเสร็จสมบูรณ์',
    'home_winner_complete': 'การเลือกผู้ชนะเสร็จสมบูรณ์',
    'home_upload_modal_title': 'โพสต์ใหม่',
    'home_upload_caption_placeholder': 'เขียนคำบรรยาย...',
    'home_upload_cancel': 'ยกเลิก',
    'home_upload_post': 'โพสต์',
    'home_eliminated': 'ถูกคัดออก',
    'home_majority': 'เสียงส่วนใหญ่',
    'home_choose_variant': 'เลือกตัวแปร',
    'home_set_duration': 'ตั้งระยะเวลา',
    'home_select_ranking': 'เลือกอันดับสูงสุด',
    'home_select_rule': 'เลือกกฎ',
    'home_current_choice': 'ตัวเลือกปัจจุบัน',
    'home_community_votes': 'คะแนนโหวตจากชุมชน',
    'home_selection_locked': 'การเลือกถูกล็อคจนกว่าตัวจับเวลาจะสิ้นสุด',
    'home_submitted': 'ส่งแล้ว',
    'home_invalid_ranking': 'อันดับไม่ถูกต้อง',
    'home_submit': 'ส่ง',
    'home_view_history': 'ดูประวัติรอบ',
    'home_start_new': 'หรือเริ่มรอบใหม่',
    'search_header_details': 'รายละเอียดรอบ',
    'search_header_results': 'ผลลัพธ์รอบ',
    'search_header_hall': 'หอเกียรติยศ',
    'search_header_history': 'ประวัติรอบ',
    'search_top_survivors': 'ผู้รอดชีวิตชั้นนำ',
    'search_recent_outcomes': 'ผลลัพธ์ล่าสุด',
    'search_clear_history': 'ล้างประวัติทั้งหมด',
    'search_start_round': 'เริ่มรอบ',
    'search_filter_type': 'ประเภทของรอบ:',
    'search_all_winners': 'ผู้ชนะทั้งหมด',
    'search_try_again': 'ลองอีกครั้ง',
    'search_total_termination': 'การยุติทั้งหมด',
    'search_no_winners': 'ไม่พบผู้ชนะ',
    'search_waiting': 'กำลังรอผู้ชนะ',
    'search_no_active': 'ไม่มีรอบที่กำลังดำเนินอยู่',
    'search_waiting_desc': 'รอบกำลังดำเนินอยู่ โปรดติดตามผลลัพธ์',
    'search_start_desc': 'เริ่มรอบใหม่จากหน้าหลักเพื่อดูผู้รอดชีวิตที่นี่',
    'search_join_next': 'เข้าร่วมภารกิจถัดไป',
    'create_new_post': 'โพสต์ใหม่',
    'create_next': 'ถัดไป',
    'create_camera': 'กล้อง',
    'create_gallery': 'แกลเลอรี',
    'create_select_preview': 'เลือกสื่อเพื่อดูตัวอย่าง',
    'create_caption_placeholder': 'เขียนคำบรรยาย...',
    'notif_activity': 'กิจกรรม',
    'notif_follow': 'ติดตาม',
    'notif_following': 'กำลังติดตาม',
    'notif_upvoted': 'โหวตให้รูปภาพของคุณ',
    'notif_commented': 'แสดงความคิดเห็น:',
    'notif_started_following': 'เริ่มติดตามคุณ',
    'profile_posts': 'โพสต์',
    'profile_followers': 'ผู้ติดตาม',
    'profile_following': 'กำลังติดตาม',
    'profile_enemies': 'ศัตรู',
    'profile_edit': 'แก้ไขโปรไฟล์',
    'profile_share': 'แชร์โปรไฟล์',
    'profile_bio_placeholder': 'เพิ่มคำอธิบายในโปรไฟล์ของคุณ...',
    'profile_tab_posts': 'โพสต์',
    'profile_tab_enemies': 'ศัตรู',
    'profile_tab_following': 'กำลังติดตาม',
    'profile_no_posts': 'ยังไม่มีโพสต์',
    'profile_no_enemies': 'ยังไม่มีศัตรูคู่อาฆาต',
    'profile_no_following': 'ยังไม่ได้ติดตามใคร',
    'profile_marked_enemy': 'ทำเครื่องหมายศัตรูแล้ว',
    'profile_enemies_desc': 'โปรไฟล์ที่คุณทำเครื่องหมายว่าเป็นศัตรูจะปรากฏที่นี่',
    'profile_following_desc': 'ติดตามผู้รอดชีวิตจากหอเกียรtiยศเพื่อดูพวกเขาที่นี่',
    'profile_unfollow': 'เลิกติดตาม',
    'profile_legend': 'ตำนาน',
    'post_view_comments': 'ดูความคิดเห็นทั้งหมด',
    'post_write_comment': 'เขียนความคิดเห็น...',
    'post_add_comment': 'เพิ่มความคิดเห็น',
    'timer_rule': 'กฎ',
    'theme_light': 'สว่าง',
    'theme_system': 'ระบบ',
    'pers_title': '🔥 Rip It – การปรับแต่ง (สไตล์ Gen Z)',
    'pers_subtitle': 'Rip It ไม่ใช่แอปที่เหมือนกันสำหรับทุกคน',
    'pers_desc': 'โปรไฟล์ของคุณจะพัฒนาไปตามวิธีที่คุณอยู่รอด',
    'pers_item1': 'บรรยากาศและธีมที่กำหนดเอง',
    'pers_item2': 'ภาพตามโหมด (Pley, Pley ให้ความรู้สึกที่แตกต่างกัน)',
    'pers_item3': 'ชื่อเรื่องแบบไดนามิกที่อวดสถานะของคุณ',
    'pers_item4': 'พลังจากผู้ติดตามที่สร้างตัวตนของคุณ',
    'pers_footer1': 'ยิ่งคุณเล่นมากเท่าไหร่ ตัวตนของคุณก็จะยิ่งเปลี่ยนไปมากเท่านั้น',
    'pers_footer2': 'ชนะหรือรีเซ็ต — มรดกของคุณยังคงอยู่',
    'pers_button': 'รับทราบ',
    'about_title': 'เกี่ยวกับ Rip It',
    'about_tagline': 'สโลแกน: อยู่รอด. รีเซ็ต. พัฒนา.',
    'about_desc1': 'Rip It เป็นแพลตฟอร์มการเอาชีวิตรอดทางสังคมที่มีความเสี่ยงสูง ออกแบบมาสำหรับผู้เล่นที่กล้าหาญ แข่งขันในโหมดต่างๆ เช่น Pley, Pley และ Pley เพื่อทดสอบกลยุทธ์ ความยืดหยุ่น และทักษะทางสังคมของคุณ',
    'about_pley_title': 'Pley',
    'about_pley_desc': 'โหมดเอาชีวิตรอดที่มีความเสี่ยงสูงที่จะถูกคัดออก',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': 'โหมดสุดขีดสำหรับผู้ที่กล้าเสี่ยงทุกอย่าง',
    'about_desc2': 'Rip It ผสมผสานการมีปฏิสัมพันธ์ทางสังคม การแข่งขัน และการปรับแต่งส่วนบุคคลแบบไดนามิก เพื่อสร้างประสบการณ์ที่ไม่เหมือนใคร เป็นไวรัล และตื่นเต้นเร้าใจ',
    'about_footer': 'เราอยู่ที่นี่เพื่อให้โปรไฟล์ สถานะ และเรื่องราวการเอาชีวิตรอดของคุณมีความสำคัญ—ชนะ รีเซ็ต หรือพัฒนา',
    'about_close': 'ปิด',
    'contact_title': 'ติดต่อเรา',
    'contact_desc': 'มีคำถาม ข้อเสนอแนะ หรือเพียงแค่ต้องการบอกเล่าเรื่องราวการเอาชีวิตรอดของคุณ? ติดต่อเรา:',
    'contact_email_label': 'อีเมล',
    'contact_email_or': 'หรือ',
    'contact_footer': 'เราจะตอบกลับคุณอย่างรวดเร็วเหมือนตัวจับเวลา Pley ที่กำลังนับถอยหลัง',
    'contact_close': 'ปิด',
    'model_title': '🔥 Rip It – โมเดลแอป',
    'model_concept_title': '1️⃣ แนวคิดหลัก',
    'model_concept_desc': 'Rip It เป็นแอปเอาชีวิตรอดทางสังคมที่มีความเสี่ยงสูง ซึ่งการมีส่วนร่วมของผู้ใช้ การโหวต และกลยุทธ์จะเป็นตัวกำหนดความก้าวหน้า สถานะ และมรดก ทุกการกระทำมีผลตามมา สร้างความตื่นเต้นและการมีส่วนร่วม',
    'model_modes_title': '2️⃣ โหมด',
    'model_pley_title': 'Pley',
    'model_pley_item1': 'เน้นการเอาชีวิตรอด',
    'model_pley_item2': 'เฉพาะคะแนนโหวตลงเท่านั้นที่สำคัญ',
    'model_pley_item3': 'รอบเวลาที่กำหนด (ผู้ใช้กำหนดระยะเวลา)',
    'model_pley_item4': 'ผู้ใช้ที่ยืนหยัดเป็นคนสุดท้ายจะได้รับการยอมรับ',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': 'โหมดเอาชีวิตรอดสุดขีด',
    'model_Pley_item2': 'โหวตลงเท่านั้น',
    'model_Pley_item3': 'รีเซ็ตทั้งหมดหากถูกโหวตลง',
    'model_Pley_item4': 'สมัครใจสำหรับผู้ที่แสวงหาความตื่นเต้นที่มีความเสี่ยงสูง',
    'model_pers_title': '3️⃣ การปรับแต่ง (ไม่เฉพาะเจาะจง IP)',
    'model_pers_item1': 'ชื่อที่แสดงและธีมโปรไฟล์ที่กำหนดเอง',
    'model_pers_item2': 'ประสบการณ์ภาพตามโหมด',
    'model_pers_item3': 'ชื่อเรื่องและสถานะแบบไดนามิก',
    'model_pers_item4': 'ตัวชี้วัดผู้ติดตาม/การมีส่วนร่วม',
    'model_close': 'ปิด',
    'priv_subtitle': 'ความเป็นส่วนตัวของคุณเป็นสิ่งสำคัญ',
    'priv_effective': 'วันที่มีผลบังคับใช้: 23/02/26',
    'priv_intro': 'ในการใช้ Rip It คุณตกลงที่จะให้รวบรวมและใช้ข้อมูลตามที่อธิบายไว้ด้านล่าง',
    'priv_s1_title': '1️⃣ ข้อมูลที่เรารวบรวม',
    'priv_s1_i1': 'ข้อมูลบัญชี: ชื่อผู้ใช้ อีเมล ข้อมูลโปรไฟล์ และความชอบ',
    'priv_s1_i2': 'ข้อมูลการเล่นเกม: การมีส่วนร่วมในโหมด การโหวต ตัวจับเวลา ความสำเร็จ',
    'priv_s1_i3': 'ข้อมูลอุปกรณ์: ที่อยู่ IP ประเภทอุปกรณ์ ระบบปฏิบัติการ และสถิติการใช้งาน',
    'priv_s1_i4': 'ข้อมูลเพิ่มเติม: ลิงก์โซเชียลหรือเนื้อหาที่คุณเลือกแชร์',
    'priv_s2_title': '2️⃣ วิธีที่เราใช้ข้อมูลของคุณ',
    'priv_s2_i1': 'เพื่อดำเนินการและปรับปรุงคุณสมบัติและโหมดของ Rip It',
    'priv_s2_i2': 'เพื่อปรับแต่งประสบการณ์ของคุณ รวมถึงธีมโปรไฟล์และสถานะ',
    'priv_s2_i3': 'เพื่อตรวจจับการละเมิด สแปม หรือกิจกรรมที่ไม่ปลอดภัย',
    'priv_s2_i4': 'เพื่อสื่อสารการอัปเดต กิจกรรม หรือข้อความช่วยเหลือ',
    'priv_s3_title': '3️⃣ การแชร์ข้อมูลของคุณ',
    'priv_s3_i1': 'เราไม่ขายข้อมูลส่วนบุคคลของคุณ',
    'priv_s3_i2': 'ข้อมูลบางอย่างอาจมองเห็นได้โดยผู้ใช้อื่น (เช่น ชื่อผู้ใช้ สถานะ และข้อมูลกระดานผู้นำ)',
    'priv_s3_i3': 'เราอาจแชร์ข้อมูลกับผู้ให้บริการหรือเพื่อการปฏิบัติตามกฎหมาย',
    'priv_s4_title': '4️⃣ ความปลอดภัย',
    'priv_s4_i1': 'เราใช้แนวทางมาตรฐานอุตสาหกรรมเพื่อปกป้องข้อมูลของคุณ',
    'priv_s4_i2': 'ไม่มีระบบใดที่สมบูรณ์แบบ — การมีส่วนร่วมมีความเสี่ยง โดยเฉพาะในคุณลักษณะสาธารณะ',
    'priv_s5_title': '5️⃣ ทางเลือกของคุณ',
    'priv_s5_i1': 'คุณสามารถอัปเดตหรือลบบัญชีของคุณได้ตลอดเวลา',
    'priv_s5_i2': 'คุณสามารถควบคุมการมองเห็นโปรไฟล์และกิจกรรมของคุณในแอปได้',
    'priv_s5_i3': 'คุณสามารถเลือกไม่รับการสื่อสารที่ไม่จำเป็นได้',
    'priv_s6_title': '6️⃣ เด็ก',
    'priv_s6_i1': 'Rip It ไม่ได้มีไว้สำหรับผู้ใช้ที่อายุต่ำกว่า 13 ปี',
    'priv_s6_i2': 'บัญชีที่พบว่าเป็นของผู้ใช้ที่อายุไม่ถึงเกณฑ์อาจถูกลบ',
    'priv_s7_title': '7️⃣ การเปลี่ยนแปลงนโยบายความเป็นส่วนตัว',
    'priv_s7_i1': 'อาจมีการอัปเดตเมื่อแอปพัฒนาขึ้น',
    'priv_s7_i2': 'การเปลี่ยนแปลงสำคัญจะได้รับการประกาศภายในแอป',
    'terms_tagline': 'สโลแกน: อยู่รอด. รีเซ็ต. พัฒนา.',
    'terms_effective': 'วันที่มีผลบังคับใช้: 23/02/26',
    'terms_intro': 'ในการใช้ Rip It คุณตกลงตามข้อกำหนดเหล่านี้ หากคุณไม่ตกลง โปรดอย่าใช้แอป',
    'terms_s1_title': '1. Rip It คืออะไร',
    'terms_s1_desc': 'Rip It เป็นแอปเอาชีวิตรอดทางสังคมที่มีความเสี่ยงสูง ซึ่งผู้ใช้จะมีส่วนร่วมในชาเลนจ์ที่มีกำหนดเวลา การโหวตสาธารณะ และโหมดการแข่งขัน',
    'terms_s1_list_title': 'เรามีเครื่องมือสำหรับ:',
    'terms_s1_i1': 'ประสบการณ์การเอาชีวิตรอดตามโหมด (Pley, Pley)',
    'terms_s1_i2': 'การโหวตสาธารณะและการได้รับการยอมรับ',
    'terms_s1_i3': 'การปรับแต่งโปรไฟล์และการติดตามสถานะ',
    'terms_s1_disclaimer': 'Rip It ไม่รับประกันผลลัพธ์ การเอาชีวิตรอด หรืออันดับ',
    'terms_s2_title': '2. ใครสามารถใช้ Rip It ได้บ้าง',
    'terms_s2_i1': 'มีอายุอย่างน้อย 13 ปี',
    'terms_s2_i2': 'ใช้แอปอย่างถูกกฎหมายและเคารพผู้อื่น',
    'terms_s2_i3': 'ให้ข้อมูลที่ถูกต้อง',
    'terms_s2_i4': 'รับผิดชอบต่อบัญชีและกิจกรรมของคุณ',
    'terms_s3_title': '3. กฎของโหมดและการโหวต',
    'terms_s3_i1': 'Pley, Pley และ Pley มีกลไกเฉพาะตัวที่ส่งผลต่อสถานะโปรไฟล์และความก้าวหน้า',
    'terms_s3_i2': 'คะแนนโหวตอาจส่งผลต่อความก้าวหน้าของผู้ใช้ การรีเซ็ตโปรไฟล์ หรือข้อจำกัดชั่วคราว',
    'terms_s3_i3': 'ตัวจับเวลา รอบ และผลลัพธ์จะถูกกำหนดโดยแอปและผู้ใช้ที่เข้าร่วม',
    'terms_s3_i4': 'ผู้ใช้เข้าร่วมตามดุลยพินิจของตนเอง',
    'terms_s4_title': '4. ชื่อเสียง สถานะ และคะแนน',
    'terms_s4_intro': 'ในการใช้ Rip It คุณเข้าใจว่า:',
    'terms_s4_i1': 'สถานะ ชื่อเรื่อง และการได้รับการยอมรับสะท้อนถึงประสิทธิภาพในแอปและประวัติการเอาชีวิตรอด',
    'terms_s4_i2': 'การโหวตสาธารณะส่งผลต่อความก้าวหน้าภายในโหมด',
    'terms_s4_i3': 'Rip It ไม่ได้ปรับแต่งผลลัพธ์เพื่อเอื้อประโยชน์แก่ผู้ใช้รายใด',
    'terms_s4_i4': 'การละเมิด การปรับแต่ง หรือสแปมอาจส่งผลให้ถูกลงโทษหรือถูกลบออก',
    'terms_s5_title': '5. การปฏิบัติตนของผู้ใช้',
    'terms_s5_intro': 'คุณตกลงที่จะไม่:',
    'terms_s5_i1': 'คุกคาม ข่มขู่ หรือกลั่นแกล้งผู้อื่น',
    'terms_s5_i2': 'ส่งสแปมหรือปรับแต่งคะแนนโหวต',
    'terms_s5_i3': 'แอบอ้างเป็นผู้ใช้อื่น',
    'terms_s5_i4': 'ใช้ Rip It เพื่อกิจกรรมที่ผิดกฎหมาย',
    'terms_s5_footer': 'การละเมิดอาจส่งผลให้ถูกระงับ จำกัด หรือลบบัญชี',
    'terms_s6_title': '6. เนื้อหาและข้อมูลผู้ใช้',
    'terms_s6_i1': 'คุณยังคงเป็นเจ้าของเนื้อหาที่คุณสร้างในแอป',
    'terms_s6_i2': 'คุณต้องรับผิดชอบต่อสิ่งที่คุณส่งและพฤติกรรมของคุณ',
    'terms_s6_i3': 'Rip It ไม่รับผิดชอบต่อเนื้อหาที่ผู้ใช้สร้างขึ้น',
    'terms_s6_i4': 'เราอาจลบเนื้อหาที่ละเมิดข้อกำหนดเหล่านี้หรือไม่ปลอดภัย',
    'terms_s7_title': '7. การระงับ การรีเซ็ต และการยกเลิกบัญชี',
    'terms_s7_i1': 'บัญชีอาจถูกระงับ รีเซ็ต หรือลบออกหากมีการละเมิดข้อกำหนดหรือมีการใช้แพลตฟอร์มในทางที่ผิด',
    'terms_s7_i2': 'บางโหมดอาจส่งผลให้มีการรีเซ็ตโปรไฟล์ซึ่งเป็นส่วนหนึ่งของกลไกเกม',
    'terms_s7_i3': 'คุณสามารถลบบัญชีของคุณได้ตลอดเวลา',
    'terms_s8_title': '8. การปฏิเสธความรับผิดชอบ',
    'terms_s8_i1': 'Rip It ให้บริการตามสภาพ "ที่เป็นอยู่"',
    'terms_s8_i2': 'เราไม่รับประกันการให้บริการอย่างต่อเนื่อง',
    'terms_s8_i3': 'เราไม่รับผิดชอบต่อผลลัพธ์ของผู้ใช้ การรีเซ็ตโปรไฟล์ หรือการสูญเสียการได้รับการยอมรับ',
    'terms_s8_i4': 'การเข้าร่วมเป็นไปตามดุลยพินิจของคุณเอง',
    'terms_s9_title': '9. การเปลี่ยนแปลงข้อกำหนดเหล่านี้',
    'terms_s9_desc': 'เราอาจอัปเดตข้อกำหนดเหล่านี้เป็นระยะ การเปลี่ยนแปลงสำคัญจะได้รับการแจ้งเตือนภายในแอป',
    'terms_s10_title': '10. ติดต่อ',
    'terms_s10_desc': 'คำถามหรือข้อสงสัย?',
    'terms_s10_email': 'Email: ripit90210@gmail.com'
  },
  ar: {
    // Settings
    'settings': 'الإعدادات',
    'app': 'التطبيق',
    'language': 'اللغة',
    'theme': 'المظهر',
    'personalization': 'التخصيص',
    'about': 'حول',
    'model': 'النموذج',
    'terms': 'شروط الخدمة',
    'privacy': 'سياسة الخصوصية',
    'contact': 'اتصل بنا',
    'logout': 'تسجيل الخروج',
    'cancel': 'إلغاء',

    // BottomNav
    'nav_home': 'الرئيسية',
    'nav_search': 'imemo0',
    'nav_create': 'إنشاء',
    'nav_notifications': 'النشاط',
    'nav_profile': 'الملف الشخصي',

    // Home
    'home_following': 'أتابعهم',
    'home_for_you': 'لك',
    'home_live_challenge': 'تحدي مباشر',
    'home_survivors': 'الناجون',
    'home_pass': 'تجاوز',
    'home_smash': 'تحطيم',
    'home_add_enemy': 'إضافة عدو',
    'home_added_enemy': 'تمت إضافة العدو',
    'home_share': 'مشاركة',
    'home_remix': 'ريمكس',
    'home_made_it': 'نجح',
    'home_pleyed': 'لعب',
    'home_won': 'فاز',
    'home_survived': 'نجا',
    'home_the_end': 'النهاية',
    'home_all_judged': 'تم الحكم على جميع الملفات الشخصية',
    'home_universal_complete': 'اكتمل الاختيار الشامل',
    'home_winner_complete': 'اكتمل اختيار الفائز',
    'home_upload_modal_title': 'منشور جديد',
    'home_upload_caption_placeholder': 'اكتب تعليقاً...',
    'home_upload_cancel': 'إلغاء',
    'home_upload_post': 'نشر',
    'home_eliminated': 'تم استبعاده',
    'home_majority': 'الأغلبية',
    'home_choose_variant': 'اختر المتغير',
    'home_set_duration': 'تعيين المدة',
    'home_select_ranking': 'تحديد أعلى تصنيف',
    'home_select_rule': 'تحديد القاعدة',
    'home_current_choice': 'الاختيار الحالي',
    'home_community_votes': 'تصويت المجتمع',
    'home_selection_locked': 'الاختيار مقفل حتى ينتهي المؤقت',
    'home_submitted': 'تم الإرسال',
    'home_invalid_ranking': 'تصنيف غير صالح',
    'home_submit': 'إرسال',
    'home_view_history': 'عرض سجل الجولات',
    'home_start_new': 'أو ابدأ جولة جديدة',

    // Search
    'search_header_details': 'تفاصيل الجولة',
    'search_header_results': 'نتائج الجولة',
    'search_header_hall': 'قاعة المشاهير',
    'search_header_history': 'سجل الجولات',
    'search_top_survivors': 'أفضل الناجين',
    'search_recent_outcomes': 'النتائج الأخيرة',
    'search_clear_history': 'مسح السجل',
    'search_start_round': 'بدء جولة',
    'search_filter_type': 'نوع الجولة:',
    'search_all_winners': 'كل الفائزين',
    'search_try_again': 'حاول مرة أخرى',
    'search_total_termination': 'إبادة كاملة',
    'search_no_winners': 'لم يتم العثور على فائزين',
    'search_waiting': 'في انتظار فائز',
    'search_no_active': 'لا توجد جولة نشطة',
    'search_waiting_desc': 'الجولة قيد التقدم حاليًا. ترقب النتائج.',
    'search_start_desc': 'ابدأ جولة جديدة من الشاشة الرئيسية لرؤية الناجين هنا.',
    'search_join_next': 'انضم إلى المهمة التالية',

    // CreatePost
    'create_new_post': 'منشور جديد',
    'create_next': 'التالي',
    'create_camera': 'كاميرا',
    'create_gallery': 'معرض الصور',
    'create_select_preview': 'اختر وسائط للمعاينة',
    'create_caption_placeholder': 'اكتب تعليقاً...',

    // Notifications
    'notif_activity': 'النشاط',
    'notif_follow': 'متابعة',
    'notif_following': 'أتابع',
    'notif_upvoted': 'أعجب بصورتك',
    'notif_commented': 'علق:',
    'notif_started_following': 'بدأ بمتابعتك',

    // Profile
    'profile_posts': 'المنشورات',
    'profile_followers': 'المتابعون',
    'profile_following': 'أتابعهم',
    'profile_enemies': 'الأعداء',
    'profile_edit': 'تعديل الملف الشخصي',
    'profile_share': 'مشاركة الملف الشخصي',
    'profile_bio_placeholder': 'أضف سيرة ذاتية لملفك الشخصي...',
    'profile_tab_posts': 'المنشورات',
    'profile_tab_enemies': 'الأعداء',
    'profile_tab_following': 'أتابعهم',
    'profile_no_posts': 'لا توجد منشورات بعد',
    'profile_no_enemies': 'لا يوجد أعداء لدودين بعد',
    'profile_no_following': 'لا تتابع أحداً بعد',
    'profile_marked_enemy': 'تم تمييزه كعدو',
    'profile_enemies_desc': 'الملفات الشخصية التي تميزها كأعداء ستظهر هنا.',
    'profile_following_desc': 'تابع الناجين من قاعة المشاهير لرؤيتهم هنا.',
    'profile_unfollow': 'إلغاء المتابعة',
    'profile_legend': 'أسطورة',
    'post_view_comments': 'عرض كل التعليقات',
    'post_write_comment': 'اكتب تعليقاً...',
    'post_add_comment': 'إضافة تعليق',
    'timer_rule': 'قاعدة',
    'theme_light': 'فاتح',
    'theme_system': 'النظام',

    // Personalization Modal
    'pers_title': '🔥 Rip It – التخصيص (أسلوب الجيل Z)',
    'pers_subtitle': 'Rip It ليس مقاساً واحداً يناسب الجميع.',
    'pers_desc': 'يتطور ملفك الشخصي مع الطريقة التي تنجو بها.',
    'pers_item1': 'أجواء وثيمات مخصصة',
    'pers_item2': 'مرئيات قائمة على الوضع (Pley، Pley، Pley كل منها له طابع مختلف)',
    'pers_item3': 'ألقاب ديناميكية تبرز مكانتك',
    'pers_item4': 'طاقة المتابعين التي تبني حضورك',
    'pers_footer1': 'كلما لعبت أكثر، تغيرت هويتك أكثر.',
    'pers_footer2': 'سواء فزت أو أعدت الضبط — سيظل إرثك يتحدث.',
    'pers_button': 'فهمت',

    // About Modal
    'about_title': 'حول Rip It',
    'about_tagline': 'الشعار: انجُ. أعد الضبط. تطور.',
    'about_desc1': 'Rip It هي منصة تواصل اجتماعي للبقاء على قيد الحياة ذات مخاطر عالية مصممة للاعبين الجريئين. تنافس في أوضاع مثل Pley و Pley و Pley لاختبار استراتيجيتك ومرونتك ومهاراتك الاجتماعية.',
    'about_pley_title': 'Pley',
    'about_pley_desc': 'وضع البقاء مع مخاطر عالية للاستبعاد.',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': 'الوضع المتطرف لأولئك الذين يجرؤون على المخاطرة بكل شيء.',
    'about_desc2': 'يجمع Rip It بين التفاعل الاجتماعي والمنافسة والتخصيص الديناميكي لخلق تجربة فريدة وانتشار واسع وإثارة للأدرينالين.',
    'about_footer': 'نحن هنا لنجعل ملفك الشخصي ومكانتك وقصة بقائك ذات أهمية — فز، أو أعد الضبط، أو تطور.',
    'about_close': 'إغلاق',

    // Contact Modal
    'contact_title': 'اتصل بنا',
    'contact_desc': 'لديك أسئلة، ملاحظات، أو تريد فقط إخبارنا بقصة بقائك؟ تواصل معنا:',
    'contact_email_label': 'البريد الإلكتروني',
    'contact_email_or': 'أو',
    'contact_footer': 'سنرد عليك بأسرع ما يمكن، مثل عداد Pley التنازلي.',
    'contact_close': 'إغلاق',

    // Model Modal
    'model_title': '🔥 Rip It – نموذج التطبيق',
    'model_concept_title': '1️⃣ المفهوم الأساسي',
    'model_concept_desc': 'Rip It هو تطبيق تواصل اجتماعي للبقاء على قيد الحياة حيث تحدد مشاركة المستخدمين والتصويت والاستراتيجية التقدم والمكانة والإرث. كل إجراء له عواقب، مما يخلق التوتر والتفاعل.',
    'model_modes_title': '2️⃣ الأوضاع',
    'model_pley_title': 'Pley',
    'model_pley_item1': 'يركز على البقاء',
    'model_pley_item2': 'فقط التصويت السلبي هو المهم',
    'model_pley_item3': 'جولات موقوتة (يحدد المستخدم المدة)',
    'model_pley_item4': 'آخر المستخدمين الباقين يحصلون على التقدير',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': 'وضع البقاء المتطرف',
    'model_Pley_item2': 'تصويت سلبي فقط',
    'model_Pley_item3': 'إعادة ضبط كاملة في حالة التصويت السلبي',
    'model_Pley_item4': 'تطوعي للباحثين عن الإثارة والمخاطر العالية',
    'model_pers_title': '3️⃣ التخصيص (غير مرتبط بملكية فكرية محددة)',
    'model_pers_item1': 'اسم عرض وثيم ملف شخصي مخصص',
    'model_pers_item2': 'تجربة بصرية قائمة على الوضع',
    'model_pers_item3': 'ألقاب وحالة ديناميكية',
    'model_pers_item4': 'مقاييس المتابعين/التفاعل',
    'model_close': 'إغلاق',

    // Privacy Modal
    'priv_subtitle': 'خصوصيتك تهمنا.',
    'priv_effective': 'تاريخ السريان: 23/02/26',
    'priv_intro': 'باستخدام Rip It، فإنك توافق على جمع واستخدام المعلومات كما هو موضح أدناه.',
    'priv_s1_title': '1️⃣ المعلومات التي نجمعها',
    'priv_s1_i1': 'معلومات الحساب: اسم المستخدم، البريد الإلكتروني، بيانات الملف الشخصي، والتفضيلات.',
    'priv_s1_i2': 'معلومات اللعب: المشاركة في الأوضاع، الأصوات، المؤقتات، الإنجازات.',
    'priv_s1_i3': 'معلومات الجهاز: عنوان IP، نوع الجهاز، نظام التشغيل، وإحصاءات الاستخدام.',
    'priv_s1_i4': 'معلومات اختيارية: الروابط الاجتماعية أو المحتوى الذي تختار مشاركته.',
    'priv_s2_title': '2️⃣ كيف نستخدم معلوماتك',
    'priv_s2_i1': 'لتشغيل وتحسين ميزات وأوضاع Rip It.',
    'priv_s2_i2': 'لتخصيص تجربتك، بما في ذلك ثيمات الملف الشخصي والحالة.',
    'priv_s2_i3': 'لاكتشاف سوء الاستخدام أو الرسائل المزعجة أو الأنشطة غير الآمنة.',
    'priv_s2_i4': 'للتواصل بشأن التحديثات أو الأحداث أو رسائل الدعم.',
    'priv_s3_title': '3️⃣ مشاركة معلوماتك',
    'priv_s3_i1': 'نحن لا نبيع معلوماتك الشخصية.',
    'priv_s3_i2': 'قد تكون بعض البيانات مرئية للمستخدمين الآخرين (مثل أسماء المستخدمين والحالة ومعلومات لوحة الصدارة).',
    'priv_s3_i3': 'قد نشارك البيانات مع مزودي الخدمة أو للامتثال القانوني.',
    'priv_s4_title': '4️⃣ الأمان',
    'priv_s4_i1': 'نحن نستخدم ممارسات معيارية في الصناعة لحماية بياناتك.',
    'priv_s4_i2': 'لا يوجد نظام مثالي — المشاركة تنطوي على مخاطر، خاصة في الميزات العامة.',
    'priv_s5_title': '5️⃣ خياراتك',
    'priv_s5_i1': 'يمكنك تحديث أو حذف حسابك في أي وقت.',
    'priv_s5_i2': 'يمكنك التحكم في رؤية ملفك الشخصي ونشاطك في التطبيق.',
    'priv_s5_i3': 'يمكنك اختيار عدم تلقي الاتصالات غير الضرورية.',
    'priv_s6_title': '6️⃣ التغييرات في سياسة الخصوصية',
    'priv_s6_i1': 'قد تحدث تحديثات مع تطور التطبيق.',
    'priv_s6_i2': 'سيتم الإعلان عن التغييرات الكبيرة داخل التطبيق.',

    // Terms Modal
    'terms_tagline': 'الشعار: انجُ. أعد الضبط. تطور.',
    'terms_effective': 'تاريخ السريان: 23/02/26',
    'terms_intro': 'باستخدام Rip It، فإنك توافق على هذه الشروط. إذا كنت لا توافق، يرجى عدم استخدام التطبيق.',
    'terms_s1_title': '1. ما هو Rip It',
    'terms_s1_desc': 'Rip It هو تطبيق تواصل اجتماعي للبقاء على قيد الحياة حيث يشارك المستخدمون في تحديات موقوتة، وتصويت عام، وأوضاع تنافسية.',
    'terms_s1_list_title': 'نحن نوفر أدوات لـ:',
    'terms_s1_i1': 'تجارب البقاء القائمة على الأوضاع (Pley، Pley، Pley)',
    'terms_s1_i2': 'التصويت العام والتقدير',
    'terms_s1_i3': 'تخصيص الملف الشخصي وتتبع الحالة',
    'terms_s1_disclaimer': 'Rip It لا يضمن النتائج أو البقاء أو التصنيف.',
    'terms_s2_title': '2. من يمكنه استخدام Rip It',
    'terms_s2_i1': 'يجب أن يكون عمرك 13 عاماً على الأقل',
    'terms_s2_i2': 'استخدام التطبيق بشكل قانوني ومحترم',
    'terms_s2_i3': 'تقديم معلومات دقيقة',
    'terms_s2_i4': 'تكون مسؤولاً عن حسابك ونشاطك',
    'terms_s3_title': '3. الأوضاع وقواعد التصويت',
    'terms_s3_i1': 'تمتلك أوضاع Pley و Pley و Pley ميكانيكيات فريدة تؤثر على حالة الملف الشخصي والتقدم.',
    'terms_s3_i2': 'قد تؤثر الأصوات على تقدم المستخدم، أو إعادة ضبط الملف الشخصي، أو القيود المؤقتة.',
    'terms_s3_i3': 'يتم تحديد المؤقتات والجولات والنتائج بواسطة التطبيق والمستخدمين المشاركين.',
    'terms_s3_i4': 'يشارك المستخدمون بناءً على تقديرهم الخاص.',
    'terms_s4_title': '4. السمعة والحالة والنقاط',
    'terms_s4_intro': 'باستخدام Rip It، فإنك تدرك ما يلي:',
    'terms_s4_i1': 'تعكس الحالة والألقاب والتقدير الأداء داخل التطبيق وسجل البقاء',
    'terms_s4_i2': 'يؤثر التصويت العام على التقدم داخل الأوضاع',
    'terms_s4_i3': 'لا يقوم Rip It بالتلاعب بالنتائج لصالح أي مستخدم',
    'terms_s4_i4': 'قد يؤدي سوء الاستخدام أو التلاعب أو إرسال رسائل مزعجة إلى عقوبات أو الإزالة',
    'terms_s5_title': '5. سلوك المستخدم',
    'terms_s5_intro': 'أنت توافق على عدم:',
    'terms_s5_i1': 'مضايقة الآخرين أو تهديدهم أو التنمر عليهم',
    'terms_s5_i2': 'إرسال رسائل مزعجة أو التلاعب بالأصوات',
    'terms_s5_i3': 'انتحال شخصية مستخدمين آخرين',
    'terms_s5_i4': 'استخدام Rip It لأي نشاط غير قانوني',
    'terms_s5_footer': 'قد تؤدي الانتهاكات إلى تعليق الحساب أو تقييده أو إزالته.',
    'terms_s6_title': '6. المحتوى وبيانات المستخدم',
    'terms_s6_i1': 'تحتفظ بملكية المحتوى الذي تنشئه في التطبيق.',
    'terms_s6_i2': 'أنت مسؤول عن مشاركاتك وسلوكك.',
    'terms_s6_i3': 'Rip It غير مسؤول عن المحتوى الذي ينشئه المستخدمون.',
    'terms_s6_i4': 'قد نقوم بإزالة المحتوى الذي ينتهك هذه الشروط أو يكون غير آمن.',
    'terms_s7_title': '7. تعليق الحساب وإعادة الضبط والإنهاء',
    'terms_s7_i1': 'قد يتم تعليق الحسابات أو إعادة ضبطها أو حذفها إذا تم انتهاك الشروط أو إساءة استخدام المنصة.',
    'terms_s7_i2': 'قد تؤدي بعض الأوضاع إلى إعادة ضبط الملف الشخصي كجزء من ميكانيكيات اللعب.',
    'terms_s7_i3': 'يمكنك حذف حسابك في أي وقت.',
    'terms_s8_title': '8. إخلاء المسؤولية',
    'terms_s8_i1': 'يتم توفير Rip It "كما هو".',
    'terms_s8_i2': 'نحن لا نضمن خدمة غير منقطعة.',
    'terms_s8_i3': 'نحن لسنا مسؤولين عن نتائج المستخدم، أو إعادة ضبط الملف الشخصي، أو فقدان التقدير.',
    'terms_s8_i4': 'المشاركة تكون بناءً على تقديرك الخاص.',
    'terms_s9_title': '9. التغييرات في هذه الشروط',
    'terms_s9_desc': 'قد نقوم بتحديث هذه الشروط بشكل دوري. سيتم إبلاغك بالتغييرات الجوهرية داخل التطبيق.',
    'terms_s10_title': '10. الاتصال',
    'terms_s10_desc': 'أسئلة أو استفسارات؟',
    'terms_s10_email': 'البريد الإلكتروني: ripit90210@gmail.com'
  },
  id: {
    // Settings
    'settings': 'Pengaturan',
    'app': 'Aplikasi',
    'language': 'Bahasa',
    'theme': 'Tema',
    'personalization': 'Personalisasi',
    'about': 'Tentang',
    'model': 'Model',
    'terms': 'Ketentuan Layanan',
    'privacy': 'Kebijakan Privasi',
    'contact': 'Hubungi Kami',
    'logout': 'Keluar',
    'cancel': 'Batal',

    // BottomNav
    'nav_home': 'Beranda',
    'nav_search': 'imemo0',
    'nav_create': 'Buat',
    'nav_notifications': 'Aktivitas',
    'nav_profile': 'Profil',

    // Home
    'home_following': 'Mengikuti',
    'home_for_you': 'Untuk Anda',
    'home_live_challenge': 'Tantangan Langsung',
    'home_survivors': 'Penyintas',
    'home_pass': 'Lewati',
    'home_smash': 'Hancurkan',
    'home_add_enemy': 'Tambah Musuh',
    'home_added_enemy': 'Musuh Ditambahkan',
    'home_share': 'Bagikan',
    'home_remix': 'Remix',
    'home_made_it': 'Berhasil',
    'home_pleyed': 'Dimainkan',
    'home_won': 'Menang',
    'home_survived': 'Bertahan',
    'home_the_end': 'Selesai',
    'home_all_judged': 'Semua profil telah dinilai',
    'home_universal_complete': 'Pemilihan universal selesai',
    'home_winner_complete': 'Pemilihan pemenang selesai',
    'home_upload_modal_title': 'Postingan Baru',
    'home_upload_caption_placeholder': 'Tulis keterangan...',
    'home_upload_cancel': 'Batal',
    'home_upload_post': 'Posting',
    'home_eliminated': 'Tereliminasi',
    'home_majority': 'Mayoritas',
    'home_choose_variant': 'Pilih Varian',
    'home_set_duration': 'Atur Durasi',
    'home_select_ranking': 'Pilih Peringkat',
    'home_select_rule': 'Pilih Aturan',
    'home_current_choice': 'Pilihan Saat Ini',
    'home_community_votes': 'Suara Komunitas',
    'home_selection_locked': 'Pilihan dikunci hingga pengatur waktu berakhir',
    'home_submitted': 'Terkirim',
    'home_invalid_ranking': 'Peringkat Tidak Valid',
    'home_submit': 'Kirim',
    'home_view_history': 'Lihat Riwayat',
    'home_start_new': 'Atau mulai babak baru',

    // Search
    'search_header_details': 'Detail Babak',
    'search_header_results': 'Hasil Babak',
    'search_header_hall': 'Hall of Fame',
    'search_header_history': 'Riwayat Babak',
    'search_top_survivors': 'Penyintas Teratas',
    'search_recent_outcomes': 'Hasil Terbaru',
    'search_clear_history': 'Hapus Riwayat',
    'search_start_round': 'Mulai Babak',
    'search_filter_type': 'Tipe Babak:',
    'search_all_winners': 'Semua Pemenang',
    'search_try_again': 'Coba Lagi',
    'search_total_termination': 'PENGHENTIAN TOTAL',
    'search_no_winners': 'PEMENANG TIDAK DITEMUKAN',
    'search_waiting': 'Menunggu pemenang',
    'search_no_active': 'Tidak ada babak aktif',
    'search_waiting_desc': 'Babak sedang berlangsung. Pantau terus hasilnya.',
    'search_start_desc': 'Mulai babak baru dari layar beranda untuk melihat penyintas.',
    'search_join_next': 'Ikuti tugas berikutnya',

    // CreatePost
    'create_new_post': 'Postingan Baru',
    'create_next': 'Berikutnya',
    'create_camera': 'Kamera',
    'create_gallery': 'Galeri',
    'create_select_preview': 'Pilih media untuk pratinjau',
    'create_caption_placeholder': 'Tulis keterangan...',

    // Notifications
    'notif_activity': 'Aktivitas',
    'notif_follow': 'Ikuti',
    'notif_following': 'Mengikuti',
    'notif_upvoted': 'menyukai foto Anda',
    'notif_commented': 'berkomentar:',
    'notif_started_following': 'mulai mengikuti Anda',

    // Profile
    'profile_posts': 'Postingan',
    'profile_followers': 'Pengikut',
    'profile_following': 'Mengikuti',
    'profile_enemies': 'Musuh',
    'profile_edit': 'Edit Profil',
    'profile_share': 'Bagikan Profil',
    'profile_bio_placeholder': 'Tambahkan bio ke profil Anda...',
    'profile_tab_posts': 'Postingan',
    'profile_tab_enemies': 'Musuh',
    'profile_tab_following': 'Mengikuti',
    'profile_no_posts': 'Belum ada postingan',
    'profile_no_enemies': 'Belum ada musuh bebuyutan',
    'profile_no_following': 'Anda belum mengikuti siapa pun',
    'profile_marked_enemy': 'Ditandai sebagai musuh',
    'profile_enemies_desc': 'Profil yang Anda tandai sebagai musuh akan muncul di sini.',
    'profile_following_desc': 'Ikuti penyintas dari Hall of Fame untuk melihat mereka di sini.',
    'profile_unfollow': 'Batal Mengikuti',
    'profile_legend': 'Legenda',
    'post_view_comments': 'Lihat semua komentar',
    'post_write_comment': 'Tulis komentar...',
    'post_add_comment': 'Tambah Komentar',
    'timer_rule': 'Aturan',
    'theme_light': 'Terang',
    'theme_system': 'Sistem',

    // Personalization Modal
    'pers_title': '🔥 Rip It – Personalisasi (Gaya Gen Z)',
    'pers_subtitle': 'Rip It tidak sama untuk semua orang.',
    'pers_desc': 'Profil Anda berkembang seiring cara Anda bertahan hidup.',
    'pers_item1': 'Vibe & tema kustom',
    'pers_item2': 'Visual berbasis mode (Pley, Pley masing-masing terasa berbeda)',
    'pers_item3': 'Gelar dinamis yang memamerkan status Anda',
    'pers_item4': 'Energi pengikut yang membangun kehadiran Anda',
    'pers_footer1': 'Semakin banyak Anda bermain, semakin identitas Anda bergeser.',
    'pers_footer2': 'Menang atau reset — warisan Anda tetap berbicara.',
    'pers_button': 'Paham',

    // About Modal
    'about_title': 'Tentang Rip It',
    'about_tagline': 'Tagline: Bertahan. Reset. Evolusi.',
    'about_desc1': 'Rip It adalah platform bertahan hidup sosial berisiko tinggi yang dirancang untuk pemain yang berani. Bersaing dalam mode seperti Pley, Pley, dan Pley untuk menguji strategi, ketahanan, dan keterampilan sosial Anda.',
    'about_pley_title': 'Pley',
    'about_pley_desc': 'Mode bertahan hidup dengan risiko eliminasi tinggi.',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': 'Mode ekstrem bagi mereka yang berani mempertaruhkan segalanya.',
    'about_desc2': 'Rip It menggabungkan interaksi sosial, kompetisi, dan personalisasi dinamis untuk menciptakan pengalaman yang unik, viral, dan memacu adrenalin.',
    'about_footer': 'Kami di sini untuk membuat profil, status, dan cerita bertahan hidup Anda berarti—menang, reset, atau berevolusi.',
    'about_close': 'Tutup',

    // Contact Modal
    'contact_title': 'Hubungi Kami',
    'contact_desc': 'Punya pertanyaan, masukan, atau hanya ingin menceritakan kisah bertahan hidup Anda? Hubungi kami:',
    'contact_email_label': 'Email',
    'contact_email_or': 'atau',
    'contact_footer': 'Kami akan membalas secepat timer Pley menghitung mundur.',
    'contact_close': 'Tutup',

    // Model Modal
    'model_title': '🔥 Rip It – Model Aplikasi',
    'model_concept_title': '1️⃣ Konsep Inti',
    'model_concept_desc': 'Rip It adalah aplikasi bertahan hidup sosial berisiko tinggi di mana partisipasi pengguna, voting, dan strategi menentukan perkembangan, status, dan warisan. Setiap tindakan memiliki konsekuensi, menciptakan ketegangan dan keterlibatan.',
    'model_modes_title': '2️⃣ Mode',
    'model_pley_title': 'Pley',
    'model_pley_item1': 'Berfokus pada pertahanan hidup',
    'model_pley_item2': 'Hanya suara turun yang penting',
    'model_pley_item3': 'Babak berwaktu (pengguna mengatur durasi)',
    'model_pley_item4': 'Pengguna terakhir yang bertahan mendapatkan pengakuan',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': 'Mode bertahan hidup ekstrem',
    'model_Pley_item2': 'Hanya suara turun',
    'model_Pley_item3': 'Reset penuh jika suara turun',
    'model_Pley_item4': 'Sukarela bagi pencari sensasi berisiko tinggi',
    'model_pers_title': '3️⃣ Personalisasi (Non-IP Spesifik)',
    'model_pers_item1': 'Nama tampilan & tema profil kustom',
    'model_pers_item2': 'Pengalaman visual berbasis mode',
    'model_pers_item3': 'Gelar & status dinamis',
    'model_pers_item4': 'Metrik pengikut/keterlibatan',
    'model_close': 'Tutup',

    // Privacy Modal
    'priv_subtitle': 'Privasi Anda penting.',
    'priv_effective': 'Tanggal Efektif: 23/02/26',
    'priv_intro': 'Dengan menggunakan Rip It, Anda menyetujui pengumpulan dan penggunaan informasi sebagaimana dijelaskan di bawah ini.',
    'priv_s1_title': '1️⃣ Informasi yang Kami Kumpulkan',
    'priv_s1_i1': 'Info akun: Nama pengguna, email, data profil, dan preferensi.',
    'priv_s1_i2': 'Info gameplay: Partisipasi mode, suara, timer, pencapaian.',
    'priv_s1_i3': 'Info perangkat: Alamat IP, jenis perangkat, OS, dan statistik penggunaan.',
    'priv_s1_i4': 'Info opsional: Tautan sosial atau konten yang Anda pilih untuk dibagikan.',
    'priv_s2_title': '2️⃣ Bagaimana Kami Menggunakan Info Anda',
    'priv_s2_i1': 'Untuk menjalankan dan meningkatkan fitur serta mode Rip It.',
    'priv_s2_i2': 'Untuk mempersonalisasi pengalaman Anda, termasuk tema profil dan status.',
    'priv_s2_i3': 'Untuk mendeteksi penyalahgunaan, spam, atau aktivitas yang tidak aman.',
    'priv_s2_i4': 'Untuk mengomunikasikan pembaruan, acara, atau pesan dukungan.',
    'priv_s3_title': '3️⃣ Berbagi Info Anda',
    'priv_s3_i1': 'Kami tidak menjual informasi pribadi Anda.',
    'priv_s3_i2': 'Beberapa data mungkin terlihat oleh pengguna lain (seperti nama pengguna, status, dan info papan peringkat).',
    'priv_s3_i3': 'Kami mungkin berbagi data dengan penyedia layanan atau untuk kepatuhan hukum.',
    'priv_s4_title': '4️⃣ Keamanan',
    'priv_s4_i1': 'Kami menggunakan praktik standar industri untuk melindungi data Anda.',
    'priv_s4_i2': 'Tidak ada sistem yang sempurna—partisipasi membawa risiko, terutama dalam fitur publik.',
    'priv_s5_title': '5️⃣ Pilihan Anda',
    'priv_s5_i1': 'Anda dapat memperbarui atau menghapus akun Anda kapan saja.',
    'priv_s5_i2': 'Anda dapat mengontrol visibilitas profil dan aktivitas Anda di aplikasi.',
    'priv_s5_i3': 'Anda dapat memilih keluar dari komunikasi non-esensial.',
    'priv_s6_title': '6️⃣ Perubahan Kebijakan Privasi',
    'priv_s6_i1': 'Pembaruan mungkin terjadi seiring berkembangnya aplikasi.',
    'priv_s6_i2': 'Perubahan besar akan diumumkan di dalam aplikasi.',

    // Terms Modal
    'terms_tagline': 'Tagline: Bertahan. Reset. Evolusi.',
    'terms_effective': 'Tanggal Efektif: 23/02/26',
    'terms_intro': 'Dengan menggunakan Rip It, Anda menyetujui Ketentuan ini. Jika Anda tidak setuju, mohon jangan gunakan aplikasi.',
    'terms_s1_title': '1. Apa Itu Rip It',
    'terms_s1_desc': 'Rip It adalah aplikasi bertahan hidup sosial berisiko tinggi di mana pengguna berpartisipasi dalam tantangan berwaktu, voting publik, dan mode kompetitif.',
    'terms_s1_list_title': 'Kami menyediakan alat untuk:',
    'terms_s1_i1': 'Pengalaman bertahan hidup berbasis mode (Pley, Pley)',
    'terms_s1_i2': 'Voting publik dan pengakuan',
    'terms_s1_i3': 'Personalisasi profil dan pelacakan status',
    'terms_s1_disclaimer': 'Rip It tidak menjamin hasil, pertahanan hidup, atau peringkat.',
    'terms_s2_title': '2. Siapa yang Dapat Menggunakan Rip It',
    'terms_s2_i1': 'Berusia minimal 13 tahun',
    'terms_s2_i2': 'Gunakan aplikasi secara legal dan hormat',
    'terms_s2_i3': 'Berikan informasi yang akurat',
    'terms_s2_i4': 'Bertanggung jawab atas akun dan aktivitas Anda',
    'terms_s3_title': '3. Aturan Mode & Voting',
    'terms_s3_i1': 'Pley, Pley, dan Pley memiliki mekanik unik yang memengaruhi status dan perkembangan profil.',
    'terms_s3_i2': 'Suara dapat memengaruhi perkembangan pengguna, reset profil, atau pembatasan sementara.',
    'terms_s3_i3': 'Timer, babak, dan hasil ditentukan oleh aplikasi dan pengguna yang berpartisipasi.',
    'terms_s3_i4': 'Pengguna berpartisipasi atas diskresi mereka sendiri.',
    'terms_s4_intro': 'Dengan menggunakan Rip It, Anda memahami bahwa:',
    'terms_s4_i1': 'Status, gelar, dan pengakuan mencerminkan performa dalam aplikasi dan riwayat bertahan hidup',
    'terms_s4_i2': 'Voting publik memengaruhi perkembangan dalam mode',
    'terms_s4_i3': 'Rip It tidak memanipulasi hasil untuk menguntungkan pengguna mana pun',
    'terms_s4_i4': 'Penyalahgunaan, manipulasi, atau spamming dapat berakibat pada penalti atau penghapusan',
    'terms_s5_title': '5. Perilaku Pengguna',
    'terms_s5_intro': 'Anda setuju untuk tidak:',
    'terms_s5_i1': 'Melecehkan, mengancam, atau merundung orang lain',
    'terms_s5_i2': 'Spam atau memanipulasi suara',
    'terms_s5_i3': 'Meniru identitas pengguna lain',
    'terms_s5_i4': 'Menggunakan Rip It untuk aktivitas ilegal',
    'terms_s5_footer': 'Pelanggaran dapat berakibat pada penangguhan, pembatasan, atau penghapusan akun.',
    'terms_s6_title': '6. Konten & Data Pengguna',
    'terms_s6_i1': 'Anda tetap memiliki kepemilikan atas konten yang Anda buat di aplikasi.',
    'terms_s6_i2': 'Anda bertanggung jawab atas kiriman dan perilaku Anda.',
    'terms_s6_i3': 'Rip It tidak bertanggung jawab atas konten buatan pengguna.',
    'terms_s6_i4': 'Kami mungkin menghapus konten yang melanggar Ketentuan ini atau tidak aman.',
    'terms_s7_title': '7. Penangguhan, Reset & Pemutusan Akun',
    'terms_s7_i1': 'Akun dapat ditangguhkan, di-reset, atau dihapus jika Ketentuan dilanggar atau platform disalahgunakan.',
    'terms_s7_i2': 'Mode tertentu dapat berakibat pada reset profil sebagai bagian dari mekanik gameplay.',
    'terms_s8_title': '8. Penafian',
    'terms_s8_i1': 'Rip It disediakan "sebagaimana adanya".',
    'terms_s8_i2': 'Kami tidak menjamin layanan tanpa gangguan.',
    'terms_s8_i3': 'Kami tidak bertanggung jawab atas hasil pengguna, reset profil, atau kehilangan pengakuan.',
    'terms_s8_i4': 'Partisipasi adalah atas diskresi Anda sendiri.',
    'terms_s9_title': '9. Perubahan pada Ketentuan Ini',
    'terms_s9_desc': 'Kami mungkin memperbarui Ketentuan ini secara berkala. Perubahan signifikan akan diumumkan di dalam aplikasi.',
    'terms_s10_title': '10. Kontak',
    'terms_s10_desc': 'Pertanyaan atau kekhawatiran?',
    'terms_s10_email': 'Email: ripit90210@gmail.com'
  },
  ur: {
    // Settings
    'settings': 'ترتیبات',
    'app': 'ایپ',
    'language': 'زبان',
    'theme': 'تھیم',
    'personalization': 'شخصی بنانا',
    'about': 'بارے میں',
    'model': 'ماڈل',
    'terms': 'سروس کی شرائط',
    'privacy': 'رازداری کی پالیسی',
    'contact': 'ہم سے رابطہ کریں',
    'logout': 'لاگ آؤٹ',
    'cancel': 'منسوخ کریں',

    // BottomNav
    'nav_home': 'ہوم',
    'nav_search': 'imemo0',
    'nav_create': 'تخلیق کریں',
    'nav_notifications': 'سرگرمی',
    'nav_profile': 'پروفائل',

    // Home
    'home_following': 'فالو کر رہے ہیں',
    'home_for_you': 'آپ کے لیے',
    'home_live_challenge': 'لائیو چیلنج',
    'home_survivors': 'بچ جانے والے',
    'home_pass': 'پاس',
    'home_smash': 'سمیش',
    'home_add_enemy': 'دشمن شامل کریں',
    'home_added_enemy': 'دشمن شامل کر دیا گیا',
    'home_share': 'شیئر کریں',
    'home_remix': 'ریمکس',
    'home_made_it': 'کامیاب',
    'home_pleyed': 'کھیلا',
    'home_won': 'جیتا',
    'home_survived': 'بچ گیا',
    'home_the_end': 'اختتام',
    'home_all_judged': 'تمام پروفائلز کا فیصلہ ہو چکا ہے',
    'home_winner_complete': 'فاتح کا انتخاب مکمل',
    'home_upload_modal_title': 'نئی پوسٹ',
    'home_upload_caption_placeholder': 'کیپشن لکھیں...',
    'home_upload_cancel': 'منسوخ کریں',
    'home_upload_post': 'پوسٹ کریں',
    'home_eliminated': 'خارج کر دیا گیا',
    'home_majority': 'اکثریت',
    'home_choose_variant': 'ورژن منتخب کریں',
    'home_set_duration': 'دورانیہ مقرر کریں',
    'home_select_ranking': 'رینکنگ منتخب کریں',
    'home_select_rule': 'اصول منتخب کریں',
    'home_current_choice': 'موجودہ انتخاب',
    'home_community_votes': 'کمیونٹی ووٹ',
    'home_selection_locked': 'ٹائمر ختم ہونے تک انتخاب مقفل ہے',
    'home_submitted': 'جمع کر دیا گیا',
    'home_invalid_ranking': 'غلط رینکنگ',
    'home_submit': 'جمع کرائیں',
    'home_view_history': 'تاریخ دیکھیں',
    'home_start_new': 'یا نیا راؤنڈ شروع کریں',

    // Search
    'search_header_details': 'راؤنڈ کی تفصیلات',
    'search_header_results': 'راؤنڈ کے نتائج',
    'search_header_hall': 'ہال آف فیم',
    'search_header_history': 'راؤنڈ کی تاریخ',
    'search_top_survivors': 'ٹاپ بچ جانے والے',
    'search_recent_outcomes': 'حالیہ نتائج',
    'search_clear_history': 'تاریخ صاف کریں',
    'search_start_round': 'راؤنڈ شروع کریں',
    'search_filter_type': 'راؤنڈ کی قسم:',
    'search_all_winners': 'تمام فاتحین',
    'search_try_again': 'دوبارہ کوشش کریں',
    'search_total_termination': 'مکمل خاتمہ',
    'search_no_winners': 'کوئی فاتح نہیں ملا',
    'search_waiting': 'فاتح کا انتظار ہے',
    'search_no_active': 'کوئی فعال راؤنڈ نہیں ہے',
    'search_waiting_desc': 'راؤنڈ جاری ہے۔ نتائج کے لیے دیکھتے رہیں۔',
    'search_start_desc': 'بچ جانے والوں کو دیکھنے کے لیے ہوم اسکرین سے نیا راؤنڈ شروع کریں۔',
    'search_join_next': 'اگلے ٹاسک میں شامل ہوں',

    // CreatePost
    'create_new_post': 'نئی پوسٹ',
    'create_next': 'اگلا',
    'create_camera': 'کیمرہ',
    'create_gallery': 'گیلری',
    'create_select_preview': 'معائنے کے لیے میڈیا منتخب کریں',
    'create_caption_placeholder': 'کیپشن لکھیں...',

    // Notifications
    'notif_activity': 'سرگرمی',
    'notif_follow': 'فالو کریں',
    'notif_following': 'فالو کر رہے ہیں',
    'notif_upvoted': 'آپ کی تصویر پسند کی',
    'notif_commented': 'تبصرہ کیا:',
    'notif_started_following': 'آپ کو فالو کرنا شروع کیا',

    // Profile
    'profile_posts': 'پوسٹس',
    'profile_followers': 'فالورز',
    'profile_following': 'فالو کر رہے ہیں',
    'profile_enemies': 'دشمن',
    'profile_edit': 'پروفائل ایڈٹ کریں',
    'profile_share': 'پروفائل شیئر کریں',
    'profile_bio_placeholder': 'اپنے پروفائل میں بائیو شامل کریں...',
    'profile_tab_posts': 'پوسٹس',
    'profile_tab_enemies': 'دشمن',
    'profile_tab_following': 'فالو کر رہے ہیں',
    'profile_no_posts': 'ابھی تک کوئی پوسٹ نہیں ہے',
    'profile_no_enemies': 'ابھی تک کوئی جانی دشمن نہیں ہے',
    'profile_no_following': 'آپ ابھی کسی کو فالو نہیں کر رہے ہیں',
    'profile_marked_enemy': 'دشمن کے طور پر نشان زد',
    'profile_enemies_desc': 'جن پروفائلز کو آپ دشمن نشان زد کریں گے وہ یہاں نظر آئیں گے۔',
    'profile_following_desc': 'بچ جانے والوں کو یہاں دیکھنے کے لیے ہال آف فیم سے فالو کریں۔',
    'profile_unfollow': 'ان فالو کریں',
    'profile_legend': 'لیجنڈ',
    'post_view_comments': 'تمام تبصرے دیکھیں',
    'post_write_comment': 'تبصرہ لکھیں...',
    'post_add_comment': 'تبصرہ شامل کریں',
    'timer_rule': 'اصول',
    'theme_light': 'روشن',
    'theme_system': 'سسٹم',

    // Personalization Modal
    'pers_title': '🔥 Rip It – تخصیص (Gen Z اسٹائل)',
    'pers_subtitle': 'Rip It سب کے لیے ایک جیسا نہیں ہے۔',
    'pers_desc': 'آپ کا پروفائل اس بات کے ساتھ تیار ہوتا ہے کہ آپ کس طرح بچتے ہیں۔',
    'pers_item1': 'حسب ضرورت وائبز اور تھیمز',
    'pers_item2': 'موڈ پر مبنی بصری (Pley، Pley، Pley ہر ایک کا احساس مختلف ہے)',
    'pers_item3': 'متحرک عنوانات جو آپ کی حیثیت کو ظاہر کرتے ہیں',
    'pers_item4': 'فالوور انرجی جو آپ کی موجودگی کو بناتی ہے',
    'pers_footer1': 'جتنا زیادہ آپ کھیلیں گے، اتنا ہی آپ کی شناخت بدلے گی۔',
    'pers_footer2': 'جیتیں یا ری سیٹ کریں — آپ کی میراث اب بھی بولتی ہے۔',
    'pers_button': 'سمجھ گیا',

    // About Modal
    'about_title': 'Rip It کے بارے میں',
    'about_tagline': 'ٹیگ لائن: بچیں۔ ری سیٹ کریں۔ تیار ہوں۔',
    'about_desc1': 'Rip It ایک اعلی داؤ والا سماجی بقا کا پلیٹ فارم ہے جو دلیر کھلاڑیوں کے لیے ڈیزائن کیا گیا ہے۔ اپنی حکمت عملی، لچک اور سماجی مہارتوں کو جانچنے کے لیے Pley، Pley، اور Pley جیسے طریقوں میں مقابلہ کریں۔',
    'about_pley_title': 'Pley',
    'about_pley_desc': 'اعلی خطرے کے اخراج کے ساتھ بقا کا موڈ۔',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': 'ان لوگوں کے لیے انتہائی موڈ جو سب کچھ خطرے میں ڈالنے کی ہمت رکھتے ہیں۔',
    'about_desc2': 'Rip It سماجی تعامل، مقابلے اور متحرک تخصیص کو یکجا کر کے ایک منفرد، وائرل اور ایڈونچر سے بھرپور تجربہ تخلیق کرتا ہے۔',
    'about_footer': 'ہم یہاں آپ کے پروفائل، حیثیت اور بقا کی کہانی کو اہم بنانے کے لیے ہیں—جیتیں، ری سیٹ کریں یا تیار ہوں۔',
    'about_close': 'بند کریں',

    // Contact Modal
    'contact_title': 'ہم سے رابطہ کریں',
    'contact_desc': 'سوالات، فیڈ بیک ہے، یا صرف ہمیں اپنی بقا کی کہانی بتانا چاہتے ہیں؟ رابطہ کریں:',
    'contact_email_label': 'ای میل',
    'contact_email_or': 'یا',
    'contact_footer': 'ہم آپ سے اتنی ہی تیزی سے رابطہ کریں گے جتنی تیزی سے Pley ٹائمر کی الٹی گنتی ہوتی ہے۔',
    'contact_close': 'بند کریں',

    // Model Modal
    'model_title': '🔥 Rip It – ایپ ماڈل',
    'model_concept_title': '1️⃣ بنیادی تصور',
    'model_concept_desc': 'Rip It ایک اعلی داؤ والا سماجی بقا کا ایپ ہے جہاں صارف کی شرکت، ووٹنگ اور حکمت عملی ترقی، حیثیت اور میراث کا تعین کرتی ہے۔ ہر عمل کے نتائج ہوتے ہیں، جو تناؤ اور مشغولیت پیدا کرتے ہیں۔',
    'model_modes_title': '2️⃣ موڈز',
    'model_pley_title': 'Pley',
    'model_pley_item1': 'بقا پر مرکوز',
    'model_pley_item2': 'صرف ڈاؤن ووٹ اہمیت رکھتے ہیں',
    'model_pley_item3': 'وقتی راؤنڈز (صارف دورانیہ مقرر کرتا ہے)',
    'model_pley_item4': 'آخری کھڑے صارفین کو پہچان ملتی ہے',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': 'انتہائی بقا کا موڈ',
    'model_Pley_item2': 'صرف ڈاؤن ووٹ',
    'model_Pley_item3': 'ڈاؤن ووٹ ہونے پر مکمل ری سیٹ',
    'model_Pley_item4': 'اعلی خطرے کے سنسنی کے متلاشیوں کے لیے رضاکارانہ',
    'model_pers_title': '3️⃣ تخصیص (غیر IP مخصوص)',
    'model_pers_item1': 'حسب ضرورت ڈسپلے نام اور پروفائل تھیم',
    'model_pers_item2': 'موڈ پر مبنی بصری تجربہ',
    'model_pers_item3': 'متحرک عنوانات اور حیثیت',
    'model_pers_item4': 'فالوور/مشغولیت کی پیمائش',
    'model_close': 'بند کریں',

    // Privacy Modal
    'priv_subtitle': 'آپ کی رازداری اہمیت رکھتی ہے۔',
    'priv_effective': 'مؤثر تاریخ: 02/23/26',
    'priv_intro': 'Rip It استعمال کر کے، آپ نیچے دی گئی معلومات کے جمع کرنے اور استعمال کرنے سے اتفاق کرتے ہیں۔',
    'priv_s1_title': '1️⃣ معلومات جو ہم جمع کرتے ہیں',
    'priv_s1_i1': 'اکاؤنٹ کی معلومات: صارف نام، ای میل، پروفائل ڈیٹا، اور ترجیحات۔',
    'priv_s1_i2': 'گیم پلے کی معلومات: موڈ کی شرکت، ووٹ، ٹائمر، کامیابیاں۔',
    'priv_s1_i3': 'ڈیوائس کی معلومات: آئی پی ایڈریس، ڈیوائس کی قسم، او ایس، اور استعمال کے اعداد و شمار۔',
    'priv_s1_i4': 'اختیاری معلومات: سماجی روابط یا مواد جو آپ شیئر کرنے کے لیے منتخب کرتے ہیں۔',
    'priv_s2_title': '2️⃣ ہم آپ کی معلومات کیسے استعمال کرتے ہیں',
    'priv_s2_i1': 'Rip It کی خصوصیات اور موڈز کو چلانے اور بہتر بنانے کے لیے۔',
    'priv_s2_i2': 'آپ کے تجربے کو ذاتی بنانے کے لیے، بشمول پروفائل تھیمز اور حیثیت۔',
    'priv_s2_i3': 'بدسلوکی، سپیم یا غیر محفوظ سرگرمی کا پتہ لگانے کے لیے۔',
    'priv_s2_i4': 'آپ ڈیٹس، ایونٹس یا سپورٹ پیغامات پہنچانے کے لیے۔',
    'priv_s3_title': '3️⃣ آپ کی معلومات شیئر کرنا',
    'priv_s3_i1': 'ہم آپ کی ذاتی معلومات فروخت نہیں کرتے ہیں۔',
    'priv_s3_i2': 'کچھ ڈیٹا دوسرے صارفین کو نظر آ سکتا ہے (جیسے صارف نام، حیثیت اور لیڈر بورڈ کی معلومات)۔',
    'priv_s3_i3': 'ہم سروس فراہم کنندگان کے ساتھ یا قانونی تعمیل کے لیے ڈیٹا شیئر کر سکتے ہیں۔',
    'priv_s4_title': '4️⃣ سیکیورٹی',
    'priv_s4_i1': 'ہم آپ کے ڈیٹا کی حفاظت کے لیے صنعت کے معیاری طریقے استعمال کرتے ہیں۔',
    'priv_s4_i2': 'کوئی بھی سسٹم مکمل نہیں ہے—شرکت میں خطرہ ہوتا ہے، خاص طور پر عوامی خصوصیات میں۔',
    'priv_s5_title': '5️⃣ آپ کے انتخاب',
    'priv_s5_i1': 'آپ کسی بھی وقت اپنا اکاؤنٹ اپ ڈیٹ یا حذف کر سکتے ہیں۔',
    'priv_s5_i2': 'آپ ایپ میں اپنے پروفائل اور سرگرمی کی نمائش کو کنٹرول کر سکتے ہیں۔',
    'priv_s5_i3': 'آپ غیر ضروری مواصلات سے آپٹ آؤٹ کر سکتے ہیں۔',
    'priv_s6_title': '6️⃣ رازداری کی پالیسی میں تبدیلیاں',
    'priv_s6_i1': 'ایپ کے تیار ہونے کے ساتھ ساتھ اپ ڈیٹس ہو سکتے ہیں۔',
    'priv_s6_i2': 'بڑی تبدیلیوں کا اعلان ایپ میں کیا جائے گا۔',

    // Terms Modal
    'terms_tagline': 'ٹیگ لائن: بچیں۔ ری سیٹ کریں۔ تیار ہوں۔',
    'terms_effective': 'مؤثر تاریخ: 02/23/26',
    'terms_intro': 'Rip It استعمال کر کے، آپ ان شرائط سے اتفاق کرتے ہیں۔ اگر آپ اتفاق نہیں کرتے ہیں، تو براہ کرم ایپ استعمال نہ کریں۔',
    'terms_s1_title': '1. Rip It کیا ہے',
    'terms_s1_desc': 'Rip It ایک اعلی داؤ والا سماجی بقا کا ایپ ہے جہاں صارف وقتی چیلنجوں، عوامی ووٹنگ اور مسابقتی طریقوں میں حصہ لیتے ہیں۔',
    'terms_s1_list_title': 'ہم ان کے لیے ٹولز فراہم کرتے ہیں:',
    'terms_s1_i1': 'موڈ پر مبنی بقا کے تجربات (Pley، Pley، Pley)',
    'terms_s1_i2': 'عوامی ووٹنگ اور پہچان',
    'terms_s1_i3': 'پروفائل کی تخصیص اور حیثیت کی ٹریکنگ',
    'terms_s1_disclaimer': 'Rip It نتائج، بقا یا رینکنگ کی ضمانت نہیں دیتا۔',
    'terms_s2_title': '2. کون Rip It استعمال کر سکتا ہے',
    'terms_s2_i1': 'کم از کم 13 سال کی عمر ہو',
    'terms_s2_i2': 'ایپ کو قانونی اور احترام کے ساتھ استعمال کریں',
    'terms_s2_i3': 'درست معلومات فراہم کریں',
    'terms_s2_i4': 'اپنے اکاؤنٹ اور سرگرمی کے ذمہ دار بنیں',
    'terms_s3_title': '3. موڈز اور ووٹنگ کے قواعد',
    'terms_s3_i1': 'Pley، Pley، اور Pley کے منفرد میکانکس ہیں جو پروفائل کی حیثیت اور ترقی کو متاثر کرتے ہیں۔',
    'terms_s3_i2': 'ووٹ صارف کی ترقی، پروفائل ری سیٹ، یا عارضی پابندیوں کو متاثر کر سکتے ہیں۔',
    'terms_s3_i3': 'ٹائمرز، راؤنڈز اور نتائج کا تعین ایپ اور شریک صارفین کرتے ہیں۔',
    'terms_s3_i4': 'صارفین اپنی صوابدید پر شرکت کرتے ہیں۔',
    'terms_s4_title': '4. شہرت، حیثیت اور اسکور',
    'terms_s4_intro': 'Rip It استعمال کر کے، آپ سمجھتے ہیں کہ:',
    'terms_s4_i1': 'حیثیت، عنوانات اور پہچان ایپ میں کارکردگی اور بقا کی تاریخ کی عکاسی کرتی ہے',
    'terms_s4_i2': 'عوامی ووٹنگ موڈز کے اندر ترقی کو متاثر کرتی ہے',
    'terms_s4_i3': 'Rip It کسی بھی صارف کے حق میں نتائج میں ہیرا پھیری نہیں کرتا ہے',
    'terms_s4_i4': 'بدسلوکی، ہیرا پھیری، یا سپیمنگ کے نتیجے میں جرمانے یا اخراج ہو سکتا ہے',
    'terms_s5_title': '5. صارف کا طرز عمل',
    'terms_s5_intro': 'آپ اس بات سے اتفاق کرتے ہیں کہ:',
    'terms_s5_i1': 'دوسروں کو ہراساں، دھمکانا یا بدمعاشی نہیں کریں گے',
    'terms_s5_i2': 'سپیم یا ووٹوں میں ہیرا پھیری نہیں کریں گے',
    'terms_s5_i3': 'دوسرے صارفین کا روپ نہیں دھاریں گے',
    'terms_s5_i4': 'Rip It کو غیر قانونی سرگرمی کے لیے استعمال نہیں کریں گے',
    'terms_s5_footer': 'خلاف ورزیوں کے نتیجے میں معطلی، پابندی یا اکاؤنٹ کا خاتمہ ہو سکتا ہے۔',
    'terms_s6_title': '6. مواد اور صارف کا ڈیٹا',
    'terms_s6_i1': 'آپ ایپ میں تخلیق کردہ مواد کی ملکیت برقرار رکھتے ہیں۔',
    'terms_s6_i2': 'آپ اپنی گذارشات اور طرز عمل کے ذمہ دار ہیں۔',
    'terms_s6_i3': 'Rip It صارف کے تیار کردہ مواد کا ذمہ دار نہیں ہے۔',
    'terms_s6_i4': 'ہم ایسا مواد ہٹا سکتے ہیں جو ان شرائط کی خلاف ورزی کرتا ہے یا غیر محفوظ ہے۔',
    'terms_s7_title': '7. اکاؤنٹ کی معطلی، ری سیٹ اور خاتمہ',
    'terms_s7_i1': 'اگر شرائط کی خلاف ورزی کی گئی یا پلیٹ فارم کا غلط استعمال کیا گیا تو اکاؤنٹس کو معطل، ری سیٹ یا حذف کیا جا سکتا ہے۔',
    'terms_s7_i2': 'کچھ موڈز گیم پلے میکانکس کے حصے کے طور پر پروفائل ری سیٹ کا باعث بن سکتے ہیں۔',
    'terms_s7_i3': 'آپ کسی بھی وقت اپنا اکاؤنٹ حذف کر سکتے ہیں۔',
    'terms_s8_title': '8. ڈس کلیمر',
    'terms_s8_i1': 'Rip It "جیسا ہے" فراہم کیا گیا ہے۔',
    'terms_s8_i2': 'ہم بلا تعطل سروس کی ضمانت نہیں دیتے ہیں۔',
    'terms_s8_i3': 'ہم صارف کے نتائج، پروفائل ری سیٹ، یا کھوئی ہوئی پہچان کے ذمہ دار نہیں ہیں۔',
    'terms_s8_i4': 'شرکت آپ کی اپنی صوابدید پر ہے۔',
    'terms_s9_title': '9. ان شرائط میں تبدیلیاں',
    'terms_s9_desc': 'ہم وقتاً فوقتاً ان شرائط کو اپ ڈیٹ کر سکتے ہیں۔ بڑی تبدیلیوں کا اعلان ایپ میں کیا جائے گا۔',
    'terms_s10_title': '10. رابطہ',
    'terms_s10_desc': 'سوالات یا خدشات؟',
    'terms_s10_email': 'ای میل: ripit90210@gmail.com'
  },
  fa: {
    // Settings
    'settings': 'تنظیمات',
    'app': 'اپلیکیشن',
    'language': 'زبان',
    'theme': 'تم',
    'personalization': 'شخصی‌سازی',
    'about': 'درباره',
    'model': 'مدل',
    'terms': 'شرایط خدمات',
    'privacy': 'سیاست حریم خصوصی',
    'contact': 'تماس با ما',
    'logout': 'خروج',
    'cancel': 'لغو',

    // BottomNav
    'nav_home': 'خانه',
    'nav_search': 'imemo0',
    'nav_create': 'ایجاد',
    'nav_notifications': 'فعالیت',
    'nav_profile': 'پروفایل',

    // Home
    'home_following': 'دنبال‌شونده‌ها',
    'home_for_you': 'برای شما',
    'home_live_challenge': 'چالش زنده',
    'home_survivors': 'بازماندگان',
    'home_pass': 'رد کردن',
    'home_smash': 'شکستن',
    'home_add_enemy': 'افزودن دشمن',
    'home_added_enemy': 'دشمن اضافه شد',
    'home_share': 'اشتراک‌گذاری',
    'home_remix': 'ریمیکس',
    'home_made_it': 'موفق شد',
    'home_pleyed': 'بازی شد',
    'home_won': 'برنده شد',
    'home_survived': 'زنده ماند',
    'home_the_end': 'پایان',
    'home_all_judged': 'همه پروفایل‌ها داوری شدند',
    'home_upload_modal_title': 'پست جدید',
    'home_upload_caption_placeholder': 'کپشن بنویسید...',
    'home_upload_cancel': 'لغو',
    'home_upload_post': 'انتشار',
    'home_eliminated': 'حذف شد',
    'home_majority': 'اکثریت',
    'home_choose_variant': 'انتخاب نسخه',
    'home_set_duration': 'تنظیم زمان',
    'home_select_ranking': 'انتخاب رتبه‌بندی',
    'home_select_rule': 'انتخاب قانون',
    'home_current_choice': 'انتخاب فعلی',
    'home_community_votes': 'آرای جامعه',
    'home_selection_locked': 'انتخاب تا پایان تایمر قفل است',
    'home_submitted': 'ثبت شد',
    'home_invalid_ranking': 'رتبه‌بندی نامعتبر',
    'home_submit': 'ثبت',
    'home_view_history': 'مشاهده تاریخچه',
    'home_start_new': 'یا شروع راند جدید',

    // Search
    'search_header_details': 'جزئیات راند',
    'search_header_results': 'نتایج راند',
    'search_header_hall': 'تالار افتخارات',
    'search_header_history': 'تاریخچه راندها',
    'search_top_survivors': 'برترین بازماندگان',
    'search_recent_outcomes': 'نتایج اخیر',
    'search_clear_history': 'پاکسازی تاریخچه',
    'search_start_round': 'شروع راند',
    'search_filter_type': 'نوع راند:',
    'search_all_winners': 'همه برندگان',
    'search_try_again': 'تلاش مجدد',
    'search_total_termination': 'حذف کامل',
    'search_no_winners': 'برنده‌ای پیدا نشد',
    'search_waiting': 'در انتظار برنده',
    'search_no_active': 'راند فعالی وجود ندارد',
    'search_waiting_desc': 'راند در حال برگزاری است. منتظر نتایج باشید.',
    'search_start_desc': 'برای دیدن بازماندگان، یک راند جدید از صفحه اصلی شروع کنید.',
    'search_join_next': 'پیوستن به وظیفه بعدی',

    // CreatePost
    'create_new_post': 'پست جدید',
    'create_next': 'بعدی',
    'create_camera': 'دوربین',
    'create_gallery': 'گالری',
    'create_select_preview': 'انتخاب رسانه برای پیش‌نمایش',
    'create_caption_placeholder': 'کپشن بنویسید...',

    // Notifications
    'notif_activity': 'فعالیت',
    'notif_follow': 'دنبال کردن',
    'notif_following': 'دنبال می‌کنید',
    'notif_upvoted': 'عکس شما را لایک کرد',
    'notif_commented': 'نظر داد:',
    'notif_started_following': 'شما را دنبال کرد',

    // Profile
    'profile_posts': 'پست‌ها',
    'profile_followers': 'دنبال‌کننده‌ها',
    'profile_following': 'دنبال‌شونده‌ها',
    'profile_enemies': 'دشمنان',
    'profile_edit': 'ویرایش پروفایل',
    'profile_share': 'اشتراک‌گذاری پروفایل',
    'profile_bio_placeholder': 'یک بیو به پروفایل خود اضافه کنید...',
    'profile_tab_posts': 'پست‌ها',
    'profile_tab_enemies': 'دشمنان',
    'profile_tab_following': 'دنبال‌شونده‌ها',
    'profile_no_posts': 'هنوز پستی وجود ندارد',
    'profile_no_enemies': 'هنوز دشمن خونی وجود ندارد',
    'profile_no_following': 'شما هنوز کسی را دنبال نکرده‌اید',
    'profile_marked_enemy': 'به عنوان دشمن علامت‌گذاری شد',
    'profile_enemies_desc': 'پروفایل‌هایی که به عنوان دشمن علامت می‌زنید اینجا ظاهر می‌شوند.',
    'profile_following_desc': 'بازماندگان را از تالار افتخارات دنبال کنید تا اینجا ببینید.',
    'profile_unfollow': 'لغو دنبال کردن',
    'profile_legend': 'افسانه',
    'post_view_comments': 'مشاهده همه نظرات',
    'post_write_comment': 'نوشتن نظر...',
    'post_add_comment': 'افزودن نظر',
    'timer_rule': 'قانون',
    'theme_light': 'روشن',
    'theme_system': 'سیستم',

    // Personalization Modal
    'pers_title': '🔥 Rip It – شخصی‌سازی (سبک نسل Z)',
    'pers_subtitle': 'Rip It برای همه یکسان نیست.',
    'pers_desc': 'پروفایل شما با نحوه بقای شما تکامل می‌یابد.',
    'pers_item1': 'تم‌ها و حال و هوای سفارشی',
    'pers_item2': 'بصری‌های مبتنی بر حالت (Pley، Pley، Pley هر کدام حس متفاوتی دارند)',
    'pers_item3': 'عناوین پویا که وضعیت شما را نشان می‌دهند',
    'pers_item4': 'انرژی دنبال‌کنندگان که حضور شما را می‌سازد',
    'pers_footer1': 'هر چه بیشتر بازی کنید، هویت شما بیشتر تغییر می‌کند.',
    'pers_footer2': 'ببرید یا ری‌ست شوید — میراث شما همچنان باقی است.',
    'pers_button': 'متوجه شدم',

    // About Modal
    'about_title': 'درباره Rip It',
    'about_tagline': 'شعار: زنده بمان. ری‌ست شو. تکامل یاب.',
    'about_desc1': 'Rip It یک پلتفرم بقای اجتماعی با ریسک بالاست که برای بازیکنان جسور طراحی شده است. در حالت‌هایی مانند Pley، Pley و Pley رقابت کنید تا استراتژی، انعطاف‌پذیری و مهارت‌های اجتماعی خود را آزمایش کنید.',
    'about_pley_title': 'Pley',
    'about_pley_desc': 'حالت بقا با حذف با ریسک بالا.',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': 'حالت افراطی برای کسانی که جرات ریسک کردن همه چیز را دارند.',
    'about_desc2': 'Rip It تعامل اجتماعی، رقابت و شخصی‌سازی پویا را ترکیب می‌کند تا تجربه‌ای منحصر به فرد، ویروسی و پر از آدرنالین ایجاد کند.',
    'about_footer': 'ما اینجا هستیم تا پروفایل، وضعیت و داستان بقای شما مهم باشد—ببرید، ری‌ست شوید یا تکامل یابید.',
    'about_close': 'بستن',

    // Contact Modal
    'contact_title': 'تماس با ما',
    'contact_desc': 'سوالی دارید، بازخوردی دارید یا فقط می‌خواهید داستان بقای خود را به ما بگویید؟ با ما در تماس باشید:',
    'contact_email_label': 'ایمیل',
    'contact_email_or': 'یا',
    'contact_footer': 'ما به سرعت شمارش معکوس تایمر Pley با شما تماس خواهیم گرفت.',
    'contact_close': 'بستن',

    // Model Modal
    'model_title': '🔥 Rip It – مدل اپلیکیشن',
    'model_concept_title': '1️⃣ مفهوم اصلی',
    'model_concept_desc': 'Rip It یک اپلیکیشن بقای اجتماعی با ریسک بالاست که در آن مشارکت کاربر، رای‌گیری و استراتژی تعیین‌کننده پیشرفت، وضعیت و میراث است. هر اقدام عواقبی دارد که تنش و تعامل ایجاد می‌کند.',
    'model_modes_title': '2️⃣ حالت‌ها',
    'model_pley_title': 'Pley',
    'model_pley_item1': 'تمرکز بر بقا',
    'model_pley_item2': 'فقط رای‌های منفی مهم هستند',
    'model_pley_item3': 'راندهای زمان‌دار (کاربر مدت زمان را تعیین می‌کند)',
    'model_pley_item4': 'آخرین کاربران باقی‌مانده شناسایی می‌شوند',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': 'حالت بقای افراطی',
    'model_Pley_item2': 'فقط رای منفی',
    'model_Pley_item3': 'ری‌ست کامل در صورت رای منفی',
    'model_Pley_item4': 'داوطلبانه برای جویندگان هیجان با ریسک بالا',
    'model_pers_title': '3️⃣ شخصی‌سازی (غیر IP اختصاصی)',
    'model_pers_item1': 'نام نمایشی و تم پروفایل سفارشی',
    'model_pers_item2': 'تجربه بصری مبتنی بر حالت',
    'model_pers_item3': 'عناوین و وضعیت پویا',
    'model_pers_item4': 'متریک‌های دنبال‌کننده/تعامل',
    'model_close': 'بستن',

    // Privacy Modal
    'priv_subtitle': 'حریم خصوصی شما مهم است.',
    'priv_effective': 'تاریخ اجرا: ۰۲/۲۳/۲۶',
    'priv_intro': 'با استفاده از Rip It، شما با جمع‌آوری و استفاده از اطلاعات به شرح زیر موافقت می‌کنید.',
    'priv_s1_title': '1️⃣ اطلاعاتی که ما جمع‌آوری می‌کنیم',
    'priv_s1_i1': 'اطلاعات حساب: نام کاربری، ایمیل، داده‌های پروفایل و ترجیحات.',
    'priv_s1_i2': 'اطلاعات بازی: مشارکت در حالت‌ها، رای‌ها، تایمرها، دستاوردها.',
    'priv_s1_i3': 'اطلاعات دستگاه: آدرس IP، نوع دستگاه، سیستم عامل و آمار استفاده.',
    'priv_s1_i4': 'اطلاعات اختیاری: لینک‌های اجتماعی یا محتوایی که برای اشتراک‌گذاری انتخاب می‌کنید.',
    'priv_s2_title': '2️⃣ نحوه استفاده ما از اطلاعات شما',
    'priv_s2_i1': 'برای اجرا و بهبود ویژگی‌ها و حالت‌های Rip It.',
    'priv_s2_i2': 'برای شخصی‌سازی تجربه شما، از جمله تم‌های پروفایل و وضعیت.',
    'priv_s2_i3': 'برای شناسایی سوءاستفاده، اسپم یا فعالیت‌های ناامن.',
    'priv_s2_i4': 'برای اطلاع‌رسانی به‌روزرسانی‌ها، رویدادها یا پیام‌های پشتیبانی.',
    'priv_s3_title': '3️⃣ اشتراک‌گذاری اطلاعات شما',
    'priv_s3_i1': 'ما اطلاعات شخصی شما را نمی‌فروشیم.',
    'priv_s3_i2': 'برخی داده‌ها ممکن است برای سایر کاربران قابل مشاهده باشد (مانند نام کاربری، وضعیت و اطلاعات جدول امتیازات).',
    'priv_s3_i3': 'ما ممکن است داده‌ها را با ارائه‌دهندگان خدمات یا برای انطباق قانونی به اشتراک بگذاریم.',
    'priv_s4_title': '4️⃣ امنیت',
    'priv_s4_i1': 'ما از روش‌های استاندارد صنعت برای محافظت از داده‌های شما استفاده می‌کنیم.',
    'priv_s4_i2': 'هیچ سیستمی کامل نیست—مشارکت با ریسک همراه است، به خصوص در ویژگی‌های عمومی.',
    'priv_s5_title': '5️⃣ انتخاب‌های شما',
    'priv_s5_i1': 'شما می‌توانید در هر زمان حساب خود را به‌روزرسانی یا حذف کنید.',
    'priv_s5_i2': 'شما می‌توانید مشاهده پروفایل و فعالیت خود را در اپلیکیشن کنترل کنید.',
    'priv_s5_i3': 'شما می‌توانید از دریافت ارتباطات غیرضروری انصراف دهید.',
    'priv_s6_title': '6️⃣ تغییرات در سیاست حریم خصوصی',
    'priv_s6_i1': 'به‌روزرسانی‌ها ممکن است همزمان با تکامل اپلیکیشن اتفاق بیفتد.',
    'priv_s6_i2': 'تغییرات عمده در اپلیکیشن اعلام خواهد شد.',

    // Terms Modal
    'terms_tagline': 'شعار: زنده بمان. ری‌ست شو. تکامل یاب.',
    'terms_effective': 'تاریخ اجرا: ۰۲/۲۳/۲۶',
    'terms_intro': 'با استفاده از Rip It، شما با این شرایط موافقت می‌کنید. اگر موافق نیستید، لطفا از اپلیکیشن استفاده نکنید.',
    'terms_s1_title': '۱. Rip It چیست',
    'terms_s1_desc': 'Rip It یک اپلیکیشن بقای اجتماعی با ریسک بالاست که در آن کاربران در چالش‌های زمان‌دار، رای‌گیری عمومی و حالت‌های رقابتی شرکت می‌کنند.',
    'terms_s1_list_title': 'ما ابزارهایی برای موارد زیر فراهم می‌کنیم:',
    'terms_s1_i1': 'تجربه‌های بقای مبتنی بر حالت (Pley، Pley، Pley)',
    'terms_s1_i2': 'رای‌گیری عمومی و شناسایی',
    'terms_s1_i3': 'شخصی‌سازی پروفایل و پیگیری وضعیت',
    'terms_s1_disclaimer': 'Rip It نتایج، بقا یا رتبه‌بندی را تضمین نمی‌کند.',
    'terms_s2_title': '۲. چه کسی می‌تواند از Rip It استفاده کند',
    'terms_s2_i1': 'حداقل ۱۳ سال سن داشته باشد',
    'terms_s2_i2': 'از اپلیکیشن به صورت قانونی و محترمانه استفاده کند',
    'terms_s2_i3': 'اطلاعات دقیق ارائه دهد',
    'terms_s2_i4': 'مسئول حساب و فعالیت خود باشد',
    'terms_s3_title': '۳. حالت‌ها و قوانین رای‌گیری',
    'terms_s3_i1': 'Pley، Pley و Pley دارای مکانیک‌های منحصر به فردی هستند که بر وضعیت و پیشرفت پروفایل تاثیر می‌گذارند.',
    'terms_s3_i2': 'رای‌ها ممکن است بر پیشرفت کاربر، ری‌ست پروفایل یا محدودیت‌های موقت تاثیر بگذارند.',
    'terms_s3_i3': 'تایمرها، راندها و نتایج توسط اپلیکیشن و کاربران شرکت‌کننده تعیین می‌شوند.',
    'terms_s3_i4': 'کاربران با صلاحدید خود مشارکت می‌کنند.',
    'terms_s4_title': '۴. اعتبار، وضعیت و امتیازها',
    'terms_s4_intro': 'با استفاده از Rip It، شما متوجه می‌شوید که:',
    'terms_s4_i1': 'وضعیت، عناوین و شناسایی منعکس‌کننده عملکرد در اپلیکیشن و تاریخچه بقا است',
    'terms_s4_i2': 'رای‌گیری عمومی بر پیشرفت در حالت‌ها تاثیر می‌گذارد',
    'terms_s4_i3': 'Rip It نتایج را به نفع هیچ کاربری دستکاری نمی‌کند',
    'terms_s4_i4': 'سوءاستفاده، دستکاری یا اسپم ممکن است منجر به جریمه یا حذف شود',
    'terms_s5_title': '۵. رفتار کاربر',
    'terms_s5_intro': 'شما موافقت می‌کنید که:',
    'terms_s5_i1': 'دیگران را آزار ندهید، تهدید نکنید یا قلدری نکنید',
    'terms_s5_i2': 'اسپم نکنید یا رای‌ها را دستکاری نکنید',
    'terms_s5_i3': 'خود را به جای دیگران جا نزنید',
    'terms_s5_i4': 'از Rip It برای فعالیت‌های غیرقانونی استفاده نکنید',
    'terms_s5_footer': 'تخلفات ممکن است منجر به تعلیق، محدودیت یا حذف حساب شود.',
    'terms_s6_title': '۶. محتوا و داده‌های کاربر',
    'terms_s6_i1': 'شما مالکیت محتوایی را که در اپلیکیشن ایجاد می‌کنید حفظ می‌کنید.',
    'terms_s6_i2': 'شما مسئول ارسالی‌ها و رفتار خود هستید.',
    'terms_s6_i3': 'Rip It مسئولیتی در قبال محتوای تولید شده توسط کاربر ندارد.',
    'terms_s6_i4': 'ما ممکن است محتوایی را که این شرایط را نقض می‌کند یا ناامن است حذف کنیم.',
    'terms_s7_title': '۷. تعلیق، ری‌ست و خاتمه حساب',
    'terms_s7_i1': 'اگر شرایط نقض شود یا از پلتفرم سوءاستفاده شود، حساب‌ها ممکن است تعلیق، ری‌ست یا حذف شوند.',
    'terms_s7_i2': 'برخی حالت‌ها ممکن است به عنوان بخشی از مکانیک‌های بازی منجر به ری‌ست پروفایل شوند.',
    'terms_s7_i3': 'شما می‌توانید در هر زمان حساب خود را حذف کنید.',
    'terms_s8_title': '۸. سلب مسئولیت',
    'terms_s8_i1': 'Rip It به صورت "همانطور که هست" ارائه می‌شود.',
    'terms_s8_i2': 'ما خدمات بدون وقفه را تضمین نمی‌کنیم.',
    'terms_s8_i3': 'ما مسئولیتی در قبال نتایج کاربران، ری‌ست پروفایل یا شناسایی از دست رفته نداریم.',
    'terms_s8_i4': 'مشارکت با صلاحدید خود شماست.',
    'terms_s9_title': '۹. تغییرات در این شرایط',
    'terms_s9_desc': 'ما ممکن است این شرایط را به صورت دوره‌ای به‌روزرسانی کنیم. تغییرات مهم در اپلیکیشن اعلام خواهد شد.',
    'terms_s10_title': '۱۰. تماس',
    'terms_s10_desc': 'سوالی دارید؟',
    'terms_s10_email': 'ایمیل: ripit90210@gmail.com'
  },
  es: {
    // Settings
    'settings': 'Ajustes',
    'app': 'App',
    'language': 'Idioma',
    'theme': 'Tema',
    'personalization': 'Personalización',
    'about': 'Acerca de',
    'model': 'Modelo',
    'terms': 'Términos de Servicio',
    'privacy': 'Política de Privacidad',
    'contact': 'Contáctanos',
    'logout': 'Cerrar Sesión',
    'cancel': 'Cancelar',

    // BottomNav
    'nav_home': 'Inicio',
    'nav_search': 'imemo0',
    'nav_create': 'Crear',
    'nav_notifications': 'Actividad',
    'nav_profile': 'Perfil',

    // Home
    'home_following': 'Siguiendo',
    'home_for_you': 'Para ti',
    'home_live_challenge': 'Desafío en Vivo',
    'home_survivors': 'Sobrevivientes',
    'home_pass': 'Pasar',
    'home_smash': 'Smash',
    'home_add_enemy': 'Añadir Enemigo',
    'home_added_enemy': 'Enemigo Añadido',
    'home_share': 'Compartir',
    'home_remix': 'Remix',
    'home_made_it': 'Logrado',
    'home_pleyed': 'Jugado',
    'home_won': 'Ganado',
    'home_survived': 'Sobrevivió',
    'home_the_end': 'El Fin',
    'home_all_judged': 'Todos los perfiles juzgados',
    'home_universal_complete': 'Selección universal completa',
    'home_winner_complete': 'Selección de ganador completa',
    'home_upload_modal_title': 'Nueva Publicación',
    'home_upload_caption_placeholder': 'Escribe un pie de foto...',
    'home_upload_cancel': 'Cancelar',
    'home_upload_post': 'Publicar',
    'home_eliminated': 'Eliminado',
    'home_majority': 'Mayoría',
    'home_choose_variant': 'Elegir Variante',
    'home_set_duration': 'Establecer Duración',
    'home_select_ranking': 'Elegir Ranking',
    'home_select_rule': 'Elegir Regla',
    'home_current_choice': 'Elección Actual',
    'home_community_votes': 'Votos de la Comunidad',
    'home_selection_locked': 'Elección bloqueada hasta que termine el temporizador',
    'home_submitted': 'Enviado',
    'home_invalid_ranking': 'Ranking Inválido',
    'home_submit': 'Enviar',
    'home_view_history': 'Ver Historial',
    'home_start_new': 'O comenzar nueva ronda',

    // Search
    'search_header_details': 'Detalles de la Ronda',
    'search_header_results': 'Resultados de la Ronda',
    'search_header_hall': 'Salón de la Fama',
    'search_header_history': 'Historial de Rondas',
    'search_top_survivors': 'Top Sobrevivientes',
    'search_recent_outcomes': 'Resultados Recientes',
    'search_clear_history': 'Borrar Historial',
    'search_start_round': 'Comenzar Ronda',
    'search_filter_type': 'Tipo de Ronda:',
    'search_all_winners': 'Todos los Ganadores',
    'search_try_again': 'Reintentar',
    'search_total_termination': 'TERMINACIÓN TOTAL',
    'search_no_winners': 'NO SE ENCONTRARON GANADORES',
    'search_waiting': 'Esperando ganador',
    'search_no_active': 'No hay ronda activa',
    'search_waiting_desc': 'Ronda en curso. Mantente al tanto.',
    'search_start_desc': 'Comienza una ronda desde el inicio para ver sobrevivientes.',
    'search_join_next': 'Unirse a la siguiente tarea',

    // CreatePost
    'create_new_post': 'Nueva Publicación',
    'create_next': 'Siguiente',
    'create_camera': 'Cámara',
    'create_gallery': 'Galería',
    'create_select_preview': 'Elegir multimedia para previsualizar',
    'create_caption_placeholder': 'Escribe un pie de foto...',

    // Notifications
    'notif_activity': 'Actividad',
    'notif_follow': 'Seguir',
    'notif_following': 'Siguiendo',
    'notif_upvoted': 'le dio like a tu foto',
    'notif_commented': 'comentó:',
    'notif_started_following': 'empezó a seguirte',

    // Profile
    'profile_posts': 'Publicaciones',
    'profile_followers': 'Seguidores',
    'profile_following': 'Siguiendo',
    'profile_enemies': 'Enemigos',
    'profile_edit': 'Editar Perfil',
    'profile_share': 'Compartir Perfil',
    'profile_bio_placeholder': 'Añade una biografía...',
    'profile_tab_posts': 'Publicaciones',
    'profile_tab_enemies': 'Enemigos',
    'profile_tab_following': 'Siguiendo',
    'profile_no_posts': 'Sin publicaciones aún',
    'profile_no_enemies': 'Sin enemigos jurados aún',
    'profile_no_following': 'No sigues a nadie aún',
    'profile_marked_enemy': 'Marcado como enemigo',
    'profile_enemies_desc': 'Los enemigos marcados aparecerán aquí.',
    'profile_following_desc': 'Sigue sobrevivientes del Salón de la Fama.',
    'profile_unfollow': 'Dejar de seguir',
    'profile_legend': 'Leyenda',
    'post_view_comments': 'Ver todos los comentarios',
    'post_write_comment': 'Escribir comentario...',
    'post_add_comment': 'Añadir comentario',
    'timer_rule': 'Regla',
    'theme_light': 'Claro',
    'theme_system': 'Sistema',

    // Personalization Modal
    'pers_title': '🔥 Rip It – Personalización (Estilo Gen Z)',
    'pers_subtitle': 'Rip It no es igual para todos.',
    'pers_desc': 'Tu perfil evoluciona con tu forma de sobrevivir.',
    'pers_item1': 'Vibras y temas personalizados',
    'pers_item2': 'Visuales basados en modo (Pley, Pley son diferentes)',
    'pers_item3': 'Títulos dinámicos que muestran tu estatus',
    'pers_item4': 'Energía de seguidores que construye tu presencia',
    'pers_footer1': 'Cuanto más juegas, más cambia tu identidad.',
    'pers_footer2': 'Ganes o reinicies — tu legado sigue hablando.',
    'pers_button': 'Entendido',

    // About Modal
    'about_title': 'Acerca de Rip It',
    'about_tagline': 'Eslogan: Sobrevive. Reinicia. Evoluciona.',
    'about_desc1': 'Rip It es una plataforma de supervivencia social de alto riesgo diseñada para jugadores audaces. Compite en modos como Pley, Pley y Pley para poner a prueba tu estrategia, resistencia y habilidades sociales.',
    'about_pley_title': 'Pley',
    'about_pley_desc': 'Modo de supervivencia con eliminación de alto riesgo.',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': 'Modo extremo para quienes se atreven a arriesgarlo todo.',
    'about_desc2': 'Rip It combina interacción social, competencia y personalización dinámica para crear una experiencia única, viral y llena de adrenalina.',
    'about_footer': 'Estamos aquí para que tu perfil, estatus e historia de supervivencia importen: gana, reinicia o evoluciona.',
    'about_close': 'Cerrar',

    // Contact Modal
    'contact_title': 'Contáctanos',
    'contact_desc': '¿Tienes preguntas, comentarios o simplemente quieres contarnos tu historia de supervivencia? Contáctanos:',
    'contact_email_label': 'Correo electrónico',
    'contact_email_or': 'o',
    'contact_footer': 'Te responderemos tan rápido como una cuenta regresiva de Pley.',
    'contact_close': 'Cerrar',

    // Model Modal
    'model_title': '🔥 Rip It – Modelo de Aplicación',
    'model_concept_title': '1️⃣ Concepto Principal',
    'model_concept_desc': 'Rip It es una aplicación de supervivencia social de alto riesgo donde la participación del usuario, la votación y la estrategia determinan la progresión, el estatus y el legado. Cada acción tiene consecuencias, creando tensión y compromiso.',
    'model_modes_title': '2️⃣ Modos',
    'model_pley_title': 'Pley',
    'model_pley_item1': 'Centrado en la supervivencia',
    'model_pley_item2': 'Solo cuentan los votos negativos',
    'model_pley_item3': 'Rondas cronometradas (el usuario establece la duración)',
    'model_pley_item4': 'Los últimos usuarios en pie ganan reconocimiento',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': 'Modo de supervivencia extremo',
    'model_Pley_item2': 'Solo votos negativos',
    'model_Pley_item3': 'Reinicio total si se vota en contra',
    'model_Pley_item4': 'Voluntario para buscadores de emociones de alto riesgo',
    'model_pers_title': '3️⃣ Personalización (No específica de IP)',
    'model_pers_item1': 'Nombre de usuario y tema de perfil personalizados',
    'model_pers_item2': 'Experiencia visual basada en el modo',
    'model_pers_item3': 'Títulos y estatus dinámicos',
    'model_pers_item4': 'Métricas de seguidores/compromiso',
    'model_close': 'Cerrar',

    // Privacy Modal
    'priv_subtitle': 'Tu privacidad importa.',
    'priv_effective': 'Fecha de entrada en vigor: 23/02/26',
    'priv_intro': 'Al usar Rip It, aceptas la recopilación y el uso de información como se describe a continuación.',
    'priv_s1_title': '1️⃣ Información que Recopilamos',
    'priv_s1_i1': 'Información de la cuenta: Nombre de usuario, correo electrónico, datos del perfil y preferencias.',
    'priv_s1_i2': 'Información del juego: Participación en modos, votos, temporizadores, logros.',
    'priv_s1_i3': 'Información del dispositivo: Dirección IP, tipo de dispositivo, sistema operativo y estadísticas de uso.',
    'priv_s1_i4': 'Información opcional: Enlaces sociales o contenido que elijas compartir.',
    'priv_s2_title': '2️⃣ Cómo Usamos Tu Información',
    'priv_s2_i1': 'Para operar y mejorar las funciones y modos de Rip It.',
    'priv_s2_i2': 'Para personalizar tu experiencia, incluidos los temas de perfil y el estatus.',
    'priv_s2_i3': 'Para detectar abusos, spam o actividades inseguras.',
    'priv_s2_i4': 'Para comunicar actualizaciones, eventos o mensajes de soporte.',
    'priv_s3_title': '3️⃣ Compartir Tu Información',
    'priv_s3_i1': 'No vendemos tu información personal.',
    'priv_s3_i2': 'Algunos datos pueden ser visibles para otros usuarios (como nombres de usuario, estatus e información de la tabla de clasificación).',
    'priv_s3_i3': 'Podemos compartir datos con proveedores de servicios o para cumplimiento legal.',
    'priv_s4_title': '4️⃣ Seguridad',
    'priv_s4_i1': 'Utilizamos prácticas estándar de la industria para proteger tus datos.',
    'priv_s4_i2': 'Ningún sistema es perfecto; la participación conlleva riesgos, especialmente en funciones públicas.',
    'priv_s5_title': '5️⃣ Tus Opciones',
    'priv_s5_i1': 'Puedes actualizar o eliminar tu cuenta en cualquier momento.',
    'priv_s5_i2': 'Puedes controlar la visibilidad de tu perfil y actividad en la aplicación.',
    'priv_s5_i3': 'Puedes optar por no recibir comunicaciones no esenciales.',
    'priv_s6_title': '6️⃣ Cambios en la Política de Privacidad',
    'priv_s6_i1': 'Pueden ocurrir actualizaciones a medida que la aplicación evoluciona.',
    'priv_s6_i2': 'Los cambios importantes se anunciarán en la aplicación.',

    // Terms Modal
    'terms_tagline': 'Eslogan: Sobrevive. Reinicia. Evoluciona.',
    'terms_effective': 'Fecha de entrada en vigor: 23/02/26',
    'terms_intro': 'Al usar Rip It, aceptas estos Términos. Si no estás de acuerdo, no uses la aplicación.',
    'terms_s1_title': '1. Qué es Rip It',
    'terms_s1_desc': 'Rip It es una aplicación de supervivencia social de alto riesgo donde los usuarios participan en desafíos cronometrados, votaciones públicas y modos competitivos.',
    'terms_s1_list_title': 'Proporcionamos herramientas para:',
    'terms_s1_i1': 'Experiencias de supervivencia basadas en modos (Pley, Pley)',
    'terms_s1_i2': 'Votación pública y reconocimiento',
    'terms_s1_i3': 'Personalización del perfil y seguimiento del estatus',
    'terms_s1_disclaimer': 'Rip It no garantiza resultados, supervivencia o ranking.',
    'terms_s2_title': '2. Quién puede usar Rip It',
    'terms_s2_i1': 'Tener al menos 13 años',
    'terms_s2_i2': 'Usar la aplicación de forma legal y respetuosa',
    'terms_s2_i3': 'Proporcionar información precisa',
    'terms_s2_i4': 'Ser responsable de tu cuenta y actividad',
    'terms_s3_title': '3. Modos y Reglas de Votación',
    'terms_s3_i1': 'Pley, Pley y Pley tienen mecánicas únicas que afectan el estatus y la progresión del perfil.',
    'terms_s3_i2': 'Los votos pueden afectar el progreso del usuario, el reinicio del perfil o restricciones temporales.',
    'terms_s3_i3': 'Los temporizadores, las rondas y los resultados son determinados por la aplicación y los usuarios participantes.',
    'terms_s3_i4': 'Los usuarios participan bajo su propia discreción.',
    'terms_s4_title': '4. Reputación, Estatus y Puntuaciones',
    'terms_s4_intro': 'Al usar Rip It, entiendes que:',
    'terms_s4_i1': 'El estatus, los títulos y el reconocimiento reflejan el desempeño en la aplicación y el historial de supervivencia.',
    'terms_s4_i2': 'La votación pública afecta la progresión dentro de los modos.',
    'terms_s4_i3': 'Rip It no manipula los resultados para favorecer a ningún usuario.',
    'terms_s4_i4': 'El abuso, la manipulación o el spam pueden resultar en penalizaciones o eliminación.',
    'terms_s5_title': '5. Conducta del Usuario',
    'terms_s5_intro': 'Aceptas no:',
    'terms_s5_i1': 'Acosar, amenazar o intimidar a otros.',
    'terms_s5_i2': 'Enviar spam o manipular votos.',
    'terms_s5_i3': 'Suplantar a otros usuarios.',
    'terms_s5_i4': 'Usar Rip It para actividades ilegales.',
    'terms_s5_footer': 'Las violaciones pueden resultar en la suspensión, restricción o eliminación de la cuenta.',
    'terms_s6_title': '6. Contenido y Datos del Usuario',
    'terms_s6_i1': 'Conservas la propiedad del contenido que creas en la aplicación.',
    'terms_s6_i2': 'Eres responsable de tus envíos y comportamiento.',
    'terms_s6_i3': 'Rip It no es responsable del contenido generado por los usuarios.',
    'terms_s6_i4': 'Podemos eliminar contenido que viole estos Términos o sea inseguro.',
    'terms_s7_title': '7. Suspensión, Reinicio y Terminación de la Cuenta',
    'terms_s7_i1': 'Las cuentas pueden ser suspendidas, reiniciadas o eliminadas si se violan los Términos o se hace un mal uso de la plataforma.',
    'terms_s7_i2': 'Ciertos modos pueden resultar en reinicios de perfil como parte de las mecánicas del juego.',
    'terms_s7_i3': 'Puedes eliminar tu cuenta en cualquier momento.',
    'terms_s8_title': '8. Descargo de Responsabilidad',
    'terms_s8_i1': 'Rip It se proporciona "tal cual".',
    'terms_s8_i2': 'No garantizamos un servicio ininterrumpido.',
    'terms_s8_i3': 'No somos responsables de los resultados de los usuarios, los reinicios de perfil o la pérdida de reconocimiento.',
    'terms_s8_i4': 'La participación es bajo tu propia discreción.',
    'terms_s9_title': '9. Cambios en estos Términos',
    'terms_s9_desc': 'Podemos actualizar estos Términos periódicamente. Los cambios significativos se comunicarán en la aplicación.',
    'terms_s10_title': '10. Contacto',
    'terms_s10_desc': '¿Preguntas o inquietudes?',
    'terms_s10_email': 'Correo electrónico: ripit90210@gmail.com'
  },
  tl: {
    // Settings
    'settings': 'Mga Setting',
    'app': 'App',
    'language': 'Wika',
    'theme': 'Tema',
    'personalization': 'Personalization',
    'about': 'Tungkol sa',
    'model': 'Model',
    'terms': 'Mga Kasunduan',
    'privacy': 'Patakaran sa Privacy',
    'contact': 'Makipag-ugnayan',
    'logout': 'Mag-logout',
    'cancel': 'I-cancel',

    // BottomNav
    'nav_home': 'Home',
    'nav_search': 'imemo0',
    'nav_create': 'Gumawa',
    'nav_notifications': 'Activity',
    'nav_profile': 'Profile',
    'nav_chat': 'Mga Mensahe',

    // Home
    'home_following': 'Following',
    'home_for_you': 'Para sa Iyo',
    'home_live_challenge': 'Live Challenge',
    'home_survivors': 'Survivors',
    'home_pass': 'Pass',
    'home_smash': 'Smash',
    'home_add_enemy': 'Magdagdag ng Kalaban',
    'home_added_enemy': 'Naidagdag na ang Kalaban',
    'home_share': 'I-share',
    'home_remix': 'Remix',
    'home_made_it': 'Nakapasa',
    'home_pleyed': 'Nilaro',
    'home_won': 'Nanalo',
    'home_survived': 'Nakapasa',
    'home_the_end': 'Ang Wakas',
    'home_all_judged': 'Tapos na ang paghatol',
    'home_universal_complete': 'Tapos na ang universal selection',
    'home_winner_complete': 'Tapos na ang winner selection',
    'home_upload_modal_title': 'Bagong Post',
    'home_upload_caption_placeholder': 'Magsulat ng caption...',
    'home_upload_cancel': 'I-cancel',
    'home_upload_post': 'I-post',
    'home_eliminated': 'Tanggal',
    'home_majority': 'Majority',
    'home_choose_variant': 'Pumili ng Variant',
    'home_set_duration': 'I-set ang Oras',
    'home_select_ranking': 'Pumili ng Ranking',
    'home_select_rule': 'Pumili ng Rule',
    'home_current_choice': 'Kasalukuyang Pili',
    'home_community_votes': 'Boto ng Community',
    'home_selection_locked': 'Naka-lock ang pili hanggang matapos ang timer',
    'home_submitted': 'Na-submit na',
    'home_invalid_ranking': 'Maling Ranking',
    'home_submit': 'I-submit',
    'home_view_history': 'Tingnan ang History',
    'home_start_new': 'O magsimula ng bagong round',

    // Search
    'search_header_details': 'Detalye ng Round',
    'search_header_results': 'Resulta ng Round',
    'search_header_hall': 'Hall of Fame',
    'search_header_history': 'History ng Round',
    'search_top_survivors': 'Top Survivors',
    'search_recent_outcomes': 'Mga Bagong Resulta',
    'search_clear_history': 'I-clear ang History',
    'search_start_round': 'Simulan ang Round',
    'search_filter_type': 'Uri ng Round:',
    'search_all_winners': 'Lahat ng Panalo',
    'search_try_again': 'Ulitin',
    'search_total_termination': 'TOTAL TERMINATION',
    'search_no_winners': 'WALANG NANALO',
    'search_waiting': 'Naghihintay ng mananalo',
    'search_no_active': 'Walang active na round',
    'search_waiting_desc': 'Kasalukuyang may round. Abangan ang resulta.',
    'search_start_desc': 'Magsimula ng round sa home screen para makita ang mga survivor.',
    'search_join_next': 'Sumali sa susunod na task',

    // CreatePost
    'create_new_post': 'Bagong Post',
    'create_next': 'Susunod',
    'create_camera': 'Camera',
    'create_gallery': 'Gallery',
    'create_select_preview': 'Pumili ng media para sa preview',
    'create_caption_placeholder': 'Magsulat ng caption...',

    // Notifications
    'notif_activity': 'Activity',
    'notif_follow': 'I-follow',
    'notif_following': 'Following',
    'notif_upvoted': 'ni-like ang iyong litrato',
    'notif_commented': 'nag-comment:',
    'notif_started_following': 'nagsimulang i-follow ka',

    // Profile
    'profile_posts': 'Mga Post',
    'profile_followers': 'Followers',
    'profile_following': 'Following',
    'profile_enemies': 'Mga Kalaban',
    'profile_edit': 'I-edit ang Profile',
    'profile_share': 'I-share ang Profile',
    'profile_bio_placeholder': 'Maglagay ng bio...',
    'profile_tab_posts': 'Mga Post',
    'profile_tab_enemies': 'Mga Kalaban',
    'profile_tab_following': 'Following',
    'profile_no_posts': 'Wala pang post',
    'profile_no_enemies': 'Wala pang kalaban',
    'profile_no_following': 'Wala ka pang fina-follow',
    'profile_marked_enemy': 'Minarkahang kalaban',
    'profile_enemies_desc': 'Lalabas dito ang mga minarkahang kalaban.',
    'profile_following_desc': 'I-follow ang mga survivor mula sa Hall of Fame.',
    'profile_unfollow': 'I-unfollow',
    'profile_legend': 'Legend',
    'post_view_comments': 'Tingnan lahat ng comment',
    'post_write_comment': 'Magsulat ng comment...',
    'post_add_comment': 'Magdagdag ng comment',
    'timer_rule': 'Rule',
    'theme_light': 'Light',
    'theme_system': 'System',

    // Personalization Modal
    'pers_title': '🔥 Rip It – Personalization (Z세대 Style)',
    'pers_subtitle': 'Ang Rip It ay hindi para sa lahat.',
    'pers_desc': 'Nagbabago ang iyong profile depende sa kung paano ka nabubuhay.',
    'pers_item1': 'Mga custom vibes at tema',
    'pers_item2': 'Mga visual base sa mode (Magkakaiba ang Pley, Pley, at Pley)',
    'pers_item3': 'Mga dynamic titles na nagpapakita ng iyong status',
    'pers_item4': 'Follower energy na nagpapatibay sa iyong presensya',
    'pers_footer1': 'Habang lalo kang naglalaro, lalong nagbabago ang iyong pagkakakilanlan.',
    'pers_footer2': 'Manalo o mag-reset — ang iyong legasiya ay patuloy na magsasalita.',
    'pers_button': 'Naintindihan ko',

    // About Modal
    'about_title': 'Tungkol sa Rip It',
    'about_tagline': 'Tagline: Mabuhay. Mag-reset. Mag-evolve.',
    'about_desc1': 'Ang Rip It ay isang high-stakes social survival platform na ginawa para sa mga matatapang na manlalaro. Sumali sa mga mode tulad ng Pley, Pley, at Pley para subukan ang iyong stratehiya, tatag, at social skills.',
    'about_pley_title': 'Pley',
    'about_pley_desc': 'Survival mode na may mataas na tsansa ng pagkakatanggal.',
    'about_Pley_title': 'Pley',
    'about_Pley_desc': 'Extreme mode para sa mga nangangahas na isugal ang lahat.',
    'about_desc2': 'Pinagsasama ng Rip It ang social interaction, kompetisyon, at dynamic personalization para gumawa ng kakaiba, viral, at adrenaline-pumping na karanasan.',
    'about_footer': 'Nandito kami para gawing mahalaga ang iyong profile, status, at survival story—manalo, mag-reset, o mag-evolve.',
    'about_close': 'Isara',

    // Contact Modal
    'contact_title': 'Makipag-ugnayan',
    'contact_desc': 'May mga katanungan, feedback, o gusto mo lang ikwento ang iyong survival story? Makipag-ugnayan sa amin:',
    'contact_email_label': 'Email',
    'contact_email_or': 'o',
    'contact_footer': 'Sasagutin ka namin kasing bilis ng Pley timer na nagka-countdown.',
    'contact_close': 'Isara',

    // Model Modal
    'model_title': '🔥 Rip It – App Model',
    'model_concept_title': '1️⃣ Pangunahing Konsepto',
    'model_concept_desc': 'Ang Rip It ay isang high-stakes social survival app kung saan ang partisipasyon ng user, pagboto, at stratehiya ang nagdedetermina ng pag-unlad, status, at legasiya. Ang bawat aksyon ay may kahihinatnan, na lumilikha ng tensyon at pakikilahok.',
    'model_modes_title': '2️⃣ Mga Mode',
    'model_pley_title': 'Pley',
    'model_pley_item1': 'Nakatuon sa survival',
    'model_pley_item2': 'Down votes lang ang mahalaga',
    'model_pley_item3': 'Mga timed round (ang user ang nagtatakda ng oras)',
    'model_pley_item4': 'Ang mga huling natitirang user ay nakakakuha ng pagkilala',
    'model_Pley_title': 'Pley',
    'model_Pley_item1': 'Extreme survival mode',
    'model_Pley_item2': 'Down votes lang',
    'model_Pley_item3': 'Full reset kapag na-vote down',
    'model_Pley_item4': 'Boluntaryo para sa mga naghahanap ng high-risk thrill',
    'model_pers_title': '3️⃣ Personalization (Non-IP Specific)',
    'model_pers_item1': 'Custom display name at tema ng profile',
    'model_pers_item2': 'Mode-based visual na karanasan',
    'model_pers_item3': 'Mga dynamic titles at status',
    'model_pers_item4': 'Mga follower/engagement metrics',
    'model_close': 'Isara',

    // Privacy Modal
    'priv_subtitle': 'Mahalaga ang iyong privacy.',
    'priv_effective': 'Petsa ng Pagpapatupad: 02/23/26',
    'priv_intro': 'Sa paggamit ng Rip It, sumasang-ayon ka sa pagkolekta at paggamit ng impormasyon gaya ng inilalarawan sa ibaba.',
    'priv_s1_title': '1️⃣ Impormasyong Kinokolekta Namin',
    'priv_s1_i1': 'Impormasyon ng account: Username, email, profile data, at mga preference.',
    'priv_s1_i2': 'Impormasyon ng gameplay: Partisipasyon sa mode, mga boto, timers, at mga nakamit.',
    'priv_s1_i3': 'Impormasyon ng device: IP address, uri ng device, OS, at stats ng paggamit.',
    'priv_s1_i4': 'Opsyonal na impormasyon: Mga social link o nilalaman na pinili mong ibahagi.',
    'priv_s2_title': '2️⃣ Paano Namin Ginagamit ang Iyong Impormasyon',
    'priv_s2_i1': 'Para patakbuhin at pagbutihin ang mga feature at mode ng Rip It.',
    'priv_s2_i2': 'Para i-personalize ang iyong karanasan, kabilang ang mga tema ng profile at status.',
    'priv_s2_i3': 'Para matukoy ang pang-aabuso, spam, o hindi ligtas na aktibidad.',
    'priv_s2_i4': 'Para ipaalam ang mga update, kaganapan, o mga mensahe ng suporta.',
    'priv_s3_title': '3️⃣ Pagbabahagi ng Iyong Impormasyon',
    'priv_s3_i1': 'Hindi namin ibinebenta ang iyong personal na impormasyon.',
    'priv_s3_i2': 'Ang ilang data ay maaaring makita ng ibang mga user (gaya ng mga username, status, at impormasyon sa leaderboard).',
    'priv_s3_i3': 'Maaari kaming magbahagi ng data sa mga service provider o para sa legal na pagsunod.',
    'priv_s4_title': '4️⃣ Seguridad',
    'priv_s4_i1': 'Gumagamit kami ng mga kasanayang naaayon sa pamantayan ng industriya para protektahan ang iyong data.',
    'priv_s4_i2': 'Walang sistema ang perpekto—ang pakikilahok ay may panganib, lalo na sa mga pampublikong feature.',
    'priv_s5_title': '5️⃣ Ang Iyong Mga Pagpipilian',
    'priv_s5_i1': 'Maaari mong i-update o burahin ang iyong account anumang oras.',
    'priv_s5_i2': 'Maaari mong kontrolin ang pagpapakita ng iyong profile at aktibidad sa app.',
    'priv_s5_i3': 'Maaari kang mag-opt out sa mga hindi mahahalagang komunikasyon.',
    'priv_s6_title': '6️⃣ Mga Pagbabago sa Patakaran sa Privacy',
    'priv_s6_i1': 'Maaaring magkaroon ng mga update habang nag-e-evolve ang app.',
    'priv_s6_i2': 'Ang mga malalaking pagbabago ay iaanunsyo sa loob ng app.',

    // Terms Modal
    'terms_tagline': 'Tagline: Mabuhay. Mag-reset. Mag-evolve.',
    'terms_effective': 'Petsa ng Pagpapatupad: 02/23/26',
    'terms_intro': 'Sa paggamit ng Rip It, sumasang-ayon ka sa mga Kasunduang ito. Kung hindi ka sumasang-ayon, mangyaring huwag gamitin ang app.',
    'terms_s1_title': '1. Ano ang Rip It',
    'terms_s1_desc': 'Ang Rip It ay isang high-stakes social survival app kung saan ang mga user ay lumalahok sa mga timed challenge, pampublikong pagboto, at mga competitive mode.',
    'terms_s1_list_title': 'Nagbibigay kami ng mga tool para sa:',
    'terms_s1_i1': 'Mode-based survival experiences (Pley, Pley)',
    'terms_s1_i2': 'Pampublikong pagboto at pagkilala',
    'terms_s1_i3': 'Profile personalization at pagsubaybay sa status',
    'terms_s1_disclaimer': 'Hindi ginagarantiya ng Rip It ang mga resulta, survival, o ranking.',
    'terms_s2_title': '2. Sino ang Maaaring Gumamit ng Rip It',
    'terms_s2_i1': 'Dapat ay hindi bababa sa 13 taong gulang',
    'terms_s2_i2': 'Gamitin ang app nang legal at may respeto',
    'terms_s2_i3': 'Magbigay ng tumpak na impormasyon',
    'terms_s2_i4': 'Maging responsable para sa iyong account at aktibidad',
    'terms_s3_title': '3. Mga Mode at Panuntunan sa Pagboto',
    'terms_s3_i1': 'Ang Pley, Pley, at Pley ay may mga natatanging mekanismo na nakakaapekto sa profile status at pag-unlad.',
    'terms_s3_i2': 'Ang mga boto ay maaaring makaapekto sa pag-unlad ng user, profile reset, o pansamantalang paghihigpit.',
    'terms_s3_i3': 'Ang mga timer, round, at resulta ay idinedetermina ng app at ng mga kalahok na user.',
    'terms_s3_i4': 'Ang mga user ay lumalahok sa sarili nilang pagpapasya.',
    'terms_s4_title': '4. Reputasyon, Status at mga Score',
    'terms_s4_intro': 'Sa paggamit ng Rip It, nauunawaan mo:',
    'terms_s4_i1': 'Ang status, mga titulo, at pagkilala ay sumasalamin sa in-app performance at survival history',
    'terms_s4_i2': 'Ang pampublikong pagboto ay nakakaapekto sa pag-unlad sa loob ng mga mode',
    'terms_s4_i3': 'Hindi minamanipula ng Rip It ang mga resulta para paboran ang sinumang user',
    'terms_s4_i4': 'Ang pang-aabuso, manipulasyon, o pag-spam ay maaaring magresulta sa mga parusa o pagtanggal',
    'terms_s5_title': '5. Pag-uugali ng User',
    'terms_s5_intro': 'Sumasang-ayon ka na huwag:',
    'terms_s5_i1': 'Mang-harass, magbanta, o mang-bully ng iba',
    'terms_s5_i2': 'Mag-spam o magmanipula ng mga boto',
    'terms_s5_i3': 'Magpanggap bilang ibang user',
    'terms_s5_i4': 'Gamitin ang Rip It para sa ilegal na aktibidad',
    'terms_s5_footer': 'Ang mga paglabag ay maaaring magresulta sa suspensyon, paghihigpit, o pagtanggal ng account.',
    'terms_s6_title': '6. Nilalaman at Data ng User',
    'terms_s6_i1': 'Pinananatili mo ang pagmamay-ari ng nilalamang ginagawa mo sa app.',
    'terms_s6_i2': 'Ikaw ang responsable para sa iyong mga isinumite at pag-uugali.',
    'terms_s6_i3': 'Ang Rip It ay hindi responsable para sa nilalamang gawa ng user.',
    'terms_s6_i4': 'Maaari kaming magtanggal ng nilalaman na lumalabag sa mga Kasunduang ito o hindi ligtas.',
    'terms_s7_title': '7. Pag-suspendi ng Account, Pag-reset at Pagwawakas',
    'terms_s7_i1': 'Ang mga account ay maaaring masuspinde, ma-reset, o mabura kung ang mga Kasunduan ay nilabag o ang platform ay maling ginamit.',
    'terms_s7_i2': 'Ang ilang mga mode ay maaaring magresulta sa mga profile reset bilang bahagi ng mekanismo ng gameplay.',
    'terms_s7_i3': 'Maaari mong burahin ang iyong account anumang oras.',
    'terms_s8_title': '8. Disclaimer',
    'terms_s8_i1': 'Ang Rip It ay ibinibigay nang "as is."',
    'terms_s8_i2': 'Hindi namin ginagarantiya ang walang gangguan na serbisyo.',
    'terms_s8_i3': 'Hindi kami responsable para sa mga resulta ng user, profile reset, o nawalang pagkilala.',
    'terms_s8_i4': 'Ang pakikilahok ay nasa sarili mong pagpapasya.',
    'terms_s9_title': '9. Mga Pagbabago sa mga Kasunduang Ito',
    'terms_s9_desc': 'Maaari naming i-update ang mga Kasunduang ito pana-panahon. Ang mga makabuluhang pagbabago ay ipapaalam sa loob ng app.',
    'terms_s10_title': '10. Pakikipag-ugnayan',
    'terms_s10_desc': 'May mga katanungan o alalahanin?',
    'terms_s10_email': 'Email: ripit90210@gmail.com'
  }
};

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export const ChallengeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem('language') || 'en';
  });
  const [theme, setTheme] = useState<string>(() => {
    const saved = localStorage.getItem('theme') || 'system';
    return saved === 'dark' ? 'system' : saved;
  });
  const getSecondsUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  };

  const calculateUniversalTimeLeft = () => {
    const now = Math.floor(Date.now() / 1000);
    const cycleSeconds = 240; // 4 minutes
    const remaining = cycleSeconds - (now % cycleSeconds);
    // Return 0 at the exact moment of reset
    const finalTime = remaining === cycleSeconds ? 0 : remaining;
    return finalTime;
  };

  const [timeLeft, setTimeLeft] = useState(calculateUniversalTimeLeft());
  const [isActive, setIsActive] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse userProfile', e);
      }
    }
    return {
      username: '',
      fullName: '',
      bio: '',
      avatar: '/custom-empty-profile.png',
      website: ''
    };
  });
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({
    pley: 0
  });
  const [eliminationCounts, setEliminationCounts] = useState<Record<string, number>>({
    pley: 0
  });
  const [madeItCounts, setMadeItCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('madeItCounts');
    return saved ? JSON.parse(saved) : { pley: 0 };
  });
  const [variantDurations, setVariantDurations] = useState<Record<string, number>>({
    pley: 0
  });
  const [variantFirstClickTime, setVariantFirstClickTime] = useState<Record<string, number>>({
    pley: 0
  });
  const [isEliminated, setIsEliminated] = useState(false);
  const [userSelection, setUserSelection] = useState<string | null>(() => {
    const userId = localStorage.getItem('supabaseUserId');
    if (!userId) return null;
    return localStorage.getItem(`userSelection_${userId}`);
  });
  const [isChallengeEnded, setIsChallengeEnded] = useState<boolean>(() => {
    const userId = localStorage.getItem('supabaseUserId');
    if (!userId) return false;
    const stored = localStorage.getItem(`isChallengeEnded_${userId}`) === 'true';
    if (!stored) return false;
    // Clear stale state — only valid if timer is currently at 0
    const now = Math.floor(Date.now() / 1000);
    const isAtZero = (now % 120) === 0;
    if (!isAtZero) {
      localStorage.setItem(`isChallengeEnded_${userId}`, 'false');
      return false;
    }
    return true;
  });
  const [isEliminationRoundActive, setIsEliminationRoundActive] = useState<boolean>(() => {
    const userId = localStorage.getItem('supabaseUserId');
    if (!userId) return false;
    const stored = localStorage.getItem(`isEliminationRoundActive_${userId}`) === 'true';
    if (!stored) return false;
    // Clear stale submitted state if timer has already cycled (not at 0)
    const now = Math.floor(Date.now() / 1000);
    const isAtZero = (now % 120) === 0;
    if (!isAtZero) {
      // Only keep if there are still seconds remaining in the SAME cycle they submitted
      // We can't know exactly, so keep it — it will be cleared when timer hits 0
      return true;
    }
    localStorage.setItem(`isEliminationRoundActive_${userId}`, 'false');
    return false;
  });
  const [enemies, setEnemies] = useState<Survivor[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>(() => {
    const saved = localStorage.getItem('allPosts_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [visiblePosts, setVisiblePosts] = useState<any[]>(() => {
    const saved = localStorage.getItem('visiblePosts_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [wallPosts, setWallPosts] = useState<WallPost[]>([]);
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [postComments, setPostComments] = useState<Record<number, Comment[]>>({});
  const [showPills, setShowPills] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('pley');
  const [survivors, setSurvivors] = useState<Survivor[]>([]);
  const [roundHistory, setRoundHistory] = useState<RoundRecord[]>(() => {
    const saved = localStorage.getItem('roundHistory');
    return saved ? JSON.parse(saved) : [];
  });
  // Only show loading if there is no cached data to show immediately
  const [historyLoading, setHistoryLoading] = useState(() => {
    return !localStorage.getItem('roundHistory');
  });

  useEffect(() => {
    const userId = localStorage.getItem('supabaseUserId');
    if (!userId) return;
    if (userSelection) localStorage.setItem(`userSelection_${userId}`, userSelection);
    else localStorage.removeItem(`userSelection_${userId}`);
  }, [userSelection]);

  useEffect(() => {
    const userId = localStorage.getItem('supabaseUserId');
    if (!userId) return;
    localStorage.setItem(`isEliminationRoundActive_${userId}`, String(isEliminationRoundActive));
  }, [isEliminationRoundActive]);

  useEffect(() => {
    const userId = localStorage.getItem('supabaseUserId');
    if (!userId) return;
    localStorage.setItem(`isChallengeEnded_${userId}`, String(isChallengeEnded));
  }, [isChallengeEnded]);

  // Hall of Fame is now derived from universal round history
  const survivorHistory = useMemo(() => {
    const allSurvivors: Survivor[] = [];
    const seenUsernames = new Set<string>();
    
    (roundHistory || []).forEach(round => {
      if (!round) return;
      (round.survivors || []).forEach((s: any) => {
        // Guard against null/undefined elements inside the JSONB array
        if (!s || !s.username) return;
        // Deduplicate by username so each person appears once in Hall of Fame
        if (!seenUsernames.has(s.username)) {
          allSurvivors.push({ ...s, madeIt: true });
          seenUsernames.add(s.username);
        }
      });
    });
    
    return allSurvivors;
  }, [roundHistory]);

  const [userVotes, setUserVotes] = useState<Record<string, number>>({});

  const [postLives, setPostLives] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem('postLives_v6');
    return saved ? JSON.parse(saved) : {};
  });

  const [userLives, setUserLives] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('userLives_v6');
    return saved ? JSON.parse(saved) : {};
  });

  const setUserVoteForPost = (postId: string | number, vote: number) => {
    setUserVotes(prev => ({ ...prev, [String(postId)]: vote }));
  };

  const setPostLivesForPost = (postId: number, lives: number) => {
    setPostLives(prev => ({ ...prev, [postId]: lives }));
  };

  const setUserLivesForUser = (username: string, lives: number) => {
    setUserLives(prev => ({ ...prev, [username]: lives }));
  };

  // Account-based scoping for private user data
  useEffect(() => {
    if (!userProfile.username) {
      setEnemies([]);
      setFollowedUsers([]);
      setWallPosts([]);
      setPostComments({});
      setUserVotes({});
      return;
    }

    const u = userProfile.username;
    const load = (key: string, setter: (val: any) => void, fallback: any) => {
      const saved = localStorage.getItem(`${key}_v7_${u}`);
      setter(saved ? JSON.parse(saved) : fallback);
    };

    load('userVotes', setUserVotes, {});
    load('enemies', setEnemies, []);
    load('followedUsers', setFollowedUsers, []);
    load('wallPosts', setWallPosts, []);
    load('postComments', setPostComments, {});
  }, [userProfile.username]);

  // Persist private data to scoped local storage
  useEffect(() => {
    if (!userProfile.username) return;
    const u = userProfile.username;
    localStorage.setItem(`userVotes_v7_${u}`, JSON.stringify(userVotes));
    localStorage.setItem(`enemies_v7_${u}`, JSON.stringify(enemies));
    localStorage.setItem(`followedUsers_v7_${u}`, JSON.stringify(followedUsers));
    localStorage.setItem(`wallPosts_v7_${u}`, JSON.stringify(wallPosts));
    localStorage.setItem(`postComments_v7_${u}`, JSON.stringify(postComments));
  }, [userProfile.username, userVotes, enemies, followedUsers, wallPosts, postComments]);

  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Sync unread count from Supabase
  useEffect(() => {
    const userId = localStorage.getItem('supabaseUserId');
    if (!userId || !isAuthenticated) {
      setUnreadMessageCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('read', false);
      
      if (!error && count !== null) {
        setUnreadMessageCount(count);
      }
    };

    fetchUnreadCount();

    // Subscribe to new messages for notification badge
    const channel = supabase
      .channel('global_unread_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      }, () => {
        setUnreadMessageCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  // Global/Public caches (not account-specific)
  useEffect(() => {
    localStorage.setItem('postLives_v6', JSON.stringify(postLives));
  }, [postLives]);

  useEffect(() => {
    localStorage.setItem('userLives_v6', JSON.stringify(userLives));
  }, [userLives]);

  useEffect(() => {
    localStorage.setItem('madeItCounts', JSON.stringify(madeItCounts));
  }, [madeItCounts]);

  // Sync only metadata to local storage, but avoid syncing heavy post lists which cause UI lag
  // Supabase is the source of truth for posts now.


  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('isChallengeEnded', String(isChallengeEnded));
  }, [isChallengeEnded]);

  // Sync Supabase posts into context globally
  const { posts: supabasePosts, loading: postsLoading, refetch: refetchPosts } = useSupabasePosts();
  const formattedPosts = useMemo(() => supabasePosts.map(formatPostForUI), [supabasePosts]);

  useEffect(() => {
    if (postsLoading) return;
    if (formattedPosts.length === 0) return;
    
    setAllPosts(prevAll => {
      // Create a map for O(1) lookups of existing posts
      const existingMap = new Map(prevAll.map(p => [String(p.id), p]));
      let changed = false;

      // Start with the incoming formatted posts (which are already sorted newest-first)
      const newMerged: any[] = [];
      
      formattedPosts.forEach(dbPost => {
        const existing = existingMap.get(String(dbPost.id));
        if (!existing) {
          newMerged.push(dbPost);
          changed = true;
        } else {
          if (JSON.stringify(existing) !== JSON.stringify(dbPost)) {
            newMerged.push(dbPost);
            changed = true;
          } else {
            newMerged.push(existing);
          }
        }
      });

      // Preserve any optimistic posts (like those with 'opt-' IDs) that aren't in db yet
      prevAll.forEach(p => {
        if (String(p.id).startsWith('opt-') || String(p.id).includes('-')) {
          // If it's an optimistic post, keep it at the top
          if (!newMerged.find(mergedPost => String(mergedPost.id) === String(p.id))) {
            newMerged.unshift(p);
            changed = true;
          }
        }
      });

      if (!changed && newMerged.length === prevAll.length) return prevAll;
      return newMerged;
    });
  }, [formattedPosts, postsLoading]);

  useEffect(() => {
    try {
      localStorage.setItem('allPosts_v2', JSON.stringify(allPosts));
    } catch(e) {
      console.warn('Storage quota exceeded for allPosts_v2');
    }
  }, [allPosts]);

  useEffect(() => {
    try {
      localStorage.setItem('visiblePosts_v2', JSON.stringify(visiblePosts));
    } catch(e) {
      console.warn('Storage quota exceeded for visiblePosts_v2');
    }
  }, [visiblePosts]);

  useEffect(() => {
    try {
      localStorage.setItem('roundHistory', JSON.stringify(roundHistory));
    } catch(e) {
      console.warn('Storage quota exceeded for roundHistory');
    }
  }, [roundHistory]);



  useEffect(() => {
    localStorage.setItem('theme', theme);
    // Since we're removing dark mode, we always remove the 'dark' class
    document.documentElement.classList.remove('dark');
  }, [theme]);

  const fetchUserProfile = async (userId: string, authUser?: any) => {
    // Start with data from auth metadata as immediate fallback
    if (authUser?.user_metadata?.username || authUser?.user_metadata?.full_name) {
      setUserProfile((prev: any) => ({
        ...prev,
        username: authUser.user_metadata.username || prev.username,
        fullName: authUser.user_metadata.full_name || prev.fullName,
      }));
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (data && !error) {
      setUserProfile((prev: any) => ({
        ...prev,
        username: data.username || '',
        fullName: data.full_name || '',
        bio: data.bio || '',
        avatar: data.avatar_url || '',
        website: data.website || ''
      }));
      setIsEliminated(false);
    } else if (error && authUser) {
      // PGRST116 means no rows found -> POTENTIALLY Eliminated
      if (error.code === 'PGRST116') {
        // Check if user is very new (race condition with trigger)
        const createdAt = authUser?.created_at ? new Date(authUser.created_at).getTime() : 0;
        const now = new Date().getTime();
        const ageInSeconds = (now - createdAt) / 1000;
        
        if (createdAt > 0 && ageInSeconds < 30) {
          console.log('User is new, retrying profile fetch in 2s...');
          setTimeout(() => fetchUserProfile(userId, authUser), 2000);
          setIsEliminated(false); // Stay alive for now
        } else {
          setIsEliminated(true);
        }
      }
      // If profile row is missing (Eliminated), at least keep the username from auth
      setUserProfile((prev: any) => ({
        ...prev,
        username: authUser.user_metadata?.username || prev.username || 'user',
        fullName: authUser.user_metadata?.full_name || prev.fullName || '',
      }));
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user);
        const prevUserId = localStorage.getItem('supabaseUserId');
        if (prevUserId !== session.user.id) {
          localStorage.removeItem('enemies');
          localStorage.removeItem('followedUsers');
          localStorage.removeItem('wallPosts');
          localStorage.removeItem('allPosts');
          localStorage.removeItem('visiblePosts');
          localStorage.removeItem('postComments');
          localStorage.removeItem('userSelection');
          localStorage.removeItem('isEliminationRoundActive');
          setEnemies([]);
          setFollowedUsers([]);
          setWallPosts([]);
          setAllPosts([]);
          setVisiblePosts([]);
          setPostComments({});
          setUserSelection(null);
          setIsEliminationRoundActive(false);

          // Set initial profile from auth metadata immediately for instant UI
          setUserProfile({
            username: session.user.user_metadata?.username || '',
            fullName: session.user.user_metadata?.full_name || '',
            bio: 'Surviving the round ⚡',
            avatar: session.user.user_metadata?.avatar_url || '/custom-empty-profile.png',
            website: ''
          });
          localStorage.setItem('userProfile', JSON.stringify({
            username: session.user.user_metadata?.username || '',
            fullName: session.user.user_metadata?.full_name || '',
            bio: 'Surviving the round ⚡',
            avatar: session.user.user_metadata?.avatar_url || '/custom-empty-profile.png',
            website: ''
          }));

          setIsChallengeEnded(false);
          localStorage.setItem('isChallengeEnded_false', 'false'); // Legacy cleanup
          localStorage.setItem('supabaseUserId', session.user.id);
        } else {
          // Even if user ID hasn't changed, ensure profile is synced if it's currently empty
          setUserProfile((prev: any) => {
            if (!prev.username && session.user.user_metadata?.username) {
              return {
                ...prev,
                username: session.user.user_metadata.username,
                fullName: session.user.user_metadata.full_name || prev.fullName,
              };
            }
            return prev;
          });
        }
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user);

        // Always reset round state on login so old swiped posts never block the feed
        setSurvivors([]);
        setEliminated([]);
        setUserSelection(null);
        setIsChallengeEnded(false);
        setIsActive(false);
        setClickCounts({ pley: 0 });
        setEliminationCounts({ pley: 0 });
        setMadeItCounts({ pley: 0 });
        setVariantFirstClickTime({ pley: 0 });

        const prevUserId = localStorage.getItem('supabaseUserId');
        if (prevUserId !== session.user.id) {
          localStorage.removeItem('enemies');
          localStorage.removeItem('followedUsers');
          localStorage.removeItem('wallPosts');
          localStorage.removeItem('allPosts');
          localStorage.removeItem('visiblePosts');
          localStorage.removeItem('postComments');
          localStorage.removeItem('userSelection');
          localStorage.removeItem('isEliminationRoundActive');
          setEnemies([]);
          setFollowedUsers([]);
          setWallPosts([]);
          setPostComments({});
          setIsEliminationRoundActive(false);

          // Set initial profile from auth metadata immediately for instant UI
          setUserProfile({
            username: session.user.user_metadata?.username || '',
            fullName: session.user.user_metadata?.full_name || '',
            bio: 'Surviving the round ⚡',
            avatar: session.user.user_metadata?.avatar_url || '/custom-empty-profile.png',
            website: ''
          });

          localStorage.setItem('supabaseUserId', session.user.id);
        }

        // Immediately seed visiblePosts from cache for instant display (feed is universal)
        const cachedPosts = localStorage.getItem('allPosts_v2');
        if (cachedPosts) {
          try {
            const parsed = JSON.parse(cachedPosts);
            if (parsed.length > 0) {
              setAllPosts(parsed);
              setVisiblePosts(parsed);
            }
          } catch (_) {}
        }

        // Trigger a fresh fetch from Supabase in the background
        refetchPosts();


      } else {
        setUserProfile({
          username: '', fullName: '', bio: '', avatar: '', website: ''
        });
        setEnemies([]);
        setFollowedUsers([]);
        setWallPosts([]);
        setPostComments({});
        setUserVotes({});
        setUserSelection(null);
        setIsEliminationRoundActive(false);
        setIsChallengeEnded(false);
        setIsActive(false);
        setClickCounts({ pley: 0 });
        setEliminationCounts({ pley: 0 });
        setMadeItCounts({ pley: 0 });
        setVariantFirstClickTime({ pley: 0 });
        localStorage.removeItem('supabaseUserId');
      }
    });

    // Real-time listener for profile deletion (Total Destruction Detection)
    const profileChannel = supabase
      .channel('profile_wipe_detection')
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        // If the deleted profile ID matches the current user session ID
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user && payload.old.id === session.user.id) {
            setIsEliminated(true);
          }
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(profileChannel);
    };
  }, []);

  const login = (username: string) => {
    // Deprecated for manual use, Auth handles state via onAuthStateChange
  };

  const logout = () => {
    supabase.auth.signOut();
  };

  const t = (key: string): string => {
    const translation = translations[language];
    return translation?.[key] || translations['en'][key] || key;
  };

  const getMajorityVariant = () => {
    const counts = Object.entries(clickCounts);
    const maxCount = Math.max(...counts.map(([, count]) => count));
    if (maxCount === 0) return null;
    
    const leaders = counts.filter(([, count]) => count === maxCount);
    if (leaders.length === 1) return leaders[0][0];
    
    return leaders.reduce((prev, curr) => {
      const prevTime = variantFirstClickTime[prev[0]] || Infinity;
      const currTime = variantFirstClickTime[curr[0]] || Infinity;
      return currTime < prevTime ? curr : prev;
    })[0];
  };

  const majorityVariant = getMajorityVariant();

  const getVariantDisplayName = (key: string | null) => {
    if (!key) return '';
    const names: Record<string, string> = {
      pley: 'Pley'
    };
    return names[key] || key;
  };

  const addEnemy = (survivor: Survivor) => {
    // Prevent adding self as enemy
    if (survivor.username === userProfile.username) return;
    
    setEnemies(prev => {
      const filtered = prev.filter(e => e.username !== survivor.username);
      return [...filtered, { ...survivor, isSworn: false }];
    });
  };

  const addSwornEnemy = (survivor: Survivor) => {
    // Prevent adding self as enemy
    if (survivor.username === userProfile.username) return;
    
    setEnemies(prev => {
      const filtered = prev.filter(e => e.username !== survivor.username);
      return [...filtered, { ...survivor, isSworn: true }];
    });
  };

  const removeEnemy = (enemyId: number) => {
    setEnemies(prev => prev.filter(e => e.id !== enemyId));
  };

  const addComment = (postId: number, text: string) => {
    setPostComments(prev => {
      const existing = prev[postId] || [];
      const newComment: Comment = {
        id: existing.length + 1,
        username: userProfile.username,
        avatar: userProfile.avatar,
        text,
        time: 'Just now'
      };
      return {
        ...prev,
        [postId]: [...existing, newComment]
      };
    });
  };

  const addWallPost = (text: string, targetUser?: string) => {
    const newPost: WallPost = {
      id: Date.now(),
      username: userProfile.username,
      avatar: userProfile.avatar,
      text,
      time: 'Just now',
      targetUser
    };
    setWallPosts(prev => [newPost, ...prev]);
  };

  const toggleFollow = (username: string) => {
    setFollowedUsers(prev => {
      const isFollowing = prev.includes(username);
      if (isFollowing) {
        return prev.filter(u => u !== username);
      }
      return [...prev, username];
    });
  };

  const isLegend = (username: string) => {
    const userHistory = survivorHistory.filter(s => s.username === username);
    const variants = new Set(userHistory.map(s => s.variant));
    return variants.has('pley');
  };

  const isSurvivor = (username: string) => {
    return survivorHistory.some(s => s.username === username);
  };

  const [eliminated, setEliminated] = useState<Survivor[]>([]);

  const addEliminated = (user: Survivor) => {
    setEliminated(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      if (existingIds.has(user.id)) return prev;
      return [...prev, { ...user, madeIt: false }];
    });
  };

  const [isDurationInitialized, setIsDurationInitialized] = useState(false);

  // Universal History Fetching — fetch once on mount, re-fetch on new inserts
  const fetchHistory = async () => {
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from('challenge_rounds')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to fetch round history:', error);
      setHistoryLoading(false);
      return;
    }

    if (data) {
      const formatted: RoundRecord[] = data.map(r => ({
        id: r.id,
        date: r.date,
        time: r.time,
        variant: r.variant,
        durationLabel: r.duration_label,
        survivors: Array.isArray(r.survivors) ? r.survivors.filter(Boolean) : [],
        eliminated: Array.isArray(r.eliminated) ? r.eliminated.filter(Boolean) : [],
        timestamp: r.round_timestamp
      }));
      console.log('📥 Fetched', formatted.length, 'rounds from Supabase');
      setRoundHistory(formatted);
    }
    setHistoryLoading(false);
  };

  useEffect(() => {
    // Set up realtime subscription for new rounds
    const channel = supabase
      .channel('universal_history')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'challenge_rounds' }, () => {
        fetchHistory();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Fetch history once when the user is confirmed authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);


  const startNewChallenge = () => {
    setIsActive(true);
    setIsEliminationRoundActive(true);
    setTimeLeft(calculateUniversalTimeLeft());
    setIsChallengeEnded(false);
    setIsDurationInitialized(false);
    setUserSelection(null);
    setShowPills(true);
    setActiveTab('pley');
    setClickCounts({ pley: 0 });
    setEliminationCounts({ pley: 0 });
    setMadeItCounts({ pley: 0 });
    setVariantDurations({ pley: 120 }); // 2m cycle
    setVariantFirstClickTime({ pley: 0 });
    setSurvivors([]);
    setEliminated([]);
    setVisiblePosts(allPosts);
  };

  // (Archive logic moved to timeLeft===0 effect to avoid stale state)

  const clearAllHistory = async () => {
    const { error } = await supabase.from('challenge_rounds').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (!error) {
      setRoundHistory([]);
    }
  };

  const updateHistoryVote = (survivorId: number, roundId: string | null, vote: 'up' | 'down' | null) => {
    if (roundId) {
      setRoundHistory(prev => prev.map(round => {
        if (round.id === roundId) {
          return {
            ...round,
            survivors: round.survivors.map(s => s.id === survivorId ? { ...s, userVote: vote } : s)
          };
        }
        return round;
      }));
    }
  };

  // Universal Loop: Finalize results for everyone when timer ends
  useEffect(() => {
    if (timeLeft === 0) {
        // Round ends: Finalize results for everyone
        const activeMode = userSelection || majorityVariant || 'pley';
        
        // ALWAYS reset the submission state for ALL users at timer zero
        setIsEliminationRoundActive(false);

        // Survivors: use visiblePosts (the actual in-round feed) as the source of truth
        const roundSurvivors = visiblePosts.map(p => ({ 
          id: p.id,
          username: p.username, 
          avatar: p.avatar,
          image: p.image,
          caption: p.caption,
          time: p.time,
          comments: p.comments,
          madeIt: true,
          variant: activeMode
        }));

        const roundEliminated = eliminated.map(e => ({ ...e, madeIt: false, userVote: null }));

        const hasData = roundSurvivors.length > 0 || roundEliminated.length > 0;

        if (hasData) {
          const currentCycleSeconds = 120;
          const roundTimestamp = Math.floor(Date.now() / 1000 / currentCycleSeconds) * currentCycleSeconds;
          
          // Optimistically update history for EVERYONE immediately
          const now = new Date();
          const today = formatDate(now);
          const survivalTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          
          const newRoundRecord: RoundRecord = {
            id: 'temp-' + roundTimestamp,
            date: today,
            time: survivalTime,
            variant: activeMode === 'pley' ? 'Pley' : activeMode,
            durationLabel: '2 min',
            survivors: roundSurvivors,
            eliminated: roundEliminated,
            timestamp: roundTimestamp
          };

          setRoundHistory(prev => {
            if (prev.some(r => r.timestamp === roundTimestamp)) return prev;
            return [newRoundRecord, ...prev];
          });

          // Only the active/participating user pushes to Supabase
          // Guarded by roundTimestamp uniqueness in DB (UNIQUE constraint on round_timestamp)
          if (isAuthenticated && isActive) {
            const lastPushed = localStorage.getItem('last_pushed_round');
            if (lastPushed !== String(roundTimestamp)) {
              localStorage.setItem('last_pushed_round', String(roundTimestamp));

              supabase.from('challenge_rounds').insert({
                date: today,
                time: survivalTime,
                variant: activeMode === 'pley' ? 'Pley' : activeMode,
                duration_label: '2 min',
                survivors: roundSurvivors,
                eliminated: roundEliminated,
                round_timestamp: roundTimestamp
              }).then(({ error }) => {
                if (error && error.code !== '23505') {
                  console.error('Error saving round:', error);
                }
              });
            }
          }
        }

        // Only participating users get the "The End" victory screen
        if (isActive) {
          setIsChallengeEnded(true);
        }
    }
  }, [timeLeft, isActive, visiblePosts, majorityVariant, userSelection, eliminated, isAuthenticated]);

  useEffect(() => {
    if (isChallengeEnded) {
      const timeout = setTimeout(() => {
        setIsChallengeEnded(false);
        setSurvivors([]);
        setEliminated([]);
        setClickCounts({ pley: 0 });
        setEliminationCounts({ pley: 0 });
        setMadeItCounts({ pley: 0 });
        setUserSelection(null);
        setVariantFirstClickTime({ pley: 0 });
        try {
          const historyIds = new Set([
            ...survivorHistory.map(s => s?.id).filter(Boolean),
            ...roundHistory.flatMap(r => r?.survivors?.map(s => s?.id).filter(Boolean) || []),
            ...roundHistory.flatMap(r => r?.eliminated?.map(e => e?.id).filter(Boolean) || [])
          ]);
          setVisiblePosts(allPosts.filter(p => !historyIds.has(p.id)));
        } catch (e) {
          setVisiblePosts([]);
        }
      }, 20000);
      return () => clearTimeout(timeout);
    }
  }, [isChallengeEnded, allPosts]);



  // Timer countdown - HALTED by user request
  useEffect(() => {
    const updateTimer = () => {
      setTimeLeft(calculateUniversalTimeLeft());
    };

    updateTimer(); // Initial call
    // const interval = setInterval(updateTimer, 1000);
    // return () => clearInterval(interval);
  }, []);



  // Simulation logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        const variants = ['pley'];
        const randomVariant = variants[Math.floor(Math.random() * variants.length)];
        const weights = [5, 10, 20, 50, 100];
        const randomClicks = weights[Math.floor(Math.random() * weights.length)];
        
        // 1. Update click counts
        setClickCounts(prev => ({
          ...prev,
          [randomVariant]: prev[randomVariant] + randomClicks
        }));
        
        // 2. Update first click times
        setVariantFirstClickTime(prevTimes => {
          if (!prevTimes[randomVariant]) return { ...prevTimes, [randomVariant]: Date.now() };
          return prevTimes;
        });

        // 3. Update variant durations (fixed for 2m cycle)
        setVariantDurations(prevDurations => ({
          ...prevDurations,
          [randomVariant]: 120
        }));

        // 4. Removed random elimination simulation - now depends on user actions
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, majorityVariant]);

  return (
    <ChallengeContext.Provider value={{
      timeLeft, isActive, userProfile, setUserProfile, clickCounts, eliminationCounts, madeItCounts,
      variantDurations, variantFirstClickTime, userSelection, isChallengeEnded,
      isEliminationRoundActive, setIsEliminationRoundActive,
      showPills, setShowPills, activeTab, setActiveTab,
      enemies, postComments, wallPosts, followedUsers, toggleFollow, isLegend, isSurvivor, allPosts, setAllPosts,
      visiblePosts, setVisiblePosts,
      majorityVariant, survivors, eliminated, addEliminated, survivorHistory, roundHistory,
      unreadMessageCount, setUnreadMessageCount,
      setTimeLeft, setIsActive, setClickCounts, setEliminationCounts,
      setMadeItCounts, setVariantDurations, setVariantFirstClickTime,
      setUserSelection, setIsChallengeEnded, startNewChallenge,
      setSurvivors, setRoundHistory, updateHistoryVote, clearAllHistory, getVariantDisplayName,
      addEnemy, addSwornEnemy, removeEnemy, addComment, addWallPost, isAuthenticated, authLoading, login, logout, language, setLanguage, theme, setTheme, t,
      userVotes, postLives, userLives, setUserVoteForPost, setPostLivesForPost, setUserLivesForUser,
      isEliminated, historyLoading, postsLoading
    }}>
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallenge = () => {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error('useChallenge must be used within a ChallengeProvider');
  }
  return context;
};
