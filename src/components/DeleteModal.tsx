import React from 'react';

interface DeleteModalProps {
  onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ onClose }) => {
  return (
    <div className="bg-white rounded-[24px] w-full max-w-[280px] overflow-hidden shadow-2xl border border-zinc-100">
      <div className="p-6 pb-5 text-center space-y-2">
        <h2 className="text-[17px] font-bold text-black leading-tight px-4">
          You wanna to delete this post?
        </h2>
        <p className="text-zinc-400 text-[11px] font-medium leading-tight px-2">
          This post will no longer be visible<br />on the app
        </p>
      </div>
      
      <div className="border-t border-zinc-100">
        <button 
          onClick={onClose}
          className="w-full py-3.5 text-red-500 font-medium text-[15px] hover:bg-zinc-50 transition-colors border-b border-zinc-100"
        >
          Delete
        </button>
        <button 
          onClick={onClose}
          className="w-full py-3.5 text-black font-medium text-[15px] hover:bg-zinc-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeleteModal;
