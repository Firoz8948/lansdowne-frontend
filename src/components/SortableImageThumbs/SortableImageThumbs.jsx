'use client';

/**
 * Lightweight HTML5 drag-reorder for image thumbnails.
 * items: [{ key, src, ... }]
 * onReorder(nextItems)
 */
export default function SortableImageThumbs({
  items = [],
  onReorder,
  onRemove,
  className = '',
  itemClassName = '',
  mainBadgeClassName = '',
  removeClassName = '',
  showMainBadge = true,
  resolveSrc = (item) => item.src || item.preview || item.url,
}) {
  const dragIndex = { current: null };

  if (!items.length) return null;

  const move = (from, to) => {
    if (from == null || to == null || from === to) return;
    const next = [...items];
    const [picked] = next.splice(from, 1);
    next.splice(to, 0, picked);
    onReorder?.(next);
  };

  return (
    <div className={className}>
      {items.map((item, index) => {
        const src = resolveSrc(item);
        return (
          <div
            key={item.key || item.url || src || index}
            className={itemClassName}
            draggable
            onDragStart={(e) => {
              dragIndex.current = index;
              e.dataTransfer.effectAllowed = 'move';
              try {
                e.dataTransfer.setData('text/plain', String(index));
              } catch {
                /* ignore */
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const from = dragIndex.current;
              dragIndex.current = null;
              move(from, index);
            }}
            onDragEnd={() => {
              dragIndex.current = null;
            }}
            title="Drag to reorder — first image is main"
            style={{ cursor: 'grab' }}
          >
            <img src={src} alt="" draggable={false} />
            {showMainBadge && index === 0 ? (
              <span className={mainBadgeClassName}>Main</span>
            ) : null}
            {onRemove ? (
              <button
                type="button"
                className={removeClassName}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(index, item);
                }}
                aria-label="Remove image"
              >
                ×
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
