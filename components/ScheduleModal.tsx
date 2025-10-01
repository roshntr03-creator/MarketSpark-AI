/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { usePlanner } from '../contexts/PlannerProvider';
import type { CreationHistoryItem } from '../types/index';

interface ScheduleModalProps {
  creation: CreationHistoryItem;
  onClose: () => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ creation, onClose }) => {
  const { t } = useTranslations();
  const { addPlannerItem } = usePlanner();
  
  const now = new Date();
  const [date, setDate] = useState(now.toISOString().split('T')[0]);
  const [time, setTime] = useState(now.toTimeString().substring(0, 5));
  const [isScheduled, setIsScheduled] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scheduled_date_time = new Date(`${date}T${time}`).toISOString();
    addPlannerItem({
      creation_id: creation.id,
      scheduled_date_time,
    });
    setIsScheduled(true);
    setTimeout(() => {
        onClose();
    }, 1500);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t.scheduleModalTitle}</h2>
        {isScheduled ? (
            <div className="text-center py-8">
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">Scheduled Successfully!</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="schedule-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.scheduleDateLabel}</label>
                    <input
                        type="date"
                        id="schedule-date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="schedule-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.scheduleTimeLabel}</label>
                    <input
                        type="time"
                        id="schedule-time"
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>
                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        {t.closeButton}
                    </button>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg"
                    >
                        {t.scheduleButton}
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default ScheduleModal;