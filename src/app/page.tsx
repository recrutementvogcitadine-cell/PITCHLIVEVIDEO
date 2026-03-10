import VideoCard from "../components/VideoCard";
import ChatBox from "../components/ChatBox";
import videos from "../../data/videos.json";

export default function Home() {
  const now = new Date();
  const validVideos = Array.isArray(videos)
    ? videos.filter((v) => {
        const published = new Date(v.timestamp);
        return now.getTime() - published.getTime() < 24 * 60 * 60 * 1000;
      })
    : [];

  if (!validVideos.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-2xl">
        Aucune vidéo disponible.
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black">
      {validVideos.map((video, idx) => (
        <div key={idx} className="snap-start h-screen w-full">
          <VideoCard src={video.src} creator={video.creator} whatsapp={video.whatsapp}>
            <ChatBox />
          </VideoCard>
        </div>
      ))}
    </div>
  );
}
