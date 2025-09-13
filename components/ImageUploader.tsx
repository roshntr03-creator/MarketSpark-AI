/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState, DragEvent, useCallback, useEffect } from 'react';
import { PhotoIcon } from './icons';
import { useTranslations } from '../contexts/LanguageProvider';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  clearTrigger?: number;
}

const CameraView: React.FC<{ onCapture: (file: File) => void, onExit: () => void }> = ({ onCapture, onExit }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        let activeStream: MediaStream | null = null;
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(s => {
                activeStream = s;
                setStream(s);
                if (videoRef.current) {
                    videoRef.current.srcObject = s;
                }
            })
            .catch(err => {
                console.error("Error accessing camera:", err);
                alert("Could not access the camera. Please check permissions.");
                onExit();
            });

        return () => {
            activeStream?.getTracks().forEach(track => track.stop());
        };
    }, [onExit]);

    const handleCapture = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
                if (blob) {
                    const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
                    onCapture(file);
                }
            }, 'image/png');
        }
    };

    return (
        <div className="relative w-full">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                 <button onClick={handleCapture} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Capture</button>
                 <button onClick={onExit} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Cancel</button>
            </div>
        </div>
    );
};


const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, clearTrigger }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploaderRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslations();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleButtonClick = () => fileInputRef.current?.click();
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

   const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
                 onImageUpload(blob);
            }
            break;
        }
    }
  }, [onImageUpload]);

  useEffect(() => {
    const uploaderElement = uploaderRef.current;
    if (uploaderElement) {
        uploaderElement.addEventListener('paste', handlePaste as EventListener);
        return () => {
            uploaderElement.removeEventListener('paste', handlePaste as EventListener);
        };
    }
  }, [handlePaste]);
  
  useEffect(() => {
    if (clearTrigger && clearTrigger > 0) {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setIsCameraOpen(false);
    }
  }, [clearTrigger]);

  if (isCameraOpen) {
    return <CameraView onCapture={onImageUpload} onExit={() => setIsCameraOpen(false)} />;
  }

  return (
    <div 
        ref={uploaderRef}
        className={`flex flex-col justify-center items-center w-full p-8 border-2 border-dashed rounded-xl transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-400 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-500 bg-black/5 dark:bg-white/5'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        tabIndex={0}
    >
      <div className="text-center">
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-500 dark:text-gray-400" />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer" onClick={handleButtonClick}>
                {t.imageUploadPrompt}
            </span>{' '}
            {t.imageUploadOrDrag}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">{t.imageUploadPaste}</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/gif, image/webp"
        />
      </div>
       <div className="relative flex items-center justify-center w-full my-4">
            <div className="flex-grow border-t border-gray-400 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-600 dark:text-gray-500 text-xs">OR</span>
            <div className="flex-grow border-t border-gray-400 dark:border-gray-600"></div>
        </div>
        <button
            onClick={() => setIsCameraOpen(true)}
            className="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
            {t.imageUploadUseCamera}
        </button>
    </div>
  );
};

export default ImageUploader;