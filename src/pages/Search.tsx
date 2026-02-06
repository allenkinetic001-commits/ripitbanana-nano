import React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import ChallengeTimer from '../components/ChallengeTimer';

const exploreItems = [
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Stunning+mountain+landscape+at+dawn&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Delicious+plate+of+sushi+artfully+arranged&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Abstract+digital+art+with+vibrant+colors&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Close-up+of+a+beautiful+flower+with+dewdrops&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Modern+architecture+with+glass+and+steel&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=A+cute+puppy+playing+in+the+park&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Night+cityscape+with+neon+lights&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Serene+forest+pathway+with+sunlight+filtering+through+trees&image_size=square',
  'https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=Colorful+street+market+in+a+European+city&image_size=square',
];

const Search = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Search Bar */}
      <div className="p-4 sticky top-0 bg-white z-10 flex items-center gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-zinc-100 border-none rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>
        <ChallengeTimer />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-1 px-1 pb-4">
        {exploreItems.map((item, index) => (
          <div key={index} className="aspect-square bg-zinc-100 overflow-hidden">
            <img src={item} alt={`Explore ${index}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
