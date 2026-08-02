'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRoomStore } from '@/store/roomStore';
import RoomCanvas from '@/components/room/RoomCanvas';
import { DEMO_ROOM } from '@/lib/mockRoom';
import { loadRoom } from '@/lib/roomStorage';
import { proxyPreviewUrl } from '@/lib/itunes';
import { getAudioEngine } from '@/lib/audio/audioEngine';

export default function RoomPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { room, setRoom, setPlaying, setCurrentTrack, setTransitioning, setHasStarted,
          setActiveSceneId, setProgress } = useRoomStore();

  useEffect(() => {
    if (!slug) return;

    // Stop any audio from a previous room
    getAudioEngine().stop();

    // Reset all playback state so we get a clean "press play" experience
    setPlaying(false);
    setCurrentTrack(0);
    setTransitioning(false);
    setHasStarted(false);
    setActiveSceneId('sunny-day');
    setProgress(0, 30);

    // Try localStorage first (user-created rooms)
    const saved = loadRoom(slug);
    if (saved) { setRoom(saved); return; }

    // Fall back to demo room, proxying its preview URLs at runtime
    const demo: typeof DEMO_ROOM = {
      ...DEMO_ROOM,
      slug,
      tracks: DEMO_ROOM.tracks.map(t => ({
        ...t,
        previewUrl: proxyPreviewUrl(t.previewUrl),
      })),
    };
    setRoom(demo);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!room) {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        background: '#0D0804',
      }} />
    );
  }

  return <RoomCanvas room={room} />;
}
