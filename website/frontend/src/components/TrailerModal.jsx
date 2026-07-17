import { useEffect } from "react";
import { X } from "lucide-react";
import "./TrailerModal.css";

function TrailerModal({
  title,
  videoKey = "",
  videoUrl = "",
  audioUrl = "",
  onClose,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!videoKey && !videoUrl && !audioUrl) {
    return null;
  }

  const youtubeUrl = videoKey
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
        videoKey,
      )}?autoplay=1&rel=0`
    : "";

  return (
    <div className="trailer-overlay" onClick={onClose}>
      <div
        className="trailer-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} media player`}
      >
        <button
          type="button"
          className="trailer-close"
          onClick={onClose}
          aria-label="Close player"
        >
          <X size={20} />
        </button>

        <div className={`trailer-video ${audioUrl ? "trailer-audio" : ""}`}>
          {audioUrl ? (
            <div className="trailer-audio-content">
              <h3>{title}</h3>

              <p>Deezer preview</p>

              <audio src={audioUrl} controls autoPlay>
                Your browser does not support audio playback.
              </audio>
            </div>
          ) : videoKey ? (
            <iframe
              src={youtubeUrl}
              title={`${title} video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video
              src={videoUrl}
              title={`${title} preview`}
              controls
              autoPlay
              playsInline
            >
              Your browser does not support video playback.
            </video>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrailerModal;
