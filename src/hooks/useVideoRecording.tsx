import { useState, useRef, useEffect } from 'react';

const MAX_RECORDING_TIME = 300; // 5 minutes in seconds

export const useVideoRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stream]);

  const getMediaStream = async () => {
    return await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 480 },
        height: { ideal: 360 },
        frameRate: { ideal: 15 },
        facingMode: 'environment'
      }, 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,  // Standard for WebM/Opus
        channelCount: 1     // Mono for better Telegram compatibility
      }
    });
  };

  const startCamera = async () => {
    try {
      const mediaStream = await getMediaStream();
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Ошибка доступа к камере:', error);
      alert('Не удалось получить доступ к камере. Проверьте разрешения.');
    }
  };

  const createMediaRecorder = (mediaStream: MediaStream) => {
    let mediaRecorder;
    
    try {
      // WebM with VP8+Opus is more compatible with Telegram on Android
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/webm;codecs=vp8,opus',
          audioBitsPerSecond: 96000,  // Lower bitrate for better compatibility
          videoBitsPerSecond: 1000000 // Lower bitrate for better compatibility
        });
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/webm;codecs=vp9,opus',
          audioBitsPerSecond: 96000,
          videoBitsPerSecond: 1000000
        });
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/webm',
          audioBitsPerSecond: 96000,
          videoBitsPerSecond: 1000000
        });
      } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264,aac')) {
        // MP4 as fallback
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4;codecs=h264,aac',
          audioBitsPerSecond: 96000,
          videoBitsPerSecond: 1000000
        });
      } else {
        // Default format
        console.warn('Using default MediaRecorder format');
        mediaRecorder = new MediaRecorder(mediaStream);
      }
      
      console.log('MediaRecorder created with mimeType:', mediaRecorder.mimeType);
    } catch (e) {
      console.error('Failed to create MediaRecorder:', e);
      mediaRecorder = new MediaRecorder(mediaStream);
    }

    return mediaRecorder;
  };

  const startRecordingWithStream = (mediaStream: MediaStream) => {
    setRecordedVideo(null);
    chunksRef.current = [];
    
    // Check if we have audio tracks
    const audioTracks = mediaStream.getAudioTracks();
    const videoTracks = mediaStream.getVideoTracks();
    
    console.log('Audio tracks:', audioTracks.length);
    console.log('Video tracks:', videoTracks.length);
    
    // Ensure audio tracks are enabled
    audioTracks.forEach(track => {
      track.enabled = true;
      console.log('Audio track enabled:', track.enabled, 'ready state:', track.readyState);
    });
    
    const mediaRecorder = createMediaRecorder(mediaStream);
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      // Determine the correct MIME type based on what was actually recorded
      const mimeType = mediaRecorderRef.current?.mimeType || 'video/mp4';
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const videoURL = URL.createObjectURL(blob);
      setRecordedVideo(videoURL);
    };
    
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= MAX_RECORDING_TIME - 1) {
          stopRecording();
          return MAX_RECORDING_TIME;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const startRecording = async () => {
    // If no stream, request camera and microphone permissions first
    if (!stream) {
      try {
        const mediaStream = await getMediaStream();
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        // Wait a moment for video to load
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Now start recording with the new stream
        startRecordingWithStream(mediaStream);
      } catch (error) {
        console.error('Ошибка доступа к камере:', error);
        alert('Не удалось получить доступ к камере и микрофону. Проверьте разрешения.');
        return;
      }
    } else {
      // Stream exists, start recording immediately
      startRecordingWithStream(stream);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRecording,
    recordedVideo,
    recordingTime,
    stream,
    videoRef,
    startCamera,
    startRecording,
    stopRecording,
    formatTime,
    MAX_RECORDING_TIME
  };
};