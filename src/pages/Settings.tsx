import React from 'react';
import { useNavigate } from 'react-router-dom';
// import { useChallenge } from '../contexts/ChallengeContext';

const Settings = () => {
  console.log('Settings component rendering (no context)');
  const navigate = useNavigate();
  // const { t } = useChallenge();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Settings Page Debug (No Context)</h1>
      <button onClick={() => navigate(-1)} className="bg-blue-500 text-white p-2 rounded">Go Back</button>
      {/* <p>Translation test: {t('settings')}</p> */}
    </div>
  );
};

export default Settings;
