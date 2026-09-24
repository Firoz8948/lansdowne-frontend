'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../home.module.css';

const VIDEO_REVIEWS = [
  {
    id: 'v1',
    src: 'https://lansdowne-cdn.b-cdn.net/Reviews/review_video_1.mp4',
    caption: 'Real customers, real leather — see why they chose Lansdowne.',
  },
];

const IMAGE_REVIEWS = [
  {
    id: 'i2',
    src: 'https://lansdowne-cdn.b-cdn.net/Reviews/review_2.png',
    caption: 'Anupam Kher at our store',
  },
  {
    id: 'i3',
    src: 'https://lansdowne-cdn.b-cdn.net/Reviews/review_3.png',
    caption: 'A moment with Anupam Kher',
  },
  {
    id: 'i4',
    src: 'https://lansdowne-cdn.b-cdn.net/Reviews/review_4.png',
    caption: 'Major General GD Bakshi Sir chooses Lansdowne',
  },
  {
    id: 'i5',
    src: 'https://lansdowne-cdn.b-cdn.net/Reviews/review_5.png',
    caption: 'Boman Irani with Lansdowne',
  },
  {
    id: 'i6',
    src: 'https://lansdowne-cdn.b-cdn.net/Reviews/review_6.png',
    caption: 'Kruttika Desai — craft she trusts',
  },
  {
    id: 'i7',
    src: 'https://lansdowne-cdn.b-cdn.net/Reviews/review_7.png',
    caption: 'Raju Kher appreciates the finish',
  },
];

function VideoReviewCard({ review, active, onHoverPlay }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return undefined;

    if (active) {
      el.muted = true;
      const playPromise = el.play();
      if (playPromise?.catch) playPromise.catch(() => {});
    } else {
      el.pause();
      el.currentTime = 0;
    }

    return undefined;
  }, [active]);

  return (
    <figure className={styles.reviewVideoCard}>
      <div
        className={styles.reviewVideoFrame}
        onMouseEnter={() => {
          const el = videoRef.current;
          if (!el) return;
          onHoverPlay?.();
          el.muted = true;
          const playPromise = el.play();
          if (playPromise?.catch) playPromise.catch(() => {});
        }}
      >
        <video
          ref={videoRef}
          className={styles.reviewVideo}
          src={review.src}
          playsInline
          loop
          muted
          preload="metadata"
          aria-label={review.caption}
        />
      </div>
      <figcaption className={styles.reviewCaption}>{review.caption}</figcaption>
    </figure>
  );
}

function VideoReviewsCarousel() {
  const [index, setIndex] = useState(0);
  const total = VIDEO_REVIEWS.length;

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % total);
  }, [total]);

  return (
    <div className={styles.reviewVideoCarousel}>
      <div className={styles.reviewVideoViewport}>
        <div
          className={styles.reviewVideoTrack}
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {VIDEO_REVIEWS.map((review, i) => (
            <div key={review.id} className={styles.reviewVideoSlide}>
              <VideoReviewCard review={review} active={i === index} />
            </div>
          ))}
        </div>
      </div>

      {total > 1 && (
        <div className={styles.reviewVideoControls}>
          <button
            type="button"
            className={styles.reviewNavBtn}
            onClick={goPrev}
            aria-label="Previous video review"
          >
            <ChevronLeft size={18} strokeWidth={1.75} />
          </button>
          <div className={styles.reviewDots} role="tablist" aria-label="Video reviews">
            {VIDEO_REVIEWS.map((review, i) => (
              <button
                key={review.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                className={`${styles.reviewDot} ${i === index ? styles.reviewDotActive : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Show video ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            className={styles.reviewNavBtn}
            onClick={goNext}
            aria-label="Next video review"
          >
            <ChevronRight size={18} strokeWidth={1.75} />
          </button>
        </div>
      )}
    </div>
  );
}

function ImageReviewsMarquee() {
  const loop = [...IMAGE_REVIEWS, ...IMAGE_REVIEWS];

  return (
    <div className={styles.reviewMarquee} aria-label="Customer photo reviews">
      <div className={styles.reviewMarqueeTrack}>
        {loop.map((review, i) => (
          <figure
            key={`${review.id}-${i}`}
            className={styles.reviewImageCard}
          >
            <div className={styles.reviewImageFrame}>
              <img
                src={review.src}
                alt={review.caption}
                className={styles.reviewImage}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className={styles.reviewCaption}>{review.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export default function ReviewsShowcase() {
  // Video reviews hidden until more clips are ready — re-enable VideoReviewsCarousel below.
  const showVideoReviews = false;

  return (
    <>
      {showVideoReviews && (
        <section className={`${styles.section} ${styles.reviewsSection}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>VIDEO REVIEWS</h2>
            <p className={styles.sectionSubtitle}>Hear it from our customers</p>
          </div>
          <VideoReviewsCarousel />
        </section>
      )}

      <section className={`${styles.section} ${styles.reviewsSection}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>LOVED BY CELEBRITIES</h2>
          <p className={styles.sectionSubtitle}>Moments with names we admire</p>
        </div>
        <ImageReviewsMarquee />
      </section>
    </>
  );
}
