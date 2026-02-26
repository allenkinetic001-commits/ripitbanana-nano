import React from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChallenge } from '../contexts/ChallengeContext';

const CreatePost = () => {
  const navigate = useNavigate();
  const { t } = useChallenge();

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20">
      {/* Header */}
      <header className="px-4 h-14 flex items-center justify-between border-b border-zinc-100">
        <button onClick={() => navigate(-1)} className="text-zinc-700">
          <X size={24} />
        </button>
        <h1 className="text-lg font-bold">{t('create_new_post')}</h1>
        <button className="text-blue-600 font-bold text-sm">{t('create_next')}</button>
      </header>

      {/* Media Selector */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <button className="flex flex-col items-center justify-center p-6 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-blue-500 hover:bg-blue-50 transition-all group">
            <Camera size={40} className="text-zinc-400 group-hover:text-blue-500 mb-2" />
            <span className="text-sm font-medium text-zinc-600 group-hover:text-blue-600">{t('create_camera')}</span>
          </button>
          <button className="flex flex-col items-center justify-center p-6 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-blue-500 hover:bg-blue-50 transition-all group">
            <ImageIcon size={40} className="text-zinc-400 group-hover:text-blue-500 mb-2" />
            <span className="text-sm font-medium text-zinc-600 group-hover:text-blue-600">{t('create_gallery')}</span>
          </button>
        </div>
        
        <div className="w-full max-w-xs space-y-4">
          <div className="bg-zinc-100 rounded-lg p-4 h-32 flex items-center justify-center">
            <p className="text-zinc-400 text-sm">{t('create_select_preview')}</p>
          </div>
          <textarea
            placeholder={t('create_caption_placeholder')}
            className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
            rows={4}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
