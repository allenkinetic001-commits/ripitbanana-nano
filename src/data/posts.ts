export const posts = [
  {
    id: 1,
    username: 'travel_adventures',
    avatar: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Portrait+of+a+traveler+with+a+mountain+background&image_size=square',
    image: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Beautiful+sunset+over+a+tropical+beach+with+palm+trees&image_size=square',
    caption: 'Chasing sunsets in paradise! 🌅🌴 #travel #vacation',
    likes: 1240,
    time: '2 hours ago',
    comments: [
      { id: 1, username: 'nature_lover', text: 'This looks incredible! 😍', time: '1h ago' },
      { id: 2, username: 'globetrotter', text: 'Wish I was there right now.', time: '45m ago' }
    ]
  },
  {
    id: 2,
    username: 'foodie_delights',
    avatar: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Portrait+of+a+person+eating+delicious+food&image_size=square',
    image: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Close-up+of+a+gourmet+burger+with+melted+cheese+and+crispy+fries&image_size=square',
    caption: 'The best burger in town! 🍔🔥 #foodie #burger',
    likes: 850,
    time: '5 hours ago',
    comments: [
      { id: 3, username: 'burger_king', text: 'Where is this?? I need it!', time: '2h ago' }
    ]
  },
  {
    id: 3,
    username: 'tech_wizard',
    avatar: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Portrait+of+a+software+engineer+at+their+desk&image_size=square',
    image: 'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Modern+desk+setup+with+multiple+monitors+and+mechanical+keyboard&image_size=square',
    caption: 'New office setup is finally complete! 💻🚀 #coding #setup',
    likes: 2100,
    time: '10 hours ago',
    comments: [
      { id: 4, username: 'dev_guy', text: 'Specs? Love the monitor arm.', time: '5h ago' },
      { id: 5, username: 'minimalist', text: 'Clean setup, man.', time: '3h ago' }
    ]
  }
];
